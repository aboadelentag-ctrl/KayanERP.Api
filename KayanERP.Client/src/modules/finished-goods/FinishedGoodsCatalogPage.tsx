import React, { useState, useEffect, useMemo } from 'react';
import {
  Cake,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Layers,
  Scale,
  Barcode,
  Sparkles,
  Edit2,
  Boxes,
  Package,
  X
} from 'lucide-react';
import {
  fetchFinishedGoodsCatalogApi,
  saveItemCatalogApi,
  saveItemVariantApi,
  saveUomConversionApi,
  executeBulkImportApi
} from './finishedGoodsApi';
import type {
  ItemDto,
  ItemVariantDto,
  UomConversionDto,
  DepartmentLookupDto
} from './finishedGoodsApi';

interface FinishedGoodsCatalogPageProps {
  onNavigate?: (tab: string) => void;
}

export const FinishedGoodsCatalogPage: React.FC<FinishedGoodsCatalogPageProps> = () => {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [allVariants, setAllVariants] = useState<ItemVariantDto[]>([]);
  const [allConversions, setAllConversions] = useState<UomConversionDto[]>([]);
  const [departmentsList, setDepartmentsList] = useState<DepartmentLookupDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');

  // Messages
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [isPageError, setIsPageError] = useState<boolean>(false);

  // Workstation Modal
  const [showWorkstationModal, setShowWorkstationModal] = useState<boolean>(false);
  const [isNewItemMode, setIsNewItemMode] = useState<boolean>(false);
  const [activeTabModal, setActiveTabModal] = useState<number>(1);
  const [activeItem, setActiveItem] = useState<ItemDto>({
    id: 0,
    itemCode: '',
    itemName: '',
    itemType: 'منتج تام',
    unit: 'قطعة',
    active: true,
    basePrice: 0,
    departmentName: ''
  });
  const [currentItemVariants, setCurrentItemVariants] = useState<ItemVariantDto[]>([]);
  const [currentItemConversions, setCurrentItemConversions] = useState<UomConversionDto[]>([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isModalError, setIsModalError] = useState<boolean>(false);
  const [isSavingMaster, setIsSavingMaster] = useState<boolean>(false);

  // Variant Form
  const [newVariantName, setNewVariantName] = useState<string>('');
  const [newVariantCode, setNewVariantCode] = useState<string>('');
  const [newVariantPrice, setNewVariantPrice] = useState<number>(0);
  const [newVariantBarcode, setNewVariantBarcode] = useState<string>('');
  const [isSavingVariant, setIsSavingVariant] = useState<boolean>(false);

  // Conversion Form
  const [newConvToUnit, setNewConvToUnit] = useState<string>('بلكة');
  const [newConvFactor, setNewConvFactor] = useState<number>(48);
  const [newConvNotes, setNewConvNotes] = useState<string>('');
  const [isSavingConv, setIsSavingConv] = useState<boolean>(false);

  // Bulk Import Modal
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkRawData, setBulkRawData] = useState<string>('');
  const [bulkStatusMessage, setBulkStatusMessage] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFinishedGoodsCatalogApi();
      setItems(data.items);
      setAllVariants(data.variants);
      setAllConversions(data.conversions);
      setDepartmentsList(data.departments);
    } catch (ex: any) {
      setPageMessage('خطأ في تحميل البيانات: ' + ex.message);
      setIsPageError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      if (selectedDepartmentFilter && i.departmentName !== selectedDepartmentFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        i.itemName.toLowerCase().includes(term) ||
        i.itemCode.toLowerCase().includes(term) ||
        (i.barcode && i.barcode.toLowerCase().includes(term))
      );
    });
  }, [items, searchTerm, selectedDepartmentFilter]);

  const openNewItemModal = () => {
    setIsNewItemMode(true);
    setActiveTabModal(1);
    setModalMessage(null);
    setActiveItem({
      id: 0,
      itemCode: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: '',
      itemType: 'منتج تام',
      unit: 'قطعة',
      active: true,
      hasExpiryDate: true,
      shelfLifeDays: 4,
      isVariant: true,
      basePrice: 0,
      departmentName: departmentsList[0]?.displayName || 'صالة تصنيع الحلويات الشرقية'
    });
    setCurrentItemVariants([]);
    setCurrentItemConversions([]);
    setShowWorkstationModal(true);
  };

  const openItemWorkstation = (item: ItemDto, targetTab: number) => {
    setIsNewItemMode(false);
    setActiveTabModal(targetTab);
    setModalMessage(null);
    setActiveItem({ ...item });

    const vars = allVariants.filter(
      v => v.parentItemId === item.id || (item.itemCode && v.itemCode.startsWith(`${item.itemCode}-`))
    );
    const convs = allConversions.filter(c => c.itemId === item.id);

    setCurrentItemVariants(vars);
    setCurrentItemConversions(convs);

    setNewVariantName('');
    setNewVariantCode(`${item.itemCode}-${vars.length + 1}`);
    setNewVariantPrice(item.basePrice);
    setNewVariantBarcode('');

    setShowWorkstationModal(true);
  };

  const handleSaveActiveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem.itemCode.trim() || !activeItem.itemName.trim()) {
      setModalMessage('يرجى كتابة كود واسم المنتج التام.');
      setIsModalError(true);
      return;
    }

    setIsSavingMaster(true);
    setModalMessage(null);

    try {
      await saveItemCatalogApi(activeItem);
      setItems(prev => {
        if (activeItem.id > 0) {
          return prev.map(i => (i.id === activeItem.id ? { ...activeItem } : i));
        }
        return [{ ...activeItem, id: Date.now() }, ...prev];
      });

      setModalMessage('✅ تم حفظ بيانات المنتج بنجاح!');
      setIsModalError(false);
      setIsNewItemMode(false);
    } finally {
      setIsSavingMaster(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariantName.trim()) return;

    setIsSavingVariant(true);
    setModalMessage(null);

    try {
      const code = newVariantCode.trim() || `${activeItem.itemCode}-${currentItemVariants.length + 1}`;
      const newVar: ItemVariantDto = {
        id: Date.now(),
        parentItemId: activeItem.id,
        itemCode: code,
        itemName: newVariantName.trim(),
        price: newVariantPrice > 0 ? newVariantPrice : activeItem.basePrice,
        barcode: newVariantBarcode.trim(),
        unit: activeItem.unit,
        active: true
      };

      await saveItemVariantApi({
        parentItemId: activeItem.id,
        variantCode: code,
        variantName: newVariantName.trim(),
        price: newVariantPrice > 0 ? newVariantPrice : activeItem.basePrice,
        barcode: newVariantBarcode.trim(),
        unit: activeItem.unit
      });

      setAllVariants(prev => [...prev, newVar]);
      setCurrentItemVariants(prev => [...prev, newVar]);

      setModalMessage('✅ تم إضافة النكهة بنجاح!');
      setIsModalError(false);

      setNewVariantName('');
      setNewVariantCode(`${activeItem.itemCode}-${currentItemVariants.length + 2}`);
      setNewVariantBarcode('');
    } finally {
      setIsSavingVariant(false);
    }
  };

  const handleAddConversion = async () => {
    if (!newConvToUnit.trim() || newConvFactor <= 0) return;

    setIsSavingConv(true);
    setModalMessage(null);

    try {
      const newConv: UomConversionDto = {
        id: Date.now(),
        itemId: activeItem.id,
        fromUnit: newConvToUnit.trim(),
        toUnit: activeItem.unit.trim(),
        conversionFactor: newConvFactor,
        notes: newConvNotes.trim() || `معامل تعبئة ${activeItem.itemName}`
      };

      await saveUomConversionApi({
        itemId: activeItem.id,
        fromUnit: newConvToUnit.trim(),
        toUnit: activeItem.unit.trim(),
        conversionFactor: newConvFactor,
        notes: newConvNotes.trim()
      });

      setAllConversions(prev => [...prev, newConv]);
      setCurrentItemConversions(prev => [...prev, newConv]);

      setModalMessage('✅ تم حفظ معامل التحويل بنجاح!');
      setIsModalError(false);
      setNewConvNotes('');
    } finally {
      setIsSavingConv(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkRawData.trim()) return;

    setIsBulkProcessing(true);
    setBulkStatusMessage(null);

    try {
      const res = await executeBulkImportApi(bulkRawData);
      setBulkStatusMessage(res.message);
      setBulkRawData('');
      await loadData();
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الشريط العلوي */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Cake className="w-6 h-6 text-amber-400" />
              <span>كتالوج المنتجات التامة والحلويات (Finished Goods Catalog)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              إدارة الأصناف والأسعار والنكهات
            </span>
          </div>
          <p className="text-xs text-slate-400">
            إدارة أصناف الحلويات، الأسعار، شجرة النكهات والتفريعات (Variants)، ومصفوفة التعبئة.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setBulkStatusMessage(null);
              setBulkRawData('');
              setShowBulkModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 shadow-xs transition-colors"
          >
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span>استيراد سريع (Bulk)</span>
          </button>
          <button
            onClick={openNewItemModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة منتج تام جديد</span>
          </button>
        </div>
      </div>

      {pageMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isPageError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <span className="flex items-center gap-2">
            {isPageError ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {pageMessage}
          </span>
          <button onClick={() => setPageMessage(null)}>×</button>
        </div>
      )}

      {/* شريط البحث والفلترة */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الكود أو الباركود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={selectedDepartmentFilter}
          onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كل الصالات والأقسام الإنتاجية --</option>
          {departmentsList.map(dept => (
            <option key={dept.id} value={dept.displayName}>{dept.displayName}</option>
          ))}
        </select>

        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-3 py-2 rounded-xl">
          إجمالي المنتجات: {filteredItems.length}
        </span>
      </div>

      {/* جدول عرض المنتجات التامة */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        <table className="w-full text-center">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="py-2.5 px-3">كود الصنف</th>
              <th className="py-2.5 px-3 text-right">اسم المنتج التام</th>
              <th className="py-2.5 px-3">القسم / الصالة</th>
              <th className="py-2.5 px-3">سعر البيع الأساسي</th>
              <th className="py-2.5 px-3">الوحدة</th>
              <th className="py-2.5 px-3">شجرة النكهات (Variants)</th>
              <th className="py-2.5 px-3">معامل التعبئة</th>
              <th className="py-2.5 px-3">الحالة</th>
              <th className="py-2.5 px-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400 font-bold">
                  جاري تحميل كتالوج المنتجات التامة...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400 font-bold">
                  ⚠️ لا توجد منتجات تامة مسجلة مطابقة للبحث.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const varCount = allVariants.filter(
                  v => v.parentItemId === item.id || (item.itemCode && v.itemCode.startsWith(`${item.itemCode}-`))
                ).length;
                const conv = allConversions.find(c => c.itemId === item.id);

                return (
                  <tr key={item.id} className={`hover:bg-slate-50 ${item.active ? '' : 'bg-slate-50/60 opacity-70'}`}>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{item.itemCode}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      <span>{item.itemName}</span>
                      {item.isMerged && (
                        <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-1.5 py-0.2 rounded text-[10px] mr-1.5 font-bold">
                          مدمج
                        </span>
                      )}
                      {item.isContainer && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded text-[10px] mr-1.5 font-bold">
                          حاوية
                        </span>
                      )}
                      {item.multiUom && (
                        <span className="bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.2 rounded text-[10px] mr-1.5 font-bold">
                          متعدد وحدات
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border text-[10px] font-medium">
                        {item.departmentName || 'غير محدد'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-black text-emerald-700">
                      {item.basePrice > 0 ? `${item.basePrice.toLocaleString()} ج.م` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-600">{item.unit}</td>
                    <td className="py-2.5 px-3">
                      {varCount > 0 ? (
                        <button
                          onClick={() => openItemWorkstation(item, 2)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-bold"
                        >
                          🍰 {varCount} نكهات / تفريعات
                        </button>
                      ) : (
                        <button
                          onClick={() => openItemWorkstation(item, 2)}
                          className="px-2 py-0.5 text-gray-400 hover:text-indigo-600 border border-dashed rounded"
                        >
                          ➕ إضافة نكهات
                        </button>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                      {conv ? `1 ${conv.fromUnit} = ${conv.conversionFactor} ${conv.toUnit}` : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {item.active ? 'مفعل' : 'موقوف'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openItemWorkstation(item, 1)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                      >
                        ⚙️ إدارة الصنف
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة بطاقة الصنف الشاملة (Item Workstation Modal) */}
      {showWorkstationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold flex items-center gap-2">
                <Cake className="w-4 h-4 text-amber-400" />
                <span>{isNewItemMode ? '➕ إضافة منتج تام جديد' : `⚙️ بطاقة المنتج: ${activeItem.itemName} (${activeItem.itemCode})`}</span>
              </h4>
              <button onClick={() => setShowWorkstationModal(false)} className="text-white">×</button>
            </div>

            <div className="bg-slate-100 border-b px-4 pt-2 flex gap-2 shrink-0">
              <button
                onClick={() => setActiveTabModal(1)}
                className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${activeTabModal === 1 ? 'bg-white text-indigo-700 border-t-2 border-t-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                📋 1. البيانات الأساسية والأسعار
              </button>
              <button
                disabled={isNewItemMode}
                onClick={() => setActiveTabModal(2)}
                className={`px-4 py-2 font-bold rounded-t-xl transition-colors disabled:opacity-40 ${activeTabModal === 2 ? 'bg-white text-indigo-700 border-t-2 border-t-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🍰 2. شجرة النكهات ({currentItemVariants.length})
              </button>
              <button
                disabled={isNewItemMode}
                onClick={() => setActiveTabModal(3)}
                className={`px-4 py-2 font-bold rounded-t-xl transition-colors disabled:opacity-40 ${activeTabModal === 3 ? 'bg-white text-indigo-700 border-t-2 border-t-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                ⚖️ 3. مصفوفة التحويل والتعبئة
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-white">
              {modalMessage && (
                <div className={`p-3 rounded-xl font-bold flex items-center justify-between border ${isModalError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                  <span>{modalMessage}</span>
                  <button onClick={() => setModalMessage(null)}>×</button>
                </div>
              )}

              {/* Tab 1: البيانات الأساسية */}
              {activeTabModal === 1 && (
                <form onSubmit={handleSaveActiveItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">كود الصنف الأساسي *</label>
                      <input
                        type="text"
                        required
                        value={activeItem.itemCode}
                        onChange={(e) => setActiveItem({ ...activeItem, itemCode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-bold text-indigo-700"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-bold mb-1">اسم المنتج التام *</label>
                      <input
                        type="text"
                        required
                        value={activeItem.itemName}
                        onChange={(e) => setActiveItem({ ...activeItem, itemName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">القسم الإنتاجي / الصالة *</label>
                      <select
                        value={activeItem.departmentName || ''}
                        onChange={(e) => setActiveItem({ ...activeItem, departmentName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                      >
                        {departmentsList.map(dept => (
                          <option key={dept.id} value={dept.displayName}>{dept.displayName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">سعر البيع الأساسي (ج.م) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={activeItem.basePrice || ''}
                        onChange={(e) => setActiveItem({ ...activeItem, basePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-black text-emerald-700 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">وحدة الصنف الأساسية *</label>
                      <select
                        value={activeItem.unit}
                        onChange={(e) => setActiveItem({ ...activeItem, unit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                      >
                        <option value="قطعة">قطعة</option>
                        <option value="علبة">علبة</option>
                        <option value="بلكة">بلكة</option>
                        <option value="صاج">صاج</option>
                        <option value="كجم">كجم</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">الباركود</label>
                      <input
                        type="text"
                        value={activeItem.barcode || ''}
                        onChange={(e) => setActiveItem({ ...activeItem, barcode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* خصائص التشغيل والمطابقة */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-gray-200">
                    <h6 className="font-bold text-indigo-700 mb-3">⚙️ خصائص التشغيل والمطابقة</h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.isVariant}
                          onChange={(e) => setActiveItem({ ...activeItem, isVariant: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="font-bold text-gray-700">صنف متنوع (له نكهات وتفريعات)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.isMerged}
                          onChange={(e) => setActiveItem({ ...activeItem, isMerged: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="font-bold text-gray-700">مدمج (صاجات / أطباق مشكلة)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.multiUom}
                          onChange={(e) => setActiveItem({ ...activeItem, multiUom: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="font-bold text-gray-700">متعدد الوحدات (قطعة وبلكة/وزن)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.isContainer}
                          onChange={(e) => setActiveItem({ ...activeItem, isContainer: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="font-bold text-gray-700">صنف حاوية / وعاء نقل (سبت / صينية)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.active}
                          onChange={(e) => setActiveItem({ ...activeItem, active: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="font-bold text-emerald-800">الصنف مفعّل وجاهز للتشغيل والبيع</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingMaster}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      {isSavingMaster ? '⏳ جاري الحفظ...' : '💾 حفظ بيانات الصنف'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: شجرة النكهات */}
              {activeTabModal === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-3">
                    <h6 className="font-bold text-indigo-700">➕ إضافة نكهة / تفرع جديد</h6>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">اسم النكهة / التفرع *</label>
                      <input
                        type="text"
                        placeholder="مثلاً: شيكولاتة، فواكه، لوتس..."
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">كود التفرع الفريد</label>
                      <input
                        type="text"
                        value={newVariantCode}
                        onChange={(e) => setNewVariantCode(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">سعر البيع للتفرع (ج.م)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newVariantPrice || ''}
                        onChange={(e) => setNewVariantPrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border rounded-xl font-mono text-center font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">الباركود الخاص بالنكهة</label>
                      <input
                        type="text"
                        value={newVariantBarcode}
                        onChange={(e) => setNewVariantBarcode(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border rounded-xl font-mono"
                      />
                    </div>
                    <button
                      onClick={handleAddVariant}
                      disabled={isSavingVariant || !newVariantName.trim()}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      {isSavingVariant ? '⏳ جاري الحفظ...' : '💾 حفظ النكهة للصنف'}
                    </button>
                  </div>

                  <div className="md:col-span-8">
                    <h6 className="font-bold text-gray-800 mb-2">🍰 قائمة نكهات وتفريعات الصنف المسجلة:</h6>
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-center">
                        <thead className="bg-slate-100 text-gray-700">
                          <tr>
                            <th className="py-2 px-3">كود التفرع</th>
                            <th className="py-2 px-3 text-right">اسم النكهة</th>
                            <th className="py-2 px-3">السعر</th>
                            <th className="py-2 px-3">الباركود</th>
                            <th className="py-2 px-3">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {currentItemVariants.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-6 text-gray-400 font-bold">
                                لم يتم تسجيل تفريعات لهذا الصنف حتى الآن.
                              </td>
                            </tr>
                          ) : (
                            currentItemVariants.map(v => (
                              <tr key={v.id}>
                                <td className="py-2 px-3 font-mono font-bold text-indigo-700">{v.itemCode}</td>
                                <td className="py-2 px-3 text-right font-bold text-gray-900">{v.itemName}</td>
                                <td className="py-2 px-3 font-mono font-bold text-emerald-700">{v.price.toLocaleString()} ج.م</td>
                                <td className="py-2 px-3 font-mono text-gray-500">{v.barcode || '-'}</td>
                                <td className="py-2 px-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                    مفعل
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: مصفوفة التحويل والتعبئة */}
              {activeTabModal === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-3">
                    <h6 className="font-bold text-indigo-700">⚖️ ضبط معامل تعبئة جديد لهذا الصنف</h6>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">الوحدة الكبرى (وحدة التعبئة) *</label>
                      <input
                        type="text"
                        placeholder="مثلاً: بلكة، صاج، كرتونة..."
                        value={newConvToUnit}
                        onChange={(e) => setNewConvToUnit(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">تحتوي على عدد من ({activeItem.unit}) *</label>
                      <input
                        type="number"
                        min={1}
                        value={newConvFactor}
                        onChange={(e) => setNewConvFactor(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border rounded-xl font-mono text-center font-bold text-indigo-700"
                      />
                      <small className="text-gray-400 block mt-0.5">مثال: 48 (أي أن 1 بلكة = 48 قطعة)</small>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">ملاحظات التعبئة</label>
                      <input
                        type="text"
                        placeholder="مثال: تعبئة صالة الجاتوه القياسية..."
                        value={newConvNotes}
                        onChange={(e) => setNewConvNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border rounded-xl"
                      />
                    </div>
                    <button
                      onClick={handleAddConversion}
                      disabled={isSavingConv || !newConvToUnit.trim() || newConvFactor <= 0}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      {isSavingConv ? '⏳ جاري الحفظ...' : '💾 اعتماد معامل التحويل'}
                    </button>
                  </div>

                  <div className="md:col-span-7">
                    <h6 className="font-bold text-gray-800 mb-2">مصفوفة وحدات التعبئة المعتمدة للصنف:</h6>
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-center">
                        <thead className="bg-slate-100 text-gray-700">
                          <tr>
                            <th className="py-2 px-3">معادلة التحويل</th>
                            <th className="py-2 px-3">المعامل الرياضي</th>
                            <th className="py-2 px-3 text-right">ملاحظات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {currentItemConversions.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-6 text-gray-400 font-bold">
                                لا توجد معاملات تحويل خاصة بهذا الصنف. يتعامل بوحدته الأساسية ({activeItem.unit}) فقط.
                              </td>
                            </tr>
                          ) : (
                            currentItemConversions.map(c => (
                              <tr key={c.id}>
                                <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                                  1 {c.fromUnit} = {c.conversionFactor} {c.toUnit}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold">{c.conversionFactor}</td>
                                <td className="py-2 px-3 text-right text-gray-500">{c.notes || '-'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 border-t flex justify-end shrink-0">
              <button
                onClick={() => setShowWorkstationModal(false)}
                className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإضافة السريعة (Bulk Import Modal) */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                <span>استيراد دفعات المنتجات التامة (Bulk Quick Import)</span>
              </h4>
              <button onClick={() => setShowBulkModal(false)} className="text-white">×</button>
            </div>

            <div className="p-5 space-y-3 bg-slate-50">
              <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-xl">
                <strong>ترتيب الأعمدة المطلوب عند اللصق:</strong><br />
                اسم الصنف | كود الصنف | القسم الإنتاجي | النكهة/التفرع | الوحدة | معامل التحويل | السعر | الباركود
              </div>

              <textarea
                rows={8}
                placeholder="الصق البيانات هنا من شيت الإكسيل..."
                value={bulkRawData}
                onChange={(e) => setBulkRawData(e.target.value)}
                className="w-full p-3 bg-white border border-indigo-200 rounded-xl font-mono text-xs outline-none"
              ></textarea>

              {bulkStatusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold">
                  {bulkStatusMessage}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isBulkProcessing || !bulkRawData.trim()}
                  onClick={handleBulkImport}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isBulkProcessing ? '⏳ جاري المعالجة والحفظ...' : '💾 تحليل وحفظ الكل'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
