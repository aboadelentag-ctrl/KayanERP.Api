import React, { useState } from 'react';
import { X, Save, AlertCircle, Clock } from 'lucide-react';
import type { ShiftScheduleAssignment } from './hrApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: ShiftScheduleAssignment) => void;
}

export const NewRosterModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [roleTitle, setRoleTitle] = useState('شيف أول شرقي');
  const [departmentName, setDepartmentName] = useState('صالة تصنيع الحلويات الشرقية');
  const [shiftName, setShiftName] = useState<ShiftScheduleAssignment['shiftName']>('وردية صباحية (07:00 ص - 03:00 م)');
  const [lineAssignment, setLineAssignment] = useState('');
  const [workDays, setWorkDays] = useState('السبت - الخميس');
  const [restDay, setRestDay] = useState('الجمعة');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim()) {
      setError('يرجى كتابة اسم الشيف أو العامل');
      return;
    }
    if (!lineAssignment.trim()) {
      setError('يرجى تحديد خط الإنتاج أو المهمة المكلف بها');
      return;
    }

    const newAssignment: ShiftScheduleAssignment = {
      id: Date.now(),
      scheduleCode: `RST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      employeeName,
      roleTitle,
      departmentName,
      shiftName,
      lineAssignment,
      workDays,
      restDay,
      status: 'على رأس العمل',
      notes: notes || 'تعيين مجدول على خط الإنتاج',
    };

    onSave(newAssignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">تعيين وردية وخط إنتاج لعامل</h2>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الشيف / الفني *</label>
              <input
                type="text"
                required
                placeholder="اسم الموظف"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المسمى الوظيفي *</label>
              <select
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
              >
                <option value="شيف أول شرقي">شيف أول شرقي</option>
                <option value="شيف تورت وحلواني غربي">شيف تورت وحلواني غربي</option>
                <option value="كبير الخبازين">كبير الخبازين</option>
                <option value="شيف مساعد حلويات">شيف مساعد حلويات</option>
                <option value="فني تعبئة وتغليف">فني تعبئة وتغليف</option>
                <option value="سائق شاحنة توزيع">سائق شاحنة توزيع</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الصالة أو القسم *</label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              >
                <option value="صالة تصنيع الحلويات الشرقية">صالة تصنيع الحلويات الشرقية</option>
                <option value="صالة الحلويات الغربية والتورت">صالة الحلويات الغربية والتورت</option>
                <option value="صالة الأفران والمخبوزات الآلية">صالة الأفران والمخبوزات الآلية</option>
                <option value="صالة التعبئة والتغليف والعلب">صالة التعبئة والتغليف والعلب</option>
                <option value="أسطول الشحن والتوزيع الميداني">أسطول الشحن والتوزيع الميداني</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الوردية المحددة *</label>
              <select
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value as any)}
                className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-900"
              >
                <option value="وردية صباحية (07:00 ص - 03:00 م)">وردية صباحية (07:00 ص - 03:00 م)</option>
                <option value="وردية مسائية (03:00 م - 11:00 م)">وردية مسائية (03:00 م - 11:00 م)</option>
                <option value="وردية ليلية (11:00 م - 07:00 ص)">وردية ليلية (11:00 م - 07:00 ص)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">خط الإنتاج / التكليف المحدد *</label>
            <input
              type="text"
              required
              placeholder="مثال: فرن الدوار التركي 1 أو خط عجن البسبوسة"
              value={lineAssignment}
              onChange={(e) => setLineAssignment(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">أيام العمل الأسبوعية</label>
              <input
                type="text"
                value={workDays}
                onChange={(e) => setWorkDays(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">يوم الراحة الأسبوعية</label>
              <select
                value={restDay}
                onChange={(e) => setRestDay(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
              >
                <option value="الجمعة">الجمعة</option>
                <option value="السبت">السبت</option>
                <option value="الأحد">الأحد</option>
                <option value="الإثنين">الإثنين</option>
                <option value="الثلاثاء">الثلاثاء</option>
                <option value="الأربعاء">الأربعاء</option>
                <option value="الخميس">الخميس</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات التكليف</label>
            <input
              type="text"
              placeholder="مثال: مسؤول فحص الجودة قبل الخبز"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>حفظ التعيين والجدول</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
