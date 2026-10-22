import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Award } from 'lucide-react';
import type { Employee, ShiftProductivityLog } from './productivityApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: ShiftProductivityLog) => void;
  employees: Employee[];
}

export const ProductivityModal: React.FC<Props> = ({ isOpen, onClose, onSave, employees }) => {
  const [employeeId, setEmployeeId] = useState<number>(1);
  const [targetQuantity, setTargetQuantity] = useState<number>(100);
  const [actualQuantity, setActualQuantity] = useState<number>(100);
  const [wastePercentage, setWastePercentage] = useState<number>(2.0);
  const [section, setSection] = useState('صالة الحلويات الشرقية');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && employees.length > 0) {
      setEmployeeId(employees[0].id);
      setTargetQuantity(employees[0].dailyTargetKg || 100);
      setActualQuantity(employees[0].dailyTargetKg || 100);
      setWastePercentage(2.0);
      setError('');
    }
  }, [isOpen, employees]);

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === Number(employeeId));
  const efficiency = targetQuantity > 0 ? Math.round((actualQuantity / targetQuantity) * 100) : 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) {
      setError('يرجى اختيار شيف أو فني تشغيل');
      return;
    }

    const newLog: ShiftProductivityLog = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      shift: currentEmp.shift,
      section,
      targetQuantity: Number(targetQuantity),
      actualProducedQuantity: Number(actualQuantity),
      wastePercentage: Number(wastePercentage),
      efficiencyScore: efficiency,
      notes: notes || 'تسجيل إنتاجية الوردية القياسية',
    };

    onSave(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">تسجيل ناتج وتقييم إنتاجية وردية</h2>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">الشيف / مسؤول الخط *</label>
            <select
              value={employeeId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setEmployeeId(id);
                const emp = employees.find((x) => x.id === id);
                if (emp) {
                  setTargetQuantity(emp.dailyTargetKg);
                  setActualQuantity(emp.dailyTargetKg);
                }
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-semibold"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - ({emp.roleTitle})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المستهدف المعياري (كجم)</label>
              <input
                type="number"
                min="1"
                required
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الناتج الفعلي للوردية (كجم)</label>
              <input
                type="number"
                min="0"
                required
                value={actualQuantity}
                onChange={(e) => setActualQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-mono text-center font-bold text-indigo-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">نسبة الهادر والفاقد الطبيعي (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                required
                value={wastePercentage}
                onChange={(e) => setWastePercentage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm font-mono text-center font-bold text-rose-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">خط / قسم التشغيل</label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              />
            </div>
          </div>

          {/* لوحة الكفاءة اللحظية */}
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-950 font-bold block">معدل كفاءة الوردية:</span>
              <span className="text-[11px] text-gray-500 block">نسبة الفعلي للمستهدف المعياري</span>
            </div>
            <div className={`px-4 py-1.5 rounded-xl text-lg font-black font-mono ${
              efficiency >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {efficiency}%
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات وتقييم المشرف</label>
            <input
              type="text"
              placeholder="مثال: جودة تسوية ممتازة، التزام بمواصفات الوصفة"
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
              <span>حفظ سجل الإنتاجية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
