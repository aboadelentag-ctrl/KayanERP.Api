import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileSpreadsheet,
  Truck,
  Box,
  ClipboardCheck,
  X,
  Warehouse
} from 'lucide-react';

interface PurchaseOrderLineDto {
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  remainingQuantity: number;
  unitPrice: number;
}

interface PendingPurchaseOrderDto {
  id: number;
  orderNumber: string;
  orderDate: string;
  supplierId: number;
  supplierName: string;
  warehouseId?: number;
  totalAmount: number;
  status: 'Approved' | 'PartiallyReceived';
  lines: PurchaseOrderLineDto[];
}

interface InspectionItemState {
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  remainingQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
  qcDecision: string;
  rejectionReason: string;
}

export const MaterialReceiptPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Lookups
  const suppliers = [
    { id: 1, supplierName: 'شركة النيل للمطاحن وتجارة الغلال' },
    { id: 2, supplierName: 'مؤسسة الزبدة والسمن الطبيعي الذهبي' },
    { id: 3, supplierName: 'مستودع الشرق لاستيراد المكسرات' }
  ];

  const warehouses = [
    { id: 1, warehouseName: 'مستودع الخامات والمستلزمات الرئيسي (WH-MAIN)' },
    { id: 2, warehouseName: 'ثلاجة النصف مصنع والمكسرات المركزية' },
    { id: 3, warehouseName: 'مستودع أدوات التعبئة والكرتون (WH-PACK)' }
  ];

  // Data
  const [pendingInvoices, setPendingInvoices] = useState<PendingPurchaseOrderDto[]>([
    {
      id: 1,
      orderNumber: 'PO-2026-104',
      orderDate: '2026-10-24',
      supplierId: 1,
      supplierName: 'شركة النيل للمطاحن وتجارة الغلال',
      warehouseId: 1,
      totalAmount: 140000,
      status: 'Approved',
      lines: [
        { itemId: 101, itemCode: 'RAW-FLR-04', itemName: 'دقيق فاخر استخراج 72%', unit: 'كجم', remainingQuantity: 5000, unitPrice: 28 }
      ]
    },
    {
      id: 2,
      orderNumber: 'PO-2026-105',
      orderDate: '2026-10-25',
      supplierId: 2,
      supplierName: 'مؤسسة الزبدة والسمن الطبيعي الذهبي',
      warehouseId: 1,
      totalAmount: 228000,
      status: 'Approved',
      lines: [
        { itemId: 102, itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي ممتاز', unit: 'كجم', remainingQuantity: 1200, unitPrice: 190 }
      ]
    }
  ]);

  // Modal State
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PendingPurchaseOrderDto | null>(null);
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [coaNumber, setCoaNumber] = useState('');
  const [inspectorName, setInspectorName] = useState('مفتش الجودة المخزنية');
  const [inspectorCode, setInspectorCode] = useState('QC-01');
  const [inspectionItems, setInspectionItems] = useState<InspectionItemState[]>([]);

  const filteredInvoices = useMemo(() => {
    return pendingInvoices.filter(p => {
      if (selectedSupplierId > 0 && p.supplierId !== selectedSupplierId) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.orderNumber.toLowerCase().includes(term) ||
        p.supplierName.toLowerCase().includes(term)
      );
    });
  }, [pendingInvoices, selectedSupplierId, searchTerm]);

  const openInspectionModal = (invoice: PendingPurchaseOrderDto) => {
    setSelectedInvoice(invoice);
    setWarehouseId(invoice.warehouseId || warehouses[0].id);
    setCoaNumber(`COA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${invoice.id}`);
    setInspectorName('مفتش الجودة المخزنية');
    setInspectorCode('QC-01');
    setModalError(null);

    setInspectionItems(
      invoice.lines.map(l => ({
        itemId: l.itemId,
        itemCode: l.itemCode,
        itemName: l.itemName,
        unit: l.unit,
        remainingQuantity: l.remainingQuantity,
        acceptedQuantity: l.remainingQuantity,
        rejectedQuantity: 0,
        unitPrice: l.unitPrice,
        batchNumber: `LOT-${l.itemId}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        qcDecision: 'Accepted',
        rejectionReason: 'مطابق للمواصفة'
      }))
    );

    setShowInspectionModal(true);
  };

  const submitMaterialReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (warehouseId <= 0) {
      setModalError('يرجى تحديد مستودع التسكين الفعلي.');
      return;
    }

    if (!inspectionItems.some(i => i.acceptedQuantity > 0 || i.rejectedQuantity > 0)) {
      setModalError('يجب إدخال كمية مقبولة أو مرفوضة لبند واحد على الأقل.');
      return;
    }

    for (const item of inspectionItems) {
      if (item.acceptedQuantity + item.rejectedQuantity > item.remainingQuantity) {
        setModalError(`مجموع الكميات (المقبولة والمرفوضة) للصنف [${item.itemName}] يتجاوز الكمية المتبقية (${item.remainingQuantity}).`);
        return;
      }
      if (item.acceptedQuantity > 0 && !item.batchNumber.trim()) {
        setModalError(`يرجى إدخال رقم التشغيلة (اللوط) للصنف المقبول [${item.itemName}].`);
        return;
      }
    }

    setIsSaving(true);
    setModalError(null);

    setTimeout(() => {
      if (selectedInvoice) {
        setPendingInvoices(pendingInvoices.filter(p => p.id !== selectedInvoice.id));
      }
      setStatusMessage(`✅ تم استلام الخامات وتسكين الأرصدة المخزنية بنجاح لأمر الشراء [${selectedInvoice?.orderNumber}]!`);
      setIsSaving(false);
      setShowInspectionModal(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }, 600);
  };

  const exportPendingToExcel = () => {
    if (!filteredInvoices.length) return;
    let csv = 'رقم_أمر_الشراء,تاريخ_الأمر,المورد,عدد_البنود_المتبقية,إجمالي_القيمة,الحالة\n';
    filteredInvoices.forEach(inv => {
      const statusText = inv.status === 'Approved' ? 'جاهز للتوريد' : 'توريد جزئي';
      csv += `"${inv.orderNumber}","${inv.orderDate}","${inv.supplierName}",${inv.lines.length},${inv.totalAmount},"${statusText}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `الشحنات_المعتمدة_للاستلام_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <span>فحص الجودة واستلام الخامات الموردة (GMP)</span>
            </h1>
            <span className="bg-emerald-400/20 text-emerald-700 dark:text-emerald-400 border border-emerald-400/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              توثيق الفحص المخزني ومطابقة COA
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            مطابقة الشحنات الموردة، توثيق شهادات التحليل (COA)، تسجيل أرقام اللوطات والصلاحيات، وترحيل الأرصدة.
          </p>
        </div>

        <div className="flex gap-2">
          {pendingInvoices.length > 0 && (
            <button
              onClick={exportPendingToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير (Excel)</span>
            </button>
          )}
          <button
            onClick={() => setIsLoading(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs border border-gray-200 dark:border-zinc-800 transition-colors"
          >
            <RotateCw className="w-4 h-4 text-indigo-500" />
            <span>تحديث الفواتير المنتظرة</span>
          </button>
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

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl text-xs font-bold flex justify-between items-center">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات الإحصائيات الثلاثة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">شحنات معتمدة في انتظار الفحص</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">{pendingInvoices.length}</h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-cyan-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">إجمالي بنود الخامات المطلوب استلامها</span>
          <h4 className="text-2xl font-black text-cyan-500 font-mono mt-1">
            {pendingInvoices.reduce((sum, p) => sum + p.lines.length, 0)}
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-emerald-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">مستودعات الخامات الجاهزة للاستقبال</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">{warehouses.length}</h4>
        </div>
      </div>

      {/* شريط الفلترة والبحث */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[260px]">
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold outline-none text-gray-800 dark:text-zinc-200"
          >
            <option value={0}>كافة الموردين</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.supplierName}</option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="ابحث برقم أمر الشراء، اسم المورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-2 outline-none font-bold text-gray-800 dark:text-zinc-200"
          />
        </div>
      </div>

      {/* جدول أوامر الشراء المعتمدة الجاهزة للاستلام */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold">
            <Box className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <span>لا توجد شحنات معتمدة في انتظار الاستلام والفحص حالياً.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-3">رقم أمر الشراء</th>
                  <th className="py-3 px-3">تاريخ الأمر</th>
                  <th className="py-3 px-3 text-right">اسم المورد</th>
                  <th className="py-3 px-3">عدد البنود المتبقية</th>
                  <th className="py-3 px-3">إجمالي القيمة</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.orderNumber}</td>
                    <td className="py-3 px-3 font-mono text-gray-400">{inv.orderDate}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-gray-400" />
                        {inv.supplierName}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                        {inv.lines.length} بنود
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-zinc-100">
                      {inv.totalAmount.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {inv.status === 'Approved' ? 'جاهز للتوريد' : 'توريد جزئي'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => openInspectionModal(inv)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-sm transition-all mx-auto"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>فحص واستلام مخزني</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: محضر الفحص الفني والاستلام المخزني */}
      {showInspectionModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-amber-400">
                <ClipboardCheck className="w-4 h-4" />
                <span>محضر استلام وفحص جودة أمر الشراء: {selectedInvoice.orderNumber}</span>
              </h4>
              <button onClick={() => setShowInspectionModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitMaterialReceipt} className="p-5 space-y-4 overflow-y-auto flex-1">
              {modalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl font-bold">
                  {modalError}
                </div>
              )}

              {/* بيانات محضر الاستلام والـ QC */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">مستودع التسكين الفعلي *</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border border-indigo-300 dark:border-zinc-800 rounded-lg font-bold"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.warehouseName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">رقم شهادة التحليل (COA)</label>
                  <input
                    type="text"
                    value={coaNumber}
                    onChange={(e) => setCoaNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم مفتش الجودة</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">كود المفتش</label>
                  <input
                    type="text"
                    value={inspectorCode}
                    onChange={(e) => setInspectorCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono text-center font-bold"
                  />
                </div>
              </div>

              {/* جدول فحص البنود واللوطات */}
              <div className="space-y-2">
                <span className="font-bold text-gray-800 dark:text-zinc-200 block">مطابقة بنود الشحنة والكميات الواردة:</span>
                <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-xl">
                  <table className="w-full text-center bg-white dark:bg-[#0c0d11]">
                    <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-b">
                      <tr>
                        <th className="py-2.5 px-3 text-right">الصنف</th>
                        <th className="py-2.5 px-3">المتبقي بالطلب</th>
                        <th className="py-2.5 px-3">الكمية المقبولة</th>
                        <th className="py-2.5 px-3">المرفوض</th>
                        <th className="py-2.5 px-3">رقم التشغيلة (اللوط)</th>
                        <th className="py-2.5 px-3">تاريخ الصلاحية</th>
                        <th className="py-2.5 px-3">قرار الجودة / الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {inspectionItems.map((item, idx) => (
                        <tr key={item.itemId}>
                          <td className="py-2 px-3 text-right">
                            <span className="font-bold text-gray-900 dark:text-zinc-100 block">{item.itemName}</span>
                            <span className="font-mono text-gray-400 text-[10px]">{item.itemCode}</span>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-gray-500">
                            {item.remainingQuantity} {item.unit}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.5"
                              min={0}
                              max={item.remainingQuantity}
                              value={item.acceptedQuantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setInspectionItems(inspectionItems.map((it, i) => i === idx ? { ...it, acceptedQuantity: val } : it));
                              }}
                              className="w-20 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center text-emerald-600"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.5"
                              min={0}
                              max={item.remainingQuantity}
                              value={item.rejectedQuantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setInspectionItems(inspectionItems.map((it, i) => i === idx ? { ...it, rejectedQuantity: val } : it));
                              }}
                              className="w-20 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center text-rose-500"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.batchNumber}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInspectionItems(inspectionItems.map((it, i) => i === idx ? { ...it, batchNumber: val } : it));
                              }}
                              className="w-28 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono text-center"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInspectionItems(inspectionItems.map((it, i) => i === idx ? { ...it, expiryDate: val } : it));
                              }}
                              className="px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono text-center text-[10px]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.rejectionReason}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInspectionItems(inspectionItems.map((it, i) => i === idx ? { ...it, rejectionReason: val } : it));
                              }}
                              className="w-36 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded text-[11px]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm transition-all"
                >
                  {isSaving ? 'جاري التسكين والترصيد...' : 'اعتماد الاستلام وتسكين المخزن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

