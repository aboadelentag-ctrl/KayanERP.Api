import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  PlusCircle,
  Search,
  CheckCircle2,
  Calendar,
  Truck,
  Building2,
  Trash2,
  Check2Circle
} from 'lucide-react';
import {
  fetchPurchaseInvoicesApi,
  fetchPurchaseInvoiceLookupsApi,
  savePurchaseInvoiceApi
} from './purchaseInvoicesApi';
import type {
  PurchaseInvoiceDto,
  PurchaseInvoiceLookupsDto,
  PurchaseInvoiceItemDto
} from './purchaseInvoicesApi';

interface PurchaseInvoicesPageProps {
  onNavigate?: (tab: string) => void;
}

export const PurchaseInvoicesPage: React.FC<PurchaseInvoicesPageProps> = () => {
  const [invoices, setInvoices] = useState<PurchaseInvoiceDto[]>([]);
  const [lookups, setLookups] = useState<PurchaseInvoiceLookupsDto>({
    suppliers: [],
    warehouses: [],
    rawMaterials: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`PINV-2026-00${Date.now().toString().slice(-2)}`);
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
  const [paymentTerm, setPaymentTerm] = useState<'نقدي' | 'آجل' | 'شيك'>('آجل');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('');
  const [invoiceItems, setInvoiceItems] = useState<PurchaseInvoiceItemDto[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invData, lookupsData] = await Promise.all([
        fetchPurchaseInvoicesApi(),
        fetchPurchaseInvoiceLookupsApi()
      ]);
      setInvoices(invData);
      setLookups(lookupsData);
      if (lookupsData.suppliers.length > 0) setSelectedSupplierId(lookupsData.suppliers[0].id);
      if (lookupsData.warehouses.length > 0) setSelectedWarehouseId(lookupsData.warehouses[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        !searchTerm.trim() ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplierInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplierName.includes(searchTerm);
      const matchStatus = !statusFilter || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const totalPurchases = useMemo(() => invoices.reduce((sum, i) => sum + i.grandTotal, 0), [invoices]);

  const addItemToInvoice = (materialId: number) => {
    const mat = lookups.rawMaterials.find(m => m.id === materialId);
    if (!mat) return;
    const existing = invoiceItems.find(i => i.itemId === mat.id);
    if (existing) {
      setInvoiceItems(items =>
        items.map(item =>
          item.itemId === mat.id
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item
        )
      );
    } else {
      setInvoiceItems(items => [
        ...items,
        {
          itemId: mat.id,
          itemCode: mat.code,
          itemName: mat.name,
          unit: mat.unit,
          quantity: 1,
          unitPrice: mat.defaultPrice,
          totalPrice: mat.defaultPrice,
          taxAmount: 0
        }
      ]);
    }
  };

  const removeItem = (index: number) => {
    setInvoiceItems(items => items.filter((_, idx) => idx !== index));
  };

  const subTotalCalc = useMemo(() => invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0), [invoiceItems]);
  const grandTotalCalc = useMemo(() => subTotalCalc, [subTotalCalc]);

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceItems.length === 0) return;

    const supplier = lookups.suppliers.find(s => s.id === selectedSupplierId);
    const warehouse = lookups.warehouses.find(w => w.id === selectedWarehouseId);

    const newInvoice: PurchaseInvoiceDto = {
      id: Date.now(),
      invoiceNumber,
      supplierInvoiceNumber: supplierInvoiceNumber || 'INV-DIR',
      supplierId: selectedSupplierId,
      supplierName: supplier?.name || '',
      invoiceDate,
      paymentTerm,
      warehouseId: selectedWarehouseId,
      warehouseName: warehouse?.name || '',
      subTotal: subTotalCalc,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: grandTotalCalc,
      status: 'معتمد ومرحل',
      notes,
      items: invoiceItems
    };

    await savePurchaseInvoiceApi(newInvoice);
    setInvoices(prev => [newInvoice, ...prev]);
    setIsModalOpen(false);
    setInvoiceItems([]);
    setNotes('');
    setStatusMessage(`تم ترحيل فاتورة الشراء (${newInvoice.invoiceNumber}) إلى الحسابات والمخازن بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-400" />
              <span>فواتير المشتريات وتوريد الخامات (Purchase Invoices)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">إثبات المديونية والمخزون</span>
          </div>
          <p className="text-xs text-slate-400">
            قيد فواتير الموردين، تسكين الكميات في المستودع المختار، وإثبات قيود المديونية في الخزينة والأستاذ العام آلياً.
          </p>
        </div>

        <button
          onClick={() => {
            setInvoiceNumber(`PINV-2026-00${Date.now().toString().slice(-2)}`);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>قيد فاتورة شراء جديدة</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي عدد الفواتير المسجلة</span>
          <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">{invoices.length} <span className="text-xs font-normal text-gray-500">فاتورة</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي المشتريات المعتمدة</span>
          <h4 className="text-2xl font-black text-emerald-700 font-mono mt-1">{totalPurchases.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">فواتير شراء تحت الاعتماد (مسودة)</span>
          <h4 className="text-2xl font-black text-amber-600 font-mono mt-1">{invoices.filter(i => i.status === 'مسودة').length}</h4>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم الفاتورة، فاتورة المورد، اسم المورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة الحالات --</option>
          <option value="معتمد ومرحل">معتمد ومرحل</option>
          <option value="مسودة">مسودة</option>
        </select>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-bold">جاري تحميل فواتير المشتريات...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold">لا توجد فواتير مطابقة للبحث.</div>
        ) : (
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-3">رقم الفاتورة</th>
                <th className="py-3 px-3">رقم فاتورة المورد</th>
                <th className="py-3 px-3 text-right">المورد</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">مستودع التسكين</th>
                <th className="py-3 px-3">طريقة الدفع</th>
                <th className="py-3 px-3">الإجمالي النهائي</th>
                <th className="py-3 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{inv.invoiceNumber}</td>
                  <td className="py-3 px-3 font-mono text-gray-600">{inv.supplierInvoiceNumber}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 flex items-center justify-end gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                    <span>{inv.supplierName}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-500">{inv.invoiceDate}</td>
                  <td className="py-3 px-3 font-medium text-gray-700">{inv.warehouseName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded font-semibold text-gray-700">{inv.paymentTerm}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-emerald-700">{inv.grandTotal.toLocaleString()} ج.م</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        inv.status === 'معتمد ومرحل'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نافذة قيد فاتورة جديدة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>قيد فاتورة شراء خامات ومستلزمات جديدة</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white font-bold text-base">×</button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">المورد *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    {lookups.suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">مستودع التسكين *</label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    {lookups.warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">رقم فاتورة المورد</label>
                  <input
                    type="text"
                    placeholder="مثال: INV-7721"
                    value={supplierInvoiceNumber}
                    onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* إضافة أصناف */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <label className="block text-gray-700 font-bold mb-2">إضافة خامة / مستلزم من الدليل:</label>
                <div className="flex gap-2">
                  <select
                    id="selectMaterial"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    {lookups.rawMaterials.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.code}) - {m.defaultPrice} ج.م/{m.unit}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('selectMaterial') as HTMLSelectElement;
                      if (el) addItemToInvoice(Number(el.value));
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                  >
                    + إضافة للفاتورة
                  </button>
                </div>

                {/* جدول بنود الفاتورة */}
                {invoiceItems.length > 0 && (
                  <div className="mt-4 border rounded-xl overflow-hidden">
                    <table className="w-full text-center">
                      <thead className="bg-slate-100 text-gray-700">
                        <tr>
                          <th className="py-2 px-3 text-right">الصنف</th>
                          <th className="py-2 px-3">الكمية</th>
                          <th className="py-2 px-3">سعر الوحدة</th>
                          <th className="py-2 px-3">الإجمالي</th>
                          <th className="py-2 px-3">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoiceItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 text-right font-bold">{item.itemName}</td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const q = Number(e.target.value);
                                  setInvoiceItems(items =>
                                    items.map((it, i) =>
                                      i === idx ? { ...it, quantity: q, totalPrice: q * it.unitPrice } : it
                                    )
                                  );
                                }}
                                className="w-20 px-2 py-1 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono font-bold"
                              /> {item.unit}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min={1}
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const p = Number(e.target.value);
                                  setInvoiceItems(items =>
                                    items.map((it, i) =>
                                      i === idx ? { ...it, unitPrice: p, totalPrice: it.quantity * p } : it
                                    )
                                  );
                                }}
                                className="w-24 px-2 py-1 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono font-bold text-blue-700"
                              /> ج.م
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-700">{item.totalPrice.toLocaleString()} ج.م</td>
                            <td className="py-2 px-3">
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="text-rose-600 hover:text-rose-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
                <span className="font-bold text-gray-700">إجمالي قيمة الفاتورة:</span>
                <span className="text-xl font-black text-emerald-700 font-mono">{grandTotalCalc.toLocaleString()} ج.م</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={invoiceItems.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  <Check2Circle className="w-4 h-4" />
                  <span>اعتماد وترحيل الفاتورة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
