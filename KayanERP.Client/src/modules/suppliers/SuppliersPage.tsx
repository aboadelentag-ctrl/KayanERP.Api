import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Plus,
  RotateCw,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Building2,
  MapPin,
  FileText
} from 'lucide-react';
import {
  fetchSuppliersApi,
  saveSupplierApi,
  toggleSupplierStatusApi,
  deleteSupplierApi,
} from './suppliersApi';
import type { SupplierViewDto, SupplierCreateUpdateDto } from './suppliersApi';
import { SupplierModal } from './SupplierModal';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierViewDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierViewDto | null>(null);

  const loadSuppliers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchSuppliersApi(activeFilter);
      setSuppliers(data);
    } catch (err: any) {
      setErrorMessage(`فشل تحميل الموردين: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [activeFilter]);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;
    const term = searchTerm.trim().toLowerCase();
    return suppliers.filter(
      (s) =>
        s.supplierName.toLowerCase().includes(term) ||
        s.supplierCode.toLowerCase().includes(term) ||
        (s.phone && s.phone.includes(term)) ||
        (s.taxNumber && s.taxNumber.includes(term))
    );
  }, [suppliers, searchTerm]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: SupplierViewDto) => {
    setEditingSupplier(s);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (formData: SupplierCreateUpdateDto, id: number) => {
    await saveSupplierApi(formData, id);
    setStatusMessage(id > 0 ? 'تم تحديث بيانات المورد بنجاح.' : 'تم تسجيل المورد بنجاح.');
    await loadSuppliers();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleSupplierStatusApi(id);
      setStatusMessage('تم تحديث حالة المورد بنجاح.');
      await loadSuppliers();
    } catch (err: any) {
      setErrorMessage(`فشل تغيير الحالة: ${err.message}`);
    }
  };

  const handleDelete = async (s: SupplierViewDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إيقاف المورد [${s.supplierName}]؟`)) return;

    try {
      await deleteSupplierApi(s.id);
      setStatusMessage('تمت معالجة حذف / إيقاف المورد بنجاح.');
      await loadSuppliers();
    } catch (err: any) {
      setErrorMessage(`خطأ في الحذف: ${err.message}`);
    }
  };

  const handleExportCsv = () => {
    if (filteredSuppliers.length === 0) return;

    const headers = ['كود_المورد', 'اسم_المورد', 'الهاتف', 'البريد_الإلكتروني', 'العنوان', 'الرقم_الضريبي', 'شروط_السداد', 'الحالة'];
    const rows = filteredSuppliers.map((s) => [
      `"${s.supplierCode}"`,
      `"${s.supplierName}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.address || ''}"`,
      `"${s.taxNumber || ''}"`,
      `"${s.paymentTerms || 'نقدي'}"`,
      `"${s.active ? 'نشط' : 'معطل'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `دليل_الموردين_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage('تم تصدير دليل الموردين إلى إكسيل بنجاح.');
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. رأس الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            <span>دليل الموردين وسلاسل الإمداد</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إدارة موردي الخامات ومواد التعبئة، شروط السداد، والبيانات الضريبية
          </p>
        </div>

        <div className="flex items-center gap-2">
          {suppliers.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير (Excel)</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مورد جديد</span>
          </button>

          <button
            onClick={loadSuppliers}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. رسائل التنبيه */}
      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* 3. بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي الموردين المسجلين</span>
          <span className="text-2xl font-black font-mono text-gray-900 mt-1 block">
            {suppliers.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">الموردين النشطين</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">
            {suppliers.filter((s) => s.active).length}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">موردين بتسهيلات سداد (آجل)</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
            {suppliers.filter((s) => s.paymentTerms && s.paymentTerms.includes('آجل')).length}
          </span>
        </div>
      </div>

      {/* 4. شريط البحث والفلترة */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          <div className="md:col-span-8">
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث باسم المورد، الكود، الهاتف، أو الرقم الضريبي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="">كافة الموردين (نشط ومعطل)</option>
              <option value="true">الموردين النشطين فقط</option>
              <option value="false">الموردين المعطلين فقط</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('');
              }}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>

      {/* 5. جدول الموردين */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-xs font-bold">
            سجل الموردين المعتمدين ({filteredSuppliers.length} مورد)
          </h2>
          <span className="bg-indigo-600 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full">
            محدث من قاعدة البيانات
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <RotateCw className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
              <p>جاري تحميل بيانات الموردين...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <Truck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p>لا يوجد موردين مطابقين لمعايير البحث.</p>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                <tr>
                  <th className="py-3 px-3" style={{ width: '110px' }}>كود المورد</th>
                  <th className="py-3 px-3 text-right">اسم المورد</th>
                  <th className="py-3 px-3">الهاتف والتواصل</th>
                  <th className="py-3 px-3 text-right">العنوان</th>
                  <th className="py-3 px-3">الرقم الضريبي</th>
                  <th className="py-3 px-3">شروط السداد</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3" style={{ width: '150px' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className={`hover:bg-slate-50/75 transition-colors ${s.active ? '' : 'bg-slate-50/40 text-gray-400'}`}>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{s.supplierCode}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">
                      <div>{s.supplierName}</div>
                      {s.notes && (
                        <div className="text-[11px] text-gray-400 font-normal truncate max-w-xs" title={s.notes}>
                          {s.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {s.phone && (
                        <div className="flex items-center justify-center gap-1 text-gray-700">
                          <Phone className="w-3 h-3 text-indigo-500" />
                          <span>{s.phone}</span>
                        </div>
                      )}
                      {s.email && (
                        <div className="flex items-center justify-center gap-1 text-gray-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{s.email}</span>
                        </div>
                      )}
                      {!s.phone && !s.email && <span className="text-gray-300">---</span>}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600 max-w-xs truncate" title={s.address || ''}>
                      {s.address || '---'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-gray-700">
                      {s.taxNumber || '---'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        s.paymentTerms === 'نقدي'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      }`}>
                        {s.paymentTerms || 'نقدي'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        s.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {s.active ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            s.active
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={s.active ? 'إيقاف التعامل' : 'تفعيل'}
                        >
                          {s.active ? 'إيقاف' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingSupplier={editingSupplier}
        onSave={handleSaveSupplier}
      />
    </div>
  );
};
