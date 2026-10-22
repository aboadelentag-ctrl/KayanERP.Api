import React, { useState } from 'react';
import { X, Save, AlertCircle, ArrowRightLeft } from 'lucide-react';
import type { UomConversionRule } from './itemHierarchyApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: UomConversionRule) => void;
}

export const UomConversionModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [itemName, setItemName] = useState('');
  const [baseUnit, setBaseUnit] = useState('كيلو');
  const [alternateUnit, setAlternateUnit] = useState('شيكارة');
  const [conversionFactor, setConversionFactor] = useState<number>(50);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setError('يرجى كتابة اسم الصنف');
      return;
    }
    if (conversionFactor <= 0) {
      setError('يجب أن يكون معامل التحويل أكبر من الصفر');
      return;
    }

    const newRule: UomConversionRule = {
      id: Date.now(),
      itemId: Math.floor(100 + Math.random() * 900),
      itemCode: `ITM-${Math.floor(100 + Math.random() * 900)}`,
      itemName,
      baseUnit,
      alternateUnit,
      conversionFactor: Number(conversionFactor),
      operation: 'ضرب',
      notes: notes || `1 ${alternateUnit} = ${conversionFactor} ${baseUnit}`,
    };

    onSave(newRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">إضافة قاعدة تحويل وحدات قياس (UOM)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الصنف (خام أو منتج تام) *</label>
            <input
              type="text"
              required
              placeholder="مثال: فستق حلبي مقشر"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الوحدة البديلة (الكبرى / البيعية)</label>
              <input
                type="text"
                required
                placeholder="مثال: كرتونة / شيكارة / دستة"
                value={alternateUnit}
                onChange={(e) => setAlternateUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الوحدة الأساسية (المخزنية)</label>
              <select
                value={baseUnit}
                onChange={(e) => setBaseUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium"
              >
                <option value="كيلو">كيلوجرام (كجم)</option>
                <option value="قطعة">قطعة</option>
                <option value="جرام">جرام</option>
                <option value="لتر">لتر</option>
              </select>
            </div>
          </div>

          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-indigo-950 font-bold block">معامل التحويل الرياضي:</span>
              <span className="text-[11px] text-gray-500 block">
                1 {alternateUnit || 'وحدة بديلة'} تحتوي على كم {baseUnit}؟
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs font-bold text-indigo-900">=</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={conversionFactor}
                onChange={(e) => setConversionFactor(Number(e.target.value))}
                className="w-24 px-2 py-1.5 bg-white border border-indigo-300 rounded-lg text-center font-bold text-indigo-700 text-sm"
              />
              <span className="text-xs text-gray-600 font-semibold">{baseUnit}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات وقواعد التعبئة</label>
            <input
              type="text"
              placeholder="مثال: تُوزن الصينية ممتلئة قبل التسليم للفرع"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>حفظ معادلة التحويل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
