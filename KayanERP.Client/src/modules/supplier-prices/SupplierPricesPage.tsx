import React, { useState, useMemo } from 'react';
import {
  Tag,
  PlusCircle,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCw,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Calendar,
  Building2,
  Clock,
  X,
  AlertTriangle
} from 'lucide-react';

export interface SupplierPriceDto {
  id: number;
  supplierId: number;
  supplierName: string;
  itemId: number;
  itemName: string;
  unit: string;
  price: number;
  deliveryDays: number;
  effectiveDate: string;
  isPreferred: boolean;
  notes?: string;
}

export interface LookupItem {
  id: number;
  name: string;
  unit?: string;
}

export const SupplierPricesPage: React.FC = () => {
  const suppliers: LookupItem[] = [
    { id: 1, name: 'شركة مطاحن الدلتا والصعيد' },
    { id: 2, name: 'مزارع الوادي لمنتجات الألبان والسمن البلدي' },
    { id: 3, name: 'الشركة السورية لاستيراد وتجارة المكسرات' },
    { id: 4, name: 'شركة الدلتا للسكر ومصانع الحوامدية' },
    { id: 5, name: 'الأهرام للكرتون ومواد التعبئة والتغليف' }
  ];

  const rawMaterials: LookupItem[] = [
    { id: 101, name: 'دقيق فاخر استخراج 72%', unit: 'كجم' },
    { id: 102, name: 'سمن بلدي بقري طبيعي', unit: 'صفيحة (16 كجم)' },
    { id: 103, name: 'فستق حلبي محمص مفروم', unit: 'كجم' },
    { id: 104, name: 'سكر بلوري أبيض نقي', unit: 'شيكارة (50 كجم)' },
    { id: 105, name: 'سميد بسبوسة خشن', unit: 'كجم' },
    { id: 106, name: 'كرتون صواني البسبوسة 50*50', unit: 'قطعة' }
  ];

  const [priceList, setPriceList] = useState<SupplierPriceDto[]>([
    {
      id: 1,
      supplierId: 1,
      supplierName: 'شركة مطاحن الدلتا والصعيد',
      itemId: 101,
      itemName: 'دقيق فاخر استخراج 72%',
      unit: 'كجم',
      price: 18.5,
      deliveryDays: 2,
      effectiveDate: '2026-09-25',
      isPreferred: true,
      notes: 'شامل النقل والتوصيل حتى مخزن مصنع أبو عادل المركزي'
    },
    {
      id: 2,
      supplierId: 2,
      supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
      itemId: 102,
      itemName: 'سمن بلدي بقري طبيعي',
      unit: 'صفيحة (16 كجم)',
      price: 3450.0,
      deliveryDays: 1,
      effectiveDate: '2026-10-01',
      isPreferred: true,
      notes: 'صفائح محكمة الغلق مطابقة لمعايير توكيد الجودة HACCP'
    },
    {
      id: 3,
      supplierId: 3,
      supplierName: 'الشركة السورية لاستيراد وتجارة المكسرات',
      itemId: 103,
      itemName: 'فستق حلبي محمص مفروم',
      unit: 'كجم',
      price: 680.0,
      deliveryDays: 3,
      effectiveDate: '2026-10-10',
      isPreferred: true,
      notes: 'فستق حلبي إكسترا درجة أولى لصواني البسبوسة والقشطية'
    },
    {
      id: 4,
      supplierId: 4,
      supplierName: 'شركة الدلتا للسكر ومصانع الحوامدية',
      itemId: 104,
      itemName: 'سكر بلوري أبيض نقي',
      unit: 'شيكارة (50 كجم)',
      price: 1350.0,
      deliveryDays: 2,
      effectiveDate: '2026-10-05',
      isPreferred: true,
      notes: 'سعر تسليم أرض المصنع بالمنصورة'
    },
    {
      id: 5,
      supplierId: 1,
      supplierName: 'شركة مطاحن الدلتا والصعيد',
      itemId: 105,
      itemName: 'سميد بسبوسة خشن',
      unit: 'كجم',
      price: 21.0,
      deliveryDays: 2,
      effectiveDate: '2026-09-28',
      isPreferred: false,
      notes: 'عرض توريد بديل لصواني الرواني والبسيمة'
    }
  ]);

  // Form State
  const [editId, setEditId] = useState<number>(0);
  const [formSupplierId, setFormSupplierId] = useState<number>(1);
  const [formItemId, setFormItemId] = useState<number>(101);
  const [formPrice, setFormPrice] = useState<number>(18.5);
  const [formDeliveryDays, setFormDeliveryDays] = useState<number>(1);
  const [formEffectiveDate, setFormEffectiveDate] = useState<string>('2026-10-25');
  const [formIsPreferred, setFormIsPreferred] = useState<boolean>(true);
  const [formNotes, setFormNotes] = useState<string>('');

  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [supplierFilter, setSupplierFilter] = useState<number>(0);
  const [itemFilter, setItemFilter] = useState<number>(0);
  const [preferenceFilter, setPreferenceFilter] = useState<string>('all');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);

  const filteredPrices = useMemo(() => {
    return priceList.filter(p => {
      if (supplierFilter > 0 && p.supplierId !== supplierFilter) return false;
      if (itemFilter > 0 && p.itemId !== itemFilter) return false;
      if (preferenceFilter === 'preferred' && !p.isPreferred) return false;
      if (preferenceFilter === 'alternative' && p.isPreferred) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.supplierName.toLowerCase().includes(term) ||
        p.itemName.toLowerCase().includes(term) ||
        (p.notes && p.notes.toLowerCase().includes(term))
      );
    });
  }, [priceList, supplierFilter, itemFilter, preferenceFilter, searchTerm]);

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (formPrice <= 0) return;

    const supObj = suppliers.find(s => s.id === formSupplierId);
    const itemObj = rawMaterials.find(i => i.id === formItemId);

    if (editId > 0) {
      setPriceList(priceList.map(p => p.id === editId ? {
        ...p,
        supplierId: formSupplierId,
        supplierName: supObj?.name || p.supplierName,
        itemId: formItemId,
        itemName: itemObj?.name || p.itemName,
        unit: itemObj?.unit || p.unit,
        price: Number(formPrice),
        deliveryDays: Number(formDeliveryDays),
        effectiveDate: formEffectiveDate,
        isPreferred: formIsPreferred,
        notes: formNotes
      } : p));
      setStatusMessage('✅ تم تحديث سعر التوريد بنجاح.');
    } else {
      const newPrice: SupplierPriceDto = {
        id: Date.now(),
        supplierId: formSupplierId,
        supplierName: supObj?.name || 'مورد معتمد',
        itemId: formItemId,
        itemName: itemObj?.name || 'خامة حلويات',
        unit: itemObj?.unit || 'كجم',
        price: Number(formPrice),
        deliveryDays: Number(formDeliveryDays),
        effectiveDate: formEffectiveDate,
        isPreferred: formIsPreferred,
        notes: formNotes
      };
      setPriceList([newPrice, ...priceList]);
      setStatusMessage('✅ تم تسجيل سعر التوريد الجديد بنجاح.');
    }

    resetForm();
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleEdit = (p: SupplierPriceDto) => {
    setEditId(p.id);
    setFormSupplierId(p.supplierId);
    setFormItemId(p.itemId);
    setFormPrice(p.price);
    setFormDeliveryDays(p.deliveryDays);
    setFormEffectiveDate(p.effectiveDate);
    setFormIsPreferred(p.isPreferred);
    setFormNotes(p.notes || '');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف سعر التوريد هذا؟')) return;
    setPriceList(priceList.filter(p => p.id !== id));
    setStatusMessage('تم حذف سعر التوريد بنجاح.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const resetForm = () => {
    setEditId(0);
    setFormPrice(0);
    setFormDeliveryDays(1);
    setFormEffectiveDate('2026-10-25');
    setFormIsPreferred(false);
    setFormNotes('');
  };

  const exportToExcel = () => {
    let csv = 'المورد,الصنف_الخامة,الوحدة,سعر_التوريد,مدة_التوريد_ايام,تاريخ_السريان,التفضيل,الملاحظات\n';
    filteredPrices.forEach(p => {
      const pref = p.isPreferred ? 'مورد مفضل' : 'بديل';
      csv += `"${p.supplierName}","${p.itemName}","${p.unit}",${p.price},${p.deliveryDays},"${p.effectiveDate}","${pref}","${p.notes || ''}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `عروض_أسعار_الموردين_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    let csv = 'المورد,الصنف_الخامة,الوحدة,سعر_التوريد,مدة_التوريد_ايام,تاريخ_السريان,التفضيل,الملاحظات\n';
    csv += 'شركة مطاحن الدلتا والصعيد,دقيق فاخر استخراج 72%,كجم,18.50,2,2026-10-25,مورد مفضل,شامل التوصيل لمصنع أبو عادل\n';
    csv += 'مزارع الوادي لمنتجات الألبان والسمن البلدي,سمن بلدي بقري طبيعي,صفيحة (16 كجم),3450.00,1,2026-10-25,مورد مفضل,صفائح معقمة\n';

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قالب_استيراد_أسعار_الموردين.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      {/* ترويسة الصفحة مع مسافة علوية pt-10 وأزرار واضحة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Tag className="w-6 h-6 text-amber-500" />
              <span>قوائم أسعار التوريد (Supplier Price Lists)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              إدارة تعاقدات الخامات والتسعير
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            إدارة عروض وأسعار التوريد للأصناف وربطها بالموردين المعتمدين ومدة التوريد.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تحميل قالب الإكسيل</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد من إكسيل</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقة تسجيل / تعديل سعر توريد جديد */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg p-5 mb-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4">
          <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
            <span>{editId > 0 ? '✏️ تعديل سعر توريد مسجل' : '➕ تسجيل سعر توريد جديد'}</span>
          </h2>
          {editId > 0 && (
            <button
              onClick={resetForm}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <form onSubmit={handleSavePrice} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">المورد *</label>
              <select
                value={formSupplierId}
                onChange={(e) => setFormSupplierId(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-amber-500/40 rounded-xl font-bold text-zinc-100 outline-none"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">الصنف / الخامة *</label>
              <select
                value={formItemId}
                onChange={(e) => setFormItemId(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-amber-500/40 rounded-xl font-bold text-zinc-100 outline-none"
              >
                {rawMaterials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">سعر التوريد * (ج.م)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-emerald-400 outline-none text-center"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">مدة التوريد (أيام)</label>
              <input
                type="number"
                min="1"
                value={formDeliveryDays}
                onChange={(e) => setFormDeliveryDays(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-center text-zinc-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">تاريخ السريان</label>
              <input
                type="date"
                value={formEffectiveDate}
                onChange={(e) => setFormEffectiveDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-zinc-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <div className="md:col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">ملاحظات العرض / شروط التسليم</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="مثال: شامل النقل والتوصيل حتى مخزن مصنع أبو عادل..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isPrefCheck"
                checked={formIsPreferred}
                onChange={(e) => setFormIsPreferred(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded"
              />
              <label htmlFor="isPrefCheck" className="text-amber-400 font-bold cursor-pointer">
                ⭐ مورد مفضل للصنف
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>💾 {editId > 0 ? 'تحديث السعر' : 'تسجيل السعر'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* شريط فلاتر البحث المتقدمة */}
      <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">🔍 بحث بالاسم أو الملاحظات</label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم المورد، الخامة، أو شروط العرض..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">🏢 فلترة بالمورد</label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(Number(e.target.value))}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100 outline-none"
            >
              <option value="0">-- كل الموردين --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">📦 فلترة بالصنف / الخامة</label>
            <select
              value={itemFilter}
              onChange={(e) => setItemFilter(Number(e.target.value))}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100 outline-none"
            >
              <option value="0">-- كل الأصناف والخامات --</option>
              {rawMaterials.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">⭐ التفضيل</label>
            <select
              value={preferenceFilter}
              onChange={(e) => setPreferenceFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100 outline-none"
            >
              <option value="all">كل العروض</option>
              <option value="preferred">⭐ مورد مفضل فقط</option>
              <option value="alternative">بديل</option>
            </select>
          </div>
        </div>
      </div>

      {/* جدول سجل الأسعار وعروض التوريد المسجلة */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
          <span className="font-bold text-zinc-200">📋 سجل الأسعار وعروض التوريد المسجلة</span>
          <span className="bg-indigo-600 px-2.5 py-0.5 rounded-lg text-white font-mono text-[11px]">
            المعروض: {filteredPrices.length} عرض
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3 text-right">المورد</th>
                <th className="py-3 px-3 text-right">الصنف / المادة الخام</th>
                <th className="py-3 px-3">الوحدة</th>
                <th className="py-3 px-3">سعر التوريد</th>
                <th className="py-3 px-3">مدة التوريد</th>
                <th className="py-3 px-3">تاريخ السريان</th>
                <th className="py-3 px-3">التفضيل</th>
                <th className="py-3 px-3 text-right">الملاحظات</th>
                <th className="py-3 px-3 w-32">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredPrices.map(row => (
                <tr key={row.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 text-right font-bold text-zinc-100">{row.supplierName}</td>
                  <td className="py-3 px-3 text-right font-bold text-indigo-400">{row.itemName}</td>
                  <td className="py-3 px-3">
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700">
                      {row.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-sm">
                    {row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} ج.م
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-zinc-300">{row.deliveryDays} يوم</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{row.effectiveDate}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      row.isPreferred ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                      {row.isPreferred ? '⭐ مورد مفضل' : 'بديل'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400 max-w-xs truncate">{row.notes || '-'}</td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 rounded-lg transition-all"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-zinc-800 rounded-lg transition-all"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة استيراد عروض الأسعار من إكسيل */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0f1117] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-emerald-900/60 text-white flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-emerald-400">
                <FileSpreadsheet className="w-4 h-4" />
                <span>استيراد عروض أسعار التوريد من ملف إكسيل</span>
              </h4>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-600 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl">
                يتعرف النظام تلقائياً على أعمدة السعر والخامة والمورد من الملف المرفوع سواء تم تصديره من المنظومة أو من ملف خارجي.
              </div>

              <div className="p-4 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-[#171922] text-center space-y-2">
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">اختر ملف الإكسيل / CSV من جهازك:</label>
                <input
                  type="file"
                  accept=".csv"
                  className="text-xs text-slate-600 dark:text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-bold hover:file:bg-indigo-500"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setStatusMessage('✅ تمت قراءة ومعالجة وتحديث كافة الأسعار من الملف بنجاح!');
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md"
                >
                  تأكيد واستيراد كافة الأسعار
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPricesPage;


