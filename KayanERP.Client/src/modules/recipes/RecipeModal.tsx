import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Calculator, AlertCircle, ChefHat } from 'lucide-react';
import type { Recipe, RecipeIngredient } from './recipesApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialData?: Recipe | null;
}

export const RecipeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Recipe>>({
    code: '',
    name: '',
    category: 'حلويات شرقية',
    batchYield: 20,
    yieldUnit: 'كيلو',
    status: 'معتمدة',
    notes: '',
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIngredients(initialData.ingredients || []);
    } else {
      setFormData({
        code: `RCP-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        category: 'حلويات شرقية',
        batchYield: 20,
        yieldUnit: 'كيلو',
        status: 'معتمدة',
        notes: '',
      });
      setIngredients([
        { id: 1, ingredientName: 'سميد فاخر', quantity: 10, unit: 'كيلو', costPerUnit: 28, totalCost: 280, wastePercentage: 2 },
        { id: 2, ingredientName: 'سمن بلدي بقري', quantity: 4, unit: 'كيلو', costPerUnit: 240, totalCost: 960, wastePercentage: 1 },
      ]);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const totalBatchCost = ingredients.reduce((sum, item) => sum + item.totalCost, 0);
  const yieldQty = formData.batchYield && formData.batchYield > 0 ? formData.batchYield : 1;
  const costPerUnit = Math.round((totalBatchCost / yieldQty) * 100) / 100;

  const handleAddIngredient = () => {
    const newId = Date.now();
    setIngredients([
      ...ingredients,
      {
        id: newId,
        ingredientName: '',
        quantity: 1,
        unit: 'كيلو',
        costPerUnit: 50,
        totalCost: 50,
        wastePercentage: 2,
      },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    const target = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'costPerUnit') {
      const q = field === 'quantity' ? Number(value) : target.quantity;
      const c = field === 'costPerUnit' ? Number(value) : target.costPerUnit;
      target.totalCost = q * c;
    }

    updated[index] = target;
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('يرجى كتابة اسم الصنف المراد تصنيعه');
      return;
    }
    if (ingredients.length === 0) {
      setError('يجب تحديد خامة واحدة على الأقل في الوصفة');
      return;
    }

    const payload: Recipe = {
      id: formData.id || Date.now(),
      code: formData.code || `RCP-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      category: formData.category || 'حلويات شرقية',
      batchYield: Number(formData.batchYield) || 1,
      yieldUnit: formData.yieldUnit || 'كيلو',
      totalBatchCost,
      costPerUnit,
      status: formData.status || 'معتمدة',
      notes: formData.notes || '',
      ingredients,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">
              {initialData ? 'تعديل معادلة ووصفة التصنيع (BOM)' : 'إعداد معادلة تصنيع جديدة'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">كود المعادلة</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">التصنيف الصناعي</label>
              <select
                value={formData.category || 'حلويات شرقية'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              >
                <option value="حلويات شرقية">حلويات شرقية</option>
                <option value="حلويات غربية">حلويات غربية</option>
                <option value="نواشف ومخبوزات">نواشف ومخبوزات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">حالة الاعتماد</label>
              <select
                value={formData.status || 'معتمدة'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-semibold"
              >
                <option value="معتمدة">معتمدة للتشغيل الفوري</option>
                <option value="قيد الاختبار والتطوير">قيد الاختبار والتطوير</option>
                <option value="مسودة">مسودة أولية</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الصنف النهائي المراد إنتاجه *</label>
              <input
                type="text"
                required
                placeholder="مثال: بسبوسة مكسرات لوكس"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">ناتج الطبخة/العجنة</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={formData.batchYield || 1}
                  onChange={(e) => setFormData({ ...formData, batchYield: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold font-mono text-center"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-semibold text-gray-600 mb-1">الوحدة</label>
                <select
                  value={formData.yieldUnit || 'كيلو'}
                  onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
                >
                  <option value="كيلو">كيلو</option>
                  <option value="قطعة">قطعة</option>
                  <option value="طبق">طبق</option>
                  <option value="صينية">صينية</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden mt-3">
            <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700">الخامات الداخلة في المعيار (BOM Items)</span>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة خامة</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {ingredients.map((item, idx) => (
                <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="اسم الخامة (سكر، سمن...)"
                      value={item.ingredientName}
                      onChange={(e) => handleUpdateIngredient(idx, 'ingredientName', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.01"
                        step="0.05"
                        value={item.quantity}
                        onChange={(e) => handleUpdateIngredient(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center font-bold font-mono"
                      />
                      <span className="text-gray-400">{item.unit}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.5"
                      value={item.costPerUnit}
                      onChange={(e) => handleUpdateIngredient(idx, 'costPerUnit', e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center font-mono"
                      title="سعر تكلفة الوحدة"
                    />
                  </div>

                  <div className="col-span-1">
                    <input
                      type="number"
                      min="0"
                      value={item.wastePercentage}
                      onChange={(e) => handleUpdateIngredient(idx, 'wastePercentage', e.target.value)}
                      className="w-full px-1.5 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-center font-mono text-rose-700"
                      title="نسبة الهادر الطبيعي %"
                    />
                  </div>

                  <div className="col-span-2 text-left font-bold font-mono text-gray-900">
                    {item.totalCost.toLocaleString()} ج.م
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-700" />
              <div>
                <span className="text-xs text-gray-600 block">تكلفة خامات الطبخة الإجمالية:</span>
                <span className="text-lg font-bold font-mono text-indigo-900">{totalBatchCost.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="bg-white border border-indigo-200 px-4 py-2 rounded-xl text-center shadow-xs">
              <span className="text-[11px] text-indigo-700 block font-semibold">التكلفة المعيارية لكل {formData.yieldUnit || 'كيلو'}:</span>
              <span className="text-xl font-black font-mono text-indigo-700">{costPerUnit} ج.م</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">إرشادات الشيف والتحضير</label>
            <textarea
              rows={2}
              placeholder="تعليمات التسوية، التبريد، الصواني..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>حفظ واعتماد المعادلة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
