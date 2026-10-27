import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Award,
  Download,
  PlusCircle,
  FileSpreadsheet,
  Building2,
  Calendar,
  CheckSquare,
  ShieldCheck,
  X
} from 'lucide-react';

export interface InspectionLineItem {
  itemId: number;
  itemName: string;
  itemCode: string;
  unit: string;
  remainingQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  batchNumber: string;
  expiryDate: string;
  rejectionReason: string;
}

export interface SupplierOrderDto {
  id: number;
  poNumber: string;
  supplierName: string;
  details: string;
  issueDate: string;
  expectedDate: string;
  totalAmount: number;
  status: string;
  coaStatus: string;
  lines?: {
    itemId: number;
    itemName: string;
    itemCode: string;
    unit: string;
    quantity: number;
  }[];
}

export const PurchaseOrdersQualityPage: React.FC = () => {
  const warehousesList = [
    { id: 1, name: 'مستودع الخامات والمستلزمات الرئيسي (WH-MAIN)' },
    { id: 2, name: 'ثلاجة تبريد النصف مصنع والمكسرات المركزية (-18°م)' },
    { id: 3, name: 'مستودع مواد التعبئة والتغليف والكرتون (WH-PACK)' }
  ];

  const [orders, setOrders] = useState<SupplierOrderDto[]>([
    {
      id: 1,
      poNumber: 'PO-2026-101',
      supplierName: 'شركة مطاحن الدلتا والصعيد',
      details: 'توريد شيكارات دقيق فاخر 72% استخراج أبيض',
      issueDate: '2026-10-21',
      expectedDate: '2026-10-23',
      totalAmount: 92500,
      status: 'معتمد قيد التوريد',
      coaStatus: 'شهادات مطابقة',
      lines: [
        { itemId: 101, itemName: 'دقيق فاخر استخراج 72%', itemCode: 'RAW-FLR-04', unit: 'شيكارة (50 كجم)', quantity: 100 }
      ]
    },
    {
      id: 2,
      poNumber: 'PO-2026-102',
      supplierName: 'الشركة المصرية لتجارة وتكرير السكر',
      details: 'توريد شيكارات سكر مكرر ناعم فاخر',
      issueDate: '2026-10-22',
      expectedDate: '2026-10-24',
      totalAmount: 84000,
      status: 'معتمد قيد التوريد',
      coaStatus: 'شهادات مطابقة',
      lines: [
        { itemId: 103, itemName: 'سكر مكرر ناعم فاخر', itemCode: 'RAW-SUG-01', unit: 'شيكارة (50 كجم)', quantity: 60 }
      ]
    },
    {
      id: 3,
      poNumber: 'PO-2026-103',
      supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف',
      details: 'كرتون صواني البسبوسة 50*50 معقم',
      issueDate: '2026-10-23',
      expectedDate: '2026-10-26',
      totalAmount: 225,
      status: 'معتمد قيد التوريد',
      coaStatus: 'شهادات مطابقة',
      lines: [
        { itemId: 106, itemName: 'كرتون صواني البسبوسة 50*50', itemCode: 'PCK-BOX-09', unit: 'قطعة', quantity: 50 }
      ]
    }
  ]);

  // قراءة أوامر التوريد المخزنة محلياً وتحديثها بدون تكرار
  useEffect(() => {
    const saved = localStorage.getItem('kayan_purchase_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const uniqueOrders = parsed.filter((item, index, self) =>
            index === self.findIndex(t => t.poNumber === item.poNumber)
          );
          setOrders(uniqueOrders);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Modal حالة محضر الفحص الفني والاستلام المخزني (GMP)
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedOrderForGmp, setSelectedOrderForGmp] = useState<SupplierOrderDto | null>(null);
  const [targetWarehouseId, setTargetWarehouseId] = useState<number>(1);
  const [coaNumber, setCoaNumber] = useState('');
  const [inspectorName, setInspectorName] = useState('مفتش الجودة المخزنية');
  const [inspectorCode, setInspectorCode] = useState('QC-01');
  const [inspectionLines, setInspectionLines] = useState<InspectionLineItem[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // فتح المحضر الرسمي
  const handleOpenGmpInspection = (order: SupplierOrderDto) => {
    setSelectedOrderForGmp(order);
    setTargetWarehouseId(1);
    setCoaNumber(`COA-${new Date().toISOString().slice(0, 7).replace('-', '')}-${order.poNumber.replace('PO-', '')}`);
    setInspectorName('مفتش الجودة المخزنية');
    setInspectorCode('QC-01');
    setModalError(null);

    // تجهيز بنود الفحص الميداني
    if (order.lines && order.lines.length > 0) {
      setInspectionLines(order.lines.map(l => ({
        itemId: l.itemId,
        itemName: l.itemName,
        itemCode: l.itemCode,
        unit: l.unit,
        remainingQuantity: l.quantity,
        acceptedQuantity: l.quantity,
        rejectedQuantity: 0,
        batchNumber: `LOT-${l.itemId}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        expiryDate: new Date(Date.now() + 86400000 * 365).toISOString().slice(0, 10),
        rejectionReason: 'مطابق للمواصفة القياسية'
      })));
    } else {
      setInspectionLines([{
        itemId: 101,
        itemName: order.details || 'خامة إنتاج معتمدة',
        itemCode: 'RAW-FLR-04',
        unit: 'وحدة',
        remainingQuantity: 100,
        acceptedQuantity: 100,
        rejectedQuantity: 0,
        batchNumber: `LOT-101-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        expiryDate: new Date(Date.now() + 86400000 * 365).toISOString().slice(0, 10),
        rejectionReason: 'مطابق للمواصفة القياسية'
      }]);
    }

    setShowInspectionModal(true);
  };

  // اعتماد المحضر وتسكين المستودع
  const handleSubmitGmpReceipt = () => {
    if (!selectedOrderForGmp) return;

    for (const item of inspectionLines) {
      if (item.acceptedQuantity + item.rejectedQuantity > item.remainingQuantity) {
        setModalError(`مجموع الكمية المقبولة والمرفوضة للصنف [${item.itemName}] يتجاوز الكمية المطلوبة.`);
        return;
      }
      if (item.acceptedQuantity > 0 && !item.batchNumber.trim()) {
        setModalError(`يرجى تسجيل رقم اللوط (الدفعة) للصنف المقبول [${item.itemName}].`);
        return;
      }
    }

    const updated = orders.map(o => o.id === selectedOrderForGmp.id ? { ...o, status: 'مكتمل ومستلم بالكامل' } : o);
    setOrders(updated);
    localStorage.setItem('kayan_purchase_orders', JSON.stringify(updated));

    setShowInspectionModal(false);
    setSuccessBanner(`✅ تم توثيق محضر الفحص الفني [${coaNumber}] واستلام شحنة أمر التوريد [${selectedOrderForGmp.poNumber}] وترحيل الأرصدة للمستودع بنجاح!`);
    setTimeout(() => setSuccessBanner(null), 6000);
  };

  const totalAmountSum = orders.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const pendingCount = orders.filter(o => o.status?.includes('قيد التوريد')).length;
  const completedCount = orders.filter(o => o.status?.includes('مستلم') || o.status?.includes('مكتمل')).length;

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      {/* البطاقات العليا بالوضع الليلي الفاحم الصافي */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي تعاقدات أوامر الشراء</span>
          <h4 className="text-2xl font-black text-amber-400 font-mono mt-1">
            {totalAmountSum.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">أوامر معتمدة قيد التوريد</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">{pendingCount} أوامر جارية</h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">شحنات اكتمل استلامها</span>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">{completedCount} أوامر مسلمة</h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">شهادات COA المعتمدة</span>
          <h4 className="text-2xl font-black text-rose-400 font-mono mt-1">مطابقة للمواصفات</h4>
        </div>
      </div>

      {successBanner && (
        <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successBanner}
          </span>
          <button onClick={() => setSuccessBanner(null)}>×</button>
        </div>
      )}

      {/* ترويسة الشاشة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <Truck className="w-6 h-6 text-indigo-400" />
              <span>أوامر توريد من الموردين وتقييم الجودة (Purchase Orders & COA)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              المرحلة التنفيذية للموردين
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            دورة إصدار أوامر الشراء المعتمدة، وتوثيق شهادات التحليل المخبري لمطابقة خامات الحلويات.
          </p>
        </div>
      </div>

      {/* جدول أوامر التوريد للموردين */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <table className="w-full text-center">
          <thead className="bg-slate-100 dark:bg-[#151822] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-3">رقم أمر الشراء</th>
              <th className="py-3 px-3 text-right">المورد والبيان</th>
              <th className="py-3 px-3">تاريخ الإصدار</th>
              <th className="py-3 px-3">التوريد المتوقع</th>
              <th className="py-3 px-3">إجمالي القيمة</th>
              <th className="py-3 px-3">حالة الأمر</th>
              <th className="py-3 px-3">إجراء الاستلام (GMP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
            {orders.map(o => {
              const isReceived = o.status?.includes('مستلم') || o.status?.includes('مكتمل');
              return (
                <tr key={o.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{o.poNumber}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-zinc-100 block">{o.supplierName}</span>
                    <small className="text-zinc-500">{o.details}</small>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{o.issueDate}</td>
                  <td className="py-3 px-3 font-mono text-indigo-300">{o.expectedDate}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {Number(o.totalAmount).toLocaleString()} ج.م
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      isReceived ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {isReceived ? (
                      <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم الاستلام المخزني ✓</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenGmpInspection(o)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1.5 mx-auto transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>فحص واستلام (GMP)</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: محضر الفحص الفني والاستلام المخزني الرسمي (مطابق تماماً لكود MaterialReceipt.razor) */}
      {showInspectionModal && selectedOrderForGmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0f1117] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-[#161a25] text-white flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-amber-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>محضر استلام وفحص جودة أمر الشراء: {selectedOrderForGmp.poNumber}</span>
              </h4>
              <button onClick={() => setShowInspectionModal(false)} className="text-slate-600 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {modalError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-bold">
                  {modalError}
                </div>
              )}

              {/* بيانات محضر الاستلام والـ QC */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 bg-black/40 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">مستودع التسكين الفعلي *</label>
                  <select
                    value={targetWarehouseId}
                    onChange={(e) => setTargetWarehouseId(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#171922] border border-emerald-500/40 rounded-lg font-bold text-zinc-100 text-xs"
                  >
                    {warehousesList.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">رقم شهادة التحليل (COA)</label>
                  <input
                    type="text"
                    value={coaNumber}
                    onChange={(e) => setCoaNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-indigo-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">اسم مفتش الجودة</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-zinc-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">كود المفتش</label>
                  <input
                    type="text"
                    value={inspectorCode}
                    onChange={(e) => setInspectorCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-zinc-200 text-xs"
                  />
                </div>
              </div>

              {/* مطابقة بنود الشحنة والكميات واللوطات */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-[#0a0c10]">
                <div className="p-3 bg-[#13161f] border-b border-slate-200 dark:border-zinc-800">
                  <h6 className="font-bold text-zinc-200 m-0">مطابقة بنود الشحنة والكميات الواردة:</h6>
                </div>

                <table className="w-full text-center">
                  <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400">
                    <tr>
                      <th className="py-2.5 px-3 text-right" style={{ width: '22%' }}>الصنف</th>
                      <th className="py-2.5 px-3">المتبقي بالطلب</th>
                      <th className="py-2.5 px-3 w-28">الكمية المقبولة</th>
                      <th className="py-2.5 px-3 w-24">المرفوض</th>
                      <th className="py-2.5 px-3 w-32">رقم التشغيلة (اللوط)</th>
                      <th className="py-2.5 px-3 w-32">تاريخ الصلاحية</th>
                      <th className="py-2.5 px-3 text-right">قرار الجودة / الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {inspectionLines.map((item, idx) => (
                      <tr key={item.itemId}>
                        <td className="py-2.5 px-3 text-right font-bold text-zinc-100">
                          {item.itemName}
                          <small className="block font-mono text-zinc-500">{item.itemCode}</small>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600 dark:text-zinc-400">
                          {item.remainingQuantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max={item.remainingQuantity}
                            value={item.acceptedQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const copy = [...inspectionLines];
                              copy[idx].acceptedQuantity = val;
                              setInspectionLines(copy);
                            }}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-emerald-500/60 rounded font-mono font-bold text-center text-emerald-400"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max={item.remainingQuantity}
                            value={item.rejectedQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const copy = [...inspectionLines];
                              copy[idx].rejectedQuantity = val;
                              setInspectionLines(copy);
                            }}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-rose-500/60 rounded font-mono font-bold text-center text-rose-400"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => {
                              const val = e.target.value;
                              const copy = [...inspectionLines];
                              copy[idx].batchNumber = val;
                              setInspectionLines(copy);
                            }}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded font-mono font-bold text-center text-zinc-200 text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              const copy = [...inspectionLines];
                              copy[idx].expiryDate = val;
                              setInspectionLines(copy);
                            }}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded font-mono font-bold text-center text-zinc-200 text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="text"
                            value={item.rejectionReason}
                            onChange={(e) => {
                              const val = e.target.value;
                              const copy = [...inspectionLines];
                              copy[idx].rejectionReason = val;
                              setInspectionLines(copy);
                            }}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded text-xs text-zinc-200"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSubmitGmpReceipt}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>اعتماد الاستلام وتسكين المخزن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersQualityPage;


