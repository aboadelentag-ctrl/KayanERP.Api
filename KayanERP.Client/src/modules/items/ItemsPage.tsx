import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  PlusCircle,
  Tags,
  Download,
  FileSpreadsheet,
  Upload,
  RotateCw,
  Search,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle
} from 'lucide-react';
import {
  fetchItemsApi,
  fetchItemCategoriesApi,
  fetchItemDepartmentsApi,
  saveItemApi,
  saveCategoryApi
} from './itemsApi';
import type {
  ItemDto,
  CategoryDto,
  DepartmentItemDto,
  ItemUnitConversionDto,
  ItemVariantDto
} from './itemsApi';

export const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number>(0);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<number>(0);

  const [expandedItemIds, setExpandedItemIds] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [itemModalActiveTab, setItemModalActiveTab] = useState<number>(1);
  const [currentItem, setCurrentItem] = useState<ItemDto>({
    id: 0,
    companyId: 1,
    itemCode: '',
    itemName: '',
    itemType: 'منتج تام',
    unit: 'كجم',
    salePrice: 0,
    basePrice: 0,
    purchasePrice: 0,
    safetyStockLevel: 0,
    reorderPoint: 0,
    active: true,
    hasVariants: false,
    isComposite: false,
    unitsHierarchy: [],
    variants: []
  });

  // Category Modal State
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryDto>({
    id: 0,
    companyId: 1,
    categoryCode: '',
    categoryName: '',
    itemType: 'منتج تام',
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [itms, cats, depts] = await Promise.all([
        fetchItemsApi(),
        fetchItemCategoriesApi(),
        fetchItemDepartmentsApi()
      ]);
      setItems(itms);
      setCategories(cats);
      setDepartments(depts);
    } catch (err: any) {
      setErrorMessage(`تعذر جلب الأصناف: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchType = !selectedTypeFilter || i.itemType === selectedTypeFilter;
      const matchCategory = !selectedCategoryFilter || i.categoryId === selectedCategoryFilter;
      const matchDept = !selectedDeptFilter || i.departmentId === selectedDeptFilter;
      const matchSearch =
        !searchTerm.trim() ||
        i.itemName.includes(searchTerm) ||
        i.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.barcode && i.barcode.includes(searchTerm)) ||
        i.variants.some(v => v.variantName.includes(searchTerm) || v.variantCode.includes(searchTerm));
      return matchType && matchCategory && matchDept && matchSearch;
    });
  }, [items, selectedTypeFilter, selectedCategoryFilter, selectedDeptFilter, searchTerm]);

  const openCreateItemModal = () => {
    setCurrentItem({
      id: 0,
      companyId: 1,
      itemCode: `${Math.floor(100000 + Math.random() * 900000)}`,
      itemName: '',
      itemType: selectedTypeFilter || 'منتج تام',
      departmentId: departments[0]?.id,
      departmentName: departments[0]?.departmentName,
      unit: 'كجم',
      salePrice: 0,
      basePrice: 0,
      purchasePrice: 0,
      safetyStockLevel: 0,
      reorderPoint: 0,
      active: true,
      hasVariants: false,
      isComposite: false,
      unitsHierarchy: [],
      variants: []
    });
    setItemModalActiveTab(1);
    setIsItemModalOpen(true);
  };

  const editItem = (item: ItemDto) => {
    setCurrentItem({
      ...item,
      unitsHierarchy: item.unitsHierarchy ? [...item.unitsHierarchy] : [],
      variants: item.variants ? [...item.variants] : []
    });
    setItemModalActiveTab(1);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!currentItem.itemName.trim() || !currentItem.itemCode.trim()) {
      setErrorMessage('يرجى إدخال كود واسم الصنف بشكل صحيح.');
      return;
    }

    const dept = departments.find(d => d.id === currentItem.departmentId);
    const itemToSave = {
      ...currentItem,
      departmentName: dept?.departmentName || currentItem.departmentName
    };

    await saveItemApi(itemToSave);

    setItems(prev => {
      const idx = prev.findIndex(i => i.id === itemToSave.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = itemToSave as ItemDto;
        return next;
      }
      return [{ ...itemToSave, id: Date.now() } as ItemDto, ...prev];
    });

    setSuccessMessage(itemToSave.id > 0 ? 'تم تحديث بيانات الصنف ونكهاته بنجاح.' : 'تمت إضافة الصنف بالمنظومة.');
    setIsItemModalOpen(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleToggleStatus = (item: ItemDto) => {
    const updated = { ...item, active: !item.active };
    setItems(prev => prev.map(i => (i.id === item.id ? updated : i)));
    setSuccessMessage(`تم تغيير حالة الصنف إلى: ${updated.active ? 'مفعل' : 'معطل'}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSaveCategory = async () => {
    if (!currentCategory.categoryName.trim() || !currentCategory.categoryCode.trim()) return;

    await saveCategoryApi(currentCategory);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === currentCategory.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = currentCategory;
        return next;
      }
      return [...prev, { ...currentCategory, id: Date.now() }];
    });

    setCurrentCategory({
      id: 0,
      companyId: 1,
      categoryCode: '',
      categoryName: '',
      itemType: 'منتج تام',
      active: true
    });
    setSuccessMessage('تم حفظ التصنيف بنجاح.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'منتج تام': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'نصف مصنع': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'خامات': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'مواد تعبئة وتغليف': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة الشاملة */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-amber-500 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            <span>مركز إدارة الأصناف والمواد الشامل (Item Master Hub)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة موحدة لجميع الأصناف: منتجات تامة، نصف مصنع، خامات، مواد تعبئة، وحاويات التداول.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={openCreateItemModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة صنف جديد</span>
          </button>
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
          >
            <Tags className="w-4 h-4 text-amber-400" />
            <span>تصنيفات الأصناف</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            title="تحديث البيانات"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {/* التصفية السريعة بالكبسولات */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs mb-4 flex flex-wrap gap-2 items-center text-xs">
        <span className="font-bold text-slate-500 ml-2">التصفية السريعة:</span>
        <button
          onClick={() => setSelectedTypeFilter(null)}
          className={`px-3 py-1.5 rounded-full font-bold transition-all ${!selectedTypeFilter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          الكل ({items.length})
        </button>
        <button
          onClick={() => setSelectedTypeFilter('منتج تام')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all ${selectedTypeFilter === 'منتج تام' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'}`}
        >
          🍰 منتج تام ({items.filter(i => i.itemType === 'منتج تام').length})
        </button>
        <button
          onClick={() => setSelectedTypeFilter('نصف مصنع')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all ${selectedTypeFilter === 'نصف مصنع' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-amber-50 text-amber-800'}`}
        >
          🥣 نصف مصنع / خلطات ({items.filter(i => i.itemType === 'نصف مصنع').length})
        </button>
        <button
          onClick={() => setSelectedTypeFilter('خامات')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all ${selectedTypeFilter === 'خامات' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}
        >
          🌾 خامات ومستلزمات ({items.filter(i => i.itemType === 'خامات').length})
        </button>
        <button
          onClick={() => setSelectedTypeFilter('مواد تعبئة وتغليف')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all ${selectedTypeFilter === 'مواد تعبئة وتغليف' ? 'bg-cyan-600 text-white' : 'bg-cyan-50 text-cyan-800'}`}
        >
          📦 مواد تعبئة وتغليف ({items.filter(i => i.itemType === 'مواد تعبئة وتغليف').length})
        </button>
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بالاسم، الكود، الباركود، أو النكهة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(Number(e.target.value))}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value={0}>-- كل التصنيفات --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.categoryName}</option>
          ))}
        </select>

        <select
          value={selectedDeptFilter}
          onChange={(e) => setSelectedDeptFilter(Number(e.target.value))}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value={0}>-- كل الأقسام والصالات --</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.departmentName}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedTypeFilter(null);
            setSearchTerm('');
            setSelectedCategoryFilter(0);
            setSelectedDeptFilter(0);
          }}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
        >
          إلغاء الفلاتر
        </button>
      </div>

      {/* جدول الأصناف */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        <table className="w-full text-center">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="py-3 px-3">الكود</th>
              <th className="py-3 px-3 text-right">اسم الصنف</th>
              <th className="py-3 px-3">النوع</th>
              <th className="py-3 px-3">القسم / الصالة</th>
              <th className="py-3 px-3">الوحدة</th>
              <th className="py-3 px-3">سعر البيع</th>
              <th className="py-3 px-3">حد الأمان</th>
              <th className="py-3 px-3">الخصائص</th>
              <th className="py-3 px-3">الحالة</th>
              <th className="py-3 px-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map(item => (
              <React.Fragment key={item.id}>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{item.itemCode}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{item.itemName}</span>
                      {item.variants && item.variants.length > 0 && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-bold text-[10px] flex items-center gap-1"
                        >
                          {expandedItemIds.has(item.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          <span>نكهات ({item.variants.length})</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTypeBadge(item.itemType)}`}>
                      {item.itemType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-700">{item.departmentName || '-'}</td>
                  <td className="py-3 px-3 font-bold text-slate-700">{item.unit}</td>
                  <td className="py-3 px-3 font-mono font-black text-indigo-900">
                    {item.salePrice > 0 ? `${item.salePrice.toLocaleString()} ج.م` : '-'}
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-500">{item.safetyStockLevel}</td>
                  <td className="py-3 px-3">
                    {item.hasVariants && <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px] ml-1">متنوع</span>}
                    {item.unitsHierarchy.length > 0 && <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px]">وحدات متعددة</span>}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {item.active ? 'مفعل' : 'معطل'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => editItem(item)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2 py-1 rounded font-bold ${item.active ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      >
                        {item.active ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* التفريعات والنكهات */}
                {expandedItemIds.has(item.id) && item.variants && (
                  item.variants.map(v => (
                    <tr key={v.id} className="bg-slate-50/80 text-gray-600">
                      <td className="py-2 px-3 font-mono text-indigo-500 font-bold">↳ {v.variantCode}</td>
                      <td className="py-2 px-3 text-right font-medium">
                        <span className="font-bold text-gray-800">{v.variantName}</span>
                        {v.barcode && <span className="font-mono text-[10px] text-gray-400 mr-2 bg-white px-1.5 py-0.5 rounded border">باركود: {v.barcode}</span>}
                      </td>
                      <td className="py-2 px-3"><span className="text-[10px] bg-white px-2 py-0.5 rounded border">نكهة / مقاس</span></td>
                      <td className="py-2 px-3 text-gray-400">{item.departmentName}</td>
                      <td className="py-2 px-3">{item.unit}</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                        {v.priceOverride ? `${v.priceOverride.toLocaleString()} ج.م` : `${item.salePrice.toLocaleString()} ج.م`}
                      </td>
                      <td colSpan={4} className="text-gray-400 text-right pr-4">فرع تابع لـ ({item.itemName})</td>
                    </tr>
                  ))
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* نافذة الصنف الكبرى التفاعلية ذات التبويبات الأربعة */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>{currentItem.id > 0 ? `تعديل الصنف: ${currentItem.itemName}` : 'إضافة صنف جديد إلى المنظومة'}</span>
              </h4>
              <button onClick={() => setIsItemModalOpen(false)} className="text-white/80 hover:text-white font-bold text-base">×</button>
            </div>

            {/* شريط التبويبات الأربعة */}
            <div className="flex border-b border-gray-200 bg-slate-100 px-5 pt-2 gap-2 shrink-0">
              <button
                onClick={() => setItemModalActiveTab(1)}
                className={`py-2 px-3 font-bold border-b-2 transition-all ${itemModalActiveTab === 1 ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-600'}`}
              >
                1. البيانات الأساسية والتصنيف
              </button>
              <button
                onClick={() => setItemModalActiveTab(2)}
                className={`py-2 px-3 font-bold border-b-2 transition-all ${itemModalActiveTab === 2 ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-600'}`}
              >
                2. منظومة الوحدات والأوزان ({currentItem.unitsHierarchy.length})
              </button>
              <button
                onClick={() => setItemModalActiveTab(3)}
                className={`py-2 px-3 font-bold border-b-2 transition-all ${itemModalActiveTab === 3 ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-600'}`}
              >
                3. الأرصدة والتسعير
              </button>
              <button
                onClick={() => setItemModalActiveTab(4)}
                className={`py-2 px-3 font-bold border-b-2 transition-all ${itemModalActiveTab === 4 ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-600'}`}
              >
                4. النكهات والمقاسات ({currentItem.variants.length})
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* تبويب 1 */}
              {itemModalActiveTab === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">كود الصنف *</label>
                      <input
                        type="text"
                        value={currentItem.itemCode}
                        onChange={(e) => setCurrentItem({ ...currentItem, itemCode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-700 font-bold mb-1">اسم الصنف الكامل *</label>
                      <input
                        type="text"
                        placeholder="مثال: بسبوسة سادة / دقيق فاخر"
                        value={currentItem.itemName}
                        onChange={(e) => setCurrentItem({ ...currentItem, itemName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">نوع الصنف في دورة الإنتاج *</label>
                      <select
                        value={currentItem.itemType}
                        onChange={(e) => setCurrentItem({ ...currentItem, itemType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                      >
                        <option value="منتج تام">🍰 منتج تام (حلويات وتام)</option>
                        <option value="نصف مصنع">🥣 نصف مصنع / خلطات وتجهيزات</option>
                        <option value="خامات">🌾 خامات ومستلزمات</option>
                        <option value="مواد تعبئة وتغليف">📦 مواد تعبئة وتغليف</option>
                        <option value="أصول / حاويات تداول">🛒 أصول / حاويات تداول</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">القسم / الصالة المسؤولة *</label>
                      <select
                        value={currentItem.departmentId}
                        onChange={(e) => setCurrentItem({ ...currentItem, departmentId: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.departmentName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">التصنيف</label>
                      <select
                        value={currentItem.categoryId}
                        onChange={(e) => setCurrentItem({ ...currentItem, categoryId: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.categoryName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">الباركود الرئيسي</label>
                    <input
                      type="text"
                      value={currentItem.barcode || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, barcode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                    />
                  </div>
                </div>
              )}

              {/* تبويب 2 */}
              {itemModalActiveTab === 2 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800 block">الوحدة الأساسية للمخزون:</span>
                      <span className="text-gray-500">أصغر وحدة يتعامل بها الجرد وحساب التكاليف</span>
                    </div>
                    <input
                      type="text"
                      value={currentItem.unit}
                      onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                      className="px-3 py-2 border rounded-xl font-bold text-center w-32"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">جدول الوحدات البديلة والتحويلات:</span>
                    <button
                      type="button"
                      onClick={() => setCurrentItem({
                        ...currentItem,
                        unitsHierarchy: [...currentItem.unitsHierarchy, { unitName: '', conversionFactor: 12 }]
                      })}
                      className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px]"
                    >
                      + إضافة وحدة بديلة
                    </button>
                  </div>

                  {currentItem.unitsHierarchy.map((u, i) => (
                    <div key={i} className="flex gap-2 items-center bg-white p-2 border rounded-xl">
                      <input
                        type="text"
                        placeholder="اسم الوحدة (مثال: كرتونة)"
                        value={u.unitName}
                        onChange={(e) => {
                          const arr = [...currentItem.unitsHierarchy];
                          arr[i].unitName = e.target.value;
                          setCurrentItem({ ...currentItem, unitsHierarchy: arr });
                        }}
                        className="flex-1 px-2 py-1 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="معامل التحويل"
                        value={u.conversionFactor}
                        onChange={(e) => {
                          const arr = [...currentItem.unitsHierarchy];
                          arr[i].conversionFactor = Number(e.target.value);
                          setCurrentItem({ ...currentItem, unitsHierarchy: arr });
                        }}
                        className="w-28 px-2 py-1 border rounded text-center font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const arr = currentItem.unitsHierarchy.filter((_, idx) => idx !== i);
                          setCurrentItem({ ...currentItem, unitsHierarchy: arr });
                        }}
                        className="text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* تبويب 3 */}
              {itemModalActiveTab === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">سعر البيع الافتراضي (ج.م)</label>
                    <input
                      type="number"
                      value={currentItem.salePrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, salePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-black text-emerald-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">سعر الشراء / التكلفة (ج.م)</label>
                    <input
                      type="number"
                      value={currentItem.purchasePrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, purchasePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">حد الأمان (Safety Stock)</label>
                    <input
                      type="number"
                      value={currentItem.safetyStockLevel}
                      onChange={(e) => setCurrentItem({ ...currentItem, safetyStockLevel: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-bold text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">نقطة إعادة الطلب</label>
                    <input
                      type="number"
                      value={currentItem.reorderPoint}
                      onChange={(e) => setCurrentItem({ ...currentItem, reorderPoint: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-bold text-amber-600"
                    />
                  </div>
                </div>
              )}

              {/* تبويب 4 */}
              {itemModalActiveTab === 4 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">جدول النكهات والأصناف المتنوعة (Variants):</span>
                    <button
                      type="button"
                      onClick={() => {
                        const count = currentItem.variants.length + 1;
                        setCurrentItem({
                          ...currentItem,
                          hasVariants: true,
                          variants: [
                            ...currentItem.variants,
                            {
                              id: Date.now(),
                              variantCode: `${currentItem.itemCode}-${count.toString().padStart(2, '0')}`,
                              variantName: '',
                              priceOverride: currentItem.salePrice
                            }
                          ]
                        });
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px]"
                    >
                      + إضافة نكهة / مقاس
                    </button>
                  </div>

                  {currentItem.variants.map((v, i) => (
                    <div key={v.id || i} className="flex gap-2 items-center bg-white p-2 border rounded-xl">
                      <input
                        type="text"
                        value={v.variantCode}
                        onChange={(e) => {
                          const arr = [...currentItem.variants];
                          arr[i].variantCode = e.target.value;
                          setCurrentItem({ ...currentItem, variants: arr });
                        }}
                        className="w-28 px-2 py-1 border rounded font-mono text-center"
                      />
                      <input
                        type="text"
                        placeholder="اسم النكهة أو المقاس"
                        value={v.variantName}
                        onChange={(e) => {
                          const arr = [...currentItem.variants];
                          arr[i].variantName = e.target.value;
                          setCurrentItem({ ...currentItem, variants: arr });
                        }}
                        className="flex-1 px-2 py-1 border rounded font-bold"
                      />
                      <input
                        type="number"
                        placeholder="سعر خاص"
                        value={v.priceOverride || ''}
                        onChange={(e) => {
                          const arr = [...currentItem.variants];
                          arr[i].priceOverride = Number(e.target.value);
                          setCurrentItem({ ...currentItem, variants: arr });
                        }}
                        className="w-24 px-2 py-1 border rounded font-mono text-center text-emerald-700 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const arr = currentItem.variants.filter((_, idx) => idx !== i);
                          setCurrentItem({ ...currentItem, variants: arr, hasVariants: arr.length > 0 });
                        }}
                        className="text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
              >
                حفظ الصنف وتحديث المنظومة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إدارة التصنيفات */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Tags className="w-4 h-4 text-amber-400" />
                <span>إدارة تصنيفات الأصناف والمواد</span>
              </h4>
              <button onClick={() => setIsCategoriesModalOpen(false)} className="text-white">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="كود التصنيف"
                  value={currentCategory.categoryCode}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, categoryCode: e.target.value })}
                  className="w-28 px-3 py-2 border rounded-xl font-mono font-bold"
                />
                <input
                  type="text"
                  placeholder="اسم التصنيف (مثال: حلويات شرقية)"
                  value={currentCategory.categoryName}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, categoryName: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-xl font-bold"
                />
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-amber-500 font-bold text-slate-950 rounded-xl"
                >
                  إضافة
                </button>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-center">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="py-2 px-3">الكود</th>
                      <th className="py-2 px-3 text-right">اسم التصنيف</th>
                      <th className="py-2 px-3">النوع</th>
                      <th className="py-2 px-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td className="py-2 px-3 font-mono font-bold">{c.categoryCode}</td>
                        <td className="py-2 px-3 text-right font-bold">{c.categoryName}</td>
                        <td className="py-2 px-3">{c.itemType}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700">مفعل</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t text-left">
              <button
                type="button"
                onClick={() => setIsCategoriesModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
