import React, { useState, useEffect, useMemo } from 'react';
import {
  GitFork,
  Scale,
  PlusCircle,
  Search,
  CheckCircle2,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import {
  fetchParentItemsApi,
  fetchVariantsApi,
  fetchConversionsApi,
  saveVariantApi,
  saveConversionApi
} from './itemHierarchyApi';
import type {
  ParentItemLookupDto,
  ItemVariantDto,
  UomConversionDto,
  ItemVariantCreateDto,
  UomConversionCreateDto
} from './itemHierarchyApi';

export const ItemHierarchyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'variants' | 'uom'>('variants');
  const [parentItems, setParentItems] = useState<ParentItemLookupDto[]>([]);
  const [variantsList, setVariantsList] = useState<ItemVariantDto[]>([]);
  const [conversionsList, setConversionsList] = useState<UomConversionDto[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  const [variantSearchTerm, setVariantSearchTerm] = useState<string>('');
  const [uomSearchTerm, setUomSearchTerm] = useState<string>('');

  // Form states
  const [newVariant, setNewVariant] = useState<ItemVariantCreateDto>({
    parentItemId: 0,
    variantName: '',
    variantCode: '',
    unit: '',
    packingUnit: '',
    packingFactor: 1
  });

  const [newConversion, setNewConversion] = useState<UomConversionCreateDto>({
    itemId: 0,
    fromUnit: '',
    toUnit: '',
    conversionFactor: 1,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [parents, variants, conversions] = await Promise.all([
        fetchParentItemsApi(),
        fetchVariantsApi(),
        fetchConversionsApi()
      ]);
      setParentItems(parents);
      setVariantsList(variants);
      setConversionsList(conversions);
    } catch (ex: any) {
      setStatusMessage(`خطأ في جلب بيانات الهيكل: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentSelect = (pId: number) => {
    const parent = parentItems.find(p => p.id === pId);
    if (parent) {
      const count = variantsList.filter(v => v.parentItemId === pId).length;
      setNewVariant(prev => ({
        ...prev,
        parentItemId: pId,
        unit: parent.unit,
        variantCode: `${parent.itemCode}-${(count + 1).toString().padStart(2, '0')}`
      }));
    } else {
      setNewVariant(prev => ({
        ...prev,
        parentItemId: 0,
        unit: '',
        variantCode: ''
      }));
    }
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newVariant.parentItemId <= 0 || !newVariant.variantName.trim()) {
      setStatusMessage('يرجى اختيار الصنف الأساسي وإدخال اسم التفرع.');
      setIsSuccess(false);
      return;
    }

    setIsProcessing(true);
    try {
      await saveVariantApi(newVariant);
      const parent = parentItems.find(p => p.id === newVariant.parentItemId);
      const added: ItemVariantDto = {
        id: Date.now(),
        itemCode: newVariant.variantCode || `SKU-${Date.now().toString().slice(-4)}`,
        itemName: newVariant.variantName,
        parentItemId: newVariant.parentItemId,
        parentItemName: parent?.itemName || '',
        unit: newVariant.unit || 'كجم',
        active: true
      };
      setVariantsList(prev => [added, ...prev]);
      setStatusMessage('تم إنشاء تفريع الصنف واعتماده بنجاح!');
      setIsSuccess(true);
      setNewVariant({
        parentItemId: 0,
        variantName: '',
        variantCode: '',
        unit: '',
        packingUnit: '',
        packingFactor: 1
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleSaveConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConversion.fromUnit.trim() || !newConversion.toUnit.trim() || newConversion.conversionFactor <= 0) {
      setStatusMessage('يرجى إدخال الوحدة الكبرى والصغرى وتحديد معامل تحويل أكبر من الصفر.');
      setIsSuccess(false);
      return;
    }

    setIsProcessing(true);
    try {
      await saveConversionApi(newConversion);
      const item = parentItems.find(p => p.id === newConversion.itemId);
      const added: UomConversionDto = {
        id: Date.now(),
        itemId: newConversion.itemId > 0 ? newConversion.itemId : undefined,
        itemName: item?.itemName || 'تحويل قياسي عام',
        fromUnit: newConversion.fromUnit,
        toUnit: newConversion.toUnit,
        conversionFactor: Number(newConversion.conversionFactor),
        isGlobal: newConversion.itemId === 0,
        notes: newConversion.notes
      };
      setConversionsList(prev => [added, ...prev]);
      setStatusMessage('تم حفظ واعتماد معامل التحويل بنجاح في قاعدة البيانات!');
      setIsSuccess(true);
      setNewConversion({
        itemId: 0,
        fromUnit: '',
        toUnit: '',
        conversionFactor: 1,
        notes: ''
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const filteredVariants = useMemo(() => {
    if (!variantSearchTerm.trim()) return variantsList;
    const term = variantSearchTerm.toLowerCase();
    return variantsList.filter(v =>
      v.itemName.toLowerCase().includes(term) ||
      v.itemCode.toLowerCase().includes(term) ||
      v.parentItemName.toLowerCase().includes(term)
    );
  }, [variantsList, variantSearchTerm]);

  const filteredConversions = useMemo(() => {
    if (!uomSearchTerm.trim()) return conversionsList;
    const term = uomSearchTerm.toLowerCase();
    return conversionsList.filter(c =>
      c.itemName.toLowerCase().includes(term) ||
      c.fromUnit.toLowerCase().includes(term) ||
      c.toUnit.toLowerCase().includes(term)
    );
  }, [conversionsList, uomSearchTerm]);

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-indigo-600" />
            <span>شجرة الوحدات ومصفوفة تحويل المقاييس (Item Hierarchy & UoM)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة مصفوفة تحويل الأوزان والمقاييس وتفريعات ونكهات الأصناف لمصانع الحلويات والمخابز.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
        >
          <RotateCw className="w-4 h-4 text-indigo-600" />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* التبويبات الرئيسية */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-fit gap-1 mb-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('variants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'variants' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <GitFork className="w-4 h-4" />
          <span>1. تفريعات الأصناف والنكهات والمقاسات ({variantsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('uom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'uom' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Scale className="w-4 h-4" />
          <span>2. مصفوفة معاملات تحويل الوحدات (UoM Matrix) ({conversionsList.length})</span>
        </button>
      </div>

      {/* محتوى تبويب 1: تفريعات الأصناف */}
      {activeTab === 'variants' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* كارت إضافة تفرع */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-slate-900 text-white p-3.5 font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>إضافة تفرع / نكهة جديدة</span>
              </div>

              <form onSubmit={handleSaveVariant} className="p-4 space-y-3 bg-slate-50">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الصنف الأساسي (الأب) *</label>
                  <select
                    value={newVariant.parentItemId}
                    onChange={(e) => handleParentSelect(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                  >
                    <option value={0}>-- اختر الصنف الأب (مثل: جاتوه) --</option>
                    {parentItems.map(p => (
                      <option key={p.id} value={p.id}>[{p.itemCode}] {p.itemName} ({p.unit})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم التفرع / النكهة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: جاتوه إسبشيال - كريمة"
                    value={newVariant.variantName}
                    onChange={(e) => setNewVariant({ ...newVariant, variantName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">كود التفرع (SKU)</label>
                  <input
                    type="text"
                    placeholder="توليد تلقائي"
                    value={newVariant.variantCode}
                    onChange={(e) => setNewVariant({ ...newVariant, variantCode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-indigo-700 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">وحدة الأساس</label>
                    <input
                      type="text"
                      placeholder="قطعة / كجم"
                      value={newVariant.unit}
                      onChange={(e) => setNewVariant({ ...newVariant, unit: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl font-bold text-center text-indigo-700"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">وحدة التعبئة</label>
                    <input
                      type="text"
                      placeholder="بلكة / كرتونة"
                      value={newVariant.packingUnit}
                      onChange={(e) => setNewVariant({ ...newVariant, packingUnit: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">عدد الوحدات بوحدة التعبئة</label>
                  <input
                    type="number"
                    min={1}
                    value={newVariant.packingFactor}
                    onChange={(e) => setNewVariant({ ...newVariant, packingFactor: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-center font-black text-emerald-700"
                  />
                  <small className="text-gray-400 block mt-1">مثال: 48 (أي أن 1 بلكة = 48 قطعة)</small>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? '⏳ جاري الحفظ...' : '✓ حفظ واعتماد التفرع'}
                </button>
              </form>
            </div>
          </div>

          {/* جدول استعراض التفريعات */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="p-3.5 bg-white border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                <span className="font-bold text-gray-800">سجل تفريعات الأصناف والنكهات المسجلة</span>
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="بحث بالنكهة، الكود، أو الصنف الأب..."
                    value={variantSearchTerm}
                    onChange={(e) => setVariantSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none"
                  />
                </div>
              </div>

              <table className="w-full text-center">
                <thead className="bg-slate-100 text-gray-700">
                  <tr>
                    <th className="py-2.5 px-3">كود التفرع</th>
                    <th className="py-2.5 px-3 text-right">اسم الصنف المتفرع</th>
                    <th className="py-2.5 px-3">الصنف الأساسي (الأب)</th>
                    <th className="py-2.5 px-3">الوحدة</th>
                    <th className="py-2.5 px-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVariants.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{v.itemCode}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">{v.itemName}</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">{v.parentItemName}</span></td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{v.unit}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {v.active ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* محتوى تبويب 2: مصفوفة معاملات تحويل الوحدات */}
      {activeTab === 'uom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* إضافة معامل تحويل */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-emerald-800 text-white p-3.5 font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>إضافة معامل تحويل وحدات جديد</span>
              </div>

              <form onSubmit={handleSaveConversion} className="p-4 space-y-3 bg-slate-50">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">نطاق تطبيق المعامل</label>
                  <select
                    value={newConversion.itemId}
                    onChange={(e) => setNewConversion({ ...newConversion, itemId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                  >
                    <option value={0}>-- تحويل قياسي عام لكافة أصناف المصنع --</option>
                    {parentItems.map(p => (
                      <option key={p.id} value={p.id}>خاص بالصنف: {p.itemName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">من وحدة (الكبرى) *</label>
                    <input
                      type="text"
                      required
                      placeholder="طن / شيكارة / بلكة"
                      value={newConversion.fromUnit}
                      onChange={(e) => setNewConversion({ ...newConversion, fromUnit: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">إلى وحدة (الصغرى) *</label>
                    <input
                      type="text"
                      required
                      placeholder="كجم / جرام / قطعة"
                      value={newConversion.toUnit}
                      onChange={(e) => setNewConversion({ ...newConversion, toUnit: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">معامل التحويل الرياضي *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.0001"
                    required
                    value={newConversion.conversionFactor}
                    onChange={(e) => setNewConversion({ ...newConversion, conversionFactor: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-center font-black text-emerald-700 text-sm"
                  />
                  <small className="text-gray-400 block mt-1">مثال: 1000 للطن، 50 لشيكارة السكر، 48 للبلكة</small>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">ملاحظات توضيحية</label>
                  <input
                    type="text"
                    placeholder="مثال: وزن شيكارة السكر الصافي"
                    value={newConversion.notes}
                    onChange={(e) => setNewConversion({ ...newConversion, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? '⏳ جاري الحفظ...' : '✓ حفظ واعتماد معامل التحويل'}
                </button>
              </form>
            </div>
          </div>

          {/* جدول معاملات التحويل */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="p-3.5 bg-white border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                <span className="font-bold text-gray-800">مصفوفة معاملات تحويل الوحدات المعتمدة</span>
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="بحث بالوحدة، الصنف، النطاق..."
                    value={uomSearchTerm}
                    onChange={(e) => setUomSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none"
                  />
                </div>
              </div>

              <table className="w-full text-center">
                <thead className="bg-slate-100 text-gray-700">
                  <tr>
                    <th className="py-2.5 px-3">نطاق المعامل</th>
                    <th className="py-2.5 px-3">الصنف المطبق عليه</th>
                    <th className="py-2.5 px-3">معادلة التحويل الرياضية</th>
                    <th className="py-2.5 px-3 text-right">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredConversions.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isGlobal ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-800'}`}>
                          {c.isGlobal ? 'قياسي عام' : 'خاص بالصنف'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{c.itemName}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-gray-600">1 {c.fromUnit} = </span>
                        <span className="font-bold text-emerald-700">{c.conversionFactor} {c.toUnit}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-500">{c.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
