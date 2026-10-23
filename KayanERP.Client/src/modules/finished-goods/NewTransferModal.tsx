import React, { useState } from 'react';
import { X, Save, AlertCircle, Truck } from 'lucide-react';
import type { FinishedGoodsTransferRecord } from './finishedGoodsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: FinishedGoodsTransferRecord) => void;
}

export const NewTransferModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [productionBatchNo, setProductionBatchNo] = useState('BATCH-2026-095');
  const [itemName, setItemName] = useState('بسبوسة مكسرات لوكس سمن بلدي');
  const [fromSection, setFromSection] = useState('صالة تصنيع الحلويات الشرقية');
  const [toDestination, setToDestination] = useState('المعرض الرئيسي (صالة العرض)');
  const [quantityTransferred, setQuantityTransferred] = useState<number>(10);
  const [unit, setUnit] = useState('صينية مقاس 50');
  const [crateCount, setCrateCount] = useState<number>(10);
  const [chefName, setChefName] = useState('الشيف سمير إبراهيم');
  const [receiverName, setReceiverName] = useState('مشرف المعرض الرئيسي');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityTransferred <= 0) {
      setError('يجب أن تكون الكمية المحولة أكبر من الصفر');
      return;
    }

    const newRecord: FinishedGoodsTransferRecord = {
      id: Date.now(),
      transferNumber: `TRN-FG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      productionBatchNo,
      itemName,
      itemCode: itemName.includes('تورتة') ? 'PRD-201' : 'PRD-101',
      fromSection,
      toDestination,
      quantityTransferred: Number(quantityTransferred),
      unit,
      crateCount: Number(crateCount),
      status: 'تم التسليم والمعاينة',
      chefName,
      receiverName,
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">تحرير إذن تسليم وتحويل منتج تام</h2>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">رقم أمر الطبخة / التشغيلة *</label>
              <input
                type="text"
                required
                value={productionBatchNo}
                onChange={(e) => setProductionBatchNo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-indigo-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">صنف المنتج التام *</label>
              <select
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  if (e.target.value.includes('تورتة')) setUnit('قطعة (تورتة)');
                  else if (e.target.value.includes('بسبوسة')) setUnit('صينية مقاس 50');
                  else setUnit('كيلو');
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900"
              >
                <option value="بسبوسة مكسرات لوكس سمن بلدي">بسبوسة مكسرات لوكس سمن بلدي</option>
                <option value="كنافة أساور نوتيلا وبندق">كنافة أساور نوتيلا وبندق</option>
                <option value="تورتة شوكولاتة كروكانت مقاس 26">تورتة شوكولاتة كروكانت مقاس 26</option>
                <option value="جاتوه سواريه مشكل فاخر">جاتوه سواريه مشكل فاخر</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">صالة الإنتاج المصدرة *</label>
              <select
                value={fromSection}
                onChange={(e) => setFromSection(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900"
              >
                <option value="صالة تصنيع الحلويات الشرقية">صالة تصنيع الحلويات الشرقية</option>
                <option value="صالة الحلويات الغربية والتورت">صالة الحلويات الغربية والتورت</option>
                <option value="صالة الأفران والمخبوزات">صالة الأفران والمخبوزات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الوجهة المستلمة *</label>
              <select
                value={toDestination}
                onChange={(e) => setToDestination(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900"
              >
                <option value="المعرض الرئيسي (صالة العرض)">المعرض الرئيسي (صالة العرض)</option>
                <option value="فرع دكرنس">فرع دكرنس</option>
                <option value="فرع شربين">فرع شربين</option>
                <option value="فرع منية النصر">فرع منية النصر</option>
                <option value="سيارة التوزيع 01 (خط دكرنس)">سيارة التوزيع 01 (خط دكرنس)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الكمية المسلمة *</label>
              <input
                type="number"
                min="1"
                required
                value={quantityTransferred}
                onChange={(e) => setQuantityTransferred(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold text-center text-indigo-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">وحدة التسليم</label>
              <input
                type="text"
                disabled
                value={unit}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-center font-semibold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">عدد الصواني / الأسبات</label>
              <input
                type="number"
                min="1"
                value={crateCount}
                onChange={(e) => setCrateCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الشيف المسلم</label>
              <input
                type="text"
                value={chefName}
                onChange={(e) => setChefName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المستلم المعتمد</label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>اعتماد إذن التسليم</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
