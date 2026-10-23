import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Layers } from 'lucide-react';
import type { StockItemStatus, StockCardMovement } from './inventoryDashboardApi';
import { fetchStockMovementsApi } from './inventoryDashboardApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: StockItemStatus | null;
}

export const StockCardModal: React.FC<Props> = ({ isOpen, onClose, item }) => {
  const [movements, setMovements] = useState<StockCardMovement[]>([]);

  useEffect(() => {
    if (isOpen && item) {
      fetchStockMovementsApi().then((all) => {
        setMovements(all.filter((m) => m.itemCode === item.itemCode));
      });
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-gray-900">
                كارت الصنف واللوطات: {item.itemName} ({item.itemCode})
              </h2>
              <span className="text-[11px] text-gray-500">سجل الحركات المخزنية الواردة والمنصرفة</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بطاقات تلخيص رصيد الصنف */}
        <div className="p-4 grid grid-cols-3 gap-3 bg-slate-50/50 border-b border-gray-100 text-xs shrink-0">
          <div className="bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-gray-500 block">الرصيد المتاح الحالي</span>
            <span className="font-mono font-bold text-base text-indigo-950 mt-0.5 block">
              {item.currentStock.toLocaleString()} {item.unit}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-gray-500 block">حد إعادة الطلب</span>
            <span className="font-mono font-bold text-base text-amber-600 mt-0.5 block">
              {item.reorderPoint.toLocaleString()} {item.unit}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-gray-500 block">تقييم المخزون</span>
            <span className="font-mono font-bold text-base text-emerald-700 mt-0.5 block">
              {item.totalValuation.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* جدول حركات كارت الصنف */}
        <div className="p-6 overflow-y-auto flex-1">
          {movements.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              لا توجد حركات مسجلة مؤخراً لهذا الصنف
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3">نوع الحركة والبيان</th>
                    <th className="py-2.5 px-3 text-center">رقم اللوط</th>
                    <th className="py-2.5 px-3 text-center">وارد (+)</th>
                    <th className="py-2.5 px-3 text-center">منصرف (-)</th>
                    <th className="py-2.5 px-3 text-center">الرصيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/75">
                      <td className="py-2.5 px-3 font-mono text-gray-500">{m.date}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-gray-900 block">{m.movementType}</span>
                        <span className="text-[11px] text-gray-400 block">{m.notes} ({m.referenceNo})</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">
                        {m.batchLotNo}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                        {m.quantityIn > 0 ? `+${m.quantityIn}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">
                        {m.quantityOut > 0 ? `-${m.quantityOut}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-900">
                        {m.runningBalance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-xl">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
