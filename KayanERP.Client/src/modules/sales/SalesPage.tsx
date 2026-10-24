import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  PlusCircle,
  Printer,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  Trash2,
  Scale,
  Building2,
  User,
  CreditCard,
  X,
  FileText,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { useBranchContext } from '../../core/context/BranchContext';
import {
  fetchSalesInvoicesApi,
  fetchSalesLookupsApi,
  createSalesInvoiceApi,
  saveQuickCustomerApi,
} from './salesApi';
import type {
  SalesInvoiceViewDto,
  SalesLookupsDto,
  SalesInvoiceLineDto,
} from './salesApi';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const SalesPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { activeBranchId, activeBranchName } = useBranchContext();

  const [invoices, setInvoices] = useState<SalesInvoiceViewDto[]>([]);
  const [lookups, setLookups] = useState<SalesLookupsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // نافذة إصدار الفاتورة
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'CREDIT'>('CASH');
  const [invoiceLines, setInvoiceLines] = useState<SalesInvoiceLineDto[]>([
    { itemId: 0, quantity: 1, unitPrice: 0 },
  ]);

  // نافذة الطباعة والمعاينة
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoiceViewDto | null>(null);
  const [printFormat, setPrintFormat] = useState<'POS' | 'A4'>('POS');

  // نافذة إضافة عميل سريع
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState<boolean>(false);
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [newCustomerCode, setNewCustomerCode] = useState<string>('');
  const [isSavingCustomer, setIsSavingCustomer] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invData, lookupsData] = await Promise.all([
        fetchSalesInvoicesApi(),
        fetchSalesLookupsApi(),
      ]);
      setInvoices(invData);
      setLookups(lookupsData);
    } catch (err: any) {
      setErrorMessage(`تعذر جلب بيانات المبيعات: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentBranchId = useMemo(() => activeBranchId || 2, [activeBranchId]);

  const activeBranchWarehouse = useMemo(() => {
    if (!lookups?.warehouses.length) return null;
    const wh = lookups.warehouses.find((w) => w.branchId === currentBranchId);
    if (wh) return wh;
    return lookups.warehouses[0];
  }, [lookups, currentBranchId]);

  const activeWarehouseDisplayName = activeBranchWarehouse
    ? `${activeBranchWarehouse.warehouseName} (${activeBranchWarehouse.warehouseCode})`
    : 'المستودع الرئيسي للفرع (مقفل)';

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.branchId === currentBranchId || currentBranchId === 1);
  }, [invoices, currentBranchId]);

  const currentInvoiceTotal = useMemo(() => {
    return invoiceLines.reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0), 0);
  }, [invoiceLines]);

  const currentCustomerName = useMemo(() => {
    const c = lookups?.customers.find((x) => x.id === selectedCustomerId);
    return c ? c.customerName : 'العميل المحدد';
  }, [lookups, selectedCustomerId]);

  const openCreateModal = () => {
    setSelectedCustomerId(lookups?.customers[0]?.id || 0);
    setSelectedPaymentMethod('CASH');
    setInvoiceLines([{ itemId: 0, quantity: 1, unitPrice: 0 }]);
    setShowCreateModal(true);
    setErrorMessage(null);
  };

  const addLine = () => {
    setInvoiceLines((prev) => [...prev, { itemId: 0, quantity: 1, unitPrice: 0 }]);
  };

  const removeLine = (index: number) => {
    setInvoiceLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemSelected = (index: number, itemId: number) => {
    const item = lookups?.finishedItems.find((x) => x.id === itemId);
    setInvoiceLines((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        itemId,
        unitPrice: item ? item.sellingPrice : 0,
        itemName: item?.itemName,
        itemCode: item?.itemCode,
        unit: item?.unit,
      };
      return copy;
    });
  };

  const handleLineQtyChange = (index: number, qty: number) => {
    setInvoiceLines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: qty };
      return copy;
    });
  };

  const openQuickCustomerModal = () => {
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerCode(`CUST-${Date.now().toString().slice(-6)}`);
    setShowQuickCustomerModal(true);
  };

  const handleSaveQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    setIsSavingCustomer(true);
    try {
      const created = await saveQuickCustomerApi({
        customerName: newCustomerName,
        customerCode: newCustomerCode,
        phone: newCustomerPhone,
      });

      const updatedLookups = await fetchSalesLookupsApi();
      setLookups(updatedLookups);
      setSelectedCustomerId(created.id);
      setShowQuickCustomerModal(false);
    } catch (err: any) {
      alert(`فشل تسجيل العميل: ${err.message}`);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleSubmitInvoice = async () => {
    if (selectedCustomerId <= 0) {
      setErrorMessage('يجب اختيار العميل أولاً.');
      return;
    }

    const validLines = invoiceLines.filter((l) => l.itemId > 0 && l.quantity > 0 && l.unitPrice > 0);
    if (!validLines.length) {
      setErrorMessage('يجب اختيار صنف معتمد بكمية وسعر أكبر من صفر.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createSalesInvoiceApi({
        branchId: currentBranchId,
        warehouseId: activeBranchWarehouse?.id || 1,
        customerId: selectedCustomerId,
        paymentMethod: selectedPaymentMethod,
        invoiceLines: validLines,
      });

      setSuccessMessage(`تم إصدار وترحيل الفاتورة رقم (${created.invoiceNumber}) بنجاح!`);
      setShowCreateModal(false);
      await loadData();
      openPrintPreview(created);
    } catch (err: any) {
      setErrorMessage(`خطأ في الترحيل: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPrintPreview = (inv: SalesInvoiceViewDto) => {
    setSelectedInvoiceForPrint(inv);
    setPrintFormat('POS');
    setShowPrintModal(true);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. بانر سياق التشغيل المعزول للفرع */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xs border border-slate-800 flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs">
            سياق التشغيل المعزول
          </span>
          <span className="text-base font-black text-amber-400">
            📍 {activeBranchName}
          </span>
          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-xl text-xs font-semibold">
            الخزينة ومستودع الصرف مقفلان على هذا الفرع حصراً ✓
          </span>
        </div>
        <span className="text-xs text-slate-400 font-bold">
          نظام الرقابة المالية الصارم • كيان ERP
        </span>
      </div>

      {/* 2. رأس الصفحة وأزرار التحكم */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" />
            <span>إدارة فواتير المبيعات والترحيل المالي</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إصدار الفواتير مع الترحيل التلقائي للمخزون وشجرة الحسابات ومديونيات التجار
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>فاتورة مبيعات جديدة</span>
        </button>
      </div>

      {/* 3. تنبيهات ورسائل النظام */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
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

      {/* 4. جدول سجل الفواتير الصادرة */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-xs font-bold">
            سجل الفواتير الصادرة ({filteredInvoices.length} فاتورة)
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[10px] ms-2">
              خاصة بـ {activeBranchName}
            </span>
          </h2>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1 text-slate-300 hover:text-white text-xs font-semibold"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <RotateCw className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
              <p>جاري تحميل بيانات الفواتير والقيود...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-bold">
              لا توجد فواتير مبيعات مسجلة لهذا الفرع حتى الآن.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">رقم الفاتورة</th>
                  <th className="py-3 px-3">تاريخ الإصدار</th>
                  <th className="py-3 px-3">الفرع</th>
                  <th className="py-3 px-3 text-right">العميل / المنفذ</th>
                  <th className="py-3 px-3">عدد البنود</th>
                  <th className="py-3 px-3">إجمالي الفاتورة</th>
                  <th className="py-3 px-3">الأثر المالي والمخزني</th>
                  <th className="py-3 px-3" style={{ width: '140px' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {filteredInvoices.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-3 font-mono text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">{inv.invoiceDate}</td>
                    <td className="py-3 px-3">
                      <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                        {inv.branchName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">{inv.customerName}</td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono text-[11px]">
                        {inv.itemsCount} أصناف
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-emerald-600 text-sm">
                      {inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        مرحل مالياً ومخزنياً ✓
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => openPrintPreview(inv)}
                        className="px-2.5 py-1 text-slate-800 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto transition-colors"
                        title="معاينة وطباعة الفاتورة"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>طباعة / معاينة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 5. نافذة إصدار فاتورة مبيعات جديدة */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh] text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                <span>إصدار فاتورة مبيعات وترحيل الأثر المخزني والمالي</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              {/* بيانات الرأس */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">فرع الإصدار (مقفل)</label>
                  <input
                    type="text"
                    readOnly
                    value={activeBranchName}
                    className="w-full px-3 py-2 bg-slate-100 border border-indigo-200 rounded-xl font-bold text-gray-800 outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-700 font-bold mb-0">
                      العميل / التاجر المستلم <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={openQuickCustomerModal}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px]"
                    >
                      + عميل جديد
                    </button>
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value={0}>-- اختر العميل --</option>
                    {lookups?.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.customerCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">طريقة السداد والأثر المالي <span className="text-rose-500">*</span></label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as 'CASH' | 'CREDIT')}
                    className="w-full px-3 py-2 bg-white border border-emerald-400 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="CASH">💵 نقدي (خزينة الفرع)</option>
                    <option value="CREDIT">📋 آجل (حساب التاجر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">مستودع الصرف (مقفل آلياً)</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={activeWarehouseDisplayName}
                      className="w-full pl-8 pr-3 py-2 bg-slate-100 border border-gray-300 rounded-xl font-bold text-gray-700 outline-none truncate"
                    />
                    <Lock className="absolute left-2.5 w-3.5 h-3.5 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* بنود الفاتورة */}
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-indigo-600" />
                    <span>📦 بنود الفاتورة:</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صنف</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3 text-right" style={{ width: '45%' }}>المنتج التام</th>
                        <th className="py-2 px-3" style={{ width: '15%' }}>الكمية المباعة</th>
                        <th className="py-2 px-3" style={{ width: '20%' }}>سعر الوحدة (مقفل)</th>
                        <th className="py-2 px-3" style={{ width: '15%' }}>الإجمالي</th>
                        <th className="py-2 px-2" style={{ width: '5%' }}>حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoiceLines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-right">
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemSelected(idx, Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg font-bold text-gray-800 outline-none focus:border-indigo-600"
                            >
                              <option value={0}>-- اختر المنتج --</option>
                              {lookups?.finishedItems.map((itm) => (
                                <option key={itm.id} value={itm.id}>
                                  {itm.itemName} ({itm.itemCode})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={line.quantity}
                              onChange={(e) => handleLineQtyChange(idx, Number(e.target.value))}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-center font-bold font-mono outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                readOnly
                                value={`${line.unitPrice.toFixed(2)} ج.م`}
                                className="w-full pl-6 pr-2 py-1.5 bg-slate-100 border-0 text-center font-mono font-bold text-emerald-600 rounded-lg"
                              />
                              <Lock className="absolute left-2 w-3 h-3 text-gray-400" />
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                            {(line.quantity * line.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                          </td>
                          <td className="py-2 px-2">
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-gray-200">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-left">إجمالي الفاتورة:</td>
                        <td colSpan={2} className="py-2.5 px-3 text-center font-mono font-black text-emerald-600 text-sm">
                          {currentInvoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* معاينة القيد المحاسبي المزدوج الآلي */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 border-r-4 border-r-cyan-500 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <h4 className="font-bold text-cyan-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-cyan-600" />
                    <span>⚖️ معاينة القيد المحاسبي الآلي بالأستاذ العام:</span>
                  </h4>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    متزن 100% ✓
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs font-mono">
                    <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">طرف القيد</th>
                        <th className="py-2 px-3">كود الحساب</th>
                        <th className="py-2 px-3 text-right">اسم الحساب</th>
                        <th className="py-2 px-3">مدين (Debit)</th>
                        <th className="py-2 px-3">دائن (Credit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 px-3 font-bold text-emerald-600">من حـ/ (مدين)</td>
                        <td className="py-2 px-3">{selectedPaymentMethod === 'CASH' ? '1212' : '1221'}</td>
                        <td className="py-2 px-3 text-right font-bold text-gray-800">
                          {selectedPaymentMethod === 'CASH' ? `خزينة [${activeBranchName}]` : `ذمم العملاء [${currentCustomerName}]`}
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-600">{currentInvoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-gray-400">0.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-indigo-600">إلى حـ/ (دائن)</td>
                        <td className="py-2 px-3">41</td>
                        <td className="py-2 px-3 text-right font-bold text-gray-800">إيرادات مبيعات التوزيع والطلبيات</td>
                        <td className="py-2 px-3 text-gray-400">0.00</td>
                        <td className="py-2 px-3 font-bold text-indigo-600">{currentInvoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitInvoice}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الترحيل المالي والمخزني...' : 'اعتماد وترحيل الفاتورة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. نافذة معاينة وطباعة الفاتورة (POS / A4) */}
      {showPrintModal && selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh] ${
            printFormat === 'POS' ? 'w-full max-w-sm' : 'w-full max-w-3xl'
          }`}>
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">طباعة فاتورة: {selectedInvoiceForPrint.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 p-0.5 rounded-lg flex items-center text-[11px]">
                  <button
                    onClick={() => setPrintFormat('POS')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      printFormat === 'POS' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    إيصال كاشير (80mm)
                  </button>
                  <button
                    onClick={() => setPrintFormat('A4')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      printFormat === 'A4' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    رسمي (A4)
                  </button>
                </div>
                <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-white mr-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-white font-mono text-xs" id="invoice-printable-area">
              {printFormat === 'POS' ? (
                /* قالب إيصال الكاشير الحراري (POS Thermal Receipt) */
                <div className="text-center text-gray-900 max-w-[280px] mx-auto space-y-2">
                  <div className="text-lg font-black tracking-tight">حلويات أبو عادل (كيان)</div>
                  <div className="text-[11px] text-gray-500">KAYAN ENTERPRISE ERP</div>
                  <div className="text-xs font-bold border-b pb-2">فرع: {selectedInvoiceForPrint.branchName}</div>

                  <div className="text-right text-[11px] space-y-0.5 py-1">
                    <div><strong>رقم الفاتورة:</strong> {selectedInvoiceForPrint.invoiceNumber}</div>
                    <div><strong>التاريخ:</strong> {selectedInvoiceForPrint.invoiceDate}</div>
                    <div><strong>العميل:</strong> {selectedInvoiceForPrint.customerName}</div>
                  </div>

                  <table className="w-full text-right text-[11px] border-t border-b border-gray-300 py-1">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-1">الصنف</th>
                        <th className="py-1 text-center">الكمية</th>
                        <th className="py-1 text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedInvoiceForPrint.lines.map((line, idx) => (
                        <tr key={idx}>
                          <td className="py-1 max-w-[120px] truncate">{line.itemName}</td>
                          <td className="py-1 text-center">{line.quantity}</td>
                          <td className="py-1 text-left font-bold">{(line.lineTotal || (line.quantity * line.unitPrice)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-between font-black text-sm border-b pb-2 pt-1">
                    <span>الإجمالي النهائي:</span>
                    <span>{selectedInvoiceForPrint.totalAmount.toFixed(2)} ج.م</span>
                  </div>

                  <div className="text-[10px] text-gray-500 pt-1">فاتورة مبيعات إلكترونية معتمدة ✓</div>
                  <div className="text-[11px] font-bold text-gray-700">شكراً لزيارتكم!</div>
                </div>
              ) : (
                /* قالب الفاتورة الرسمية (A4) */
                <div className="space-y-4 border border-gray-300 p-5 rounded-xl">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h2 className="text-xl font-black text-indigo-700">مجموعة حلويات أبو عادل (كيان)</h2>
                      <p className="text-[11px] text-gray-500">سجل تجاري: 482910 | بطاقة ضريبية: 712-345-998</p>
                      <p className="text-xs font-bold text-gray-800 mt-1">فرع الإصدار: {selectedInvoiceForPrint.branchName}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-base font-black text-gray-900 block">فاتورة مبيعات ضريبية</span>
                      <span className="bg-slate-900 text-white font-mono px-3 py-1 rounded-md text-xs font-bold inline-block mt-1">
                        {selectedInvoiceForPrint.invoiceNumber}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><strong>تاريخ الفاتورة:</strong> {selectedInvoiceForPrint.invoiceDate}</div>
                    <div><strong>العميل / التاجر:</strong> {selectedInvoiceForPrint.customerName}</div>
                    <div><strong>حالة الترحيل:</strong> مرحل مالياً ومخزنياً بالأستاذ العام ✓</div>
                    <div><strong>المستودع المنصرف منه:</strong> {selectedInvoiceForPrint.warehouseName}</div>
                  </div>

                  <table className="w-full text-center text-xs border border-gray-200">
                    <thead className="bg-slate-100 text-gray-700 font-bold border-b">
                      <tr>
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">كود الصنف</th>
                        <th className="py-2 px-3 text-right">اسم المنتج التام</th>
                        <th className="py-2 px-2">الكمية المباعة</th>
                        <th className="py-2 px-2">سعر الوحدة</th>
                        <th className="py-2 px-3 text-left">الإجمالي (ج.م)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoiceForPrint.lines.map((l, i) => (
                        <tr key={i}>
                          <td className="py-2 px-2">{i + 1}</td>
                          <td className="py-2 px-2 font-mono">{l.itemCode}</td>
                          <td className="py-2 px-3 text-right font-bold text-gray-900">{l.itemName}</td>
                          <td className="py-2 px-2 font-mono">{l.quantity} {l.unit}</td>
                          <td className="py-2 px-2 font-mono">{l.unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 text-left font-mono font-bold text-indigo-700">
                            {(l.lineTotal || (l.quantity * l.unitPrice)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-gray-300">
                      <tr>
                        <td colSpan={5} className="py-2.5 px-3 text-left">الإجمالي الصافي للفاتورة:</td>
                        <td className="py-2.5 px-3 text-left font-mono font-black text-emerald-600 text-sm">
                          {selectedInvoiceForPrint.totalAmount.toFixed(2)} ج.م
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-gray-500 text-[11px]">
                    <div>المستلم: ................................</div>
                    <div>المحاسب المسؤول: {user?.fullName || 'المحاسب المالي'}</div>
                    <div>الختم والاعتماد: ................................</div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={triggerBrowserPrint}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. نافذة إضافة عميل جديد سريع (+) */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-bold">إضافة عميل / تاجر جديد للنظام</h4>
              <button onClick={() => setShowQuickCustomerModal(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickCustomer} className="p-5 space-y-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  اسم العميل / المنفذ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: هايبر ماركت البركة"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">كود العميل (تلقائي)</label>
                <input
                  type="text"
                  readOnly
                  value={newCustomerCode}
                  className="w-full px-3 py-2 bg-slate-100 border border-gray-200 rounded-xl font-mono text-gray-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">رقم الهاتف / الموبايل</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono outline-none focus:border-indigo-600 text-left"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isSavingCustomer ? 'جاري الحفظ...' : 'حفظ وتعيين العميل فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
