import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileSpreadsheet,
  Upload,
  Edit2,
  Trash2,
  Building,
  Briefcase,
  X
} from 'lucide-react';
import {
  fetchEmployeesLookupsApi,
  fetchEmployeesApi,
  saveEmployeeApi,
  toggleEmployeeStatusApi,
  deleteEmployeeApi
} from './employeesApi';
import type { EmployeeDto, DepartmentSimpleDto } from './employeesApi';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentSimpleDto[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingEmp, setEditingEmp] = useState<EmployeeDto>({
    id: 0,
    code: '',
    fullName: '',
    departmentName: '',
    jobTitle: '',
    active: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [lookups, emps] = await Promise.all([
        fetchEmployeesLookupsApi(),
        fetchEmployeesApi()
      ]);
      setDepartments(lookups.departments);
      setJobTitles(lookups.jobTitles);
      setEmployees(emps);
    } catch (ex: any) {
      setStatusMessage(`خطأ في جلب بيانات العاملين: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayCode = (emp: EmployeeDto) => {
    return emp.workerCode || emp.employeeCode || emp.code || `EMP-${emp.id}`;
  };

  const getDisplayName = (emp: EmployeeDto) => {
    return emp.fullName || emp.employeeName || emp.name || `عامل #${emp.id}`;
  };

  const getDisplayDept = (emp: EmployeeDto) => {
    return emp.departmentName || 'قسم الشرقي والمخبوزات';
  };

  const getDisplayJob = (emp: EmployeeDto) => {
    return emp.jobTitleName || emp.jobTitle || 'عامل تشغيل';
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const dept = getDisplayDept(e);
      const job = getDisplayJob(e);
      const code = getDisplayCode(e);
      const name = getDisplayName(e);

      if (selectedDeptFilter && dept !== selectedDeptFilter) return false;
      if (selectedJobFilter && job !== selectedJobFilter) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        code.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term) ||
        dept.toLowerCase().includes(term) ||
        job.toLowerCase().includes(term)
      );
    });
  }, [employees, selectedDeptFilter, selectedJobFilter, searchTerm]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDeptFilter('');
    setSelectedJobFilter('');
  };

  const openNewEmployeeModal = () => {
    setModalError(null);
    setEditingEmp({
      id: 0,
      code: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      departmentName: departments[0]?.displayName || 'قسم الشرقي والمخبوزات',
      jobTitle: jobTitles[0] || 'عامل تشغيل',
      active: true
    });
    setIsModalOpen(true);
  };

  const openEditEmployeeModal = (emp: EmployeeDto) => {
    setModalError(null);
    setEditingEmp({
      id: emp.id,
      code: getDisplayCode(emp),
      fullName: getDisplayName(emp),
      departmentName: getDisplayDept(emp),
      jobTitle: getDisplayJob(emp),
      active: emp.active
    });
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp.fullName?.trim() || !editingEmp.code?.trim()) {
      setModalError('⚠️ يرجى إدخال الكود الوظيفي والاسم الرسمي كاملاً!');
      return;
    }

    setIsSaving(true);
    setModalError(null);
    try {
      const payload: EmployeeDto = {
        id: editingEmp.id,
        code: editingEmp.code.trim(),
        employeeCode: editingEmp.code.trim(),
        workerCode: editingEmp.code.trim(),
        fullName: editingEmp.fullName.trim(),
        employeeName: editingEmp.fullName.trim(),
        name: editingEmp.fullName.trim(),
        departmentName: editingEmp.departmentName,
        jobTitle: editingEmp.jobTitle?.trim(),
        jobTitleName: editingEmp.jobTitle?.trim(),
        active: editingEmp.active
      };

      await saveEmployeeApi(payload);

      setEmployees(prev => {
        if (editingEmp.id > 0) {
          return prev.map(item => (item.id === editingEmp.id ? { ...payload } : item));
        }
        return [...prev, { ...payload, id: Date.now() }];
      });

      setStatusMessage(`✅ تم حفظ بيانات الموظف [${editingEmp.code}] ${editingEmp.fullName} بنجاح!`);
      setIsSuccess(true);
      setIsModalOpen(false);
    } catch (ex: any) {
      setModalError(`❌ خطأ: ${ex.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (emp: EmployeeDto) => {
    await toggleEmployeeStatusApi(emp.id);
    setEmployees(prev =>
      prev.map(e => (e.id === emp.id ? { ...e, active: !e.active } : e))
    );
    setStatusMessage(`تم تغيير حالة الموظف (${getDisplayName(emp)}) إلى: ${!emp.active ? 'نشط' : 'معطل'}`);
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteEmployee = async (emp: EmployeeDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إيقاف الموظف [${getDisplayName(emp)}]؟`)) return;
    await deleteEmployeeApi(emp.id);
    setEmployees(prev => prev.filter(e => e.id !== emp.id));
    setStatusMessage('تمت معالجة حذف / إيقاف الموظف بنجاح.');
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const exportEmployeesToExcel = () => {
    if (!filteredEmployees.length) return;
    const headers = 'الكود الوظيفي,الاسم الرباعي الرسمي,القسم والصالة,المسمى الوظيفي المعتمد,الحالة\n';
    const rows = filteredEmployees
      .map(emp => {
        const status = emp.active ? 'نشط' : 'معطل';
        return `"${getDisplayCode(emp)}","${getDisplayName(emp)}","${getDisplayDept(emp)}","${getDisplayJob(emp)}","${status}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل_العمال_والورديات_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async evt => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) return;

      const newEmps: EmployeeDto[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 2) {
          const code = cols[0];
          const name = cols[1];
          const dept = cols[2] || 'قسم الشرقي والمخبوزات';
          const job = cols[3] || 'عامل تشغيل';

          const item: EmployeeDto = {
            id: Date.now() + i,
            code,
            employeeCode: code,
            fullName: name,
            employeeName: name,
            departmentName: dept,
            jobTitle: job,
            active: true
          };
          newEmps.push(item);
          await saveEmployeeApi(item);
        }
      }

      setEmployees(prev => [...newEmps, ...prev]);
      setStatusMessage(`✅ تم استيراد (${newEmps.length}) موظفاً وتوزيعهم بنجاح!`);
      setIsSuccess(true);
      setTimeout(() => setStatusMessage(null), 4000);
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-cyan-400 flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span>إدارة العمال والفنيين والورديات (HR Master & Staff Registry)</span>
            </h1>
            <span className="bg-cyan-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              شؤون العاملين
            </span>
          </div>
          <p className="text-xs text-slate-400">
            حصر الكوادر الميدانية وربطهم بالأقسام وصالات الإنتاج وتثبيت العهد والماكينات بالكود الوظيفي الرسمي.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={openNewEmployeeModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل موظف / عامل جديد</span>
          </button>
          <button
            onClick={exportEmployeesToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير إكسيل</span>
          </button>
          <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 shadow-xs transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>استيراد من إكسيل</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleImportCsv}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* شريط فلاتر البحث والفرز */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بكود الموظف، الاسم، أو المسمى..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-cyan-500 font-medium"
          />
        </div>

        <select
          value={selectedDeptFilter}
          onChange={(e) => setSelectedDeptFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كل الأقسام والصالات المعتمدة --</option>
          {departments.map(d => (
            <option key={d.id} value={d.displayName}>{d.displayName}</option>
          ))}
        </select>

        <select
          value={selectedJobFilter}
          onChange={(e) => setSelectedJobFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كل المسميات الوظيفية --</option>
          {jobTitles.map(j => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
        >
          إلغاء الفلاتر
        </button>
      </div>

      {/* جدول العاملين */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
          <span className="font-bold">
            📋 سجل القوى العاملة بالصالات والمصنع (المعروض: {filteredEmployees.length} من أصل {employees.length})
          </span>
          <span className="bg-slate-800 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
            محدث من قاعدة البيانات
          </span>
        </div>

        <table className="w-full text-center">
          <thead className="bg-slate-100 text-gray-700">
            <tr>
              <th className="py-2.5 px-3 w-36">الكود الوظيفي</th>
              <th className="py-2.5 px-3 text-right">الاسم الرباعي الرسمي</th>
              <th className="py-2.5 px-3">القسم / الصالة</th>
              <th className="py-2.5 px-3">المسمى الوظيفي المعتمد</th>
              <th className="py-2.5 px-3">الحالة</th>
              <th className="py-2.5 px-3 w-44">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 font-bold">
                  جاري تحميل بيانات الكوادر والعاملين...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 font-bold">
                  لا يوجد عاملون يطابقون شروط البحث.
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id} className={`hover:bg-slate-50 ${emp.active ? '' : 'bg-slate-50/60 opacity-70'}`}>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{getDisplayCode(emp)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900">{getDisplayName(emp)}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 text-[10px] font-bold">
                      {getDisplayDept(emp)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-600">{getDisplayJob(emp)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${emp.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {emp.active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => openEditEmployeeModal(emp)}
                        className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded flex items-center gap-1"
                        title="تعديل"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`px-2.5 py-1 rounded font-bold ${emp.active ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      >
                        {emp.active ? 'إيقاف' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="p-1 hover:text-rose-600"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal إضافة/تعديل عامل */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{editingEmp.id === 0 ? '👤 قيد عامل / موظف جديد' : `🛠 تعديل بيانات الموظف: ${editingEmp.fullName}`}</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-5 space-y-4 bg-slate-50">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الكود الوظيفي *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.code || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, code: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono font-bold text-indigo-700"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">الاسم الرباعي الرسمي *</label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم ثلاثي أو رباعي..."
                    value={editingEmp.fullName || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">القسم / الصالة (مرتبط بالهيكل المعتمد) *</label>
                <select
                  value={editingEmp.departmentName || ''}
                  onChange={(e) => setEditingEmp({ ...editingEmp, departmentName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl font-bold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.displayName}>{d.displayName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">المسمى الوظيفي المعتمد *</label>
                <input
                  type="text"
                  list="jobTitlesList"
                  required
                  placeholder="اختر أو اكتب مسمى جديد..."
                  value={editingEmp.jobTitle || ''}
                  onChange={(e) => setEditingEmp({ ...editingEmp, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                />
                <datalist id="jobTitlesList">
                  {jobTitles.map(j => (
                    <option key={j} value={j} />
                  ))}
                </datalist>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isSaving ? '⏳ جاري الحفظ...' : '💾 حفظ بيانات العامل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
