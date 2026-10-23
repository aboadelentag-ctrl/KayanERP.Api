import React, { useState } from 'react';
import { X, AlertOctagon, Send, AlertCircle } from 'lucide-react';
import type { EmergencyTask } from './emergencyTasksApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: EmergencyTask) => void;
}

export const NewEmergencyTaskModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('صالة تصنيع الحلويات الشرقية (المصنع الرئيسي)');
  const [reportedBy, setReportedBy] = useState('شيف الصالة المناوب');
  const [priority, setPriority] = useState<EmergencyTask['priority']>('حرجة للغاية (توقف إنتاج)');
  const [assignedTo, setAssignedTo] = useState('فريق الصيانة السريعة');
  const [estimatedDowntimeMinutes, setEstimatedDowntimeMinutes] = useState<number>(30);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى وصف المشكلة أو العطل الطارئ');
      return;
    }

    const newTask: EmergencyTask = {
      id: Date.now(),
      taskNumber: `EMG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title,
      location,
      reportedBy,
      reportedDate: new Date().toISOString().slice(0, 10),
      reportedTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      priority,
      assignedTo,
      status: 'مفتوح',
      estimatedDowntimeMinutes: Number(estimatedDowntimeMinutes) || 0,
    };

    onSave(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-rose-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-gray-800">إرسال بلاغ عطل أو مهمة إصلاح طارئة</h2>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">وصف العطل الطارئ / الحالة *</label>
            <textarea
              required
              rows={2}
              placeholder="مثال: تسريب غاز أو توقف مفاجئ في مروحة توزيع الحرارة بالفرن 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">درجة الأولوية والتأثير *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-800"
              >
                <option value="حرجة للغاية (توقف إنتاج)">حرجة للغاية (توقف خط الإنتاج)</option>
                <option value="عالية">عالية (تأثير على الجودة / السواقط)</option>
                <option value="متوسطة">متوسطة (صيانة طارئة دون توقف)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">التوقف المتوقع (دقائق)</label>
              <input
                type="number"
                min="5"
                step="5"
                required
                value={estimatedDowntimeMinutes}
                onChange={(e) => setEstimatedDowntimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">موقع العطل أو الخط أو المعدة *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">مُبلغ العطل</label>
              <input
                type="text"
                required
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">توجيه التكليف إلى</label>
              <input
                type="text"
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm">
              <Send className="w-4 h-4" />
              <span>إطلاق أمر الإصلاح العاجل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
