import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertOctagon,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Wrench,
  Zap,
  CheckCheck,
  Eye,
  Camera,
  FileText,
  Clock,
  Layers,
  Flame,
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { useBranchContext } from '../../core/context/BranchContext';
import {
  fetchEmergencyLookupsApi,
  fetchEmergencyTasksApi,
  submitEmergencyTaskApi,
  delegateTaskApi,
  respondToTaskApi,
  completeEmergencyTaskApi
} from './emergencyTasksApi';
import type {
  EmergencyTaskDto,
  FixedAssetSimpleDto,
  DepartmentApiDto,
  EmployeeApiDto
} from './emergencyTasksApi';

interface EmergencyTasksPageProps {
  onNavigate?: (tab: string) => void;
}

export const EmergencyTasksPage: React.FC<EmergencyTasksPageProps> = () => {
  const { user } = useAuth();
  const { activeBranchName } = useBranchContext();

  const [tasks, setTasks] = useState<EmergencyTaskDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentApiDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeApiDto[]>([]);
  const [fixedAssets, setFixedAssets] = useState<FixedAssetSimpleDto[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');

  // Modals
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState<boolean>(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);
  const [isFullDetailsModalOpen, setIsFullDetailsModalOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Selected Entities
  const [selectedTaskToDelegate, setSelectedTaskToDelegate] = useState<EmergencyTaskDto | null>(null);
  const [completingTask, setCompletingTask] = useState<EmergencyTaskDto | null>(null);
  const [detailedTask, setDetailedTask] = useState<EmergencyTaskDto | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>('');

  // New Task Form
  const [isMachineEmergency, setIsMachineEmergency] = useState<boolean>(true);
  const [newTask, setNewTask] = useState<Partial<EmergencyTaskDto>>({
    title: '',
    description: '',
    priority: 'HIGH',
    targetResolutionMinutes: 30,
    targetDepartment: '',
    targetEmployeeName: '',
    assetCode: ''
  });

  // Inputs for delegation & completion
  const [assignedTechnicianInput, setAssignedTechnicianInput] = useState<string>('');
  const [assignmentNotesInput, setAssignmentNotesInput] = useState<string>('');
  const [closureNotes, setClosureNotes] = useState<string>('');
  const [closureProofUrl, setClosureProofUrl] = useState<string>('');
  const [closureCostImpact, setClosureCostImpact] = useState<string>('صيانة عادية');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [lookups, tasksData] = await Promise.all([
        fetchEmergencyLookupsApi(),
        fetchEmergencyTasksApi()
      ]);
      setDepartments(lookups.departments);
      setEmployees(lookups.employees);
      setFixedAssets(lookups.assets);
      setTasks(tasksData);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNum = t.taskNumber?.toLowerCase().includes(term);
        const matchTitle = t.title.toLowerCase().includes(term);
        const matchAsset = t.assetCode?.toLowerCase().includes(term);
        const matchDept = t.senderDepartment.toLowerCase().includes(term);
        if (!matchNum && !matchTitle && !matchAsset && !matchDept) return false;
      }
      if (selectedDeptFilter && t.senderDepartment !== selectedDeptFilter && t.targetDepartment !== selectedDeptFilter) return false;
      if (selectedPriorityFilter && t.priority !== selectedPriorityFilter) return false;
      if (selectedStatusFilter && t.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [tasks, searchTerm, selectedDeptFilter, selectedPriorityFilter, selectedStatusFilter]);

  const stats = useMemo(() => {
    const pending = tasks.filter(t => t.status === 'PENDING' || t.status === 'NEW').length;
    const assigned = tasks.filter(t => t.status === 'ASSIGNED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const closed = tasks.filter(t => t.status === 'CLOSED').length;
    return { pending, assigned, inProgress, closed };
  }, [tasks]);

  const openNewTaskModal = () => {
    setIsMachineEmergency(true);
    const maintDept = departments.find(d => d.displayName.includes('صيانة')) || departments[0];
    setNewTask({
      taskNumber: `EMG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      priority: 'HIGH',
      targetResolutionMinutes: 30,
      senderDepartment: 'صالة تصنيع الحلويات الشرقية',
      senderEmployeeCode: user?.role || 'EMP-088',
      senderEmployeeName: user?.fullName || 'مشرف الصالة',
      targetDepartment: maintDept?.displayName || 'إدارة الصيانة الهندسية والتشغيل',
      title: '',
      description: '',
      assetCode: ''
    });
    setIsNewTaskModalOpen(true);
  };

  const handleMachineSelected = (assetCode: string) => {
    const machine = fixedAssets.find(m => m.assetCode === assetCode);
    if (machine) {
      setNewTask(prev => ({
        ...prev,
        assetCode: machine.assetCode,
        title: `عطل طارئ: ${machine.name} [${machine.assetCode}]`,
        description: `توقف الماكينة (${machine.name}) بصالة (${machine.department}). يرجى التدخل الفوري.`,
        priority: 'CRITICAL'
      }));
    }
  };

  const handleSubmitNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title?.trim()) return;

    setIsSubmitting(true);
    try {
      const createdTask: EmergencyTaskDto = {
        id: Date.now(),
        taskNumber: newTask.taskNumber || `EMG-${Date.now()}`,
        title: newTask.title,
        description: newTask.description || '',
        senderDepartment: newTask.senderDepartment || 'صالة الإنتاج',
        senderEmployeeCode: newTask.senderEmployeeCode || 'EMP-088',
        senderEmployeeName: newTask.senderEmployeeName || 'المشرف',
        targetDepartment: newTask.targetDepartment || 'إدارة الصيانة الهندسية والتشغيل',
        targetEmployeeName: newTask.targetEmployeeName,
        priority: newTask.priority || 'HIGH',
        mediaType: 'IMAGE',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        targetResolutionMinutes: newTask.targetResolutionMinutes || 30,
        status: 'PENDING',
        assetCode: newTask.assetCode
      };

      await submitEmergencyTaskApi(createdTask);
      setTasks(prev => [createdTask, ...prev]);

      if (createdTask.assetCode) {
        setFixedAssets(prev =>
          prev.map(a => (a.assetCode === createdTask.assetCode ? { ...a, status: 'UNDER_MAINTENANCE' } : a))
        );
      }

      setFeedbackMessage('✅ تم إرسال البلاغ وتثبيت حالة العطل بنجاح!');
      setIsSuccessFeedback(true);
      setIsNewTaskModalOpen(false);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const openDelegateModal = (t: EmergencyTaskDto) => {
    setSelectedTaskToDelegate(t);
    setAssignedTechnicianInput('');
    setAssignmentNotesInput('');
    setIsDelegateModalOpen(true);
  };

  const handleConfirmDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToDelegate || !assignedTechnicianInput.trim()) return;

    const chosenEmp = employees.find(e => e.displayName === assignedTechnicianInput);
    await delegateTaskApi(selectedTaskToDelegate.id, {
      technicianName: assignedTechnicianInput,
      technicianCode: chosenEmp?.code || 'TECH-01',
      notes: assignmentNotesInput
    });

    setTasks(prev =>
      prev.map(t =>
        t.id === selectedTaskToDelegate.id
          ? {
              ...t,
              status: 'ASSIGNED',
              assignedTechnicianName: assignedTechnicianInput,
              assignedTechnicianCode: chosenEmp?.code || 'TECH-01'
            }
          : t
      )
    );

    setFeedbackMessage(`✅ تم تكليف الفني (${assignedTechnicianInput}) بالمهمة!`);
    setIsSuccessFeedback(true);
    setIsDelegateModalOpen(false);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleRespondToTask = async (taskId: number) => {
    await respondToTaskApi(taskId);
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t))
    );
    setFeedbackMessage('⚡ تم بدء التنفيذ وتسجيل وقت الاستجابة الميداني!');
    setIsSuccessFeedback(true);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const openCompleteModal = (t: EmergencyTaskDto) => {
    setCompletingTask(t);
    setClosureNotes('');
    setClosureProofUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60');
    setClosureCostImpact('صيانة عادية واستبدال سير نقل');
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask || !closureNotes.trim()) return;

    await completeEmergencyTaskApi(completingTask.id, {
      closureNotes,
      closureProofMediaUrl: closureProofUrl,
      closedBy: user?.fullName || 'مدير الصيانة',
      closedByCode: user?.role || 'ADMIN',
      costImpact: closureCostImpact
    });

    setTasks(prev =>
      prev.map(t =>
        t.id === completingTask.id
          ? {
              ...t,
              status: 'CLOSED',
              closureNotes
            }
          : t
      )
    );

    if (completingTask.assetCode) {
      setFixedAssets(prev =>
        prev.map(a => (a.assetCode === completingTask.assetCode ? { ...a, status: 'OPERATIONAL' } : a))
      );
    }

    setFeedbackMessage('✅ تم توثيق إنجاز البلاغ وعودة الماكينة للعمل بكفاءة تامة ✓');
    setIsSuccessFeedback(true);
    setIsCompleteModalOpen(false);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const translateStatus = (s: string) => {
    switch (s) {
      case 'PENDING':
      case 'NEW': return 'جديدة (بانتظار الإجراء)';
      case 'ASSIGNED': return 'محالة لفني 🛠️';
      case 'IN_PROGRESS': return 'قيد التنفيذ ⚡';
      case 'CLOSED': return 'مغلقة ومؤكدة ✓';
      default: return s;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'PENDING':
      case 'NEW': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ASSIGNED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CLOSED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* رأس الصفحة التنفيذي */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-rose-500 flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
              <span>غرفة عمليات المهام الطارئة والاستجابة السريعة (SOS Operations Hub)</span>
            </h1>
            <span className="bg-rose-500 text-white px-2.5 py-0.5 rounded-md text-[10px] font-black">
              إدارة الصيانة وحوكمة الأعطال
            </span>
          </div>
          <p className="text-xs text-slate-400">
            إدارة أعطال الماكينات بالصالات، وتكليف الفنيين مع الإغلاق المشروط بالدليل وتحديث حالة الأصول تلقائياً.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openNewTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إطلاق بلاغ طارئ جديد (SOS)</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isSuccessFeedback ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span className="flex items-center gap-2">
            {isSuccessFeedback ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {feedbackMessage}
          </span>
          <button onClick={() => setFeedbackMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات المؤشرات اللحظية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-rose-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">جديدة (بانتظار الإجراء)</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">{stats.pending} بلاغ</h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">محالة ومكلفة لفني</span>
          <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">{stats.assigned} بلاغ</h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">قيد التنفيذ الميداني</span>
          <h4 className="text-2xl font-black text-amber-600 font-mono mt-1">{stats.inProgress} بلاغ</h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">مغلقة ومؤكدة بالدليل</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">{stats.closed} بلاغ</h4>
        </div>
      </div>

      {/* شريط فلاتر البحث */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم البلاغ، العنوان، كود الماكينة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-rose-600 font-medium"
          />
        </div>

        <select
          value={selectedDeptFilter}
          onChange={(e) => setSelectedDeptFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كل الأقسام والإدارات --</option>
          {departments.map(d => (
            <option key={d.id} value={d.displayName}>{d.displayName}</option>
          ))}
        </select>

        <select
          value={selectedPriorityFilter}
          onChange={(e) => setSelectedPriorityFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كل الأولويات --</option>
          <option value="CRITICAL">حرجة جداً 🔥</option>
          <option value="HIGH">عالية ⚡</option>
          <option value="NORMAL">عادية</option>
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كل الحالات --</option>
          <option value="PENDING">جديدة</option>
          <option value="ASSIGNED">محالة لفني</option>
          <option value="IN_PROGRESS">قيد التنفيذ</option>
          <option value="CLOSED">مغلقة ومؤكدة</option>
        </select>

        <button
          onClick={loadAll}
          disabled={isLoading}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          title="تحديث السجل"
        >
          <RotateCw className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* جدول البلاغات */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
          <span className="font-bold">📋 سجل بلاغات الطوارئ والأعطال (المعروض: {filteredTasks.length})</span>
          <span className="bg-rose-500 text-white font-mono text-[10px] px-2 py-0.5 rounded">مراقبة لحظية</span>
        </div>

        <table className="w-full text-center">
          <thead className="bg-slate-100 text-gray-700">
            <tr>
              <th className="py-2.5 px-3">رقم البلاغ</th>
              <th className="py-2.5 px-3 text-right">عنوان البلاغ / الماكينة المعطلة</th>
              <th className="py-2.5 px-3 text-right">الجهة الطالبة / الراسل</th>
              <th className="py-2.5 px-3 text-right">القسم المسؤول / الفني</th>
              <th className="py-2.5 px-3">الأولوية</th>
              <th className="py-2.5 px-3">التوقيت والمهلة</th>
              <th className="py-2.5 px-3">الحالة</th>
              <th className="py-2.5 px-3">إجراءات الاستجابة والتكليف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 font-bold">
                  جاري تحميل سجل البلاغات الطارئة...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 font-bold">
                  لا توجد بلاغات طارئة مطابقة لشروط البحث.
                </td>
              </tr>
            ) : (
              filteredTasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{t.taskNumber}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                    <div>{t.title}</div>
                    {t.assetCode && (
                      <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded font-mono text-[10px] mt-0.5 inline-block">
                        🏭 [{t.assetCode}]
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-700">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold block w-fit mb-0.5">
                      {t.senderDepartment}
                    </span>
                    <span className="text-gray-500 text-[10px]">👤 {t.senderEmployeeName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-bold block w-fit mb-0.5">
                      {t.targetDepartment}
                    </span>
                    <span className="text-indigo-700 font-bold text-[10px] block">
                      {t.assignedTechnicianName ? `🛠️ ${t.assignedTechnicianName}` : 'بانتظار تكليف فني'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>
                      {t.priority === 'CRITICAL' ? 'حرجة جداً 🔥' : 'عالية ⚡'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                    <div>{t.createdAt}</div>
                    <small className="text-slate-400">مهلة: {t.targetResolutionMinutes} دقيقة</small>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(t.status)}`}>
                      {translateStatus(t.status)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex justify-center items-center gap-1.5">
                      {(t.status === 'PENDING' || t.status === 'NEW') && (
                        <button
                          onClick={() => openDelegateModal(t)}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>تكليف</span>
                        </button>
                      )}
                      {(t.status === 'PENDING' || t.status === 'ASSIGNED') && (
                        <button
                          onClick={() => handleRespondToTask(t.id)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          <span>تنفيذ</span>
                        </button>
                      )}
                      {t.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => openCompleteModal(t)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>إغلاق بالدليل</span>
                        </button>
                      )}
                      <button
                        onClick={() => { setDetailedTask(t); setIsFullDetailsModalOpen(true); }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>التفاصيل</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة إطلاق بلاغ طارئ جديد */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-rose-700 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-white" />
                <span>إطلاق بلاغ طارئ واستدعاء فوري (SOS)</span>
              </h4>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSubmitNewTask} className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white p-3 rounded-xl border border-rose-200 flex justify-between items-center text-xs">
                <div>الجهة الطالبة: <span className="font-bold text-indigo-700">صالة تصنيع الحلويات الشرقية</span></div>
                <div>المسؤول المنشئ: <span className="font-bold text-gray-900">{user?.fullName || 'مشرف الصالة'}</span></div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">تصنيف طبيعة البلاغ *</label>
                  <select
                    value={isMachineEmergency ? 'MACHINE' : 'GENERAL'}
                    onChange={(e) => setIsMachineEmergency(e.target.value === 'MACHINE')}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    <option value="MACHINE">🏭 عطل ماكينة / خط إنتاج رأسمالي</option>
                    <option value="GENERAL">📦 مشكلة تشغيلية / طارئ عام</option>
                  </select>
                </div>
                <div>
                  {isMachineEmergency ? (
                    <>
                      <label className="block text-rose-700 font-bold mb-1">اختر الماكينة المعطلة من الصالة *</label>
                      <select
                        value={newTask.assetCode || ''}
                        onChange={(e) => handleMachineSelected(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl font-bold font-mono"
                      >
                        <option value="">-- اضغط لاختيار الماكينة --</option>
                        {fixedAssets.map(m => (
                          <option key={m.id} value={m.assetCode}>
                            [{m.assetCode}] - {m.name}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-gray-500 font-bold mb-1">نطاق الملاحظة:</label>
                      <input
                        type="text"
                        disabled
                        value="بلاغ عام غير مرتبط بأصل مسريل"
                        className="w-full px-3 py-2 bg-gray-100 border rounded-xl text-gray-500"
                      />
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">عنوان المشكلة أو العطل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: توقف مفاجئ لفرن الدوار في صالة الشرقي..."
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">القسم المسؤول (الموجّه إليه البلاغ) *</label>
                  <select
                    value={newTask.targetDepartment || ''}
                    onChange={(e) => setNewTask({ ...newTask, targetDepartment: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl font-bold"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.displayName}>{d.displayName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">درجة الأولوية والخطورة *</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl font-bold text-rose-700"
                  >
                    <option value="CRITICAL">حرجة جداً 🔥 (توقف إنتاج كامل)</option>
                    <option value="HIGH">عالية الأهمية ⚡</option>
                    <option value="NORMAL">عادية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">التفاصيل الكاملة للعطل والظروف الميدانية</label>
                <textarea
                  rows={3}
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="اشرح العطل، أصوات الماكينة، أو أي مؤشرات حرارة..."
                  className="w-full px-3 py-2 bg-white border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3 border-t shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isSubmitting ? '⏳ جاري الإرسال...' : '🚀 إرسال البلاغ فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تكليف فني بالمهمة */}
      {isDelegateModalOpen && selectedTaskToDelegate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Wrench className="w-4 h-4 text-white" />
                <span>تكليف فني صيانة بالمهمة</span>
              </h4>
              <button onClick={() => setIsDelegateModalOpen(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleConfirmDelegate} className="p-5 space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl">
                تكليف فني معتمد لمباشرة: <strong className="block mt-1">{selectedTaskToDelegate.title}</strong>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم الفني المكلف ميدانياً *</label>
                <select
                  required
                  value={assignedTechnicianInput}
                  onChange={(e) => setAssignedTechnicianInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-indigo-300 rounded-xl font-bold"
                >
                  <option value="">-- اختر الفني من الإدارة --</option>
                  {employees
                    .filter(e => e.departmentName?.includes('صيانة') || true)
                    .map(emp => (
                      <option key={emp.id} value={emp.displayName}>
                        [{emp.code}] {emp.displayName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">توجيهات الإدارة للفني</label>
                <textarea
                  rows={2}
                  value={assignmentNotesInput}
                  onChange={(e) => setAssignmentNotesInput(e.target.value)}
                  placeholder="ملاحظات سرعة الفحص والتأمين..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsDelegateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  ✓ اعتماد التكليف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إغلاق المهمة بالدليل */}
      {isCompleteModalOpen && completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-white" />
                <span>إغلاق البلاغ وإعادة تشغيل الماكينة</span>
              </h4>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleConfirmComplete} className="p-5 space-y-3">
              {completingTask.assetCode && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl">
                  🔄 <strong>تأكيد تشغيلي:</strong> سيتم تحويل الماكينة <strong>[{completingTask.assetCode}]</strong> تلقائياً إلى حالة <strong>(تعمل بكفاءة OPERATIONAL)</strong> فور تأكيد الإغلاق.
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-bold mb-1">تقرير الإصلاح / بيان ما تم إنجازه *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="اكتب تفاصيل الإصلاح، الفحص، وتجارب التشغيل..."
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-emerald-400 rounded-xl"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">تكلفة قطع الغيار / الأثر المالي (إن وجد)</label>
                <input
                  type="text"
                  placeholder="مثال: تغيير سير موتور بقيمة 450 ج"
                  value={closureCostImpact}
                  onChange={(e) => setClosureCostImpact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  ✔ تأكيد إغلاق البلاغ واستعادة الماكينة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة استعراض التفاصيل الكاملة */}
      {isFullDetailsModalOpen && detailedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>ملف البلاغ: {detailedTask.taskNumber}</span>
              </h4>
              <button onClick={() => setIsFullDetailsModalOpen(false)} className="text-white">×</button>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <h5 className="font-bold text-gray-900 text-sm">{detailedTask.title}</h5>
                <span className="text-gray-500 block">{detailedTask.description}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-xl bg-white">
                  <span className="text-gray-400 block mb-1">الجهة الطالبة</span>
                  <div className="font-bold text-gray-800">{detailedTask.senderDepartment}</div>
                  <small className="text-gray-500">[{detailedTask.senderEmployeeCode}] {detailedTask.senderEmployeeName}</small>
                </div>
                <div className="p-3 border rounded-xl bg-white">
                  <span className="text-gray-400 block mb-1">الجهة المسؤولة</span>
                  <div className="font-bold text-gray-800">{detailedTask.targetDepartment}</div>
                  <small className="text-indigo-700 font-bold">{detailedTask.assignedTechnicianName || 'غير مكلف'}</small>
                </div>
              </div>

              {detailedTask.closureNotes && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl">
                  <strong>تقرير الحل والإغلاق:</strong>
                  <p className="mt-1 mb-0">{detailedTask.closureNotes}</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 border-t text-left">
              <button
                onClick={() => setIsFullDetailsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
