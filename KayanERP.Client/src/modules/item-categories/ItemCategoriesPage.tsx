import React, { useState, useEffect, useMemo } from 'react';
import {
  Tags,
  PlusCircle,
  Search,
  CheckCircle2,
  RotateCw,
  Edit2,
  AlertCircle,
  FolderTree
} from 'lucide-react';
import {
  fetchItemCategoriesApi,
  fetchCompaniesLookupApi,
  saveItemCategoryApi,
  toggleCategoryStatusApi
} from './itemCategoriesApi';
import type {
  ItemCategoryDto,
  CompanyDropdownDto
} from './itemCategoriesApi';

export const ItemCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ItemCategoryDto[]>([]);
  const [companiesList, setCompaniesList] = useState<CompanyDropdownDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [currentCategory, setCurrentCategory] = useState<ItemCategoryDto>({
    id: 0,
    companyId: 1,
    categoryName: '',
    categoryCode: '',
    itemType: 'منتج تام',
    description: '',
    active: true
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [cats, comps] = await Promise.all([
        fetchItemCategoriesApi(),
        fetchCompaniesLookupApi()
      ]);
      setCategories(cats);
      setCompaniesList(comps);
      if (comps.length > 0 && currentCategory.companyId === 0) {
        setCurrentCategory(prev => ({ ...prev, companyId: comps[0].id }));
      }
    } catch (ex: any) {
      setErrorMessage(`خطأ في الاتصال: ${ex.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(c =>
      c.categoryName.toLowerCase().includes(term) ||
      c.categoryCode.toLowerCase().includes(term) ||
      c.itemType.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  const resetForm = () => {
    setCurrentCategory({
      id: 0,
      companyId: companiesList[0]?.id || 1,
      categoryName: '',
      categoryCode: '',
      itemType: 'منتج تام',
      description: '',
      active: true
    });
    setIsEditMode(false);
    setErrorMessage(null);
  };

  const handleEdit = (cat: ItemCategoryDto) => {
    setCurrentCategory({ ...cat });
    setIsEditMode(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (currentCategory.companyId === 0) {
      setErrorMessage('الرجاء اختيار الشركة أولاً.');
      return;
    }

    if (!currentCategory.categoryName.trim() || !currentCategory.categoryCode.trim() || !currentCategory.itemType.trim()) {
      setErrorMessage('الرجاء إدخال الكود والاسم ونوع التصنيف.');
      return;
    }

    setIsProcessing(true);
    try {
      await saveItemCategoryApi(currentCategory, isEditMode);

      setCategories(prev => {
        if (isEditMode) {
          return prev.map(c => (c.id === currentCategory.id ? { ...currentCategory } : c));
        }
        return [{ ...currentCategory, id: Date.now() }, ...prev];
      });

      setSuccessMessage('✅ تم حفظ التصنيف بنجاح!');
      resetForm();
    } catch (ex: any) {
      setErrorMessage(`خطأ: ${ex.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (cat: ItemCategoryDto) => {
    await toggleCategoryStatusApi(cat.id);
    setCategories(prev =>
      prev.map(c => (c.id === cat.id ? { ...c, active: !c.active } : c))
    );
    setSuccessMessage(`تم تغيير حالة التصنيف [${cat.categoryName}] بنجاح.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'منتج تام': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'نصف مصنع': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'خامات': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'مواد تعبئة وتغليف': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'أصول / حاويات تداول': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-amber-500 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Tags className="w-6 h-6 text-amber-600" />
            <span>تصنيفات ومجموعات الأصناف (Item Categories & Taxonomies)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة مجموعات وتصنيفات المواد الخام والمنتجات التامة والوسيطة ومواد التعبئة لمصانع الحلويات.
          </p>
        </div>

        <button
          onClick={loadAll}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
        >
          <RotateCw className="w-4 h-4 text-amber-600" />
          <span>تحديث</span>
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-600" />{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* نموذج الإضافة / التعديل */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="bg-amber-500 text-slate-950 p-3.5 font-black flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderTree className="w-4 h-4" />
                <span>{isEditMode ? '✏️ تعديل بيانات التصنيف' : '➕ إضافة تصنيف جديد'}</span>
              </span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs bg-slate-950 text-white px-2 py-0.5 rounded font-bold"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3 bg-slate-50">
              <div>
                <label className="block text-gray-700 font-bold mb-1">الشركة التابع لها التصنيف *</label>
                <select
                  value={currentCategory.companyId}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, companyId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                >
                  <option value={0}>-- اختر الشركة --</option>
                  {companiesList.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">كود التصنيف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: CAT-01"
                  value={currentCategory.categoryCode}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, categoryCode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم التصنيف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خامات التعبئة / حلويات شرقية"
                  value={currentCategory.categoryName}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, categoryName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">نوع الأصناف في هذا التصنيف *</label>
                <select
                  value={currentCategory.itemType}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, itemType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                >
                  <option value="">-- اختر النوع --</option>
                  <option value="منتج تام">🍰 منتج تام (حلويات وتام)</option>
                  <option value="نصف مصنع">🥣 نصف مصنع / خلطات وتجهيزات</option>
                  <option value="خامات">🌾 خامات ومستلزمات أولية</option>
                  <option value="مواد تعبئة وتغليف">📦 مواد تعبئة وتغليف</option>
                  <option value="أصول / حاويات تداول">🛒 أصول / حاويات تداول (أسبات وصواني)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">الوصف / ملاحظات</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات توضيحية عن التصنيف..."
                  value={currentCategory.description || ''}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCat"
                  checked={currentCategory.active}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, active: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-400"
                />
                <label htmlFor="isActiveCat" className="font-bold text-gray-700 select-none cursor-pointer">
                  التصنيف مفعل ومتاح للاستخدام في المنظومة
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xs transition-colors disabled:opacity-50 mt-2"
              >
                {isProcessing ? '⏳ جاري الحفظ...' : isEditMode ? '💾 حفظ التعديلات' : '➕ إضافة التصنيف'}
              </button>
            </form>
          </div>
        </div>

        {/* جدول العرض */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="p-3.5 bg-white border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
              <span className="font-bold text-gray-800">سجل التصنيفات المسجلة ({filteredCategories.length})</span>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث بالاسم، الكود، أو النوع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none"
                />
              </div>
            </div>

            <table className="w-full text-center">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-2.5 px-3">الكود</th>
                  <th className="py-2.5 px-3 text-right">اسم التصنيف</th>
                  <th className="py-2.5 px-3">النوع المرتبط</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 font-bold">
                      جاري تحميل التصنيفات...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 font-bold">
                      لا توجد تصنيفات مطابقة للبحث.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map(cat => (
                    <tr key={cat.id} className={`hover:bg-slate-50 ${cat.active ? '' : 'bg-slate-50/60 opacity-70'}`}>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{cat.categoryCode}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                        {cat.categoryName}
                        {cat.description && <span className="block text-[10px] text-gray-400 font-normal">{cat.description}</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadge(cat.itemType)}`}>
                          {cat.itemType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {cat.active ? 'مفعل' : 'موقوف'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            className={`px-2 py-1 rounded font-bold ${cat.active ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                          >
                            {cat.active ? 'إيقاف' : 'تفعيل'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
