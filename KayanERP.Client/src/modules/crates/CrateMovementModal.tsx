import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { CrateClient } from './cratesApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  client: CrateClient | null;
  onSaveMovement: (clientId: number, type: 'in' | 'out', quantity: number, notes: string) => void;
}

export const CrateMovementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  client,
  onSaveMovement,
}) => {
  const [type, setType] = useState<'out' | 'in'>('out'); // out: خروج مع بضاعة، in: مرتجع فارغ
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert('يرجى إدخال عدد مجنسات صحيح');
      return;
    }
    onSaveMovement(client.id, type, quantity, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-800">حركة مجنسات وبراني</h2>
            <p className="text-xs text-gray-500 mt-0.5">{client.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-indigo-50/60 rounded-xl flex items-center justify-between text-sm">
            <span className="text-gray-600">الرصيد الحالي طرف العميل:</span>
            <span className="font-bold text-indigo-700 font-mono text-base">{client.crateBalance} قفص</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">نوع الحركة</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('out')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  type === 'out'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>صادر (تسليم أقفاص)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('in')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  type === 'in'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>وارد (استلام مرتجع)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">عدد المجنسات / الأقفاص</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ملاحظات الحركة / رقم إذن الصرف</label>
            <input
              type="text"
              placeholder="مثال: تسليم مع سيارة خط دكرنس"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              تأكيد الحركة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
