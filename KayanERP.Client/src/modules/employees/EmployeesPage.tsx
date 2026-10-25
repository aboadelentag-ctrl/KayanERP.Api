import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Power,
  X,
  Building2,
  Briefcase
} from 'lucide-react';

export interface EmployeeDto {
  id: number;
  code: string;
  fullName: string;
  departmentName: string;
  jobTitle: string;
  active: boolean;
}

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([
    { id: 1, code: 'EMP-577', fullName: 'فتحي حميده', departmentName: 'إدارة الإنتاج', jobTitle: 'مهندس انتاج', active: true },
    { id: 2, code: 'EMP-747', fullName: 'أحمد عبد العزيز', departmentName: 'قسم الشرقي والمخبوزات', jobTitle: 'منسق انتاج', active: true },
    { id: 3, code: 'EMP-476', fullName: 'محمد وهدان', departmentName: 'قسم الجاتوه والتورت والحلويات الغربية', jobTitle: 'شيف جاتوه', active: true },
    { id: 4, code: 'EMP-101', fullName: 'أحمد السعدي', departmentName: 'صالة تصنيع الحلويات الشرقية', jobTitle: 'مشرف صالة إنتاج', active: true },
    { id: 5, code: 'EMP-102', fullName: 'سامح فوزي', departmentName: 'قسم الجاتوه والتورت والحلويات الغربية', jobTitle: 'شيف تورت وحلواني', active: true },
    { id: 6, code: 'EMP-103', fullName: 'حسام الدين فؤاد', departmentName: 'إدارة الصيانة والتشغيل المركزي', jobTitle: 'فني صيانة ميكانيكية', active: true }
  ]);

  const dbDepartments = [
    'إدارة الإنتاج',
    'قسم الشرقي والمخبوزات',
    'قسم الجاتوه والتورت والحلويات الغربية',
    'قسم النواشف والبتيفور والكرواسون',
    'مستودع التعبئة والتغليف والتوزيع',
    'إدارة الصيانة والتشغيل المركزي',
    'إدارة الجودة وسلامة الغذاء'
  ];

  const distinctJobTitles = [
    'مهندس انتاج',
    'مشرف صالة إنتاج',
    'شيف جاتوه وتورت',
    'شيف شرقي ومخبوزات',
    'منسق انتاج',
    'فني صيانة ميكانيكية',
    'فني صيانة كهربائية',
    'أمين مخزن خامات',
    'مراقب جودة (ISO/GMP)',
    'عامل تشغيل وتعبئة'
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [inputFullName, setInputFullName] = useState('');
  const [inputDepartmentName, setInputDepartmentName] = useState(dbDepartments[0]);
  const [inputJobTitle, setInputJobTitle] = useState(distinctJobTitles[0]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (selectedDeptFilter && emp.departmentName !== selectedDeptFilter) return false;
      if (selectedJobFilter && emp.jobTitle !== selectedJobFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        emp.code.toLowerCase().includes(term) ||
        emp.fullName.toLowerCase().includes(term) ||
        emp.departmentName.toLowerCase().includes(term) ||
        emp.jobTitle.toLowerCase().includes(term)
      );
    });
  }, [employees, selectedDeptFilter, selectedJobFilter, searchTerm]);

  const openNewEmployeeModal = () => {
    setModalError(null);
    setEditingId(null);
    setInputCode(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setInputFullName('');
    setInputDepartmentName(dbDepartments[0]);
    setInputJobTitle(distinctJobTitles[0]);
    setIsModalOpen(true);
  };

  const editEmployee = (emp: EmployeeDto) => {
    setModalError(null);
    setEditingId(emp.id);
    setInputCode(emp.code);
    setInputFullName(emp.fullName);
    setInputDepartmentName(emp.departmentName);
    setInputJobTitle(emp.jobTitle);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputFullName.trim() || !inputCode.trim()) {
      setModalError('⚠️ يرجى إدخال الكود الوظيفي والاسم الرسمي كاملاً!');
      return;
    }

    if (editingId) {
      setEmployees(employees.map(e => e.id === editingId ? {
        ...e,
        code: inputCode.trim(),
        fullName: inputFullName.trim(),
        departmentName: inputDepartmentName,
        jobTitle: inputJobTitle
      } : e));
      setStatusMessage(`✅ تم تحديث بيانات الموظف [${inputCode}] بنجاح!`);
    } else {
      const created: EmployeeDto = {
        id: Date.now(),
        code: inputCode.trim(),
        fullName: inputFullName.trim(),
        departmentName: inputDepartmentName,
        jobTitle: inputJobTitle,
        active: true
      };
      setEmployees([...employees, created]);
      setStatusMessage(`✅ تم تسجيل الموظف الجديد [${inputCode}] بنجاح!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const toggleEmployeeStatus = (emp: EmployeeDto) => {
    setEmployees(employees.map(e => e.id === emp.id ? { ...e, active: !e.active } : e));
    setStatusMessage(`تم تغيير حالة الموظف (${emp.fullName}) إلى: ${!emp.active ? 'نشط' : 'معطل'}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const deleteEmployee = (emp: EmployeeDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إيقاف الموظف [${emp.fullName}]؟`)) return;
    setEmployees(employees.filter(e => e.id !== emp.id));
    setStatusMessage(`تمت إزالة الموظف [${emp.fullName}] من السجل.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const exportEmployeesToExcel = () => {
    let csv = 'الكود الوظيفي,الاسم الرباعي الرسمي,القسم والصالة,المسمى الوظيفي المعتمد,الحالة\n';
    filteredEmployees.forEach(emp => {
      const status = emp.active ? 'نشط' : 'معطل';
      csv += `"${emp.code}","${emp.fullName}","${emp.departmentName}","${emp.jobTitle}","${status}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
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
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;

      const newRows: EmployeeDto[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (cols.length >= 2) {
          newRows.push({
            id: Date.now() + i,
            code: cols[0] || `EMP-${Date.now() + i}`,
            fullName: cols[1],
            departmentName: cols[2] || dbDepartments[0],
            jobTitle: cols[3] || distinctJobTitles[0],
            active: true
          });
        }
      }

      setEmployees([...employees, ...newRows]);
      setStatusMessage(`✅ تم استيراد (${newRows.length}) موظفاً وتوزيعهم بنجاح!`);
      setTimeout(() => setStatusMessage(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الشاشة التنفيذي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-500" />
              <span>إدارة العمال والفنيين والورديات (HR Master)</span>
            </h1>
            <span className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              شؤون العاملين
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            حصر الكوادر الميدانية وربطهم بالأقسام وصالات الإنتاج وتثبيت العهد والماكينات بالكود الوظيفي الرسمي.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={openNewEmployeeModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل موظف / عامل جديد</span>
          </button>

          <button
            onClick={exportEmployeesToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs border border-gray-200 dark:border-zinc-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-500" />
            <span>استيراد من إكسيل</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
          </label>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* شريط فلاتر البحث والفرز الذكي */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بكود الموظف، الاسم، أو المسمى..."
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
          <option value="">-- كل الأقسام والصالات المعتمدة --</option>
          {dbDepartments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={selectedJobFilter}
          onChange={(e) => setSelectedJobFilter(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-gray-700 dark:text-zinc-300"
        >
          <option value="">-- كل المسميات الوظيفية --</option>
          {distinctJobTitles.map(j => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedDeptFilter('');
            setSelectedJobFilter('');
          }}
          className="px-3 py-2 bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 rounded-xl font-bold border border-gray-200 dark:border-zinc-800"
        >
          إلغاء الفلاتر
        </button>
      </div>

      {/* جدول العاملين */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <span className="font-bold text-gray-900 dark:text-zinc-100">
            📋 سجل القوى العاملة بالصالات والمصنع (المعروض: {filteredEmployees.length} من أصل {employees.length})
          </span>
          <span className="font-mono text-gray-400 text-[11px] bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
            محدث من قاعدة البيانات
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b">
              <tr>
                <th className="py-3 px-3 w-36">الكود الوظيفي</th>
                <th className="py-3 px-3 text-right">الاسم الرباعي الرسمي</th>
                <th className="py-3 px-3 text-right">القسم / الصالة</th>
                <th className="py-3 px-3 text-right">المسمى الوظيفي المعتمد</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 w-48">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-gray-400 font-bold">لا يوجد عاملون يطابقون شروط البحث.</td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className={`hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors ${!emp.active ? 'opacity-60 bg-slate-50/50 dark:bg-zinc-900/20' : ''}`}>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">{emp.code}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100 text-sm">{emp.fullName}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        {emp.departmentName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-500 dark:text-zinc-400 font-medium">{emp.jobTitle}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        emp.active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                      }`}>
                        {emp.active ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => editEmployee(emp)}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-zinc-900 hover:bg-indigo-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-zinc-700 rounded-lg font-bold text-[11px]"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => toggleEmployeeStatus(emp)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                            emp.active
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {emp.active ? 'إيقاف' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => deleteEmployee(emp)}
                          className="px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 rounded-lg text-[11px]"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إضافة/تعديل عامل */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-cyan-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{editingId ? `🛠 تعديل بيانات الموظف: ${inputFullName}` : '👤 قيد عامل / موظف جديد'}</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-5 space-y-4">
              {modalError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl font-bold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الكود الوظيفي *</label>
                  <input
                    type="text"
                    required
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="مثال: EMP-045"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-cyan-600 dark:text-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الاسم الرباعي الرسمي *</label>
                  <input
                    type="text"
                    required
                    value={inputFullName}
                    onChange={(e) => setInputFullName(e.target.value)}
                    placeholder="الاسم كما في مسيرات الرواتب..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">القسم / الصالة (مرتبط بالهيكل المعتمد) *</label>
                <select
                  value={inputDepartmentName}
                  onChange={(e) => setInputDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-cyan-500 rounded-xl font-bold"
                >
                  {dbDepartments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">المسمى الوظيفي المعتمد *</label>
                <select
                  value={inputJobTitle}
                  onChange={(e) => setInputJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                >
                  {distinctJobTitles.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-sm"
                >
                  💾 حفظ بيانات العامل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
