import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  PlusCircle,
  RotateCw,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Warehouse,
  Eye,
  CheckCheck,
  Plus,
  Trash2,
  Calendar,
  X,
  ShieldCheck,
  BadgePercent,
  Receipt
} from 'lucide-react';
import {
  fetchPurchaseOrdersApi,
  fetchPoLookupsApi,
  createPurchaseOrderApi,
  approvePurchaseOrderApi,
} from './purchasingApi';
import type {
  PurchaseOrderDto,
  PurchaseOrderLookupsDto,
  PurchaseOrderCreateDto,
  PurchaseOrderCreateLineDto,
  PoApproveDto,
} from './purchasingApi';

export const PurchasingPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
  const [lookups, setLookups] = useState<PurchaseOrderLookupsDto>({
    suppliers: [],
    warehouses: [],
    items: [],
  });

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // النوافذ المنبثقة
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderDto | null>(null);
  const [newOrder, setNewOrder] = useState<PurchaseOrderCreateDto>({
    supplierId: 0,
    warehouseId: 0,
    orderDate: new Date().toISOString().slice(0, 10),
    lines: [],
  });
  const [approveModel, setApproveModel] = useState<PoApproveDto | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [ordersData, lookupsData] = await Promise.all([
        fetchPurchaseOrdersApi(),
        fetchPoLookupsApi(),
      ]);
      setOrders(ordersData);
      setLookups(lookupsData);
    } catch (err: any) {
      setErrorMessage(`تعذر جلب أوامر الشراء: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // حساب مؤشرات الـ KPIs
  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'Pending_Procurement').length,
    [orders]
  );
  const approvedCount = useMemo(
    () => orders.filter((o) => o.status === 'Approved' || o.status === 'Partially_Received').length,
    [orders]
  );
  const totalValue = useMemo(
    () => orders.reduce((sum, o) => sum + o.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0), 0),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (selectedStatus && o.status !== selectedStatus) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchNum = o.orderNumber.toLowerCase().includes(term);
        const matchSup = o.supplierName.toLowerCase().includes(term);
        if (!matchNum && !matchSup) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchTerm]);

  // إدارة إنشاء أمر شراء جديد
  const openCreateModal = () => {
    setNewOrder({
      supplierId: lookups.suppliers[0]?.id || 0,
      warehouseId: lookups.warehouses[0]?.id || 0,
      orderDate: new Date().toISOString().slice(0, 10),
      lines: [
        {
          itemId: lookups.items[0]?.id || 0,
          quantity: 100,
          unitPrice: lookups.items[0]?.basePrice || 0,
          notes: '',
        },
      ],
    });
    setModalError(null);
    setShowCreateModal(true);
  };

  const addNewLine = () => {
    const defaultItem = lookups.items[0];
    setNewOrder((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          itemId: defaultItem ? defaultItem.id : 0,
          quantity: 10,
          unitPrice: defaultItem ? defaultItem.basePrice : 0,
          notes: '',
        },
      ],
    }));
  };

  const removeLine = (idx: number) => {
    setNewOrder((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  const handleItemChanged = (idx: number, itemId: number) => {
    const item = lookups.items.find((i) => i.id === itemId);
    setNewOrder((prev) => {
      const copy = [...prev.lines];
      copy[idx] = {
        ...copy[idx],
        itemId,
        unitPrice: item ? item.basePrice : 0,
      };
      return { ...prev, lines: copy };
    });
  };

  const handleSaveOrder = async () => {
    if (newOrder.supplierId <= 0 || newOrder.warehouseId <= 0) {
      setModalError('يرجى تحديد المورد ومستودع الاستلام.');
      return;
    }
    if (!newOrder.lines.length || newOrder.lines.some((l) => l.itemId <= 0 || l.quantity <= 0)) {
      setModalError('يجب إضافة صنف واحد على الأقل بكمية صالحة.');
      return;
    }

    setIsSaving(true);
    setModalError(null);
    try {
      await createPurchaseOrderApi(newOrder);
      setStatusMessage('تم إنشاء أمر الشراء بنجاح وهو الآن قيد المراجعة والاعتماد.');
      setShowCreateModal(false);
      await loadData();
    } catch (err: any) {
      setModalError(`خطأ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // فتح نافذة التفاصيل
  const openDetailsModal = (order: PurchaseOrderDto) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // فتح نافذة الاعتماد
  const openApproveModal = (order: PurchaseOrderDto) => {
    setApproveModel({
      orderId: order.id,
      status: 'Approved',
      lines: order.lines.map((l) => ({
        lineId: l.id,
        itemId: l.itemId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        notes: l.notes || '',
      })),
    });
    setShowApproveModal(true);
  };

  const submitApproval = async () => {
    if (!approveModel) return;
    setIsSaving(true);
    try {
      await approvePurchaseOrderApi(approveModel);
      setStatusMessage('تم اعتماد أمر الشراء والفاتورة بنجاح، وتم ترحيله لمحطة فحص الجودة والاستلام المخزني.');
      setShowApproveModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMessage(`خطأ في الاعتماد: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // تصدير إكسيل
  const handleExportCsv = () => {
    if (!filteredOrders.length) return;

    try {
      const headers = ['رقم_الأمر', 'التاريخ', 'المورد', 'عدد_البنود', 'القيمة_الإجمالية_ج.م', 'الحالة'];
      const rows = filteredOrders.map((o) => {
        const total = o.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
        return [
          `"${o.orderNumber}"`,
          `"${o.orderDate}"`,
          `"${o.supplierName}"`,
          o.lines.length,
          total.toFixed(2),
          `"${getStatusLabel(o.status)}"`,
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `أوامر_وفواتير_الشراء_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage('تم تصدير أوامر الشراء إلى إكسيل بنجاح.');
    } catch (err: any) {
      setErrorMessage(`فشل التصدير: ${err.message}`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending_Procurement':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Partially_Received':
        return 'bg-cyan-50 text-cyan-800 border border-cyan-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending_Procurement': return 'قيد الاعتماد ⏳';
      case 'Approved': return 'معتمد للتوريد ✅';
      case 'Partially_Received': return 'توريد جزئي 🚚';
      case 'Closed': return 'مكتمل ومغلق 🔒';
      case 'Rejected': return 'مرفوض فني ❌';
      default: return status;
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            <span>أوامر وفواتير الشراء والتوريد</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إصدار أوامر الشراء، اعتماد فواتير الموردين، وتجهيز الشحنات للفحص المخزني (GMP)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {orders.length > 0 && (
            <button
              onClick={handleExportCsv}
              disabled={isLoading || !filteredOrders.length}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير (Excel)</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>أمر شراء جديد</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            title="تحديث"
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

      {/* 3. بطاقات المؤشرات اللحظية (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي أوامر الشراء</span>
          <span className="text-2xl font-black font-mono text-gray-900 mt-1 block">
            {orders.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">قيد المراجعة والاعتماد</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
            {pendingCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">فواتير معتمدة للتوريد</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">
            {approvedCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-cyan-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي القيمة المالية للمشتريات</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-cyan-800">
              {totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-bold text-gray-500">ج.م</span>
          </div>
        </div>
      </div>

      {/* 4. فلاتر العرض والبحث */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-7">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedStatus(null)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedStatus === null
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({orders.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('Pending_Procurement')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedStatus === 'Pending_Procurement'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                قيد الاعتماد ⏳ ({pendingCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('Approved')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedStatus === 'Approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                معتمد للتوريد ✅
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('Partially_Received')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedStatus === 'Partially_Received'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                توريد جزئي 🚚
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('Closed')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedStatus === 'Closed'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                مكتمل ومغلق 🔒
              </button>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث برقم الأمر، اسم المورد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. جدول أوامر وفواتير الشراء */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <RotateCw className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
              <p>جاري تحميل أوامر الشراء...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-bold">
              لا توجد فواتير أو أوامر شراء مطابقة للبحث.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                <tr>
                  <th className="py-3 px-3">رقم الأمر / الفاتورة</th>
                  <th className="py-3 px-3">التاريخ</th>
                  <th className="py-3 px-3 text-right">المورد</th>
                  <th className="py-3 px-3">عدد البنود</th>
                  <th className="py-3 px-3">إجمالي القيمة التقديرية</th>
                  <th className="py-3 px-3">الحالة الرقابية</th>
                  <th className="py-3 px-3" style={{ width: '160px' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {filteredOrders.map((o) => {
                  const orderTotal = o.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">{o.orderNumber}</td>
                      <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">{o.orderDate}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{o.supplierName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                          {o.lines.length} أصناف
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-gray-900 text-sm">
                        {orderTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} <small className="text-[10px] text-gray-500 font-normal">ج.م</small>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(o.status)}`}>
                          {getStatusLabel(o.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openDetailsModal(o)}
                            className="px-2.5 py-1 text-cyan-800 hover:bg-cyan-50 border border-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-600" />
                            <span>التفاصيل</span>
                          </button>

                          {o.status === 'Pending_Procurement' && (
                            <button
                              onClick={() => openApproveModal(o)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                              title="اعتماد الفاتورة والأسعار"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>اعتماد</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 6. Modal 1: إنشاء أمر شراء جديد */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh] text-xs">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-300" />
                <span>إنشاء أمر شراء وتوريد خامات</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    المورد المعتمد <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newOrder.supplierId}
                    onChange={(e) => setNewOrder({ ...newOrder, supplierId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value={0}>-- اختر المورد --</option>
                    {lookups.suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName} ({s.supplierCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    مستودع الاستلام المستهدف <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newOrder.warehouseId}
                    onChange={(e) => setNewOrder({ ...newOrder, warehouseId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value={0}>-- اختر المستودع --</option>
                    {lookups.warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">تاريخ إصدار الطلب</label>
                  <input
                    type="date"
                    value={newOrder.orderDate}
                    onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* بنود أمر الشراء */}
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <h4 className="font-bold text-gray-800">📋 بنود الخامات ومواد التعبئة المطلوبة</h4>
                  <button
                    type="button"
                    onClick={addNewLine}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند خامة</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-center text-xs">
                    <thead className="bg-slate-50 text-gray-700 font-bold border-b">
                      <tr>
                        <th className="py-2.5 px-3 text-right" style={{ width: '45%' }}>الصنف / الخامة</th>
                        <th className="py-2.5 px-3" style={{ width: '20%' }}>الكمية المطلوبة</th>
                        <th className="py-2.5 px-3" style={{ width: '20%' }}>سعر الوحدة التقديري</th>
                        <th className="py-2.5 px-3" style={{ width: '15%' }}>الإجمالي</th>
                        <th className="py-2.5 px-2" style={{ width: '5%' }}>إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {newOrder.lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-right">
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemChanged(idx, Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-lg font-bold text-gray-800 outline-none focus:border-indigo-600"
                            >
                              <option value={0}>-- اختر الصنف --</option>
                              {lookups.items.map((itm) => (
                                <option key={itm.id} value={itm.id}>
                                  {itm.itemName} ({itm.itemCode}) - [{itm.categoryName}]
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.5"
                              min="0.1"
                              value={line.quantity}
                              onChange={(e) => {
                                const copy = [...newOrder.lines];
                                copy[idx].quantity = Number(e.target.value);
                                setNewOrder({ ...newOrder, lines: copy });
                              }}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono font-bold text-indigo-700 outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={line.unitPrice}
                              onChange={(e) => {
                                const copy = [...newOrder.lines];
                                copy[idx].unitPrice = Number(e.target.value);
                                setNewOrder({ ...newOrder, lines: copy });
                              }}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-600">
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
                  </table>
                </div>

                <div className="flex justify-end pt-3">
                  <div className="bg-slate-100 px-4 py-2 rounded-xl text-left border border-gray-200">
                    <span className="text-gray-500 font-bold ml-2">الإجمالي الكلي التقديري:</span>
                    <strong className="text-base font-black font-mono text-indigo-700">
                      {newOrder.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveOrder}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'جاري الحفظ...' : '💾 حفظ وإصدار أمر الشراء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal 2: عرض تفاصيل أمر الشراء */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>تفاصيل أمر الشراء: {selectedOrder.orderNumber}</span>
              </h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-gray-200 font-medium">
                <div><strong>المورد:</strong> {selectedOrder.supplierName}</div>
                <div><strong>التاريخ:</strong> {selectedOrder.orderDate}</div>
                <div>
                  <strong>الحالة:</strong>{' '}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-50 text-gray-700 font-bold border-b">
                    <tr>
                      <th className="py-2.5 px-3 text-right">الصنف</th>
                      <th className="py-2.5 px-3">الكمية المطلوبة</th>
                      <th className="py-2.5 px-3">سعر الوحدة</th>
                      <th className="py-2.5 px-3">المستلم مخزنياً</th>
                      <th className="py-2.5 px-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.lines.map((l, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          <div>{l.itemName}</div>
                          <span className="font-mono text-gray-400 text-[10px]">{l.itemCode}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">{l.quantity} {l.unit}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-700">{l.unitPrice.toFixed(2)} ج.م</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                          {l.receivedQuantity > 0 ? `${l.receivedQuantity} ${l.unit}` : '---'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                          {(l.quantity * l.unitPrice).toFixed(2)} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal 3: اعتماد أمر الشراء والفاتورة */}
      {showApproveModal && approveModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] text-xs">
            <div className="px-5 py-3 bg-emerald-600 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-amber-300" />
                <span>اعتماد الفاتورة وتثبيت أسعار التوريد النهائية</span>
              </h3>
              <button onClick={() => setShowApproveModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-800 font-medium">
                مراجعة الأسعار المعتمدة مع المورد لترحيل أمر الشراء مباشرة إلى محطة <strong>فحص الجودة واستلام الخامات (GMP)</strong>:
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-50 text-gray-700 font-bold border-b">
                    <tr>
                      <th className="py-2.5 px-3 text-right">الصنف</th>
                      <th className="py-2.5 px-3" style={{ width: '25%' }}>الكمية المعتمدة</th>
                      <th className="py-2.5 px-3" style={{ width: '25%' }}>سعر الوحدة النهائي</th>
                      <th className="py-2.5 px-3" style={{ width: '30%' }}>ملاحظات الاعتماد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {approveModel.lines.map((line, idx) => {
                      const item = lookups.items.find((i) => i.id === line.itemId);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-right font-bold text-gray-900">
                            {item?.itemName || `صنف ${line.itemId}`}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.5"
                              value={line.quantity}
                              onChange={(e) => {
                                const copy = [...approveModel.lines];
                                copy[idx].quantity = Number(e.target.value);
                                setApproveModel({ ...approveModel, lines: copy });
                              }}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono font-bold"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.1"
                              value={line.unitPrice}
                              onChange={(e) => {
                                const copy = [...approveModel.lines];
                                copy[idx].unitPrice = Number(e.target.value);
                                setApproveModel({ ...approveModel, lines: copy });
                              }}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-emerald-400 rounded-lg text-center font-mono font-bold text-emerald-600"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="ملاحظة أو اتفاق خاص..."
                              value={line.notes || ''}
                              onChange={(e) => {
                                const copy = [...approveModel.lines];
                                copy[idx].notes = e.target.value;
                                setApproveModel({ ...approveModel, lines: copy });
                              }}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-[11px]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={submitApproval}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                ✓ تأكيد الاعتماد وترحيل الأمر لمحطة الاستلام
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
