import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Folder,
  Edit2,
  Trash2,
  Power,
  X,
  PlusCircle,
  Briefcase,
  Building2
} from 'lucide-react';

interface EmployeeDto {
  id: number;
  companyId: number;
  departmentId: number;
  jobTitleId?: number;
  name: string;
  workerCode: string;
  active: boolean;
  jobTitleName: string;
}

interface DepartmentItemDto {
  id: number;
  departmentCode: string;
  departmentName: string;
}

interface JobTitleLookupDto {
  id: number;
  titleName: string;
  hourlyRate: number;
}

interface EmployeeImportRowDto {
  employeeCode: string;
  name: string;
  departmentNameOrCode: string;
  jobTitleName: string;
  active: boolean;
}

export const EmployeesManagementPage: React.FC = () => {
  const [departments] = useState<DepartmentItemDto[]>([
    { id: 1, departmentCode: 'DEPT-PROD', departmentName: 'إدارة الإنتاج' },
    { id: 2, departmentCode: 'DEPT-EAST', departmentName: 'قسم الشرقي والمخبوزات' },
    { id: 3, departmentCode: 'DEPT-WEST', departmentName: 'قسم الجاتوه والتورت والحلويات الغربية' },
    { id: 4, departmentCode: 'DEPT-DRY', departmentName: 'قسم النواشف والبتيفور والكرواسون' },
    { id: 5, departmentCode: 'DEPT-PACK', departmentName: 'مستودع التعبئة والتغليف والتوزيع' }
  ]);

  const [jobTitles, setJobTitles] = useState<JobTitleLookupDto[]>([
    { id: 1, titleName: 'مهندس انتاج', hourlyRate: 65 },
    { id: 2, titleName: 'منسق انتاج', hourlyRate: 45 },
    { id: 3, titleName: 'شيف جاتوه', hourlyRate: 55 },
    { id: 4, titleName: 'شيف شرقي', hourlyRate: 55 },
    { id: 5, titleName: 'عامل تشغيل وتعبئة', hourlyRate: 30 }
  ]);

  const [employees, setEmployees] = useState<EmployeeDto[]>([
    { id: 1, companyId: 1, departmentId: 1, jobTitleId: 1, name: 'فتحي حميده', workerCode: '577', active: true, jobTitleName: 'مهندس انتاج' },
    { id: 2, companyId: 1, departmentId: 2, jobTitleId: 2, name: 'أحمد عبد العزيز', workerCode: '747', active: true, jobTitleName: 'منسق انتاج' },
    { id: 3, companyId: 1, departmentId: 3, jobTitleId: 3, name: 'محمد وهدان', workerCode: '476', active: true, jobTitleName: 'شيف جاتوه' }
  ]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<number>(0);
  const [selectedJobTitleFilter, setSelectedJobTitleFilter] = useState<number>(0);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form State (Left Panel)
  const [currentEmpId, setCurrentEmpId] = useState<number>(0);
  const [empName, setEmpName] = useState('');
  const [empWorkerCode, setEmpWorkerCode] = useState('');
  const [empDepartmentId, setEmpDepartmentId] = useState<number | ''>('');
  const [empJobTitleId, setEmpJobTitleId] = useState<number | ''>('');
  const [empActive, setEmpActive] = useState<boolean>(true);

  // Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isJobTitleModalOpen, setIsJobTitleModalOpen] = useState(false);
  const [newJobTitleName, setNewJobTitleName] = useState('');
  const [newJobTitleHourlyRate, setNewJobTitleHourlyRate] = useState<number>(30);
  const [importedPreviewList, setImportedPreviewList] = useState<EmployeeImportRowDto[]>([]);

  // Feedback Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedDeptFilter > 0 ||
    selectedJobTitleFilter > 0 ||
    selectedStatusFilter !== 'all'
  );

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDeptFilter(0);
    setSelectedJobTitleFilter(0);
    setSelectedStatusFilter('all');
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchesName = e.name.toLowerCase().includes(term);
        const matchesCode = e.workerCode.toLowerCase().includes(term);
        if (!matchesName && !matchesCode) return false;
      }
      if (selectedDeptFilter > 0 && e.departmentId !== selectedDeptFilter) return false;
      if (selectedJobTitleFilter > 0 && e.jobTitleId !== selectedJobTitleFilter) return false;
      if (selectedStatusFilter === 'active' && !e.active) return false;
      if (selectedStatusFilter === 'inactive' && e.active) return false;
      return true;
    });
  }, [employees, searchTerm, selectedDeptFilter, selectedJobTitleFilter, selectedStatusFilter]);

  const displayedDepartments = useMemo(() => {
    return selectedDeptFilter > 0
      ? departments.filter(d => d.id === selectedDeptFilter)
      : departments;
  }, [departments, selectedDeptFilter]);

  const resetForm = () => {
    setCurrentEmpId(0);
    setEmpName('');
    setEmpWorkerCode('');
    setEmpDepartmentId('');
    setEmpJobTitleId('');
    setEmpActive(true);
    setErrorMessage(null);
  };

  const handleEditEmployee = (emp: EmployeeDto) => {
    setCurrentEmpId(emp.id);
    setEmpName(emp.name);
    setEmpWorkerCode(emp.workerCode);
    setEmpDepartmentId(emp.departmentId);
    setEmpJobTitleId(emp.jobTitleId || '');
    setEmpActive(emp.active);
    setErrorMessage(null);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empDepartmentId) {
      setErrorMessage('يرجى كتابة اسم العامل واختيار القسم أو الصالة التابع لها.');
      return;
    }

    const jobTitleObj = jobTitles.find(j => j.id === Number(empJobTitleId));
    const titleName = jobTitleObj ? jobTitleObj.titleName : 'عامل تشغيل';

    if (currentEmpId > 0) {
      setEmployees(employees.map(emp => emp.id === currentEmpId ? {
        ...emp,
        name: empName.trim(),
        workerCode: empWorkerCode.trim() || emp.workerCode,
        departmentId: Number(empDepartmentId),
        jobTitleId: empJobTitleId ? Number(empJobTitleId) : undefined,
        jobTitleName: titleName,
        active: empActive
      } : emp));
      setSuccessMessage('تم تحديث بيانات وتوزيع العامل بنجاح.');
    } else {
      const newEmp: EmployeeDto = {
        id: Date.now(),
        companyId: 1,
        name: empName.trim(),
        workerCode: empWorkerCode.trim() || String(Math.floor(100 + Math.random() * 900)),
        departmentId: Number(empDepartmentId),
        jobTitleId: empJobTitleId ? Number(empJobTitleId) : undefined,
        jobTitleName: titleName,
        active: empActive
      };
      setEmployees([...employees, newEmp]);
      setSuccessMessage('تم تسجيل العامل الجديد وتوزيعه بالصالة بنجاح.');
    }

    resetForm();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleToggleStatus = (emp: EmployeeDto) => {
    setEmployees(employees.map(e => e.id === emp.id ? { ...e, active: !e.active } : e));
    setSuccessMessage(`تم تغيير حالة العامل (${emp.name}) إلى: ${!emp.active ? 'نشط' : 'موقوف'}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteEmployee = (emp: EmployeeDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إيقاف العامل (${emp.name})؟`)) return;
    setEmployees(employees.filter(e => e.id !== emp.id));
    setSuccessMessage(`تمت إزالة العامل (${emp.name}) بنجاح.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSaveQuickJobTitle = () => {
    if (!newJobTitleName.trim()) {
      setErrorMessage('يرجى كتابة اسم الوظيفة أولاً.');
      return;
    }

    const createdTitle: JobTitleLookupDto = {
      id: Date.now(),
      titleName: newJobTitleName.trim(),
      hourlyRate: Number(newJobTitleHourlyRate) || 30
    };

    setJobTitles([...jobTitles, createdTitle]);
    setEmpJobTitleId(createdTitle.id);
    setNewJobTitleName('');
    setIsJobTitleModalOpen(false);
    setSuccessMessage(`تمت إضافة المسمى الوظيفي (${createdTitle.titleName}) بنجاح!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleExportToExcel = () => {
    let csv = 'كود_العامل,اسم_العامل,القسم_التابع_له,المسمى_الوظيفي,الحالة\n';
    filteredEmployees.forEach(emp => {
      const deptName = departments.find(d => d.id === emp.departmentId)?.departmentName || 'غير محدد';
      const status = emp.active ? 'نشط' : 'معطل';
      csv += `"${emp.workerCode}","${emp.name}","${deptName}","${emp.jobTitleName}","${status}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كشف_القوة_العاملة_أبو_عادل_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    let csv = 'كود_العامل,اسم_العامل,القسم_او_كود_القسم,المسمى_الوظيفي,الحالة\n';
    csv += '577,فتحي حميده,إدارة الإنتاج,مهندس انتاج,1\n';
    csv += '747,أحمد عبد العزيز,قسم الشرقي والمخبوزات,منسق انتاج,1\n';
    csv += '476,محمد وهدان,قسم الجاتوه والتورت والحلويات الغربية,شيف جاتوه,1\n';

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قالب_استيراد_العمال_أبو_عادل.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;

      const preview: EmployeeImportRowDto[] = [];
      for (let i = 1; i < lines.Length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (cols.length >= 2) {
          preview.push({
            employeeCode: cols[0],
            name: cols[1],
            departmentNameOrCode: cols[2] || '',
            jobTitleName: cols[3] || 'عامل تشغيل',
            active: cols[4] !== '0' && cols[4] !== 'معطل'
          });
        }
      }
      setImportedPreviewList(preview);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    const newItems: EmployeeDto[] = importedPreviewList.map((row, idx) => {
      const matchedDept = departments.find(d =>
        d.departmentName.includes(row.departmentNameOrCode) ||
        row.departmentNameOrCode.includes(d.departmentName)
      ) || departments[0];

      return {
        id: Date.now() + idx,
        companyId: 1,
        name: row.name,
        workerCode: row.employeeCode || String(Date.now() + idx),
        departmentId: matchedDept.id,
        jobTitleName: row.jobTitleName || 'عامل تشغيل',
        active: row.active
      };
    });

    setEmployees([...employees, ...newItems]);
    setIsImportModalOpen(false);
    setImportedPreviewList([]);
    setSuccessMessage(`اكتملت المعالجة: تم استيراد وتوزيع (${newItems.length}) عاملاً على الصالات بنجاح!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الصفحة وأزرار التصدير والاستيراد */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              <span>إدارة وتوزيع العمال بالصالات (Workers Allocation & Operations)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              الهيكل التنظيمي الميداني
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            تسجيل، تعديل، وحذف القوة العاملة وتوزيعهم على صالات التشغيل بدقة تامة.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تحميل قالب الإكسيل</span>
          </button>

          <button
            onClick={() => {
              setImportedPreviewList([]);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد من إكسيل</span>
          </button>
        </div>
      </div>

      {/* تنبيهات النظام */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl text-xs font-bold flex justify-between items-center">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. الهيكل التنظيمي وشريط الفلاتر المتقدمة (الجانب الأيمن) */}
        <div className="lg:col-span-8 space-y-4">
          {/* شريط الفلاتر */}
          <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm text-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <div>
                <label className="block text-gray-400 font-bold mb-1">🔍 بحث سريع (اسم أو كود)</label>
                <input
                  type="text"
                  placeholder="اكتب الاسم أو الكود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 outline-none font-bold text-gray-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">🏢 الإدارة / الصالة</label>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 outline-none font-bold text-gray-800 dark:text-zinc-200"
                >
                  <option value={0}>-- كل الأقسام والصالات --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">💼 المسمى الوظيفي</label>
                <select
                  value={selectedJobTitleFilter}
                  onChange={(e) => setSelectedJobTitleFilter(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 outline-none font-bold text-gray-800 dark:text-zinc-200"
                >
                  <option value={0}>-- كل الوظائف --</option>
                  {jobTitles.map(j => (
                    <option key={j.id} value={j.id}>{j.titleName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">⚡ حالة العامل</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 outline-none font-bold text-gray-800 dark:text-zinc-200"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">🟢 نشط فقط</option>
                  <option value="inactive">🔴 غير نشط</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  نتائج التصفية: ({filteredEmployees.length} من إجمالي {employees.length} عامل مسجل)
                </span>
                <button
                  onClick={resetFilters}
                  className="text-rose-500 hover:text-rose-600 font-bold"
                >
                  ✕ إلغاء الفلاتر وعرض الكل
                </button>
              </div>
            )}
          </div>

          {/* بطاقة عرض وتوزيع العمال بالصالات */}
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
            <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold">الهيكل التنظيمي وتوزيع العمل في الصالات</span>
              <span className="bg-indigo-600 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px]">
                المعروض: {filteredEmployees.length} عامل
              </span>
            </div>

            <div className="p-4 space-y-4 max-h-[72vh] overflow-y-auto">
              {displayedDepartments.map(dept => {
                const deptEmps = filteredEmployees.filter(e => e.departmentId === dept.id);
                if (hasActiveFilters && deptEmps.length === 0 && selectedDeptFilter === 0) return null;

                return (
                  <div key={dept.id} className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Folder className="w-4 h-4 text-amber-500" />
                        <span>{dept.departmentName}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${deptEmps.length > 0 ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 text-gray-400'}`}>
                        {deptEmps.length} عمال
                      </span>
                    </div>

                    <div className="p-3">
                      {deptEmps.length === 0 ? (
                        <div className="text-gray-400 text-center py-2">لا يوجد عمال مسجلين في هذا القسم حالياً.</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {deptEmps.map(emp => (
                            <div
                              key={emp.id}
                              className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                                emp.id === currentEmpId
                                  ? 'border-indigo-500 bg-indigo-500/5'
                                  : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d11]'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 text-sm">
                                  <span>{emp.name}</span>
                                  {!emp.active && (
                                    <span className="bg-rose-500/10 text-rose-500 px-1.5 py-0.2 rounded text-[9px] font-bold">
                                      موقوف
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                                  <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded font-bold">
                                    {emp.jobTitleName}
                                  </span>
                                  <span className="text-gray-400">كود: {emp.workerCode}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditEmployee(emp)}
                                  className="px-2 py-1 bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold hover:bg-indigo-100"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(emp)}
                                  className={`px-2 py-1 rounded-lg font-bold ${
                                    emp.active
                                      ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                  }`}
                                >
                                  {emp.active ? 'إيقاف' : 'تفعيل'}
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(emp)}
                                  className="p-1 text-rose-500 hover:text-rose-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. بطاقة تسجيل / تعديل عامل (الجانب الأيسر) */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 text-xs space-y-4 sticky top-6">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{currentEmpId > 0 ? '✏️ تعديل بيانات عامل' : '➕ تسجيل عامل جديد'}</span>
              </h3>
              {currentEmpId > 0 && (
                <button onClick={resetForm} className="text-gray-400 hover:text-white text-[11px]">إلغاء التعديل</button>
              )}
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3">
              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم العامل الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمود الدسوقي..."
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">كود العامل (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: 577 أو W-105..."
                  value={empWorkerCode}
                  onChange={(e) => setEmpWorkerCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-center text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">القسم / الصالة التابع لها *</label>
                <select
                  required
                  value={empDepartmentId}
                  onChange={(e) => setEmpDepartmentId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-indigo-500 rounded-xl font-bold"
                >
                  <option value="">-- اختر القسم أو الإدارة --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold">المسمى الوظيفي</label>
                  <button
                    type="button"
                    onClick={() => setIsJobTitleModalOpen(true)}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    + إضافة مسمى جديد
                  </button>
                </div>
                <select
                  value={empJobTitleId}
                  onChange={(e) => setEmpJobTitleId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                >
                  <option value="">-- غير محدد --</option>
                  {jobTitles.map(j => (
                    <option key={j.id} value={j.id}>{j.titleName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="empActiveStatus"
                  checked={empActive}
                  onChange={(e) => setEmpActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="empActiveStatus" className="font-bold text-gray-700 dark:text-zinc-300 cursor-pointer">
                  حالة العامل: نشط ومتاح للتشغيل
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-sm transition-all"
              >
                {currentEmpId > 0 ? 'تحديث بيانات العامل' : 'حفظ وتوزيع العامل'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* مودال استيراد الإكسيل الذكي */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>استيراد كشف العمال من ملف إكسيل</span>
              </h4>
              <button onClick={() => setIsImportModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl">
                يقوم النظام آلياً بربط كل عامل بصالته وقسمه بدقة بالغة ويمنع تكرار السجلات، كما يربطه بمسمّاه الوظيفي المعتمد.
              </div>

              <div className="p-4 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50">
                <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">اختر ملف الإكسيل / CSV من جهازك:</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelected}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {importedPreviewList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 dark:text-zinc-200">
                      معاينة بيانات العمال المقروءة ({importedPreviewList.length} عامل):
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded text-[10px]">
                      جاهز للاستيراد
                    </span>
                  </div>

                  <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-center bg-white dark:bg-[#0c0d11]">
                      <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                        <tr>
                          <th className="py-2 px-3">الكود</th>
                          <th className="py-2 px-3 text-right">اسم العامل</th>
                          <th className="py-2 px-3 text-right">القسم / الصالة</th>
                          <th className="py-2 px-3">المسمى الوظيفي</th>
                          <th className="py-2 px-3">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {importedPreviewList.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.employeeCode}</td>
                            <td className="py-2 px-3 text-right font-bold">{row.name}</td>
                            <td className="py-2 px-3 text-right text-gray-500">{row.departmentNameOrCode}</td>
                            <td className="py-2 px-3"><span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{row.jobTitleName}</span></td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                {row.active ? 'نشط' : 'معطل'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={importedPreviewList.length === 0}
                  onClick={handleProcessImport}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm disabled:opacity-40"
                >
                  تأكيد واستيراد كافة العمال ({importedPreviewList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة مسمى وظيفي جديد سريعاً */}
      {isJobTitleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2 text-indigo-400">
                <Briefcase className="w-4 h-4" />
                <span>إضافة مسمى وظيفي جديد</span>
              </h4>
              <button onClick={() => setIsJobTitleModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم الوظيفة *</label>
                <input
                  type="text"
                  placeholder="مثال: معلم شرقي / فني تعبئة..."
                  value={newJobTitleName}
                  onChange={(e) => setNewJobTitleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">أجر الساعة الاسترشادي للتكاليف (ج.م):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newJobTitleHourlyRate}
                  onChange={(e) => setNewJobTitleHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-center font-bold"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsJobTitleModalOpen(false)}
                  className="px-4 py-1.5 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickJobTitle}
                  className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-sm"
                >
                  حفظ المسمى
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
