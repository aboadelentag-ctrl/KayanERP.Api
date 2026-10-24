import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  FileSpreadsheet,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ClipboardCheck,
  Check2Circle
} from 'lucide-react';
import {
  fetchMaterialReceiptLookupsApi,
  fetchPendingInvoicesApi,
  PendingInvoiceDto,
  MaterialReceiptLookupsDto,
  MaterialReceiptPostDto
} from './materialReceiptApi';

export const MaterialReceiptPage: React.FC = () => {
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoiceDto[]>([]);
  const [lookups, setLookups] = useState<MaterialReceiptLookupsDto>({ suppliers: [], warehouses: [] });
  const [selectedInvoice, setSelectedInvoice] = useState<PendingInvoiceDto | null>(null);
  const [receiptPostDto, setReceiptPostDto] = useState<MaterialReceiptPostDto | null>(null);

  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showInspectionModal, setShowInspectionModal] = useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const lookupsData = await fetchMaterialReceiptLookupsApi();
      setLookups(lookupsData);
      await loadInvoices(selectedSupplierId);
    } catch (ex: any) {
      setErrorMessage(`خطأ في تحميل بيانات محطة الاستلام: ${ex.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvoices = async (supplierId: number) => {
    try {
      const invoices = await fetchPendingInvoicesApi(supplierId);
      setPendingInvoices(invoices);
    } catch (ex: any) {
      setErrorMessage(`تعذر جلب أوامر الشراء المعتمدة: ${ex.message}`);
    }
  };

  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return pendingInvoices;
    const term = searchTerm.toLowerCase();
    return pendingInvoices.filter(
      (p) => p.orderNumber?.toLowerCase().includes(term) || p.supplierName?.toLowerCase().includes(term)
    );
  }, [pendingInvoices, searchTerm]);

  const openInspectionModal = (invoice: PendingInvoiceDto) => {
    setSelectedInvoice(invoice);
    setReceiptPostDto({
      invoiceId: invoice.id,
      warehouseId: invoice.warehouseId > 0 ? invoice.warehouseId : (lookups.warehouses[0]?.id || 0),
      coaNumber: `COA-${new Date().toISOString().slice(0, 7).replace('-', '')}-${invoice.id}`,
      inspectorCode: 'QC-01',
      inspectorName: 'مفتش الجودة المخزنية',
      items: invoice.lines.map((l) => ({
        itemId: l.itemId,
        itemName: l.itemName,
        itemCode: l.itemCode,
        unit: l.unit,
        remainingQuantity: l.remainingQuantity,
        acceptedQuantity: l.remainingQuantity,
        rejectedQuantity: 0,
        unitPrice: l.unitPrice,
        batchNumber: `LOT-${l.itemId}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
        qcDecision: 'Accepted',
        rejectionReason: 'مطابق للمواصفة'
      }))
    });
    setModalError(null);
    setShowInspectionModal(true);
  };

  const submitMaterialReceipt = async () => {
    if (!receiptPostDto) return;

    if (receiptPostDto.warehouseId <= 0) {
      setModalError('يرجى تحديد مستودع التسكين الفعلي.');
      return;
    }

    if (!receiptPostDto.items.some((i) => i.acceptedQuantity > 0 || i.rejectedQuantity > 0)) {
      setModalError('يجب إدخال كمية مقبولة أو مرفوضة لبند واحد على الأقل.');
      return;
    }

    for (const item of receiptPostDto.items) {
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

    try {
      const response = await fetch('/api/materialreceipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptPostDto)
      });

      if (response.ok) {
        const result = await response.json();
        setStatusMessage(result?.message || 'تم استلام الخامات وتسكين الأرصدة المخزنية بنجاح!');
        setShowInspectionModal(false);
        await loadInvoices(selectedSupplierId);
      } else {
        const errText = await response.text();
        setModalError(errText);
      }
    } catch (ex: any) {
      setModalError(`خطأ: ${ex.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const exportPendingToExcel = () => {
    if (filteredInvoices.length === 0) return;
    const headers = ['رقم_أمر_الشراء', 'تاريخ_الأمر', 'المورد', 'عدد_البنود_المتبقية', 'إجمالي_القيمة', 'الحالة'];
    const rows = filteredInvoices.map((inv) => [
      inv.orderNumber,
      inv.orderDate,
      `"${inv.supplierName}"`,
      inv.lines.length,
      inv.totalAmount.toFixed(2),
      inv.status === 'Approved' ? 'جاهز للتوريد' : 'توريد جزئي'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `الشحنات_المعتمدة_للاستلام_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>فحص الجودة واستلام الخامات الموردة (GMP)</span>
          </h3>
          <p className="text-xs text-gray-500">
            مطابقة الشحنات الموردة، توثيق شهادات التحليل (COA)، تسجيل أرقام اللوطات والصلاحيات، وترحيل الأرصدة
          </p>
        </div>
        <div className="flex gap-2">
          {pendingInvoices.length > 0 && (
            <button
              onClick={exportPendingToExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير (Excel)</span>
            </button>
          )}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <RefreshCcw className="w-4 h-4 text-indigo-600" />
            <span>تحديث الفواتير المنتظرة</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" />{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">شحنات معتمدة في انتظار الفحص</span>
          <h4 className="text-xl font-black text-amber-600 font-mono mt-1">{pendingInvoices.length}</h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-cyan-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي بنود الخامات المطلوب استلامها</span>
          <h4 className="text-xl font-black text-cyan-600 font-mono mt-1">{pendingInvoices.reduce((acc, p) => acc + p.lines.length, 0)}</h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">مستودعات الخامات الجاهزة للاستقبال</span>
          <h4 className="text-xl font-black text-emerald-600 font-mono mt-1">{lookups.warehouses.length}</h4>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <select
          value={selectedSupplierId}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSelectedSupplierId(val);
            loadInvoices(val);
          }}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold outline-none"
        >
          <option value={0}>كافة الموردين</option>
          {lookups.suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.supplierName}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="ابحث برقم أمر الشراء، اسم المورد..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-bold">جاري فحص وتحديث أوامر الشراء الجاهزة للاستلام...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold">لا توجد شحنات معتمدة في انتظار الاستلام والفحص حالياً.</div>
        ) : (
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
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
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{inv.orderNumber}</td>
                  <td className="py-3 px-3 font-mono text-gray-500">{inv.orderDate}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 flex items-center gap-1.5 justify-end">
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                    <span>{inv.supplierName}</span>
                  </td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 bg-slate-100 rounded font-mono font-bold">{inv.lines.length} بنود</span></td>
                  <td className="py-3 px-3 font-mono font-bold">{inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold ${inv.status === 'Approved' ? 'bg-amber-50 text-amber-800' : 'bg-cyan-50 text-cyan-800'}`}>
                      {inv.status === 'Approved' ? 'جاهز للتوريد' : 'توريد جزئي'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => openInspectionModal(inv)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 inline ml-1" /> فحص واستلام مخزني
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInspectionModal && selectedInvoice && receiptPostDto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h6 className="font-bold">محضر استلاست وفحص جودة أمر الشراء: {selectedInvoice.orderNumber}</h6>
              <button onClick={() => setShowInspectionModal(false)} className="text-white/80 hover:text-white font-bold">×</button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold">{modalError}</div>
              )}

              <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">مستودع التسكين الفعلي *</label>
                  <select
                    value={receiptPostDto.warehouseId}
                    onChange={(e) => setReceiptPostDto({ ...receiptPostDto, warehouseId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    {lookups.warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.warehouseName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">رقم شهادة التحليل (COA)</label>
                  <input
                    type="text"
                    value={receiptPostDto.coaNumber}
                    onChange={(e) => setReceiptPostDto({ ...receiptPostDto, coaNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم مفتش الجودة</label>
                  <input
                    type="text"
                    value={receiptPostDto.inspectorName}
                    onChange={(e) => setReceiptPostDto({ ...receiptPostDto, inspectorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">كود المفتش</label>
                  <input
                    type="text"
                    value={receiptPostDto.inspectorCode}
                    onChange={(e) => setReceiptPostDto({ ...receiptPostDto, inspectorCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <h6 className="font-bold text-gray-900 mt-2">مطابقة بنود الشحنة والكميات الواردة:</h6>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <table className="w-full text-center">
                  <thead className="bg-slate-100 text-gray-700">
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
                  <tbody className="divide-y divide-gray-100">
                    {receiptPostDto.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-right font-bold">
                          {item.itemName}
                          <div className="text-[11px] text-gray-400 font-mono">{item.itemCode}</div>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-gray-500">{item.remainingQuantity} {item.unit}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={item.remainingQuantity}
                            value={item.acceptedQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const newItems = [...receiptPostDto.items];
                              newItems[idx].acceptedQuantity = val;
                              setReceiptPostDto({ ...receiptPostDto, items: newItems });
                            }}
                            className="w-24 px-2 py-1 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono font-bold text-emerald-700"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={item.remainingQuantity}
                            value={item.rejectedQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const newItems = [...receiptPostDto.items];
                              newItems[idx].rejectedQuantity = val;
                              setReceiptPostDto({ ...receiptPostDto, items: newItems });
                            }}
                            className="w-24 px-2 py-1 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono font-bold text-rose-600"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newItems = [...receiptPostDto.items];
                              newItems[idx].batchNumber = val;
                              setReceiptPostDto({ ...receiptPostDto, items: newItems });
                            }}
                            className="w-full px-2 py-1 bg-slate-50 border border-gray-300 rounded-lg font-mono text-center"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newItems = [...receiptPostDto.items];
                              newItems[idx].expiryDate = val;
                              setReceiptPostDto({ ...receiptPostDto, items: newItems });
                            }}
                            className="w-full px-2 py-1 bg-slate-50 border border-gray-300 rounded-lg font-mono text-center"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.rejectionReason}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newItems = [...receiptPostDto.items];
                              newItems[idx].rejectionReason = val;
                              setReceiptPostDto({ ...receiptPostDto, items: newItems });
                            }}
                            className="w-full px-2 py-1 bg-slate-50 border border-gray-300 rounded-lg"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-white border-t flex justify-between items-center shrink-0">
              <button onClick={() => setShowInspectionModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl">إلغاء</button>
              <button
                disabled={isSaving}
                onClick={submitMaterialReceipt}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                <Check2Circle className="w-4 h-4" />
                <span>{isSaving ? 'جاري التسكين والترصيد...' : 'اعتماد الاستلام وتسكين المخزن'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
