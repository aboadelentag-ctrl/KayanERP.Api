import React, { useState } from 'react';
import { X, Save, AlertCircle, Building2 } from 'lucide-react';
import type { Department } from './departmentsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Department) => void;
}

export const NewDepartmentModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [code, setCode] = useState(`DEP-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [type, setType] = useState<Department['type']>('صالة تصنيع وإنتاج');
  const [supervisorName, setSupervisorName] = useState('');
  const [workerCount, setWorkerCount] = useState<number>(8);
  const [dailyCapacityKg, setDailyCapacityKg] = useState<number>(500);
  const [activeLinesCount, setActiveLinesCount] = useState<number>(2);
  const [location, setLocation] = useState('مجمع المصانع الرئيسي');
  const [status, setStatus] = useState<Department['status']>('نشط ويعمل');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الصالة أو القسم');
      return;
    }
    if (!supervisorName.trim()) {
      setError('يرجى تحديد الشيف أو المشرف المسؤول');
      return;
    }

    const newDept: Department = {
      id: Date.now(),
      code,
      name,
      type,
      supervisorName,
      workerCount: Number(workerCount),
      dailyCapacityKg: Number(dailyCapacityKg),
      activeLinesCount: Number(activeLinesCount),
      location,
      status,
    };

    onSave(newDept);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">إضافة صالة تشغيل / قسم إنتاجي جديد</h2>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">كود الصالة التنظيمي *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-indigo-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">نوع وتصنيف النشاط *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900"
              >
                <option value="صالة تصنيع وإنتاج">صالة تصنيع وإنتاج</option>
                <option value="صالة خبز وتجهيز">صالة خبز وتجهيز</option>
                <option value="تعبئة وتغليف">تعبئة وتغليف</option>
                <option value="لوجستيات وتوزيع">لوجستيات وتوزيع</option>
                <option value="معرض وبيع">معرض وبيع</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الصالة أو القسم بالكامل *</label>
            <input
              type="text"
              required
              placeholder="مثال: صالة تصنيع الكنافة والبقلاوة"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الشيف أو المشرف المسؤول *</label>
              <input
                type="text"
                required
                placeholder="اسم المشرف"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الموقع الفعلي للمنشأة</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الطاقة القصوى (كجم/يوم)</label>
              <input
                type="number"
                min="50"
                required
                value={dailyCapacityKg}
                onChange={(e) => setDailyCapacityKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">طاقم العمالة (فرد)</label>
              <input
                type="number"
                min="1"
                required
                value={workerCount}
                onChange={(e) => setWorkerCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">عدد خطوط التشغيل</label>
              <input
                type="number"
                min="1"
                value={activeLinesCount}
                onChange={(e) => setActiveLinesCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">الحالة التشغيلية</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
            >
              <option value="نشط ويعمل">نشط ويعمل بكفاءة</option>
              <option value="صيانة وتطهير">صيانة وتطهير دوري</option>
              <option value="متوقف مؤقتاً">متوقف مؤقتاً</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>حفظ الصالة والبيانات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
