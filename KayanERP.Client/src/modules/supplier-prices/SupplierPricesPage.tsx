import React, { useState, useEffect, useMemo } from 'react';
import {
  Tags,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2,
  Save,
  X,
  Star,
  Building2,
  Package,
  Calendar,
  Clock,
  Filter
} from 'lucide-react';
import {
  fetchSupplierPricesApi,
  fetchSuppliersLookupApi,
  fetchItemsLookupApi,
  saveSupplierPriceApi,
  deleteSupplierPriceApi,
} from './supplierPricesApi';
import type {
  SupplierPriceDto,
  SupplierLookupItem,
  ItemLookupItem,
  PriceImportRowDto,
} from './supplierPricesApi';

export const SupplierPricesPage: React.FC = () => {
  const [priceList, setPriceList] = useState<SupplierPriceDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierLookupItem[]>([]);
  const [items, setItems] = useState<ItemLookupItem[]>([]);

  // نموذج الإدخال والتعديل
  const [editId, setEditId] = useState<number>(0);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [inputPrice, setInputPrice] = useState<number>(0);
  const [inputDeliveryDays, setInputDeliveryDays] = useState<number>(1);
  const [inputEffectiveDate, setInputEffectiveDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [inputIsPreferred, setInputIsPreferred] = useState<boolean>(false);
  const [inputNotes, setInputNotes] = useState<string>('');

  // شريط الفلاتر والبحث
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<number>(0);
  const [selectedItemFilter, setSelectedItemFilter] = useState<number>(0);
  const [selectedPreferenceFilter, setSelectedPreferenceFilter] = useState<string>('all');

  // حالات التحميل والرسائل
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // مودال الاستيراد
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importedPreviewList, setImportedPreviewList] = useState<PriceImportRowDto[]>([]);
  const [isSavingImport, setIsSavingImport] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [prices, sups, itms] = await Promise.all([
        fetchSupplierPricesApi(),
        fetchSuppliersLookupApi(),
        fetchItemsLookupApi(),
      ]);
      setPriceList(prices);
      setSuppliers(sups);
      setItems(itms);
    } catch (err: any) {
      setErrorMessage(`تعذر جلب قوائم الأسعار: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSupplierName = (supId: number) =>
    suppliers.find((s) => s.id === supId)?.supplierName ?? 'غير محدد';
  const getItemName = (itemId: number) =>
    items.find((i) => i.id === itemId)?.itemName ?? 'غير محدد';
  const getItemUnit = (itemId: number) =>
    items.find((i) => i.id === itemId)?.unit ?? 'كجم';

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedSupplierFilter > 0 ||
    selectedItemFilter > 0 ||
    selectedPreferenceFilter !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSupplierFilter(0);
    setSelectedItemFilter(0);
    setSelectedPreferenceFilter('all');
  };

  const filteredPrices = useMemo(() => {
    return priceList.filter((p) => {
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const sName = (p.supplierName || getSupplierName(p.supplierId)).toLowerCase();
        const iName = (p.itemName || getItemName(p.itemId)).toLowerCase();
        const notes = (p.notes || '').toLowerCase();
        if (!sName.includes(term) && !iName.includes(term) && !notes.includes(term)) {
          return false;
        }
      }

      if (selectedSupplierFilter > 0 && p.supplierId !== selectedSupplierFilter) {
        return false;
      }

      if (selectedItemFilter > 0 && p.itemId !== selectedItemFilter) {
        return false;
      }

      if (selectedPreferenceFilter === 'preferred' && !p.isPreferred) {
        return false;
      }
      if (selectedPreferenceFilter === 'alternative' && p.isPreferred) {
        return false;
      }

      return true;
    });
  }, [priceList, searchTerm, selectedSupplierFilter, selectedItemFilter, selectedPreferenceFilter]);

  const handleEditPrice = (p: SupplierPriceDto) => {
    setEditId(p.id);
    setSelectedSupplierId(p.supplierId);
    setSelectedItemId(p.itemId);
    setInputPrice(p.price);
    setInputDeliveryDays(p.deliveryDays || p.leadTimeDays || 1);
    setInputEffectiveDate(p.effectiveDate || new Date().toISOString().slice(0, 10));
    setInputIsPreferred(p.isPreferred);
    setInputNotes(p.notes || '');
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditId(0);
    setSelectedSupplierId(0);
    setSelectedItemId(0);
    setInputPrice(0);
    setInputDeliveryDays(1);
    setInputEffectiveDate(new Date().toISOString().slice(0, 10));
    setInputIsPreferred(false);
    setInputNotes('');
    setErrorMessage(null);
  };

  const handleSavePrice = async () => {
    if (selectedSupplierId <= 0 || selectedItemId <= 0 || inputPrice <= 0) {
      setErrorMessage('يرجى تحديد المورد والصنف وتحديد سعر توريد أكبر من الصفر.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveSupplierPriceApi(
        {
          supplierId: selectedSupplierId,
          itemId: selectedItemId,
          price: inputPrice,
          deliveryDays: inputDeliveryDays,
          effectiveDate: inputEffectiveDate,
          isPreferred: inputIsPreferred,
          notes: inputNotes,
        },
        editId
      );

      setSuccessMessage(editId > 0 ? 'تم تحديث سعر التوريد بنجاح.' : 'تم تسجيل سعر التوريد بنجاح.');
      handleResetForm();
      await loadData();
    } catch (err: any) {
      setErrorMessage(`خطأ في الحفظ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePrice = async (p: SupplierPriceDto) => {
    if (!window.confirm(`هل تريد حذف سعر توريد (${p.itemName}) من المورد (${p.supplierName})؟`)) return;

    try {
      await deleteSupplierPriceApi(p.id);
      setSuccessMessage('تم حذف سعر التوريد بنجاح.');
      await loadData();
    } catch (err: any) {
      setErrorMessage(`خطأ أثناء الحذف: ${err.message}`);
    }
  };

  const handleExportCsv = () => {
    if (filteredPrices.length === 0) {
      setErrorMessage('لا توجد أسعار مسجلة لتصديرها.');
      return;
    }

    const headers = ['المورد', 'الصنف_الخامة', 'الوحدة', 'سعر_التوريد', 'مدة_التوريد_ايام', 'تاريخ_السريان', 'التفضيل', 'الملاحظات'];
    const rows = filteredPrices.map((p) => [
      `"${p.supplierName || getSupplierName(p.supplierId)}"`,
      `"${p.itemName || getItemName(p.itemId)}"`,
      `"${p.unit || getItemUnit(p.itemId)}"`,
      p.price,
      p.deliveryDays || p.leadTimeDays || 1,
      p.effectiveDate || '-',
      p.isPreferred ? 'مورد مفضل' : 'بديل',
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `عروض_أسعار_الموردين_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage(`تم تصدير (${filteredPrices.length}) عرض سعر إلى إكسيل بنجاح.`);
  };

  const handleDownloadTemplate = () => {
    const headers = ['المورد', 'الصنف_الخامة', 'الوحدة', 'سعر_التوريد', 'مدة_التوريد_ايام', 'تاريخ_السريان', 'التفضيل', 'الملاحظات'];
    const sampleRows = [
      ['شركة مطاحن الدلتا والصعيد', 'دقيق فاخر استخراج 72%', 'كجم', '18.50', '2', '2026-10-01', 'مورد مفضل', 'شامل التوصيل لمصنع أبو عادل'],
      ['مزارع الوادي لمنتجات الألبان', 'سمن بلدي بقري طبيعي', 'صفيحة', '3450.00', '1', '2026-10-01', 'مورد مفضل', 'تسليم فوري من المخزن'],
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'قالب_استيراد_أسعار_الموردين.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // معالجة اختيار ملف الإكسيل للاستيراد
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportedPreviewList([]);
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setErrorMessage('الملف فارغ أو لا يحتوي على صفوف بيانات.');
          return;
        }

        const preview: PriceImportRowDto[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 4) {
            preview.push({
              supplierName: cols[0] || 'مورد عام',
              itemName: cols[1] || 'خامة عامة',
              price: parseFloat(cols[3]) || 0,
              deliveryDays: parseInt(cols[4], 10) || 1,
              effectiveDate: cols[5] || new Date().toISOString().slice(0, 10),
              isPreferred: cols[6]?.includes('مفضل') || false,
              notes: cols[7] || '',
            });
          }
        }
        setImportedPreviewList(preview);
      } catch (err: any) {
        setErrorMessage(`فشل قراءة الملف: ${err.message}`);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleProcessImport = async () => {
    if (importedPreviewList.length === 0) return;
    setIsSavingImport(true);
    setErrorMessage(null);

    try {
      let createdCount = 0;
      for (const row of importedPreviewList) {
        if (row.price <= 0) continue;
        const sup = suppliers.find((s) => s.supplierName.includes(row.supplierName) || row.supplierName.includes(s.supplierName));
        const itm = items.find((i) => i.itemName.includes(row.itemName) || row.itemName.includes(i.itemName));

        await saveSupplierPriceApi({
          supplierId: sup ? sup.id : (suppliers[0]?.id || 1),
          itemId: itm ? itm.id : (items[0]?.id || 101),
          price: row.price,
          deliveryDays: row.deliveryDays,
          effectiveDate: row.effectiveDate,
          isPreferred: row.isPreferred,
          notes: row.notes,
        });
        createdCount++;
      }

      setSuccessMessage(`اكتمل الاستيراد: تم اعتماد وتحديث (${createdCount}) عرض سعر بنجاح.`);
      setIsImportModalOpen(false);
      setImportedPreviewList([]);
      await loadData();
    } catch (err: any) {
      setErrorMessage(`خطأ أثناء معالجة الاستيراد: ${err.message}`);
    } finally {
      setIsSavingImport(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. رأس الصفحة وأزرار التصدير والاستيراد */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-xs border-r-4 border-r-amber-500 border border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Tags className="w-6 h-6 text-indigo-600" />
            <span>قوائم أسعار التوريد (Supplier Price Lists)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إدارة عروض وأسعار التوريد للأصناف وربطها بالموردين المعتمدين ومدة التوريد
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 rounded-xl border border-cyan-200 text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>تحميل قالب الإكسيل</span>
          </button>

          <button
            onClick={() => {
              setImportedPreviewList([]);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد من إكسيل</span>
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

      {/* 3. بطاقة تسجيل / تعديل سعر توريد جديد */}
      <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-indigo-600 p-5 mb-6 shadow-xs text-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
            <span>{editId > 0 ? '✏️ تعديل سعر توريد مسجل' : '➕ تسجيل سعر توريد جديد'}</span>
          </h2>
          {editId > 0 && (
            <button
              onClick={handleResetForm}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">
              المورد <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>-- اختر المورد --</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.supplierName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">
              الصنف / الخامة <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>-- اختر الصنف --</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemName} ({item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-1">
              سعر التوريد * (ج.م)
            </label>
            <input
              type="number"
              step="0.01"
              value={inputPrice || ''}
              onChange={(e) => setInputPrice(Number(e.target.value))}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono font-bold text-emerald-600 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-1">
              مدة التوريد (أيام)
            </label>
            <input
              type="number"
              value={inputDeliveryDays}
              onChange={(e) => setInputDeliveryDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono text-center focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-1">تاريخ السريان</label>
            <input
              type="date"
              value={inputEffectiveDate}
              onChange={(e) => setInputEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-8">
            <label className="block text-gray-700 font-bold mb-1">ملاحظات العرض / شروط التسليم</label>
            <input
              type="text"
              placeholder="مثال: شامل النقل والتوصيل حتى مخزن المصنع..."
              value={inputNotes}
              onChange={(e) => setInputNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-center pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inputIsPreferred}
                onChange={(e) => setInputIsPreferred(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded"
              />
              <span className="font-bold text-amber-700 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>مورد مفضل للصنف</span>
              </span>
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleSavePrice}
              disabled={isSaving}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : editId > 0 ? 'تحديث السعر' : 'تسجيل السعر'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. شريط فلاتر البحث المتقدمة */}
      <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-amber-500 p-4 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4">
            <label className="block text-gray-600 font-bold mb-1">🔍 بحث بالاسم أو الملاحظات</label>
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث باسم المورد، الخامة، أو شروط العرض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-gray-600 font-bold mb-1">🏢 فلترة بالمورد</label>
            <select
              value={selectedSupplierFilter}
              onChange={(e) => setSelectedSupplierFilter(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>-- كل الموردين --</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.supplierName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-gray-600 font-bold mb-1">📦 فلترة بالصنف / الخامة</label>
            <select
              value={selectedItemFilter}
              onChange={(e) => setSelectedItemFilter(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>-- كل الأصناف والخامات --</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-bold mb-1">⭐ التفضيل</label>
            <select
              value={selectedPreferenceFilter}
              onChange={(e) => setSelectedPreferenceFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="all">كل العروض</option>
              <option value="preferred">⭐ مورد مفضل فقط</option>
              <option value="alternative">بديل</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <span className="text-xs text-indigo-700 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>نتائج التصفية: ({filteredPrices.length} من إجمالي {priceList.length} عرض مسجل)</span>
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold"
            >
              ✕ إلغاء الفلاتر وعرض الكل
            </button>
          </div>
        )}
      </div>

      {/* 5. جدول سجل الأسعار وعروض التوريد المسجلة */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-xs font-bold">📋 سجل الأسعار وعروض التوريد المسجلة</h2>
          <span className="bg-indigo-600 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full">
            المعروض: {filteredPrices.length} عرض
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <RotateCw className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
              <p>جاري تحميل قوائم الأسعار...</p>
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-bold">
              لا توجد عروض أسعار مطابقة لشروط البحث والفلترة.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                <tr>
                  <th className="py-3 px-3 text-right">المورد</th>
                  <th className="py-3 px-3 text-right">الصنف / المادة الخام</th>
                  <th className="py-3 px-3">الوحدة</th>
                  <th className="py-3 px-3">سعر التوريد</th>
                  <th className="py-3 px-3">مدة التوريد</th>
                  <th className="py-3 px-3">تاريخ السريان</th>
                  <th className="py-3 px-3">التفضيل</th>
                  <th className="py-3 px-3 text-right">الملاحظات</th>
                  <th className="py-3 px-3" style={{ width: '130px' }}>إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {filteredPrices.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/75 transition-colors ${
                      row.id === editId ? 'bg-indigo-50/60' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-right font-bold text-gray-900">
                      {row.supplierName || getSupplierName(row.supplierId)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-700">
                      {row.itemName || getItemName(row.itemId)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                        {row.unit || getItemUnit(row.itemId)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-sm text-emerald-600">
                      {row.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-700">
                      {row.deliveryDays || row.leadTimeDays || 1} يوم
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                      {row.effectiveDate || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        row.isPreferred
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {row.isPreferred ? '⭐ مورد مفضل' : 'بديل'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-500 max-w-xs truncate" title={row.notes || '-'}>
                      {row.notes || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditPrice(row)}
                          className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDeletePrice(row)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          )}
        </div>
      </div>

      {/* 6. نافذة استيراد عروض الأسعار من إكسيل */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] text-xs">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                <span>استيراد عروض أسعار التوريد من ملف إكسيل</span>
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-xs">
                يتعرف النظام تلقائياً على أعمدة السعر والخامة والمورد من الملف المرفوع سواء تم تصديره من المنظومة أو من ملف خارجي.
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <label className="block font-bold text-gray-700 mb-2">اختر ملف الإكسيل / CSV من جهازك:</label>
                <input
                  type="file"
                  accept=".csv, text/csv"
                  onChange={handleFileSelected}
                  className="w-full text-xs text-gray-600 file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {importedPreviewList.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-gray-800">
                      معاينة الأسعار المقروءة من الملف ({importedPreviewList.length} عرض):
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      جاهز للاستيراد
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-center text-xs">
                      <thead className="bg-slate-100/75 text-gray-600 font-bold border-b border-gray-200">
                        <tr>
                          <th className="py-2 px-3 text-right">المورد</th>
                          <th className="py-2 px-3 text-right">الصنف / المادة الخام</th>
                          <th className="py-2 px-3">سعر التوريد</th>
                          <th className="py-2 px-3">مدة التوريد</th>
                          <th className="py-2 px-3">تاريخ السريان</th>
                          <th className="py-2 px-3">التفضيل</th>
                          <th className="py-2 px-3 text-right">الملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importedPreviewList.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-right font-bold text-gray-800">{row.supplierName}</td>
                            <td className="py-2 px-3 text-right font-bold text-indigo-700">{row.itemName}</td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-600">{row.price} ج.م</td>
                            <td className="py-2 px-3 font-mono">{row.deliveryDays} يوم</td>
                            <td className="py-2 px-3 font-mono text-gray-500">{row.effectiveDate}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.isPreferred ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {row.isPreferred ? 'مفضل' : 'بديل'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right text-gray-500 truncate max-w-xs">{row.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSavingImport || importedPreviewList.length === 0}
                onClick={handleProcessImport}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSavingImport
                    ? 'جاري معالجة وتحديث الأسعار...'
                    : `تأكيد واستيراد كافة الأسعار (${importedPreviewList.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
