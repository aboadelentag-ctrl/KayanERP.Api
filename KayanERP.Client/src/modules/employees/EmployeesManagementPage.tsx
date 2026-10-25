import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Building2,
  FolderOpen,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileSpreadsheet,
  Download,
  Upload,
  Edit2,
  Trash2,
  Briefcase,
  X,
  BadgeCheck
} from 'lucide-react';
import {
  fetchEmployeesLookupsApi,
  fetchEmployeesApi,
  saveEmployeeApi,
  saveQuickJobTitleApi,
  toggleEmployeeStatusApi,
  deleteEmployeeApi
} from './employeesApi';
import type {
  EmployeeDto,
  DepartmentItemDto,
  JobTitleLookupDto,
  EmployeeImportRowDto
} from './employeesApi';

export const EmployeesManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentItemDto[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitleLookupDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavingImport, setIsSavingImport] = useState<boolean>(false);

  // Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<number>(0);
  const [selectedJobTitleFilter, setSelectedJobTitleFilter] = useState<number>(0);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Form State
  const [currentEmp, setCurrentEmp] = useState<EmployeeDto>({
    id: 0,
    name: '',
    workerCode: '',
    departmentId: undefined,
    jobTitleId: undefined,
    active: true
  });

  // Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isJobTitleModalOpen, setIsJobTitleModalOpen] = useState<boolean>(false);
  const [newJobTitleName, setNewJobTitleName] = useState<string>('');
  const [newJobTitleHourlyRate, setNewJobTitleHourlyRate] = useState<number>(25);
  const [importedPreviewList, setImportedPreviewList] = useState<EmployeeImportRowDto[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [lookups, emps] = await Promise.all([
        fetchEmployeesLookupsApi(),
        fetchEmployeesApi()
      ]);
      setDepartments(lookups.departments);
      setJobTitles(lookups.jobTitles);
      setEmployees(emps);
    } catch (ex: any) {
      setErrorMessage(`تعذر جلب بيانات العمال: ${ex.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== '' ||
      selectedDeptFilter > 0 ||
      selectedJobTitleFilter > 0 ||
      selectedStatusFilter !== 'all'
    );
  }, [searchTerm, selectedDeptFilter, selectedJobTitleFilter, selectedStatusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDeptFilter(0);
    setSelectedJobTitleFilter(0);
    setSelectedStatusFilter('all');
  };

  const getEmpName = (emp: EmployeeDto) => emp.name || emp.fullName || emp.employeeName || `عامل #${emp.id}`;
  const getEmpCode = (emp: EmployeeDto) => emp.workerCode || emp.employeeCode || emp.code || '';
  const getEmpJob = (emp: EmployeeDto) => {
    if (emp.jobTitleId) {
      const match = jobTitles.find(j => j.id === emp.jobTitleId);
      if (match) return match.titleName;
    }
    return emp.jobTitleName || emp.jobTitle || 'عامل تشغيل';
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const name = getEmpName(e);
      const code = getEmpCode(e);

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (!name.toLowerCase().includes(term) && !code.toLowerCase().includes(term)) {
          return false;
        }
      }

      if (selectedDeptFilter > 0 && e.departmentId !== selectedDeptFilter) {
        return false;
      }

      if (selectedJobTitleFilter > 0 && e.jobTitleId !== selectedJobTitleFilter) {
        return false;
      }

      if (selectedStatusFilter === 'active' && !e.active) return false;
      if (selectedStatusFilter === 'inactive' && e.active) return false;

      return true;
    });
  }, [employees, searchTerm, selectedDeptFilter, selectedJobTitleFilter, selectedStatusFilter, jobTitles]);

  const displayedDepartments = useMemo(() => {
    return selectedDeptFilter > 0
      ? departments.filter(d => d.id === selectedDeptFilter)
      : departments;
  }, [departments, selectedDeptFilter]);

  const handleEdit = (emp: EmployeeDto) => {
    setCurrentEmp({
      id: emp.id,
      name: getEmpName(emp),
      workerCode: getEmpCode(emp),
      departmentId: emp.departmentId,
      jobTitleId: emp.jobTitleId,
      active: emp.active
    });
    setErrorMessage(null);
  };

  const resetForm = () => {
    setCurrentEmp({
      id: 0,
      name: '',
      workerCode: '',
      departmentId: departments[0]?.id,
      jobTitleId: jobTitles[0]?.id,
      active: true
    });
    setErrorMessage(null);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp.name?.trim() || !currentEmp.departmentId) {
      setErrorMessage('يرجى كتابة اسم العامل واختيار القسم التابع له.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const payload: EmployeeDto = {
        id: currentEmp.id,
        name: currentEmp.name.trim(),
        workerCode: currentEmp.workerCode?.trim() || '',
        employeeCode: currentEmp.workerCode?.trim() || '',
        departmentId: currentEmp.departmentId,
        jobTitleId: currentEmp.jobTitleId || undefined,
        active: currentEmp.active
      };

      await saveEmployeeApi(payload);

      setEmployees(prev => {
        if (currentEmp.id > 0) {
          return prev.map(item => (item.id === currentEmp.id ? { ...payload } : item));
        }
        return [...prev, { ...payload, id: Date.now() }];
      });

      setSuccessMessage(currentEmp.id > 0 ? 'تم تحديث بيانات العامل بنجاح.' : 'تم تسجيل العامل الجديد وتوزيعه بالصالة بنجاح.');
      resetForm();
    } catch (ex: any) {
      setErrorMessage(`خطأ أثناء الاتصال: ${ex.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (emp: EmployeeDto) => {
    try {
      await toggleEmployeeStatusApi(emp.id);
      setEmployees(prev =>
        prev.map(e => (e.id === emp.id ? { ...e, active: !e.active } : e))
      );
      setSuccessMessage(`تم تغيير حالة العامل (${getEmpName(emp)}) إلى: ${!emp.active ? 'نشط' : 'معطل'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (ex: any) {
      setErrorMessage(`خطأ في تعديل الحالة: ${ex.message}`);
    }
  };

  const handleDelete = async (emp: EmployeeDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إيقاف العامل (${getEmpName(emp)})؟`)) return;
    try {
      await deleteEmployeeApi(emp.id);
      setEmployees(prev => prev.filter(e => e.id !== emp.id));
      setSuccessMessage(`تمت معالجة حذف / إيقاف العامل (${getEmpName(emp)}) بنجاح.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (ex: any) {
      setErrorMessage(`خطأ أثناء الحذف: ${ex.message}`);
    }
  };

  const handleSaveQuickJobTitle = async () => {
    if (!newJobTitleName.trim()) {
      setErrorMessage('يرجى كتابة اسم الوظيفة أولاً.');
      return;
    }

    try {
      const newId = await saveQuickJobTitleApi({
        titleName: newJobTitleName.trim(),
        hourlyRate: newJobTitleHourlyRate
      });

      const newTitleObj = { id: newId, titleName: newJobTitleName.trim(), hourlyRate: newJobTitleHourlyRate };
      setJobTitles(prev => [...prev, newTitleObj]);
      setCurrentEmp(prev => ({ ...prev, jobTitleId: newId }));
      setSuccessMessage(`تمت إضافة المسمى الوظيفي (${newJobTitleName}) بنجاح!`);
      setNewJobTitleName('');
      setIsJobTitleModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (ex: any) {
      setErrorMessage(`خطأ في حفظ المسمى: ${ex.message}`);
    }
  };

  // Export
  const exportToExcel = () => {
    if (!employees.length) {
      setErrorMessage('لا يوجد عمال مسجلين لتصديرهم.');
      return;
    }

    const headers = 'كود_العامل,اسم_العامل,القسم_التابع_له,المسمى_الوظيفي,الحالة\n';
    const rows = filteredEmployees
      .map(emp => {
        const deptName = departments.find(d => d.id === emp.departmentId)?.departmentName || 'غير محدد';
        const titleName = getEmpJob(emp);
        const status = emp.active ? 'نشط' : 'معطل';
        return `"${getEmpCode(emp)}","${getEmpName(emp)}","${deptName}","${titleName}","${status}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كشف_القوة_العاملة_أبو_عادل_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('تم تصدير كشف العمال إلى إكسيل بنجاح.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Download Template
  const downloadTemplate = () => {
    const content =
      'كود_العامل,اسم_العامل,القسم_او_كود_القسم,المسمى_الوظيفي,الحالة\n577,فتحي حميده,إدارة الإنتاج,مهندس انتاج,1\n747,أحمد عبد العزيز,قسم الشرقي,منسق انتاج,1\n476,محمد وهدان,قسم الجاتوه,شيف جاتوه,1';
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قالب_استيراد_العمال_أبو_عادل.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // File import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        setErrorMessage('الملف المرفوع فارغ أو لا يحتوي على صفوف بيانات.');
        return;
      }

      const rows: EmployeeImportRowDto[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 2) {
          rows.push({
            employeeCode: cols[0],
            name: cols[1],
            departmentNameOrCode: cols[2] || '',
            jobTitleName: cols[3] || '',
            active: cols[4] === '1' || cols[4]?.toLowerCase() === 'نشط' || cols[4]?.toLowerCase() === 'مفعل' || cols[4]?.toLowerCase() === 'true'
          });
        }
      }
      setImportedPreviewList(rows);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleProcessImport = async () => {
    if (!importedPreviewList.length) return;

    setIsSavingImport(true);
    setErrorMessage(null);
    try {
      const newItems: EmployeeDto[] = [...employees];

      for (const row of importedPreviewList) {
        const matchedDept = departments.find(
          d => d.departmentName.includes(row.departmentNameOrCode) || row.departmentNameOrCode.includes(d.departmentName)
        );
        const matchedJob = jobTitles.find(
          j => j.titleName.includes(row.jobTitleName) || row.jobTitleName.includes(j.titleName)
        );

        const existing = newItems.find(
          e => (e.workerCode && e.workerCode === row.employeeCode) || getEmpName(e) === row.name
        );

        if (existing) {
          existing.name = row.name;
          existing.workerCode = row.employeeCode;
          existing.departmentId = matchedDept ? matchedDept.id : existing.departmentId;
          existing.jobTitleId = matchedJob ? matchedJob.id : existing.jobTitleId;
          existing.active = row.active;
        } else {
          newItems.push({
            id: Date.now() + Math.random(),
            name: row.name,
            workerCode: row.employeeCode,
            departmentId: matchedDept ? matchedDept.id : departments[0]?.id,
            jobTitleId: matchedJob ? matchedJob.id : jobTitles[0]?.id,
            active: row.active
          });
        }
      }

      setEmployees(newItems);
      setSuccessMessage(`اكتملت المعالجة: تم استيراد وتوزيع (${importedPreviewList.length}) عاملاً على صالاتهم بدقة.`);
      setIsImportModalOpen(false);
      setImportedPreviewList([]);
    } catch (ex: any) {
      setErrorMessage(`خطأ أثناء معالجة استيراد العمال: ${ex.message}`);
    } finally {
      setIsSavingImport(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* رأس الصفحة وأزرار التصدير والاستيراد */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>إدارة وتوزيع العمال بالصالات (Workers Allocation & Operations)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل، تعديل، وحذف القوة العاملة وتوزيعهم على صالات التشغيل بدقة تامة.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تحميل قالب الإكسيل</span>
          </button>
          <button
            onClick={() => {
              setImportedPreviewList([]);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>استيراد من إكسيل</span>
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            <RotateCw className="w-4 h-4 text-indigo-600" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* الجانب الأيمن: الهيكل وشريط الفلاتر وعرض كروت الصالات */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs text-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-gray-700 font-bold mb-1">🔍 بحث سريع (اسم أو كود)</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="اكتب الاسم أو الكود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-8 pl-3 py-1.5 outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">🏢 الإدارة / الصالة</label>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2 py-1.5 font-bold text-gray-700 outline-none"
                >
                  <option value={0}>-- كل الأقسام والصالات --</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">💼 المسمى الوظيفي</label>
                <select
                  value={selectedJobTitleFilter}
                  onChange={(e) => setSelectedJobTitleFilter(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2 py-1.5 font-bold text-gray-700 outline-none"
                >
                  <option value={0}>-- كل الوظائف --</option>
                  {jobTitles.map(title => (
                    <option key={title.id} value={title.id}>{title.titleName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">⚡ حالة العامل</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2 py-1.5 font-bold text-gray-700 outline-none"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">🟢 نشط فقط</option>
                  <option value="inactive">🔴 غير نشط</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-indigo-700 font-bold text-[11px]">
                  نتائج التصفية: ({filteredEmployees.length} من إجمالي {employees.length} عامل مسجل)
                </span>
                <button
                  onClick={resetFilters}
                  className="text-rose-600 hover:text-rose-800 font-bold text-[11px]"
                >
                  ✕ إلغاء الفلاتر وعرض الكل
                </button>
              </div>
            )}
          </div>

          {/* استعراض وتوزيع العمال في الصالات */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold">الهيكل التنظيمي وتوزيع العمل في الصالات</span>
              <span className="bg-indigo-600 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                المعروض: {filteredEmployees.length} عامل
              </span>
            </div>

            <div className="p-4 space-y-4 max-h-[72vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-12 text-center text-gray-400 font-bold">جاري تحميل بيانات القوة العاملة...</div>
              ) : displayedDepartments.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-bold">لا توجد أقسام مسجلة بالنظام.</div>
              ) : (
                displayedDepartments.map(dept => {
                  const deptEmps = filteredEmployees.filter(e => e.departmentId === dept.id);
                  if (hasActiveFilters && deptEmps.length === 0 && selectedDeptFilter === 0) return null;

                  return (
                    <div key={dept.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <FolderOpen className="w-4 h-4 text-indigo-600" />
                          <span>{dept.departmentName}</span>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${deptEmps.length > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-100 text-gray-500'}`}>
                          {deptEmps.length} عمال
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50">
                        {deptEmps.length === 0 ? (
                          <div className="text-center text-gray-400 py-2">لا يوجد عمال مسجلين في هذا القسم حالياً.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {deptEmps.map(emp => (
                              <div
                                key={emp.id}
                                className={`p-2.5 rounded-xl border flex justify-between items-center ${emp.id === currentEmp.id ? 'border-indigo-500 bg-indigo-50/50' : 'bg-white border-gray-200'}`}
                              >
                                <div>
                                  <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                    <span>{getEmpName(emp)}</span>
                                    {!emp.active && (
                                      <span className="bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded text-[9px] font-bold">موقوف</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="bg-cyan-50 text-cyan-800 px-1.5 py-0.2 rounded text-[10px] font-bold border border-cyan-200">
                                      {getEmpJob(emp)}
                                    </span>
                                    {getEmpCode(emp) && (
                                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-mono border">
                                        كود: {getEmpCode(emp)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEdit(emp)}
                                    className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded"
                                  >
                                    تعديل
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(emp)}
                                    className={`px-2 py-0.5 rounded font-bold ${emp.active ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}
                                  >
                                    {emp.active ? 'إيقاف' : 'تفعيل'}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(emp)}
                                    className="p-1 hover:text-rose-600"
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
                })
              )}
            </div>
          </div>
        </div>

        {/* الجانب الأيسر: بطاقة تسجيل / تعديل عامل */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="bg-indigo-600 text-white p-3.5 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-300" />
                <span>{currentEmp.id > 0 ? '✏️ تعديل بيانات عامل' : '➕ تسجيل عامل جديد'}</span>
              </span>
              {currentEmp.id > 0 && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] bg-indigo-800 hover:bg-indigo-900 text-white px-2 py-0.5 rounded"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            <form onSubmit={handleSaveEmployee} className="p-4 space-y-3 bg-slate-50">
              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم العامل الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمود الدسوقي"
                  value={currentEmp.name || ''}
                  onChange={(e) => setCurrentEmp({ ...currentEmp, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">كود العامل (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: 577 أو W-105"
                  value={currentEmp.workerCode || ''}
                  onChange={(e) => setCurrentEmp({ ...currentEmp, workerCode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">القسم / الإدارة التابع لها *</label>
                <select
                  required
                  value={currentEmp.departmentId || ''}
                  onChange={(e) => setCurrentEmp({ ...currentEmp, departmentId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                >
                  <option value="">-- اختر القسم أو الإدارة --</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-700 font-bold mb-0">المسمى الوظيفي</label>
                  <button
                    type="button"
                    onClick={() => setIsJobTitleModalOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px]"
                  >
                    ➕ إضافة مسمى جديد
                  </button>
                </div>
                <select
                  value={currentEmp.jobTitleId || ''}
                  onChange={(e) => setCurrentEmp({ ...currentEmp, jobTitleId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                >
                  <option value="">-- غير محدد --</option>
                  {jobTitles.map(title => (
                    <option key={title.id} value={title.id}>{title.titleName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allocActiveCheck"
                  checked={currentEmp.active}
                  onChange={(e) => setCurrentEmp({ ...currentEmp, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <label htmlFor="allocActiveCheck" className="font-bold text-gray-700 cursor-pointer">
                  حالة العامل: نشط ومتاح للتشغيل
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                {currentEmp.id > 0 && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSaving ? '⏳ جاري الحفظ...' : currentEmp.id > 0 ? 'تحديث العامل' : 'حفظ وتوزيع العامل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* نافذة استيراد الإكسيل الذكية */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>استيراد كشف العمال من ملف إكسيل / CSV</span>
              </h4>
              <button onClick={() => setIsImportModalOpen(false)} className="text-white">×</button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-xl">
                💡 يقوم النظام آلياً بربط كل عامل بصالته وقسمه بدقة بالغة ويمنع تكرار السجلات، كما يربطه بمسمّاه الوظيفي المعتمد.
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">
                <label className="block text-gray-700 font-bold mb-1">اختر ملف الإكسيل / CSV من جهازك:</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv, text/csv"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {importedPreviewList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">
                      معاينة بيانات العمال المقروءة من الملف ({importedPreviewList.length} عامل):
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      جاهز للاستيراد
                    </span>
                  </div>

                  <div className="border rounded-xl overflow-hidden bg-white max-h-56 overflow-y-auto">
                    <table className="w-full text-center">
                      <thead className="bg-slate-100 text-gray-700">
                        <tr>
                          <th className="py-2 px-2">الكود</th>
                          <th className="py-2 px-2 text-right">اسم العامل</th>
                          <th className="py-2 px-2">القسم / الصالة</th>
                          <th className="py-2 px-2">المسمى الوظيفي</th>
                          <th className="py-2 px-2">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {importedPreviewList.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 px-2 font-mono font-bold text-indigo-700">{row.employeeCode}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-gray-900">{row.name}</td>
                            <td className="py-1.5 px-2 text-gray-600">{row.departmentNameOrCode}</td>
                            <td className="py-1.5 px-2 text-slate-700">{row.jobTitleName}</td>
                            <td className="py-1.5 px-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
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
            </div>

            <div className="p-3 bg-white border-t flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSavingImport || !importedPreviewList.length}
                onClick={handleProcessImport}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {isSavingImport ? '⏳ جاري المعالجة والتوزيع...' : `تأكيد واستيراد كافة العمال (${importedPreviewList.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal إضافة مسمى وظيفي جديد سريعاً */}
      {isJobTitleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>إضافة مسمى وظيفي جديد</span>
              </h4>
              <button onClick={() => setIsJobTitleModalOpen(false)} className="text-white">×</button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم الوظيفة *</label>
                <input
                  type="text"
                  placeholder="مثال: معلم شرقي / فني تعبئة"
                  value={newJobTitleName}
                  onChange={(e) => setNewJobTitleName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">أجر الساعة الاسترشادي للتكاليف (ج.م):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newJobTitleHourlyRate}
                  onChange={(e) => setNewJobTitleHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-center font-bold"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsJobTitleModalOpen(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickJobTitle}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
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
