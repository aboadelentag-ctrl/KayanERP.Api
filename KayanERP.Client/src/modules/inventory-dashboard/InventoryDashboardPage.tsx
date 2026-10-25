import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileSpreadsheet,
  ArrowRight,
  TrendingDown,
  Warehouse,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import {
  fetchInventorySummaryApi,
  fetchInventoryBalancesApi,
  fetchStockLedgerApi
} from './inventoryDashboardApi';
import type {
  InventoryDashboardSummaryDto,
  StockBalanceDetailedDto,
  StockMovementDto
} from './inventoryDashboardApi';

interface InventoryDashboardPageProps {
  onNavigate?: (tab: string) => void;
}

export const InventoryDashboardPage: React.FC<InventoryDashboardPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<InventoryDashboardSummaryDto>({
    totalInventoryValue: 0,
    rawMaterialsValue: 0,
    wipValue: 0,
    finishedGoodsValue: 0,
    totalStockRecords: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringLotsCount: 0
  });
  const [balances, setBalances] = useState<StockBalanceDetailedDto[]>([]);
  const [movements, setMovements] = useState<StockMovementDto[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLedger, setIsLoadingLedger] = useState<boolean>(false);
  const [isViewingLedger, setIsViewingLedger] = useState<boolean>(false);

  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [sum, bals] = await Promise.all([
        fetchInventorySummaryApi(),
        fetchInventoryBalancesApi()
      ]);
      setSummary(sum);
      setBalances(bals);
    } catch (ex: any) {
      setErrorMessage(`خطأ في جلب بيانات لوحة القيادة: ${ex.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBalances = useMemo(() => {
    return balances.filter(b => {
      const matchSearch =
        !searchTerm.trim() ||
        b.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.warehouseName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = !selectedTypeFilter || b.itemType.includes(selectedTypeFilter);

      const matchStatus =
        !selectedStatusFilter ||
        (selectedStatusFilter === 'AVAILABLE' && b.availableQuantity > 10) ||
        (selectedStatusFilter === 'LOW' && b.availableQuantity > 0 && b.availableQuantity <= 10) ||
        (selectedStatusFilter === 'OUT' && b.availableQuantity <= 0);

      return matchSearch && matchType && matchStatus;
    });
  }, [balances, searchTerm, selectedTypeFilter, selectedStatusFilter]);

  const handleViewLedger = async (itemId: number, itemName: string) => {
    setIsViewingLedger(true);
    setIsLoadingLedger(true);
    setSelectedItemName(itemName);
    try {
      const data = await fetchStockLedgerApi(itemId);
      setMovements(data);
    } catch (ex: any) {
      setErrorMessage(`خطأ في استخراج حركة الصنف: ${ex.message}`);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  const handleBackToBalances = () => {
    setIsViewingLedger(false);
    setMovements([]);
    setSelectedItemName('');
  };

  const translateMovementType = (type: string) => {
    switch (type) {
      case 'PURCHASE_RECEIPT': return 'توريد مشتريات (خامات)';
      case 'PRODUCTION_ISSUE': return 'صرف خامات تشغيل';
      case 'PRODUCTION_RECEIPT':
      case 'PRODUCTION_IN': return 'استلام تشغيل (تام/وسيط)';
      case 'FG_TRANSFER_OUT': return 'خروج تحويل تام';
      case 'FG_TRANSFER_IN': return 'استلام تحويل بالكنترول';
      case 'SALES_ISSUE': return 'صرف مبيعات';
      default: return type;
    }
  };

  const getBadgeForMovement = (type: string) => {
    switch (type) {
      case 'PURCHASE_RECEIPT': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PRODUCTION_ISSUE': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'PRODUCTION_RECEIPT': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'FG_TRANSFER_IN': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'FG_TRANSFER_OUT': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const exportBalancesToCsv = () => {
    if (!filteredBalances.length) return;
    const headers = 'كود_الصنف,اسم_الصنف,التصنيف,المستودع,الرصيد_الفعلي,المحجوز,الرصيد_المتاح,الوحدة,التكلفة_التقديرية,القيمة_الإجمالية,الحالة\n';
    const rows = filteredBalances.map(b => {
      const status = b.availableQuantity <= 0 ? 'نفد الرصيد' : (b.availableQuantity <= 10 ? 'حد الطلب' : 'متوفر');
      return `"${b.itemCode}","${b.itemName}","${b.itemType}","${b.warehouseName}",${b.quantity},${b.reservedQuantity},${b.availableQuantity},"${b.unit}",${b.estimatedUnitCost},${b.totalValue},"${status}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_رقابة_المخزون_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
              <span>لوحة قيادة ورقابة المخزون التنفيذية (Live Inventory Control)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">الرقابة والتقييم اللحظي</span>
          </div>
          <p className="text-xs text-slate-400">
            التقييم المالي اللحظي للأرصدة، رادار الصلاحية (FEFO)، مراقبة النواقص، وتدقيق المسار التراكمي لكافة المستودعات.
          </p>
        </div>

        <div className="flex gap-2">
          {isViewingLedger ? (
            <button
              onClick={handleBackToBalances}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لجدول الأرصدة</span>
            </button>
          ) : (
            <>
              <button
                onClick={exportBalancesToCsv}
                disabled={!filteredBalances.length || isLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير الأرصدة (Excel)</span>
              </button>
              <button
                onClick={loadAllData}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                <span>تحديث الرقابة اللحظية</span>
              </button>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" />{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {!isViewingLedger ? (
        <>
          {/* بطاقات المؤشرات المالية والرقابية العليا */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">إجمالي القيمة المالية للمخزون</span>
              <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">
                {summary.totalInventoryValue.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
              </h4>
              <small className="text-gray-400 block mt-1">موزع على كافة مخازن وفروع المصنع</small>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-600 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">قيمة مخزون الخامات الأولية</span>
              <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">
                {summary.rawMaterialsValue.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
              </h4>
              <small className="text-gray-400 block mt-1">المستودعات المركزية ومخازن الخامات</small>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-cyan-500 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">قيمة المنتج التام الجاهز للبيع</span>
              <h4 className="text-2xl font-black text-cyan-700 font-mono mt-1">
                {summary.finishedGoodsValue.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
              </h4>
              <small className="text-gray-400 block mt-1">مخازن الكنترول ومعارض الفروع</small>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">رادار الصلاحية والنواقص</span>
              <div className="flex gap-2 items-center mt-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-black font-mono text-xs">
                  {summary.lowStockCount} نواقص
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-black font-mono text-xs">
                  {summary.expiringLotsCount} لوطات مهددة
                </span>
              </div>
              <small className="text-gray-400 block mt-1">متابعة دقيقة لحد الأمان وتواريخ الصلاحية</small>
            </div>
          </div>

          {/* فلاتر الجدول والبحث السريع */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="ابحث باسم الصنف أو الكود أو المستودع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
            >
              <option value="">-- كافة التصنيفات (خامات، وسيط، تام) --</option>
              <option value="خامات">خامات ومستلزمات 🧂</option>
              <option value="نصف مصنع">نصف مصنع ووسيط 🥣</option>
              <option value="منتج تام">منتج تام وجاهز للبيع 🍰</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
            >
              <option value="">-- كافة الحالات --</option>
              <option value="AVAILABLE">متوفر بمخزون كافٍ ✓</option>
              <option value="LOW">قارب على النفاد ⚠️</option>
              <option value="OUT">نفد رصيده بالكامل ❌</option>
            </select>

            <button
              onClick={() => onNavigate?.('stock-balances')}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center gap-1.5"
            >
              <Warehouse className="w-4 h-4" />
              <span>كشف أرصدة المستودعات</span>
            </button>
          </div>

          {/* جدول الأرصدة التنفيذي */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <table className="w-full text-center">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-3 px-3">كود الصنف</th>
                  <th className="py-3 px-3 text-right">اسم الصنف</th>
                  <th className="py-3 px-3">النوع</th>
                  <th className="py-3 px-3">المستودع</th>
                  <th className="py-3 px-3">الرصيد الفعلي</th>
                  <th className="py-3 px-3">المحجوز</th>
                  <th className="py-3 px-3">الرصيد المتاح</th>
                  <th className="py-3 px-3">متوسط التكلفة</th>
                  <th className="py-3 px-3">القيمة الإجمالية</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-gray-400 font-bold">
                      جاري تحميل وتقييم أرصدة المخازن...
                    </td>
                  </tr>
                ) : filteredBalances.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-gray-400 font-bold">
                      لا توجد أرصدة مطابقة لشروط الفلترة المحددة.
                    </td>
                  </tr>
                ) : (
                  filteredBalances.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">{b.itemCode}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900">{b.itemName}</td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">{b.itemType}</span></td>
                      <td className="py-3 px-3 font-medium text-gray-700">{b.warehouseName}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{b.quantity} {b.unit}</td>
                      <td className="py-3 px-3 font-mono text-amber-600">{b.reservedQuantity > 0 ? `${b.reservedQuantity} ${b.unit}` : '-'}</td>
                      <td className="py-3 px-3 font-mono font-black text-emerald-700 text-sm">{b.availableQuantity} {b.unit}</td>
                      <td className="py-3 px-3 font-mono text-gray-500">{b.estimatedUnitCost.toFixed(2)} ج.م</td>
                      <td className="py-3 px-3 font-mono font-black text-indigo-900">{b.totalValue.toLocaleString()} ج.م</td>
                      <td className="py-3 px-3">
                        {b.availableQuantity <= 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">نفد الرصيد ❌</span>
                        ) : b.availableQuantity <= 10 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">قارب على النفاد ⚠️</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">مخزون آمن ✓</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleViewLedger(b.itemId, b.itemName)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] shadow-xs"
                        >
                          🔍 كشف الحركة
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* الشاشة الفرعية: كشف حركة الصنف المباشر */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <h6 className="font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>كشف حركة تفصيلي لحظي للصنف: <span className="text-amber-400 font-black">{selectedItemName}</span></span>
            </h6>
            <button
              onClick={handleBackToBalances}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
            >
              ⬅️ عودة للأرصدة
            </button>
          </div>

          <table className="w-full text-center">
            <thead className="bg-slate-100 text-gray-700">
              <tr>
                <th className="py-2.5 px-3">التاريخ والوقت</th>
                <th className="py-2.5 px-3">نوع الحركة</th>
                <th className="py-2.5 px-3">المستودع</th>
                <th className="py-2.5 px-3">الكمية (وارد / منصرف)</th>
                <th className="py-2.5 px-3">التكلفة</th>
                <th className="py-2.5 px-3">المستند المرجعي</th>
                <th className="py-2.5 px-3 text-right">البيان وملاحظات التدقيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingLedger ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-bold">
                    جاري استخراج كشف الحركات المخزنية...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-bold">
                    لم يتم تسجيل أي حركات مخزنية لهذا الصنف.
                  </td>
                </tr>
              ) : (
                movements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-gray-500">{m.movementDate}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeForMovement(m.movementType)}`}>
                        {translateMovementType(m.movementType)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-800">{m.warehouseName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sm">
                      <span className={m.quantity > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">{m.unitCost.toFixed(2)} ج.م</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">
                      {m.referenceId ? `${m.referenceType} #${m.referenceId}` : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{m.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
