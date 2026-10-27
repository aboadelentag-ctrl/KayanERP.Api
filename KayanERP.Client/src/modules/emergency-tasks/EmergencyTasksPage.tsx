import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  RotateCw,
  Eye,
  X,
  Send,
  Camera,
  Layers,
  Factory,
  Video,
  Mic,
  FileAudio,
  FileVideo,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { useBranchContext } from '../../core/context/BranchContext';

export interface EmergencyTaskDto {
  id: number;
  taskNumber: string;
  title: string;
  description: string;
  senderDepartment: string;
  senderEmployeeCode: string;
  senderEmployeeName: string;
  targetDepartment: string;
  targetEmployeeName?: string;
  assignedTechnicianCode?: string;
  assignedTechnicianName?: string;
  assignmentNotes?: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  mediaType: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'TEXT';
  mediaUrl?: string;
  mediaFileName?: string;
  createdAt: string;
  targetResolutionMinutes: number;
  respondedAt?: string;
  completedAt?: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'CLOSED';
  closureNotes?: string;
  closureProofMediaUrl?: string;
  closedBy?: string;
  closedByCode?: string;
  assetCode?: string;
}

export const EmergencyTasksPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { activeBranchName } = useBranchContext();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(true);

  // Lookups
  const dbDepartments = [
    { id: 1, name: 'إدارة الصيانة الهندسية والتشغيل', code: 'MAINT' },
    { id: 2, name: 'صالة تصنيع الحلويات الشرقية', code: 'PROD-EAST' },
    { id: 3, name: 'صالة تصنيع الحلويات الغربية والتورت', code: 'PROD-WEST' },
    { id: 4, name: 'غرف التبريد والتجميد المركزي', code: 'COLD-RM' },
    { id: 5, name: 'إدارة الجودة وسلامة الغذاء', code: 'QC-GMP' }
  ];

  const fixedAssetsList = [
    { id: 1, assetCode: 'AST-OVEN-01', name: 'فرن دوار أوتوماتيكي كبير', department: 'صالة تصنيع الحلويات الشرقية' },
    { id: 2, assetCode: 'AST-FRG-03', name: 'وحدة تبريد وتكثيف مركزية 40 حصان', department: 'غرف التبريد والتجميد المركزي' },
    { id: 3, assetCode: 'AST-MIX-02', name: 'عجانة حلويات هيدروليكية 150 كجم', department: 'صالة تصنيع الحلويات الشرقية' },
    { id: 4, assetCode: 'AST-SHP-04', name: 'خط فرد وفورمات الكرواسون والعجين', department: 'صالة تصنيع الحلويات الغربية والتورت' }
  ];

  const allEmployees = [
    { id: 1, code: 'TECH-01', name: 'م. حسام الدين (مهندس صيانة)', departmentName: 'إدارة الصيانة الهندسية والتشغيل' },
    { id: 2, code: 'TECH-02', name: 'أحمد فؤاد (فني تبريد وتكييف)', departmentName: 'إدارة الصيانة الهندسية والتشغيل' },
    { id: 3, code: 'TECH-03', name: 'محمود عبد الرازق (كهربائي قوى)', departmentName: 'إدارة الصيانة الهندسية والتشغيل' },
    { id: 4, code: 'EMP-101', name: 'أحمد السعدي (مشرف صالة)', departmentName: 'صالة تصنيع الحلويات الشرقية' }
  ];

  // Tasks State
  const [tasksList, setTasksList] = useState<EmergencyTaskDto[]>([
    {
      id: 1,
      taskNumber: 'EMG-20261024-401',
      title: 'عطل طارئ: توقف مفاجئ للفرن الدوار في صالة الشرقي',
      description: 'توقف مفاجئ لمحرك دوران الصاجات في الفرن أثناء تسوية البسبوسة وارتفاع مؤشر الحرارة.',
      senderDepartment: 'صالة تصنيع الحلويات الشرقية',
      senderEmployeeCode: 'EMP-101',
      senderEmployeeName: 'أحمد السعدي (مشرف صالة)',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      assignedTechnicianCode: 'TECH-01',
      assignedTechnicianName: 'م. حسام الدين (مهندس صيانة)',
      priority: 'CRITICAL',
      mediaType: 'IMAGE',
      createdAt: '2026-10-24 15:30',
      targetResolutionMinutes: 30,
      status: 'CLOSED',
      closureNotes: 'تم ضبط بادئ الحركة وتغيير سير الموتور وعاد الفرن للعمل بكفاءة تامة.',
      assetCode: 'AST-OVEN-01'
    },
    {
      id: 2,
      taskNumber: 'EMG-20261023-112',
      title: 'تسريب مياه تبريد بوحدة التكثيف المركزية',
      description: 'تسريب مياه تبريد الفريون داخل ثلاجة الخامات وتجمع مياه على الأرضية.',
      senderDepartment: 'غرف التبريد والتجميد المركزي',
      senderEmployeeCode: 'EMP-105',
      senderEmployeeName: 'عمرو ربيع',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      assignedTechnicianCode: 'TECH-02',
      assignedTechnicianName: 'أحمد فؤاد (فني تبريد وتكييف)',
      priority: 'HIGH',
      mediaType: 'AUDIO',
      createdAt: '2026-10-23 11:00',
      targetResolutionMinutes: 45,
      status: 'CLOSED',
      closureNotes: 'تم لحام خط الراجع واستبدال صمام التكثيف التالف.',
      assetCode: 'AST-FRG-03'
    },
    {
      id: 3,
      taskNumber: 'EMG-20261022-094',
      title: 'ارتفاع حرارة سير ماتور العجانة الكبيرة',
      description: 'رائحة شياط وارتفاع غير طبيعي في صوت جيربوكس عجانة البسبوسة.',
      senderDepartment: 'صالة تصنيع الحلويات الشرقية',
      senderEmployeeCode: 'EMP-101',
      senderEmployeeName: 'أحمد السعدي (مشرف صالة)',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      assignedTechnicianCode: 'TECH-01',
      assignedTechnicianName: 'م. حسام الدين (مهندس صيانة)',
      priority: 'HIGH',
      mediaType: 'VIDEO',
      createdAt: '2026-10-22 09:15',
      targetResolutionMinutes: 40,
      status: 'CLOSED',
      closureNotes: 'تم تشحيم التروس وتغيير بلي الموتور الرئيسي.',
      assetCode: 'AST-MIX-02'
    }
  ]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // 1. New Task Modal State
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isMachineEmergency, setIsMachineEmergency] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('MACHINE');
  const [selectedMachineCode, setSelectedMachineCode] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTargetDept, setNewTaskTargetDept] = useState('إدارة الصيانة الهندسية والتشغيل');
  const [newTaskTargetEmp, setNewTaskTargetEmp] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('HIGH');
  const [newTaskMinutes, setNewTaskMinutes] = useState<number>(30);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  
  // Media Upload State
  const [newTaskMediaType, setNewTaskMediaType] = useState<'IMAGE' | 'AUDIO' | 'VIDEO' | 'TEXT'>('TEXT');
  const [newTaskMediaUrl, setNewTaskMediaUrl] = useState<string | null>(null);
  const [newTaskMediaFileName, setNewTaskMediaFileName] = useState<string>('');

  // 2. Delegate Modal State
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [taskToDelegate, setTaskToDelegate] = useState<EmergencyTaskDto | null>(null);
  const [assignedTechName, setAssignedTechName] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  // 3. Complete Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState<EmergencyTaskDto | null>(null);
  const [closureNotes, setClosureNotes] = useState('');
  const [closureCostImpact, setClosureCostImpact] = useState('صيانة وإصلاح داخلي');
  const [closureProofUrl, setClosureProofUrl] = useState<string | null>(null);

  // 4. Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailedTask, setDetailedTask] = useState<EmergencyTaskDto | null>(null);

  // 5. Preview Modal
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: string; title: string } | null>(null);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasksList.filter(t => {
      if (selectedDeptFilter && t.senderDepartment !== selectedDeptFilter && t.targetDepartment !== selectedDeptFilter) return false;
      if (selectedPriorityFilter && t.priority !== selectedPriorityFilter) return false;
      if (selectedStatusFilter && t.status !== selectedStatusFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.taskNumber.toLowerCase().includes(term) ||
        t.title.toLowerCase().includes(term) ||
        (t.assetCode && t.assetCode.toLowerCase().includes(term)) ||
        t.senderDepartment.toLowerCase().includes(term)
      );
    });
  }, [tasksList, selectedDeptFilter, selectedPriorityFilter, selectedStatusFilter, searchTerm]);

  const handleOpenNewTask = () => {
    setIsMachineEmergency(true);
    setSelectedCategory('MACHINE');
    setSelectedMachineCode('');
    setNewTaskTitle('');
    setNewTaskTargetDept('إدارة الصيانة الهندسية والتشغيل');
    setNewTaskTargetEmp('');
    setNewTaskPriority('HIGH');
    setNewTaskMinutes(30);
    setNewTaskDesc('');
    setNewTaskMediaUrl(null);
    setNewTaskMediaFileName('');
    setNewTaskMediaType('TEXT');
    setIsNewTaskModalOpen(true);
  };

  const handleMachineChange = (code: string) => {
    setSelectedMachineCode(code);
    const m = fixedAssetsList.find(a => a.assetCode === code);
    if (m) {
      setNewTaskTitle(`عطل طارئ: توقف مفاجئ لـ ${m.name} في ${m.department}`);
      setNewTaskDesc(`توقف الماكينة (${m.name}) عن العمل بصورة مفاجئة، يرجى الاستجابة الفورية للصيانة.`);
      setNewTaskPriority('CRITICAL');
    }
  };

  const handleMultiMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewTaskMediaFileName(file.name);
    if (file.type.startsWith('image/')) {
      setNewTaskMediaType('IMAGE');
    } else if (file.type.startsWith('audio/')) {
      setNewTaskMediaType('AUDIO');
    } else if (file.type.startsWith('video/')) {
      setNewTaskMediaType('VIDEO');
    } else {
      setNewTaskMediaType('TEXT');
    }

    const reader = new FileReader();
    reader.onload = ev => {
      setNewTaskMediaUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const created: EmergencyTaskDto = {
      id: Date.now(),
      taskNumber: `EMG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'بلاغ عاجل تم رفعه من صالة التشغيل.',
      senderDepartment: 'صالة تصنيع الحلويات الشرقية',
      senderEmployeeCode: 'EMP-101',
      senderEmployeeName: user?.fullName || 'أبو عادل (المدير التنفيذي)',
      targetDepartment: newTaskTargetDept,
      targetEmployeeName: newTaskTargetEmp || undefined,
      priority: newTaskPriority,
      mediaType: newTaskMediaType,
      mediaUrl: newTaskMediaUrl || undefined,
      mediaFileName: newTaskMediaFileName || undefined,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      targetResolutionMinutes: newTaskMinutes,
      status: 'PENDING',
      assetCode: isMachineEmergency && selectedMachineCode ? selectedMachineCode : undefined
    };

    setTasksList([created, ...tasksList]);
    setIsNewTaskModalOpen(false);
    setFeedbackMessage('✅ تم إطلاق البلاغ الطارئ وتثبيت حالة الأصل بنجاح!');
    setIsSuccessFeedback(true);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleOpenDelegate = (task: EmergencyTaskDto) => {
    setTaskToDelegate(task);
    setAssignedTechName(allEmployees[0].name);
    setAssignmentNotes('يرجى التوجه فوراً لفحص العطل وتشغيل الماكينة.');
    setIsDelegateModalOpen(true);
  };

  const handleConfirmDelegate = () => {
    if (!taskToDelegate || !assignedTechName) return;
    const tech = allEmployees.find(e => e.name === assignedTechName);
    setTasksList(prev =>
      prev.map(t =>
        t.id === taskToDelegate.id
          ? {
              ...t,
              status: 'ASSIGNED',
              assignedTechnicianCode: tech?.code || 'TECH',
              assignedTechnicianName: assignedTechName,
              assignmentNotes
            }
          : t
      )
    );
    setIsDelegateModalOpen(false);
    setFeedbackMessage(`✅ تم تكليف الفني (${assignedTechName}) بالمهمة!`);
    setIsSuccessFeedback(true);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleRespondTask = (taskId: number) => {
    setTasksList(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'IN_PROGRESS',
              respondedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
            }
          : t
      )
    );
    setFeedbackMessage('⚡ تم بدء أعمال الإصلاح الميداني وتسجيل وقت الاستجابة!');
    setIsSuccessFeedback(true);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleOpenComplete = (task: EmergencyTaskDto) => {
    setCompletingTask(task);
    setClosureNotes('تم عمل الإصلاحات اللازمة واختبار الماكينة بنجاح على الحمل التشغيلي.');
    setClosureCostImpact('تم توفير قطع الغيار من مخزن الصيانة');
    setClosureProofUrl(null);
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = () => {
    if (!completingTask || !closureNotes.trim()) return;
    setTasksList(prev =>
      prev.map(t =>
        t.id === completingTask.id
          ? {
              ...t,
              status: 'CLOSED',
              completedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              closureNotes,
              closureProofMediaUrl: closureProofUrl || undefined,
              closedBy: user?.fullName || 'أبو عادل'
            }
          : t
      )
    );
    setIsCompleteModalOpen(false);
    setFeedbackMessage('✅ تم توثيق إنجاز البلاغ وعودة الماكينة للخدمة بكفاءة تشغيلية كاملة ✓');
    setIsSuccessFeedback(true);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الصفحة التنفيذي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              <span>غرفة عمليات المهام الطارئة والاستجابة السريعة (SOS Operations Hub)</span>
            </h1>
            <span className="bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              إدارة الصيانة وحوكمة الأعطال
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            إدارة أعطال الماكينات بالصالات، وتكليف الفنيين مع الإغلاق المشروط بالدليل وتحديث حالة الأصول تلقائياً.
          </p>
        </div>

        <div className="flex gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('emergency-reports')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs border border-gray-200 dark:border-zinc-800 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>📊 تقارير ومؤشرات الإنجاز (SLA)</span>
            </button>
          )}

          <button
            onClick={handleOpenNewTask}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ إطلاق بلاغ طارئ جديد (SOS)</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex justify-between items-center ${isSuccessFeedback ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'}`}>
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات المؤشرات اللحظية الأربعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-rose-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">جديدة (بانتظار الإجراء)</span>
          <h4 className="text-xl font-black text-rose-600 font-mono mt-1">
            {tasksList.filter(t => t.status === 'PENDING').length} بلاغ
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-indigo-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">محالة ومكلفة لفني</span>
          <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            {tasksList.filter(t => t.status === 'ASSIGNED').length} بلاغ
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">قيد التنفيذ الميداني</span>
          <h4 className="text-xl font-black text-amber-500 font-mono mt-1">
            {tasksList.filter(t => t.status === 'IN_PROGRESS').length} بلاغ
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-emerald-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">مغلقة ومؤكدة بالدليل</span>
          <h4 className="text-xl font-black text-emerald-600 font-mono mt-1">
            {tasksList.filter(t => t.status === 'CLOSED').length} بلاغ
          </h4>
        </div>
      </div>

      {/* شريط فلاتر البحث */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم البلاغ، العنوان، كود الماكينة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-2 outline-none font-bold text-gray-800 dark:text-zinc-200"
          />
        </div>

        <select
          value={selectedDeptFilter}
          onChange={(e) => setSelectedDeptFilter(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-gray-700 dark:text-zinc-300"
        >
          <option value="">-- كل الأقسام والإدارات --</option>
          {dbDepartments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select
          value={selectedPriorityFilter}
          onChange={(e) => setSelectedPriorityFilter(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-gray-700 dark:text-zinc-300"
        >
          <option value="">-- كل الأولويات --</option>
          <option value="CRITICAL">حرجة جداً 🔥</option>
          <option value="HIGH">عالية ⚡</option>
          <option value="NORMAL">عادية</option>
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-gray-700 dark:text-zinc-300"
        >
          <option value="">-- كل الحالات --</option>
          <option value="PENDING">جديدة</option>
          <option value="ASSIGNED">محالة لفني</option>
          <option value="IN_PROGRESS">قيد التنفيذ</option>
          <option value="CLOSED">مغلقة ومؤكدة</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedDeptFilter('');
            setSelectedPriorityFilter('');
            setSelectedStatusFilter('');
          }}
          className="px-3 py-2 bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 rounded-xl font-bold border border-gray-200 dark:border-zinc-800"
        >
          إلغاء الفلترة
        </button>
      </div>

      {/* جدول البلاغات */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <span className="font-bold text-gray-900 dark:text-zinc-100">📋 سجل بلاغات الطوارئ والأعطال (المعروض: {filteredTasks.length})</span>
          <span className="font-mono text-gray-400">مراقبة لحظية</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b">
              <tr>
                <th className="py-3 px-3">رقم البلاغ</th>
                <th className="py-3 px-3 text-right">عنوان البلاغ / الماكينة المعطلة</th>
                <th className="py-3 px-3 text-right">الجهة الطالبة / الراسل</th>
                <th className="py-3 px-3 text-right">القسم المسؤول / الفني</th>
                <th className="py-3 px-3">المرفقات</th>
                <th className="py-3 px-3">الأولوية</th>
                <th className="py-3 px-3">التوقيت والمهلة</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3" style={{ minWidth: '220px' }}>إجراءات التكليف والاستجابة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredTasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.taskNumber}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-gray-900 dark:text-zinc-100 block">{t.title}</span>
                    {t.assetCode && (
                      <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.2 rounded text-[10px] font-mono">
                        🏭 [{t.assetCode}]
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-gray-700 dark:text-zinc-300 font-bold block">{t.senderDepartment}</span>
                    <small className="text-gray-400 font-mono">[{t.senderEmployeeCode}] {t.senderEmployeeName}</small>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-gray-500 block">{t.targetDepartment}</span>
                    {t.assignedTechnicianName ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] block">
                        🛠️ {t.assignedTechnicianName}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-[10px]">بانتظار تكليف فني</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {t.mediaUrl ? (
                      <button
                        onClick={() => setPreviewMedia({ url: t.mediaUrl!, type: t.mediaType, title: t.title })}
                        className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-lg font-bold text-[10px] mx-auto hover:bg-cyan-500/20"
                      >
                        {t.mediaType === 'IMAGE' && <ImageIcon className="w-3.5 h-3.5" />}
                        {t.mediaType === 'AUDIO' && <FileAudio className="w-3.5 h-3.5" />}
                        {t.mediaType === 'VIDEO' && <FileVideo className="w-3.5 h-3.5" />}
                        <span>
                          {t.mediaType === 'IMAGE' ? '🖼 صورة' : t.mediaType === 'AUDIO' ? '🎤 تسجيل صوتي' : '📹 فيديو'}
                        </span>
                      </button>
                    ) : (
                      <span className="text-gray-400 text-[10px]">نص فقط</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-600'}`}>
                      {t.priority === 'CRITICAL' ? 'حرجة جداً 🔥' : t.priority === 'HIGH' ? 'عالية ⚡' : 'عادية'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="text-gray-700 dark:text-zinc-300 block">{t.createdAt}</span>
                    <small className="text-gray-400">مهلة: {t.targetResolutionMinutes} دقيقة</small>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      t.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-600' :
                      t.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600' :
                      t.status === 'ASSIGNED' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {t.status === 'CLOSED' ? 'مغلقة ومؤكدة ✓' :
                       t.status === 'IN_PROGRESS' ? 'قيد التنفيذ ⚡' :
                       t.status === 'ASSIGNED' ? 'محالة لفني 🛠️' : 'جديدة (بانتظار الإجراء)'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center gap-1.5 flex-wrap">
                      {t.status === 'PENDING' && (
                        <button
                          onClick={() => handleOpenDelegate(t)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] shadow-sm"
                        >
                          🛠️ تكليف
                        </button>
                      )}

                      {(t.status === 'PENDING' || t.status === 'ASSIGNED') && (
                        <button
                          onClick={() => handleRespondTask(t.id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[11px] shadow-sm"
                        >
                          ⚡ تنفيذ
                        </button>
                      )}

                      {t.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleOpenComplete(t)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-sm"
                        >
                          ✅ إغلاق بالدليل
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDetailedTask(t);
                          setIsDetailsModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg font-bold text-[11px]"
                      >
                        🔍 التفاصيل
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. نافذة إطلاق بلاغ طارئ جديد مع دعم (فيديو / صوت / صورة) */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-rose-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <span>إطلاق بلاغ طارئ واستدعاء فوري (SOS)</span>
              </h4>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTask} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* الجهة الطالبة والمسؤول */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-rose-500/30">
                <div>
                  <span className="text-gray-400 text-[10px] block">الجهة الطالبة:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">صالة تصنيع الحلويات الشرقية</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">كود الموظف المنشئ:</span>
                  <span className="font-mono font-bold">EMP-101</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">اسم المسؤول:</span>
                  <span className="font-bold text-gray-800 dark:text-zinc-200">{user?.fullName || 'أبو عادل (المدير التنفيذي)'}</span>
                </div>
              </div>

              {/* تصنيف البلاغ والماكينة */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">تصنيف طبيعة البلاغ *</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setSelectedCategory(cat);
                      setIsMachineEmergency(cat === 'MACHINE');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                  >
                    <option value="MACHINE">🏭 عطل ماكينة / خط إنتاج رأسمالي</option>
                    <option value="GMP">🧹 نظافة وبيئة تصنيع (GMP / Sanitation)</option>
                    <option value="QUALITY">⚠️ مخالفة جودة وسلامة غذاء (ISO)</option>
                    <option value="GENERAL">📦 مشكلة تشغيلية / طارئ عام</option>
                  </select>
                </div>

                <div>
                  {isMachineEmergency ? (
                    <>
                      <label className="block text-rose-500 font-bold mb-1">اختر الماكينة المعطلة من الصالة *</label>
                      <select
                        value={selectedMachineCode}
                        onChange={(e) => handleMachineChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-rose-500 rounded-xl font-bold font-mono text-rose-500"
                      >
                        <option value="">-- اضغط لاختيار الماكينة --</option>
                        {fixedAssetsList.map(a => (
                          <option key={a.assetCode} value={a.assetCode}>[{a.assetCode}] - {a.name}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-gray-500 font-bold mb-1">نطاق الملاحظة:</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value="بلاغ عام غير مرتبط بأصل مسريل"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-900/60 border rounded-xl text-gray-500"
                      />
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">عنوان المشكلة أو العطل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: توقف مفاجئ لفرن الدوار في صالة الشرقي..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-rose-400 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-rose-500 font-bold mb-1">القسم المسؤول (الموجه إليه البلاغ) *</label>
                  <select
                    value={newTaskTargetDept}
                    onChange={(e) => setNewTaskTargetDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                  >
                    {dbDepartments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">درجة الأولوية والخطورة *</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold text-rose-500"
                  >
                    <option value="CRITICAL">حرجة جداً 🔥 (توقف إنتاج)</option>
                    <option value="HIGH">عالية الأهمية ⚡</option>
                    <option value="NORMAL">عادية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">التفاصيل الكاملة للعطل والظروف الميدانية:</label>
                <textarea
                  rows={3}
                  placeholder="اشرح العطل، أصوات الماكينة، أو أي مؤشرات حرارة..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl"
                />
              </div>

              {/* قسم المرفقات متعدد الوسائط (فيديو أو صوت أو صورة) */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <span className="text-amber-500">📎</span>
                  <span>إرفاق وسائط توثيقية للعطل (صورة 🖼 / تسجيل صوتي 🎤 / مقطع فيديو 📹):</span>
                </label>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleMultiMediaUpload}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                />
                {newTaskMediaUrl && (
                  <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                      {newTaskMediaType === 'IMAGE' && <ImageIcon className="w-4 h-4" />}
                      {newTaskMediaType === 'AUDIO' && <FileAudio className="w-4 h-4" />}
                      {newTaskMediaType === 'VIDEO' && <FileVideo className="w-4 h-4" />}
                      <span>تم إرفاق {newTaskMediaType === 'IMAGE' ? 'الصورة' : newTaskMediaType === 'AUDIO' ? 'التسجيل الصوتي' : 'مقطع الفيديو'} بنجاح: {newTaskMediaFileName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTaskMediaUrl(null);
                        setNewTaskMediaFileName('');
                        setNewTaskMediaType('TEXT');
                      }}
                      className="text-rose-500 hover:text-rose-700 font-bold text-[10px]"
                    >
                      إلغاء المرفق
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-sm"
                >
                  🚀 إرسال البلاغ فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. نافذة تكليف فني صيانة */}
      {isDelegateModalOpen && taskToDelegate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>تكليف فني صيانة بالمهمة</span>
              </h4>
              <button onClick={() => setIsDelegateModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold">
                تكليف فني معتمد لمباشرة: {taskToDelegate.title}
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم الفني المكلف ميدانياً *</label>
                <select
                  value={assignedTechName}
                  onChange={(e) => setAssignedTechName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-bold"
                >
                  {allEmployees.filter(e => e.departmentName.includes('صيانة')).map(e => (
                    <option key={e.id} value={e.name}>[{e.code}] {e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">توجيهات الإدارة للفني:</label>
                <textarea
                  rows={3}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsDelegateModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelegate}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-sm"
                >
                  ✓ اعتماد التكليف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. نافذة إغلاق المهمة بالدليل واستعادة الأصل */}
      {isCompleteModalOpen && completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>إغلاق البلاغ وإعادة تشغيل الماكينة</span>
              </h4>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {completingTask.assetCode && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl font-bold">
                  🔄 تأكيد تشغيلي: سيتم تحويل الماكينة [{completingTask.assetCode}] تلقائياً إلى حالة (تعمل بكفاءة OPERATIONAL) فور تأكيد الإغلاق.
                </div>
              )}

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">تقرير الإصلاح / بيان ما تم إنجازه *</label>
                <textarea
                  rows={3}
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-emerald-500 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الأثر المالي / تكلفة قطع الغيار:</label>
                <input
                  type="text"
                  value={closureCostImpact}
                  onChange={(e) => setClosureCostImpact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border">
                <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">📸 إرفاق دليل الإنجاز (صورة الماكينة بعد الإصلاح):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = ev => setClosureProofUrl(ev.target?.result as string);
                      r.readAsDataURL(f);
                    }
                  }}
                  className="text-[11px] text-gray-500"
                />
                {closureProofUrl && (
                  <div className="mt-2 text-emerald-600 font-bold text-[11px]">✓ تم إرفاق دليل الإنجاز بنجاح</div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm"
                >
                  ✔ تأكيد إغلاق البلاغ واستعادة الماكينة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. استعراض كامل التفاصيل */}
      {isDetailsModalOpen && detailedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold">🔍 ملف البلاغ: {detailedTask.taskNumber}</h4>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="border-b pb-2">
                <h3 className="text-sm font-black text-gray-900 dark:text-zinc-100">{detailedTask.title}</h3>
                <span className="text-gray-400 font-mono text-[10px]">تاريخ الإنشاء: {detailedTask.createdAt}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl">
                <div>
                  <span className="text-gray-400 block text-[10px]">الجهة الطالبة:</span>
                  <span className="font-bold">{detailedTask.senderDepartment}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">القسم المسؤول:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{detailedTask.targetDepartment}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">الفني المكلف:</span>
                  <span className="font-bold text-amber-500">{detailedTask.assignedTechnicianName || 'غير مكلف'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">الماكينة المرتبطة:</span>
                  <span className="font-mono font-bold text-rose-500">{detailedTask.assetCode || 'بلاغ عام'}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px]">شرح العطل:</span>
                <p className="p-2.5 bg-slate-100 dark:bg-zinc-900 rounded-lg">{detailedTask.description}</p>
              </div>

              {detailedTask.closureNotes && (
                <div>
                  <span className="text-emerald-600 font-bold block text-[10px]">تقرير الإصلاح والإغلاق:</span>
                  <p className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-500/30">
                    {detailedTask.closureNotes}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-1.5 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. نافذة معاينة المرفقات المتنوعة (صوت / فيديو / صورة) */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" dir="rtl">
          <div className="bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-zinc-900 text-white flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-amber-400">
                <span>معاينة مرفق البلاغ: {previewMedia.title}</span>
              </h4>
              <button onClick={() => setPreviewMedia(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center flex flex-col items-center justify-center bg-black min-h-[300px]">
              {previewMedia.type === 'IMAGE' && (
                <img
                  src={previewMedia.url}
                  alt="مرفق البلاغ"
                  className="max-h-[480px] max-w-full rounded-xl object-contain border border-slate-200 dark:border-zinc-800 shadow-lg"
                />
              )}

              {previewMedia.type === 'VIDEO' && (
                <video controls className="max-h-[480px] max-w-full rounded-xl border border-slate-200 dark:border-zinc-800 shadow-lg">
                  <source src={previewMedia.url} />
                  متصفحك لا يدعم تشغيل مقطع الفيديو المرفق.
                </video>
              )}

              {previewMedia.type === 'AUDIO' && (
                <div className="p-8 bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 w-full max-w-md space-y-4">
                  <div className="flex items-center justify-center gap-3 text-cyan-400">
                    <Mic className="w-8 h-8 animate-pulse" />
                    <span className="font-bold text-sm">تسجيل صوتي ميداني للعطل</span>
                  </div>
                  <audio controls className="w-full">
                    <source src={previewMedia.url} />
                    متصفحك لا يدعم تشغيل الصوت المرفق.
                  </audio>
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setPreviewMedia(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl"
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

