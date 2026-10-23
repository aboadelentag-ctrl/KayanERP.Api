import React, { useState } from 'react';
import { X, Save, AlertCircle, CheckSquare } from 'lucide-react';
import type { MaterialReceiptInspection } from './materialReceiptApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (receipt: MaterialReceiptInspection) => void;
}

export const NewReceiptModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [poNumber, setPoNumber] = useState('PO-2026-108');
  const [supplierName, setSupplierName] = useState('شركة مطاحن الدلتا والصعيد');
  const [materialName, setMaterialName] = useState('');
  const [batchNumber, setBatchNumber] = useState(`LOT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [quantityReceived, setQuantityReceived] = useState<number>(100);
  const [unit, setUnit] = useState('كيلو');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [truckTemperatureCelsius, setTruckTemperatureCelsius] = useState<number>(20);
  const [packagingCondition, setPackagingCondition] = useState<MaterialReceiptInspection['packagingCondition']>('سليم ومحكم الإغلاق');
  const [labTestResult, setLabTestResult] = useState<MaterialReceiptInspection['labTestResult']>('مطابق للمواصفات القياسية');
  const [inspectorName, setInspectorName] = useState('د. مينا عادل (مسؤول جودة الأغذية)');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) {
      setError('يرجى تحديد اسم الخامة المستلمة');
      return;
    }
    if (quantityReceived <= 0) {
      setError('يجب أن تكون الكمية المستلمة أكبر من الصفر');
      return;
    }

    let status: MaterialReceiptInspection['status'] = 'معتمد ومستلم بالمخزن';
    if (labTestResult === 'تحت الفحص المعملي') status = 'معلق تحت الفحص';
    if (labTestResult === 'مرفوض ملوث / غير مطابق') status = 'مرفوض ومرتجع للمورد';

    const newReceipt: MaterialReceiptInspection = {
      id: Date.now(),
      receiptNumber: `REC-QC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      poNumber,
      supplierName,
      materialName,
      batchNumber,
      receivedDate: new Date().toISOString().slice(0, 10),
      expiryDate,
      quantityReceived: Number(quantityReceived),
      unit,
      truckTemperatureCelsius: Number(truckTemperatureCelsius),
      packagingCondition,
      labTestResult,
      inspectorName,
      status,
      notes: notes || 'فحص استلام ظاهري ومعملي مطابق',
    };

    onSave(newReceipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">تحرير محضر فحص واستلام خامات (GMP Inspection)</h2>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المورد المعتمد *</label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">رقم أمر الشراء المرتبط (PO)</label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الخامة الموردة *</label>
              <input
                type="text"
                required
                placeholder="مثال: سمن بلدي طبيعي / فستق / دقيق فاخر"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">رقم اللوط / التشغيلة *</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-indigo-700 text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الكمية المستلمة *</label>
              <input
                type="number"
                min="1"
                required
                value={quantityReceived}
                onChange={(e) => setQuantityReceived(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">وحدة القياس</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
              >
                <option value="كيلو">كيلوجرام (كجم)</option>
                <option value="شيكارة 50ك">شيكارة 50 كجم</option>
                <option value="صفيحة 16ك">صفيحة 16 كجم</option>
                <option value="كرتونة">كرتونة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ انتهاء الصلاحية *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-3 text-xs">
            <span className="font-bold text-gray-800 block border-b border-gray-200 pb-1.5">
              معايير الفحص وسلامة الأغذية (Quality Control)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">حرارة كابينة السيارة (°C)</label>
                <input
                  type="number"
                  value={truckTemperatureCelsius}
                  onChange={(e) => setTruckTemperatureCelsius(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-center font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-600 mb-1">حالة التغليف والعبوات</label>
                <select
                  value={packagingCondition}
                  onChange={(e) => setPackagingCondition(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                >
                  <option value="سليم ومحكم الإغلاق">سليم ومحكم الإغلاق</option>
                  <option value="تالف جزئياً">تالف جزئياً</option>
                  <option value="غير مطابق">غير مطابق ومفتوح</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">القرار المعملي الفني *</label>
              <select
                value={labTestResult}
                onChange={(e) => setLabTestResult(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-bold ${
                  labTestResult === 'مطابق للمواصفات القياسية'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : labTestResult === 'تحت الفحص المعملي'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                <option value="مطابق للمواصفات القياسية">مطابق للمواصفات القياسية (قبول واستلام بالمستودع)</option>
                <option value="تحت الفحص المعملي">تحت الفحص المعملي (حجز مؤقت في منطقة الحجر)</option>
                <option value="مرفوض ملوث / غير مطابق">مرفوض ملوث / غير مطابق (رفض فوري ورد للشاحنة)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات الفحص</label>
            <input
              type="text"
              placeholder="مثال: مطابقة شهادة التحليل COA وخلو من الشوائب"
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
              <span>اعتماد محضر الفحص والاستلام</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
