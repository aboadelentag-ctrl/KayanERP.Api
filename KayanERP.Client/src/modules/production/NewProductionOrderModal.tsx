import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Factory, Layers, Flame } from 'lucide-react';
import type { ProductionOrder, RequiredMaterial } from './productionApi';
import type { Recipe } from '../recipes/recipesApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: ProductionOrder) => void;
}

export const NewProductionOrderModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(1);
  const [plannedQty, setPlannedQty] = useState<number>(50);
  const [shift, setShift] = useState<'وردية صباحية' | 'وردية مسائية' | 'وردية ليلية'>('وردية صباحية');
  const [assignedChef, setAssignedChef] = useState<string>('الشيف سمير إبراهيم');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const recData = JSON.parse(localStorage.getItem('kayan_recipes_data') || '[]');
      setRecipes(recData);
      if (recData.length > 0) {
        setSelectedRecipeId(recData[0].id);
        setPlannedQty(recData[0].batchYield || 25);
      }
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRecipe = recipes.find((r) => r.id === Number(selectedRecipeId));

  const multiplier = currentRecipe && currentRecipe.batchYield > 0 ? plannedQty / currentRecipe.batchYield : 1;

  const explodedMaterials: RequiredMaterial[] = (currentRecipe?.ingredients || []).map((ing) => {
    const rawQty = ing.quantity * multiplier;
    const withWaste = rawQty * (1 + (ing.wastePercentage || 0) / 100);
    const finalQty = Math.round(withWaste * 100) / 100;
    return {
      ingredientName: ing.ingredientName,
      requiredQuantity: finalQty,
      unit: ing.unit,
      unitCost: ing.costPerUnit,
      totalCost: Math.round(finalQty * ing.costPerUnit),
    };
  });

  const estimatedCost = explodedMaterials.reduce((sum, item) => sum + item.totalCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecipe) {
      setError('يرجى اختيار وصفة تصنيع صالحة');
      return;
    }
    if (plannedQty <= 0) {
      setError('يجب تحديد كمية إنتاج صالحة');
      return;
    }

    const newOrder: ProductionOrder = {
      id: Date.now(),
      orderNumber: `PRD-ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      recipeId: currentRecipe.id,
      recipeCode: currentRecipe.code,
      productName: currentRecipe.name,
      plannedQuantity: Number(plannedQty),
      producedQuantity: 0,
      unit: currentRecipe.yieldUnit,
      shift,
      assignedChef,
      status: 'قيد التجهيز والخبز',
      estimatedCost,
      actualCost: 0,
      requiredMaterials: explodedMaterials,
    };

    onSave(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">إصدار أمر تشغيل معمل وتصنيع جديد</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">وصفة ومعادلة التصنيع (BOM) *</label>
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-semibold"
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الكمية المستهدف إنتاجها بالمعمل</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold font-mono text-center"
                />
                <span className="text-xs font-semibold text-gray-500 shrink-0">
                  {currentRecipe?.yieldUnit || 'كيلو'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">وردية التشغيل</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              >
                <option value="وردية صباحية">وردية صباحية (06:00 ص - 02:00 م)</option>
                <option value="وردية مسائية">وردية مسائية (02:00 م - 10:00 م)</option>
                <option value="وردية ليلية">وردية ليلية (10:00 م - 06:00 ص)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">شيف الصالة / مسؤول الخط</label>
              <input
                type="text"
                required
                value={assignedChef}
                onChange={(e) => setAssignedChef(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              />
            </div>
          </div>

          <div className="border border-indigo-100 rounded-xl overflow-hidden bg-slate-50/50">
            <div className="bg-indigo-50/80 px-4 py-2.5 flex items-center justify-between border-b border-indigo-100">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>الخامات المخصومة تلقائياً للتشغيل (إذن سحب خامات معمل)</span>
              </span>
              <span className="text-xs font-mono text-indigo-700 font-bold">
                إجمالي تكلفة الخامات: {estimatedCost.toLocaleString()} ج.م
              </span>
            </div>

            <div className="divide-y divide-gray-100 p-2">
              {explodedMaterials.map((mat, idx) => (
                <div key={idx} className="p-2 flex items-center justify-between text-xs">
                  <div className="font-semibold text-gray-800">{mat.ingredientName}</div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-indigo-700 font-bold">
                      {mat.requiredQuantity} {mat.unit}
                    </span>
                    <span className="text-gray-400">× {mat.unitCost} ج.م</span>
                    <span className="font-bold text-gray-900 w-20 text-left">
                      {mat.totalCost.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Flame className="w-4 h-4" />
              <span>إطلاق أمر التشغيل للمعمل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
