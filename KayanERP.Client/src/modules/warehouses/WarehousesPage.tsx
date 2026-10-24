import React, { useState, useEffect, useMemo } from 'react';
import {
  Warehouse,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2,
  MapPin,
  GitFork,
  Boxes
} from 'lucide-react';
import {
  fetchWarehousesApi,
  fetchBranchesLookupApi,
  saveWarehouseApi,
  deleteWarehouseApi,
} from './warehousesApi';
import type { WarehouseDto, BranchLookupDto } from './warehousesApi';
import { WarehouseModal } from './WarehouseModal';

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [branches, setBranches] = useState<BranchLookupDto[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseDto | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [wList, bList] = await Promise.all([
        fetchWarehousesApi(selectedBranchId),
        fetchBranchesLookupApi(),
      ]);
      setWarehouses(wList);
      setBranches(bList);
    } catch (err: any) {
      setErrorMessage(`تعذر جلب المستودعات: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  const filteredWarehouses = useMemo(() => {
    if (!searchTerm.trim()) return warehouses;
    const term = searchTerm.toLowerCase();
    return warehouses.filter(
      (w) =>
        w.warehouseName.toLowerCase().includes(term) ||
        w.warehouseCode.toLowerCase().includes(term) ||
        (w.branchName && w.branchName.toLowerCase().includes(term))
    );
  }, [warehouses, searchTerm]);

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: WarehouseDto) => {
    setEditingWarehouse(w);
    setIsModalOpen(true);
  };

  const handleSave = async (w: WarehouseDto) => {
    await saveWarehouseApi(w);
    setStatusMessage(w.id > 0 ? 'تم تحديث المستودع بنجاح.' : 'تم تسجيل المستودع بنجاح.');
    await loadData();
  };

  const handleDelete = async (w: WarehouseDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستودع [${w.warehouseName}]؟`)) return;

    try {
      await deleteWarehouseApi(w.id);
      setStatusMessage('تمت معالجة حذف المستودع بنجاح.');
      await loadData();
    } catch (err: any) {
      setErrorMessage(`فشل الحذف: ${err.message}`);
    }
  };

  const handleExportCsv = () => {
    if (filteredWarehouses.length === 0) return;

    const headers = ['كود_المستودع', 'اسم_المستودع', 'الفرع', 'نوع_المستودع', 'المستودع_الأب', 'الوصف', 'الحالة'];
    const rows = filteredWarehouses.map((w) => [
      `"${w.warehouseCode}"`,
      `"${w.warehouseName}"`,
      `"${w.branchName || 'الفرع الرئيسي'}"`,
      `"${w.warehouseType}"`,
      `"${w.parentWarehouseName || 'مستودع رئيسي'}"`,
      `"${w.description || '---'}"`,
      `"${w.active ? 'نشط' : 'معطل'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `دليل_المستودعات_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadgeClass = (type: WarehouseDto['warehouseType']) => {
    switch (type) {
      case 'خامات':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'منتج تام':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'معرض':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'صالة تشغيل':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'تالف وهوالك':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen font-sans" dir="rtl">
      {/* الترويسة الرئيسية وأزرار الإجراءات */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Warehouse className="w-7 h-7 text-indigo-600" />
            <span>إدارة المستودعات ومراكز التخزين (Warehouses)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            هيكلة المستودعات والشجرة الهرمية وربطها بالفروع ومنافذ الإنتاج
          </p>
        </div>

        <div className="flex items-center gap-2">
          {warehouses.length > 0 && (
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
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستودع جديد</span>
          </button>
        </div>
      </div>

      {/* رسائل التنبيه والنجاح */}
      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* فلاتر العرض والبحث السريع */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
          <div className="md:col-span-4">
            <label className="block text-gray-500 font-bold mb-1">فلترة حسب الفرع:</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="0">كافة الفروع والمراكز الرئيسية</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName} ({b.branchCode})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-gray-500 font-bold mb-1">بحث سريع:</label>
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بكود أو اسم المستودع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end pt-5">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          </div>
        </div>
      </div>

      {/* جدول المستودعات والشجرة الهرمية */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
            <p>جاري تحميل شجرة المستودعات...</p>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            <Boxes className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p>لا توجد مستودعات مطابقة للبحث المحدد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">كود المستودع</th>
                  <th className="py-3 px-4">اسم المستودع</th>
                  <th className="py-3 px-4">الفرع التابع له</th>
                  <th className="py-3 px-4 text-center">نوع المستودع</th>
                  <th className="py-3 px-4 text-center">المستودع الرئيسي (الأب)</th>
                  <th className="py-3 px-4">الوصف</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWarehouses.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-700">{w.warehouseCode}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{w.warehouseName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px]">
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        <span>{w.branchName || 'الفرع الرئيسي'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getTypeBadgeClass(w.warehouseType)}`}>
                        {w.warehouseType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {w.parentWarehouseName ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
                          <GitFork className="w-3 h-3 text-indigo-500" />
                          <span>{w.parentWarehouseName}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">مستودع رئيسي</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate" title={w.description}>
                      {w.description || '---'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        w.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {w.active ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warehouse={editingWarehouse}
        branches={branches}
        allWarehouses={warehouses}
        onSave={handleSave}
      />
    </div>
  );
};
