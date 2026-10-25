import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
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
  Filter,
  Layers,
  Crown
} from 'lucide-react';
import {
  fetchDepartmentsApi,
  saveDepartmentApi,
  toggleDepartmentStatusApi,
  deleteDepartmentApi
} from './departmentsApi';
import type { DepartmentItemDto, DepartmentImportRowDto } from './departmentsApi';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavingImport, setIsSavingImport] = useState<boolean>(false);

  // Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [currentDept, setCurrentDept] = useState<DepartmentItemDto>({
    id: 0,
    departmentCode: '',
    departmentName: '',
    parentDepartmentId: null,
    description: '',
    active: true
  });

  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedParentFilter, setSelectedParentFilter] = useState<number>(-1);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Excel Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importedPreviewList, setImportedPreviewList] = useState<DepartmentImportRowDto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchDepartmentsApi();
      setDepartments(data);
    } catch (ex: any) {
      setErrorMessage(`تعذر جلب الأقسام: ${ex.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== '' ||
      selectedLevelFilter !== 'all' ||
      selectedParentFilter !== -1 ||
      selectedStatusFilter !== 'all'
    );
  }, [searchTerm, selectedLevelFilter, selectedParentFilter, selectedStatusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLevelFilter('all');
    setSelectedParentFilter(-1);
    setSelectedStatusFilter('all');
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = d.departmentName.toLowerCase().includes(term);
        const matchCode = d.departmentCode.toLowerCase().includes(term);
        const matchDesc = d.description ? d.description.toLowerCase().includes(term) : false;
        if (!matchName && !matchCode && !matchDesc) return false;
      }

      if (selectedLevelFilter === 'root' && d.parentDepartmentId !== null && d.parentDepartmentId !== undefined) {
        return false;
      }
      if (selectedLevelFilter === 'sub' && (d.parentDepartmentId === null || d.parentDepartmentId === undefined)) {
        return false;
      }

      if (selectedParentFilter !== -1 && d.parentDepartmentId !== selectedParentFilter) {
        return false;
      }

      if (selectedStatusFilter === 'active' && !d.active) return false;
      if (selectedStatusFilter === 'inactive' && d.active) return false;

      return true;
    });
  }, [departments, searchTerm, selectedLevelFilter, selectedParentFilter, selectedStatusFilter]);

  const getParentName = (parentId?: number | null) => {
    if (!parentId) return 'إدارة رئيسية';
    const p = departments.find(d => d.id === parentId);
    return p ? p.departmentName : 'جهة غير معروفة';
  };

  const handleEdit = (dept: DepartmentItemDto) => {
    setCurrentDept({ ...dept });
    setErrorMessage(null);
  };

  const resetForm = () => {
    setCurrentDept({
      id: 0,
      departmentCode: '',
      departmentName: '',
      parentDepartmentId: null,
      description: '',
      active: true
    });
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDept.departmentName.trim() || !currentDept.departmentCode.trim()) {
      setErrorMessage('يرجى إدخال كود واسم القسم بشكل صحيح.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveDepartmentApi(currentDept);
      setDepartments(prev => {
        if (currentDept.id > 0) {
          return prev.map(d => (d.id === currentDept.id ? { ...currentDept } : d));
        }
        return [...prev, { ...currentDept, id: Date.now() }];
      });

      setSuccessMessage(currentDept.id > 0 ? 'تم تحديث بيانات القسم بنجاح.' : 'تمت إضافة الهيكل الجديد بنجاح.');
      resetForm();
    } catch (ex: any) {
      setErrorMessage(`خطأ أثناء الحفظ: ${ex.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (dept: DepartmentItemDto) => {
    await toggleDepartmentStatusApi(dept);
    setDepartments(prev =>
      prev.map(d => (d.id === dept.id ? { ...d, active: !d.active } : d))
    );
    setSuccessMessage(`تم تغيير حالة القسم إلى: ${!dept.active ? 'مفعل' : 'معطل'}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = async (dept: DepartmentItemDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إيقاف القسم [${dept.departmentName}]؟`)) return;
    await deleteDepartmentApi(dept.id);
    setDepartments(prev => prev.filter(d => d.id !== dept.id));
    setSuccessMessage('تمت معالجة حذف / إيقاف القسم بنجاح.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Export to Excel / CSV
  const exportToExcel = () => {
    if (!filteredDepartments.length) {
      setErrorMessage('لا توجد سجلات مطابقة للفلترة لتصديرها.');
      return;
    }

    const headers = 'الكود,الاسم,الجهة_التابع_لها,الوصف,الحالة\n';
    const rows = filteredDepartments
      .map(d => {
        const parentName = getParentName(d.parentDepartmentId);
        const desc = d.description || '';
        const status = d.active ? 'مفعل' : 'معطل';
        return `"${d.departmentCode}","${d.departmentName}","${parentName}","${desc}","${status}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `الهيكل_التنظيمي_أبو_عادل_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage(`تم تصدير (${filteredDepartments.length}) قسماً بنجاح.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Download Template
  const downloadTemplate = () => {
    const content =
      'كود_القسم,اسم_القسم,كود_الإدارة_الأب,الوصف,الحالة\n1,الإدارة العليا,,الإدارة العامة للمؤسسة,1\n2,إدارة الإنتاج,1,إدارة شؤون التصنيع,1\n300,قسم الشرقي,2,صالة تصنيع الحلويات الشرقية,1';
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قالب_استيراد_الأقسام_أبو_عادل.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Handling
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

      const rows: DepartmentImportRowDto[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 2) {
          rows.push({
            departmentCode: cols[0],
            departmentName: cols[1],
            parentCode: cols[2] || '',
            description: cols[3] || '',
            active: cols[4] === '1' || cols[4]?.toLowerCase() === 'مفعل' || cols[4]?.toLowerCase() === 'true'
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
      const newItems: DepartmentItemDto[] = [...departments];

      // 1. Process root items
      const roots = importedPreviewList.filter(r => !r.parentCode);
      for (const r of roots) {
        const existing = newItems.find(d => d.departmentCode === r.departmentCode);
        if (existing) {
          existing.departmentName = r.departmentName;
          existing.description = r.description;
          existing.active = r.active;
        } else {
          newItems.push({
            id: Date.now() + Math.random(),
            departmentCode: r.departmentCode,
            departmentName: r.departmentName,
            parentDepartmentId: null,
            description: r.description,
            active: r.active
          });
        }
      }

      // 2. Process child items
      const children = importedPreviewList.filter(r => r.parentCode);
      for (const c of children) {
        const parent = newItems.find(d => d.departmentCode === c.parentCode);
        const existing = newItems.find(d => d.departmentCode === c.departmentCode);
        if (existing) {
          existing.departmentName = c.departmentName;
          existing.parentDepartmentId = parent ? parent.id : null;
          existing.description = c.description;
          existing.active = c.active;
        } else {
          newItems.push({
            id: Date.now() + Math.random(),
            departmentCode: c.departmentCode,
            departmentName: c.departmentName,
            parentDepartmentId: parent ? parent.id : null,
            description: c.description,
            active: c.active
          });
        }
      }

      setDepartments(newItems);
      setSuccessMessage(`تم حفظ وتحديث (${importedPreviewList.length}) قسماً بالهيكل التنظيمي بنجاح.`);
      setIsImportModalOpen(false);
      setImportedPreviewList([]);
    } catch (ex: any) {
      setErrorMessage(`خطأ أثناء معالجة الاستيراد: ${ex.message}`);
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
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>إدارة الأقسام وصالات الإنتاج (Departments & Production Halls)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تعريف وتصفية الهيكل التنظيمي للمصنع (إدارة عليا ──&gt; إدارة ──&gt; صالة / قسم إنتاجي).
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
            onClick={loadDepartments}
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
        {/* الجانب الأيمن: شريط الفلاتر وجدول عرض الأقسام والإدارات */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs text-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-gray-700 font-bold mb-1">🔍 بحث (اسم، كود، أو وصف)</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو الكود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-8 pl-3 py-1.5 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">👑 المستوى الهيكلي</label>
                <select
                  value={selectedLevelFilter}
                  onChange={(e) => setSelectedLevelFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2 py-1.5 font-bold text-gray-700 outline-none"
                >
                  <option value="all">-- كل المستويات --</option>
                  <option value="root">👑 إدارات رئيسية فقط</option>
                  <option value="sub">└── صالات وأقسام فرعية</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">🏢 تتبع لإدارة</label>
                <select
                  value={selectedParentFilter}
                  onChange={(e) => setSelectedParentFilter(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2 py-1.5 font-bold text-gray-700 outline-none"
                >
                  <option value={-1}>-- كل الجهات --</option>
                  {departments
                    .filter(d => !d.parentDepartmentId)
                    .map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.departmentName}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">⚡ الحالة</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-2 py-1.5 font-bold text-gray-700 outline-none"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">🟢 مفعل فقط</option>
                  <option value="inactive">🔴 معطل</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-indigo-700 font-bold text-[11px] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>نتائج التصفية: ({filteredDepartments.length} من إجمالي {departments.length} هيكل مسجل)</span>
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

          {/* جدول عرض الهيكل التنظيمي */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold">قائمة الأقسام المسجلة بالهيكل التنظيمي</span>
              <span className="bg-indigo-600 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                المعروض: {filteredDepartments.length} هيكل
              </span>
            </div>

            <table className="w-full text-center">
              <thead className="bg-slate-100 text-gray-700">
                <tr>
                  <th className="py-2.5 px-3">الكود</th>
                  <th className="py-2.5 px-3 text-right">الاسم</th>
                  <th className="py-2.5 px-3">الجهة التابع لها (الأب)</th>
                  <th className="py-2.5 px-3 text-right">الوصف / الملاحظات</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-bold">
                      جاري تحميل الهيكل التنظيمي...
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-bold">
                      لا توجد سجلات مطابقة لشروط البحث والفلترة.
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map(dept => {
                    const isRoot = !dept.parentDepartmentId;
                    const isSelected = dept.id === currentDept.id;

                    return (
                      <tr
                        key={dept.id}
                        className={`hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/60' : dept.active ? '' : 'bg-slate-50/60 opacity-70'}`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{dept.departmentCode}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          {isRoot ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded text-[10px]">إدارة رئيسية</span>
                              <span>{dept.departmentName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-800 pr-3">
                              <span className="text-gray-400">└──</span>
                              <span>{dept.departmentName}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {dept.parentDepartmentId ? (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border text-[10px]">
                              {getParentName(dept.parentDepartmentId)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">👑 إدارة رئيسية</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-500 text-[11px] max-w-[180px] truncate" title={dept.description}>
                          {dept.description || '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dept.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {dept.active ? 'مفعل' : 'معطل'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEdit(dept)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded flex items-center gap-1"
                              title="تعديل"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>تعديل</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(dept)}
                              className={`px-2 py-1 rounded font-bold ${dept.active ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                            >
                              {dept.active ? 'إيقاف' : 'تفعيل'}
                            </button>
                            <button
                              onClick={() => handleDelete(dept)}
                              className="p-1 hover:text-rose-600"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* الجانب الأيسر: بطاقة إضافة / تعديل هيكل */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="bg-indigo-600 text-white p-3.5 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-300" />
                <span>{currentDept.id > 0 ? '✏️ تعديل بيانات هيكل' : '➕ إضافة هيكل جديد'}</span>
              </span>
              {currentDept.id > 0 && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] bg-indigo-800 hover:bg-indigo-900 text-white px-2 py-0.5 rounded"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3 bg-slate-50">
              <div>
                <label className="block text-gray-700 font-bold mb-1">كود القسم / الإدارة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 101 أو 300"
                  value={currentDept.departmentCode}
                  onChange={(e) => setCurrentDept({ ...currentDept, departmentCode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم القسم / الإدارة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قسم الشرقي / الإدارة المالية"
                  value={currentDept.departmentName}
                  onChange={(e) => setCurrentDept({ ...currentDept, departmentName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">يتبع لإدارة (اختياري)</label>
                <select
                  value={currentDept.parentDepartmentId || ''}
                  onChange={(e) =>
                    setCurrentDept({
                      ...currentDept,
                      parentDepartmentId: e.target.value ? Number(e.target.value) : null
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                >
                  <option value="">-- إدارة رئيسية (لا تتبع جهة أخرى) --</option>
                  {departments
                    .filter(d => d.id !== currentDept.id)
                    .map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.departmentName} ({parent.departmentCode})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">ملاحظات / وصف</label>
                <textarea
                  rows={3}
                  placeholder="توصيف نشاط القسم أو اختصاصاته..."
                  value={currentDept.description || ''}
                  onChange={(e) => setCurrentDept({ ...currentDept, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeDeptCheck"
                  checked={currentDept.active}
                  onChange={(e) => setCurrentDept({ ...currentDept, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <label htmlFor="activeDeptCheck" className="font-bold text-gray-700 cursor-pointer">
                  مفعل في النظام
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                {currentDept.id > 0 && (
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
                  {isSaving ? '⏳ جاري الحفظ...' : currentDept.id > 0 ? 'تحديث البيانات' : 'حفظ وإضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* نافذة استيراد الإكسيل الذكية (EXCEL IMPORT MODAL) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>استيراد الهيكل التنظيمي من ملف إكسيل / CSV</span>
              </h4>
              <button onClick={() => setIsImportModalOpen(false)} className="text-white">×</button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-xl">
                💡 يمكنك حفظ شيت الإكسيل بصيغة <strong>CSV (UTF-8)</strong> ثم رفعه هنا مباشرة، أو قم بـ{' '}
                <button onClick={downloadTemplate} className="underline font-bold text-cyan-950">
                  تحميل القالب النموذجي
                </button>{' '}
                لتعبئة البيانات بدقة.
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
                      معاينة البيانات المقروءة من الملف ({importedPreviewList.length} سجل):
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
                          <th className="py-2 px-2 text-right">الاسم</th>
                          <th className="py-2 px-2">كود الإدارة الأب</th>
                          <th className="py-2 px-2 text-right">الوصف</th>
                          <th className="py-2 px-2">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {importedPreviewList.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 px-2 font-mono font-bold text-indigo-700">{row.departmentCode}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-gray-900">{row.departmentName}</td>
                            <td className="py-1.5 px-2 text-gray-600">{row.parentCode || 'إدارة رئيسية'}</td>
                            <td className="py-1.5 px-2 text-right text-gray-500 text-[11px]">{row.description || '-'}</td>
                            <td className="py-1.5 px-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {row.active ? 'مفعل' : 'معطل'}
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
                {isSavingImport ? '⏳ جاري الحفظ والتحديث...' : `تأكيد وحفظ كافة السجلات (${importedPreviewList.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
