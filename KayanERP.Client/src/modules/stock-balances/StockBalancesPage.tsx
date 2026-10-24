import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  FileSpreadsheet,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package,
  Layers,
  CheckCheck,
  XCircle,
  CreditCard,
  Filter
} from 'lucide-react';
import {
  fetchStockBalancesApi,
  fetchStockLookupsApi,
} from './stockBalancesApi';
import type {
  StockBalanceViewDto,
  StockKpiSummaryDto,
  BranchLookupItem,
  WarehouseLookupItem,
} from './stockBalancesApi';

interface Props {
  onNavigate?: (tab: string, state?: any) => void;
}

export const StockBalancesPage: React.FC<Props> = ({ onNavigate }) => {
  const [balances, setBalances] = useState<StockBalanceViewDto[]>([]);
  const [kpis, setKpis] = useState<StockKpiSummaryDto>({
    totalItemsCount: 0,
    totalAvailableQuantity: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    estimatedStock: 0,
  });

  const [branches, setBranches] = useState<BranchLookupItem[]>([]);
  const [allWarehouses, setAllWarehouses] = useState<WarehouseLookupItem[]>([]);
  const [availableWarehouses, setAvailableWarehouses] = useState<WarehouseLookupItem[]>([]);

  const [selectedBranchId, setSelectedBranchId] = useState<number>(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLookups = async () => {
    try {
      const { branches: bList, warehouses: wList } = await fetchStockLookupsApi();
      setBranches(bList);
      setAllWarehouses(wList);
      setAvailableWarehouses(wList);
    } catch (err: any) {
      console.error('فشل جلب القوائم المرجعية للأرصدة:', err);
    }
  };

  const loadData = async (branchId = selectedBranchId, whId = selectedWarehouseId, lowOnly = lowStockOnly) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchStockBalancesApi(branchId, whId, lowOnly);
      setBalances(data.balances);
      setKpis(data.kpis);
    } catch (err: any) {
      setErrorMessage(`تعذر جلب الأرصدة اللحظية: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
    loadData(0, 0, false);
  }, []);

  const handleBranchChanged = (bId: number) => {
    setSelectedBranchId(bId);
    if (bId > 0) {
      const filteredWh = allWarehouses.filter((w) => w.branchId === bId);
      setAvailableWarehouses(filteredWh);
      setSelectedWarehouseId(0);
      loadData(bId, 0, lowStockOnly);
    } else {
      setAvailableWarehouses(allWarehouses);
      setSelectedWarehouseId(0);
      loadData(0, 0, lowStockOnly);
    }
  };

  const filteredBalances = useMemo(() => {
    if (!searchTerm.trim()) return balances;
    const term = searchTerm.trim().toLowerCase();
    return balances.filter(
      (b) =>
        b.itemName.toLowerCase().includes(term) ||
        b.itemCode.toLowerCase().includes(term) ||
        b.warehouseName.toLowerCase().includes(term)
    );
  }, [balances, searchTerm]);

  const handleNavigateToStockCard = (itemId: number, warehouseId: number) => {
    if (onNavigate) {
      onNavigate('stock-card');
    }
  };

  const handleExportCsv = () => {
    if (!filteredBalances.length) return;

    try {
      const headers = [
        'كود_الصنف',
        'اسم_الصنف',
        'التصنيف',
        'المستودع',
        'الفرع',
        'الرصيد_الفعلي',
        'المحجوز',
        'الرصيد_المتاح',
        'الوحدة',
        'حد_الطلب',
        'الحالة',
      ];

      const rows = filteredBalances.map((s) => [
        `"${s.itemCode}"`,
        `"${s.itemName}"`,
        `"${s.categoryName}"`,
        `"${s.warehouseName}"`,
        `"${s.branchName}"`,
        s.quantity.toFixed(1),
        s.reservedQuantity.toFixed(1),
        s.availableQuantity.toFixed(1),
        `"${s.unit}"`,
        s.reorderLevel.toFixed(0),
        `"${s.status}"`,
      ]);

      const csvContent =
        '\uFEFF' +
        `تقرير أرصدة المخازن اللحظية والرقابة - مصانع كيان (أبو عادل)\n` +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `أرصدة_المخازن_اللحظية_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setErrorMessage(`فشل تصدير التقرير: ${err.message}`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'نفد الرصيد':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'حرج (تحت حد الأمان)':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      case 'حد الطلب':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            <span>أرصدة المخازن اللحظية والرقابة على المخزون</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة الأرصدة الحالية والمحجوزة والمتاحة عبر كافة مستودعات وفروع المصنع
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {kpis.estimatedStock > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
              <span>💰 القيمة التقديرية للمخزون:</span>
              <strong className="font-mono text-sm">{kpis.estimatedStock.toLocaleString()} ج.م</strong>
            </span>
          )}

          <button
            onClick={handleExportCsv}
            disabled={isLoading || filteredBalances.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير الأرصدة (Excel)</span>
          </button>

          <button
            onClick={() => loadData()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث الأرصدة اللحظية</span>
          </button>
        </div>
      </div>

      {/* 2. رسائل الأخطاء */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* 3. بطاقات الـ KPIs الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">إجمالي الأصناف المسجلة</span>
            <span className="text-2xl font-black font-mono text-gray-900 mt-1 block">
              {kpis.totalItemsCount}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">الكمية الإجمالية المتاحة</span>
            <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">
              {kpis.totalAvailableQuantity.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">أصناف قاربت على النفاد (حد الطلب)</span>
            <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
              {kpis.lowStockCount}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-rose-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">أصناف نفد رصيدها تماماً</span>
            <span className="text-2xl font-black font-mono text-rose-600 mt-1 block">
              {kpis.outOfStockCount}
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. شريط الفلاتر المتقدمة */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">الفرع:</label>
            <select
              value={selectedBranchId}
              onChange={(e) => handleBranchChanged(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>كافة الفروع</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName} ({b.branchCode})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">المستودع:</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => {
                const whId = Number(e.target.value);
                setSelectedWarehouseId(whId);
                loadData(selectedBranchId, whId, lowStockOnly);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>كافة المستودعات</option>
              {availableWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.warehouseName} ({w.warehouseCode})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-gray-700 font-bold mb-1">بحث سريع:</label>
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث باسم الصنف أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-3 flex items-center justify-end">
            <label className="relative flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setLowStockOnly(checked);
                  loadData(selectedBranchId, selectedWarehouseId, checked);
                }}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="font-bold text-rose-700 text-xs">النواقص فقط ⚠️</span>
            </label>
          </div>
        </div>
      </div>

      {/* 5. جدول الأرصدة اللحظية */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <RotateCw className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
              <p>جاري احتساب ومطابقة الأرصدة اللحظية...</p>
            </div>
          ) : filteredBalances.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-bold">
              لا توجد أرصدة مخزنية مطابقة للفلاتر المحددة.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                <tr>
                  <th className="py-3 px-3">كود الصنف</th>
                  <th className="py-3 px-3 text-right">اسم الصنف</th>
                  <th className="py-3 px-3">التصنيف</th>
                  <th className="py-3 px-3 text-right">المستودع والفرع</th>
                  <th className="py-3 px-3">الرصيد الفعلي</th>
                  <th className="py-3 px-3">المحجوز</th>
                  <th className="py-3 px-3">الرصيد المتاح</th>
                  <th className="py-3 px-3">حد الطلب</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3" style={{ width: '130px' }}>كارت الصنف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {filteredBalances.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-gray-500">{s.itemCode}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">{s.itemName}</td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                        {s.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-gray-900">{s.warehouseName}</div>
                      <span className="text-[10px] text-gray-400 block">{s.branchName}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-gray-900 text-sm">
                      {s.quantity.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <small className="text-[10px] text-gray-500 font-normal">{s.unit}</small>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-600">
                      {s.reservedQuantity > 0 ? s.reservedQuantity.toLocaleString(undefined, { minimumFractionDigits: 1 }) : '---'}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-emerald-600 text-sm">
                      {s.availableQuantity.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <small className="text-[10px] text-gray-500 font-normal">{s.unit}</small>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-500">
                      {s.reorderLevel > 0 ? s.reorderLevel.toLocaleString() : 'غير محدد'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleNavigateToStockCard(s.itemId, s.warehouseId)}
                        className="px-2.5 py-1 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto transition-colors"
                        title="عرض الحركات التاريخية لكارت الصنف"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>📊 حركات الصنف</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
