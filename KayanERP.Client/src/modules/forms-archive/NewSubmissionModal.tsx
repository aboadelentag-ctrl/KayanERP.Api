import React, { useState } from 'react';
import { X, Save, AlertCircle, ClipboardCheck } from 'lucide-react';
import type { FormSubmissionRecord, InspectionFormTemplate } from './formsArchiveApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: FormSubmissionRecord) => void;
  templates: InspectionFormTemplate[];
}

export const NewSubmissionModal: React.FC<Props> = ({ isOpen, onClose, onSave, templates }) => {
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState(
    templates.length > 0 ? templates[0].title : 'قائمة التحقق من درجات حرارة غرف التجميد والتبريد'
  );
  const [departmentName, setDepartmentName] = useState('صالة تصنيع الحلويات الشرقية');
  const [inspectorName, setInspectorName] = useState('د. مينا عادل (مفتش الجودة والسلامة)');
  const [complianceScore, setComplianceScore] = useState<number>(95);
  const [findingsCount, setFindingsCount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectorName.trim()) {
      setError('يرجى تحديد اسم مسؤول الفحص');
      return;
    }

    let status: FormSubmissionRecord['status'] = 'معتمد ومطابق';
    if (complianceScore < 90) status = 'يحتاج إجراء تصحيحي';
    if (complianceScore < 75) status = 'مرفوض كلياً';

    const newRecord: FormSubmissionRecord = {
      id: Date.now(),
      submissionCode: `SUB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      templateTitle: selectedTemplateTitle,
      departmentName,
      inspectorName,
      submissionDate: new Date().toISOString().slice(0, 10),
      complianceScore: Number(complianceScore),
      findingsCount: Number(findingsCount),
      status,
      notes: notes || 'تمت المطابقة والاعتماد الميداني',
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">تعبئة نموذج فحص ميداني رقمي (HACCP)</h2>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">نموذج وقائمة الفحص *</label>
            <select
              value={selectedTemplateTitle}
              onChange={(e) => setSelectedTemplateTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.title}>
                  {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الصالة أو القسم المفحوص *</label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900"
              >
                <option value="صالة تصنيع الحلويات الشرقية">صالة تصنيع الحلويات الشرقية</option>
                <option value="صالة الحلويات الغربية والتورت">صالة الحلويات الغربية والتورت</option>
                <option value="صالة الأفران والمخبوزات الآلية">صالة الأفران والمخبوزات الآلية</option>
                <option value="غرف التبريد والتجميد المركزي">غرف التبريد والتجميد المركزي</option>
                <option value="صالة التعبئة والتغليف والعلب">صالة التعبئة والتغليف والعلب</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المفتش أو القائم بالفحص *</label>
              <input
                type="text"
                required
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">درجة الامتثال والمطابقة (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={complianceScore}
                onChange={(e) => setComplianceScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-mono font-bold text-indigo-700 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">عدد الملاحظات / الحيود المسجلة</label>
              <input
                type="number"
                min="0"
                value={findingsCount}
                onChange={(e) => setFindingsCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">الملاحظات والإجراء التصحيحي المطلوب</label>
            <input
              type="text"
              placeholder="مثال: تم التطهير الفوري وإعادة ضبط الثرموستات"
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
              <span>اعتماد محضر الفحص</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
