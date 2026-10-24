import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  FileSpreadsheet,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Package,
  Inbox,
  Send,
  Scale
} from 'lucide-react';
import {
  fetchStockLookupsApi,
  fetchStockCardLedgerApi,
} from './stockCardApi';
import type {
  StockCardLookupsResponse,
  StockCardReportDto,
  StockCardMovementLine,
} from './stockCardApi';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const StockCardPage: React.FC<Props> = ({ onNavigate }) => {
  const [lookups, setLookups] = useState<StockCardLookupsResponse>({ items: [], warehouses: [] });
  const [selectedItemId, setSelectedItemId] = useState<number>(201);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [report, setReport] = useState<StockCardReportDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLookups = async () => {
    try {
      const data = await fetchStockLookupsApi();
      setLookups(data);
      if (data.items.length > 0 && selectedItemId === 0) {
        setSelectedItemId(data.items[0].id);
      }
    } catch (err: any) {
      setErrorMessage(`خطأ في تحميل القوائم المرجعية: ${err.message}`);
    }
  };

  const loadLedger = async (itemId = selectedItemId, whId = selectedWarehouseId) => {
    if (itemId <= 0) {
      setReport(null);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const rep = await fetchStockCardLedgerApi(itemId, whId, fromDate, toDate);
      setReport(rep);
    } catch (err: any) {
      setErrorMessage(`تعذر جلب كارت الصنف: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
    loadLedger(201, 0);
  }, []);

  const handleExportCsv = () => {
    if (!report || !report.lines.length) return;

    try {
      const headers = [
        'التاريخ_والوقت',
        'نوع_الحركة',
        'المستودع',
        'الفرع',
        'رقم_التشغيلة_LOT',
        'تاريخ_الصلاحية',
        'وارد_+',
        'منصرف_-',
        'الرصيد_بعد_الحركة',
        'البيان_والملاحظات',
      ];

      const rows = report.lines.map((l) => [
        `"${l.movementDate}"`,
        `"${getMovementLabel(l.movementType, l.movementTypeLabel)}"`,
        `"${l.warehouseName}"`,
        `"${l.branchName || ''}"`,
        `"${l.batchNumber || '---'}"`,
        `"${l.expiryDate || '---'}"`,
        l.inQuantity > 0 ? l.inQuantity.toFixed(1) : '0.0',
        l.outQuantity > 0 ? l.outQuantity.toFixed(1) : '0.0',
        l.balanceAfter.toFixed(1),
        `"${(l.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        '\uFEFF' +
        `كشف حركة صنف: ${report.itemName} (${report.itemCode})\n` +
        `رصيد أول المدة: ${report.openingBalance.toFixed(1)} ${report.unit},إجمالي الوارد: ${report.totalInbound.toFixed(1)},إجمالي المنصرف: ${report.totalOutbound.toFixed(1)},الرصيد الفعلي الحالي: ${report.closingBalance.toFixed(1)}\n` +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `كارت_صنف_${report.itemCode}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setErrorMessage(`فشل تصدير كشف الحركات: ${err.message}`);
    }
  };

  const getMovementLabel = (type: string, fallback?: string): string => {
    switch (type) {
      case 'PURCHASE_RECEIPT': return 'توريد مشتريات (خامات)';
      case 'PRODUCTION_ISSUE': return 'صرف خامات لصالة التشغيل';
      case 'PRODUCTION_RECEIPT':
      case 'PRODUCTION_IN': return 'استلام تشغيل (تام/وسيط)';
      case 'FG_TRANSFER_OUT': return 'خروج تحويل منتج تام';
      case 'FG_TRANSFER_IN': return 'استلام تحويل بالكنترول';
      case 'QC_SAMPLE': return 'سحب عينات فحص الجودة';
      case 'QC_SCRAP': return 'إهلاك جودة غير مطابق';
      case 'QC_REJECTED': return 'فحص جودة - مرفوض (خارج المخزون)';
      case 'FG_TRANSIT_DEFICIT': return 'تسوية عجز نقل الكنترول';
      case 'SALES_ISSUE': return 'صرف مبيعات / فواتير';
      case 'TRANSFER_OUT': return 'تحويل صادر';
      case 'TRANSFER_IN': return 'تحويل وارد';
      case 'TRANSFER_LOSS': return 'عجز تحويل';
      default: return fallback || type;
    }
  };

  const getMovementBadgeClass = (type: string): string => {
    switch (type) {
      case 'PURCHASE_RECEIPT':
      case 'PRODUCTION_RECEIPT':
      case 'PRODUCTION_IN':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'SALES_ISSUE':
      case 'QC_SCRAP':
      case 'QC_REJECTED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'TRANSFER_OUT':
      case 'FG_TRANSFER_OUT':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'TRANSFER_IN':
      case 'FG_TRANSFER_IN':
      case 'QC_SAMPLE':
        return 'bg-cyan-50 text-cyan-800 border border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <span>كارت الصنف وسجل الحركات المخزنية اللحظي</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            كشف حساب تفصيلي لحركة الصنف، الرصيد التراكمي، وتتبع اللوطات والصلاحيات عبر الفروع وصالات التشغيل
          </p>
        </div>

        <div className="flex items-center gap-2">
          {report && report.lines.length > 0 && (
            <button
              onClick={handleExportCsv}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير كشف الحركة (Excel)</span>
            </button>
          )}

          <button
            onClick={() => loadLedger()}
            disabled={selectedItemId <= 0 || isLoading}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            title="إعادة تحميل"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>إعادة تحميل</span>
          </button>
        </div>
      </div>

      {/* 2. فلاتر الاستعلام */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label className="block text-gray-700 font-bold mb-1">
              اختر الصنف <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelectedItemId(val);
                loadLedger(val, selectedWarehouseId);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>-- اختر الصنف لعرض حركته --</option>
              {lookups.items.map((itm) => (
                <option key={itm.id} value={itm.id}>
                  {itm.itemName} ({itm.itemCode}) - [{itm.categoryName}]
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">المستودع / الفرع</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelectedWarehouseId(val);
                loadLedger(selectedItemId, val);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>كافة المستودعات والفروع وصالات التشغيل</option>
              {lookups.warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.warehouseName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-1">من تاريخ</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-1">
            <button
              onClick={() => loadLedger()}
              disabled={selectedItemId <= 0 || isLoading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center disabled:opacity-50"
            >
              عرض
            </button>
          </div>
        </div>
      </div>

      {/* 3. رسائل الأخطاء */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {report ? (
        <>
          {/* 4. بطاقات ملخص كشف الحساب التراكمي */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-slate-400 p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">رصيد أول المدة</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-slate-700">
                  {report.openingBalance.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-gray-500">{report.unit}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">إجمالي الوارد (+)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-emerald-600">
                  {report.totalInbound.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-gray-500">{report.unit}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-rose-500 p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">إجمالي المنصرف (-)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-rose-600">
                  {report.totalOutbound.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-gray-500">{report.unit}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">رصيد آخر المدة (الرصيد الفعلي الحالي)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-indigo-700">
                  {report.closingBalance.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-gray-500">{report.unit}</span>
              </div>
            </div>
          </div>

          {/* 5. جدول الحركات التفصيلية لكارت الصنف */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-bold">
                حركات الصنف: <span className="text-amber-400">{report.itemName}</span> ({report.itemCode})
              </h2>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-0.5 rounded-full text-[11px]">
                التصنيف: {report.categoryName}
              </span>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  <RotateCw className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
                  <p>جاري احتساب كشف الحركات والرصيد التراكمي...</p>
                </div>
              ) : report.lines.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-bold">
                  لا توجد حركات مخزنية مسجلة لهذا الصنف خلال الفترة المحددة.
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                    <tr>
                      <th className="py-3 px-3">التاريخ والوقت</th>
                      <th className="py-3 px-3">نوع الحركة المخزنية</th>
                      <th className="py-3 px-3">المستودع / الصالة</th>
                      <th className="py-3 px-3">التشغيلة (اللوط)</th>
                      <th className="py-3 px-3">تاريخ الصلاحية</th>
                      <th className="py-3 px-3 bg-emerald-50/75 text-emerald-800 font-bold">وارد (+)</th>
                      <th className="py-3 px-3 bg-rose-50/75 text-rose-800 font-bold">منصرف (-)</th>
                      <th className="py-3 px-3 bg-indigo-50/75 text-indigo-900 font-black">الرصيد بعد الحركة</th>
                      <th className="py-3 px-3 text-right" style={{ width: '25%' }}>البيان والملاحظات المرجعية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-center">
                    {report.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">{line.movementDate}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getMovementBadgeClass(line.movementType)}`}>
                            {getMovementLabel(line.movementType, line.movementTypeLabel)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-900">{line.warehouseName}</div>
                          {line.branchName && (
                            <span className="text-[10px] text-gray-400 block">{line.branchName}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-gray-800">
                          {line.batchNumber || '---'}
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                          {line.expiryDate || '---'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600 bg-emerald-50/30">
                          {line.inQuantity > 0 ? line.inQuantity.toLocaleString() : '---'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-rose-600 bg-rose-50/30">
                          {line.outQuantity > 0 ? line.outQuantity.toLocaleString() : '---'}
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-indigo-700 bg-indigo-50/40 text-sm">
                          {line.balanceAfter.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-500 text-[11px] truncate max-w-xs" title={line.notes || ''}>
                          {line.notes || '---'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-16 text-gray-400 text-xs shadow-xs">
          <Search className="w-10 h-10 mx-auto text-indigo-400 mb-2 opacity-50" />
          <p>يرجى اختيار صنف من القائمة أعلاه لعرض كارت الصنف وسجل حركاته التراكمية.</p>
        </div>
      )}

    </div>
  );
};
