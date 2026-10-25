import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Camera,
  RotateCw,
  FileCheck,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchDynamicFormsApi,
  fetchErpLookupOptionsApi,
  submitDynamicFormResponseApi
} from './dynamicFormsApi';
import type {
  DynamicFormDto,
  FormStudioSchema
} from './dynamicFormsApi';

interface FormViewerPageProps {
  onNavigate?: (tab: string) => void;
}

export const FormViewerPage: React.FC<FormViewerPageProps> = () => {
  const { user } = useAuth();
  const [activeForms, setActiveForms] = useState<DynamicFormDto[]>([]);
  const [selectedForm, setSelectedForm] = useState<DynamicFormDto | null>(null);
  const [schema, setSchema] = useState<FormStudioSchema | null>(null);

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [erpOptions, setErpOptions] = useState<{ [key: string]: string[] }>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const all = await fetchDynamicFormsApi();
      const actives = all.filter(f => f.isActive);
      setActiveForms(actives);
      if (actives.length > 0) {
        selectFormById(actives[0].id, actives);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectFormById = async (formId: number, formsList = activeForms) => {
    setStatusMessage(null);
    setAnswers({});
    const found = formsList.find(f => f.id === formId);
    if (!found) {
      setSelectedForm(null);
      setSchema(null);
      return;
    }

    setSelectedForm(found);
    try {
      const parsed: FormStudioSchema = JSON.parse(found.fieldsSchema);
      setSchema(parsed);

      const initialAnswers: { [key: string]: string } = {};
      const sourcesToLoad: string[] = [];

      parsed.blocks?.forEach(blk => {
        blk.fields?.forEach(f => {
          if (f.fieldType === 'date') {
            initialAnswers[f.key] = new Date().toISOString().slice(0, 10);
          }
          if (f.fieldType === 'erp_select' && f.erpSource) {
            sourcesToLoad.push(f.erpSource);
          }
        });
      });

      setAnswers(initialAnswers);

      const uniqueSources = Array.from(new Set(sourcesToLoad));
      uniqueSources.forEach(async src => {
        if (!erpOptions[src]) {
          const opts = await fetchErpLookupOptionsApi(src);
          setErpOptions(prev => ({ ...prev, [src]: opts }));
        }
      });
    } catch {
      setSchema(null);
    }
  };

  const getAnswer = (key: string): string => answers[key] || '';

  const setAnswer = (key: string, val: string | null) => {
    setAnswers(prev => {
      const copy = { ...prev };
      if (val === null || val === undefined || val === '') {
        delete copy[key];
      } else {
        copy[key] = val;
      }
      return copy;
    });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const result = evt.target?.result as string;
      setAnswer(key, result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const jsonSubmission = JSON.stringify(answers);
      const payload = {
        formId: selectedForm.id,
        submissionData: jsonSubmission,
        userId: 1,
        submittedByName: user?.fullName || 'مراقب الجودة الميداني',
        status: 'مكتمل'
      };

      await submitDynamicFormResponseApi(payload);
      setStatusMessage('✅ تم حفظ واعتماد المستند بنجاح في قاعدة بيانات المصنع!');
      setIsSuccess(true);
      setAnswers({});
      
      const initial: { [key: string]: string } = {};
      schema?.blocks?.forEach(blk => {
        blk.fields?.forEach(f => {
          if (f.fieldType === 'date') initial[f.key] = new Date().toISOString().slice(0, 10);
        });
      });
      setAnswers(initial);
    } catch (ex: any) {
      setStatusMessage(`خطأ في الحفظ: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-emerald-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            <span>تعبئة نماذج التفتيش والعمليات الميدانية (Runtime Form Viewer)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            شاشة الإدخال الميدانية الموحدة المربوطة حياً بقواعد بيانات المصنع ومسارات الاعتمادات.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>المستخدم الموثق: </span>
          <span className="text-indigo-700 font-black">{user?.fullName || 'مراقب الجودة / النظام'}</span>
        </div>
      </div>

      {/* شريط اختيار النموذج */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 text-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px]">
          <label className="block text-indigo-700 font-bold mb-1.5 text-xs">
            اختر النموذج المطلوب تعبئته:
          </label>
          <select
            value={selectedForm?.id || ''}
            onChange={(e) => selectFormById(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-slate-50 border border-indigo-300 rounded-xl font-bold text-gray-800 text-xs outline-none focus:border-indigo-600"
          >
            <option value="">-- اضغط هنا لاختيار النموذج --</option>
            {activeForms.map(form => (
              <option key={form.id} value={form.id}>
                {form.formName} ({form.formCode})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadForms}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
        >
          <RotateCw className="w-4 h-4 text-indigo-600" />
          <span>تحديث القوالب</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center justify-between border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* رندرة النموذج النشط */}
      {selectedForm && schema ? (
        <form onSubmit={handleSubmitForm} className="bg-white rounded-2xl border border-emerald-500/30 border-t-4 border-t-emerald-600 shadow-xs overflow-hidden text-xs">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>{selectedForm.formName}</span>
            </h4>
            <span className="bg-emerald-500 text-slate-950 font-mono font-black text-xs px-3 py-1 rounded-lg">
              {selectedForm.formCode}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {schema.blocks?.map((block, bIdx) => (
              <div key={block.id || bIdx} className="space-y-3">
                {/* 1. كتلة النصوص والتوجيهات */}
                {block.blockType === 'instruction' && block.instructionText && (
                  <div className="p-4 bg-slate-50 border-r-4 border-r-indigo-600 rounded-xl text-gray-700 space-y-1">
                    <h6 className="font-bold text-indigo-700 text-xs">📌 {block.title}</h6>
                    <p className="whitespace-pre-line leading-relaxed text-[11px] m-0 text-slate-600">
                      {block.instructionText}
                    </p>
                  </div>
                )}

                {/* 2. كتلة حقول البيانات الأساسية */}
                {block.blockType === 'fields' && block.fields?.length > 0 && (
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                    <h6 className="font-bold text-slate-800 text-xs border-b pb-2">📋 {block.title}</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {block.fields.map(f => {
                        const isTextarea = f.fieldType === 'textarea';
                        return (
                          <div key={f.key} className={isTextarea ? 'md:col-span-2' : ''}>
                            <label className="block text-gray-700 font-bold mb-1 text-[11px]">
                              {f.label}
                              {f.isRequired && <span className="text-rose-600 mr-1">*</span>}
                            </label>

                            {f.fieldType === 'erp_select' && (
                              <select
                                required={f.isRequired}
                                value={getAnswer(f.key)}
                                onChange={(e) => setAnswer(f.key, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl font-bold text-indigo-900"
                              >
                                <option value="">-- اختر {f.label} --</option>
                                {erpOptions[f.erpSource || '']?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                )) || <option disabled>جاري التحميل...</option>}
                              </select>
                            )}

                            {f.fieldType === 'manual_select' && (
                              <select
                                required={f.isRequired}
                                value={getAnswer(f.key)}
                                onChange={(e) => setAnswer(f.key, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                              >
                                <option value="">-- اختر --</option>
                                {f.manualOptions?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}

                            {f.fieldType === 'textarea' && (
                              <textarea
                                rows={2}
                                required={f.isRequired}
                                placeholder="سجل التفاصيل والملاحظات..."
                                value={getAnswer(f.key)}
                                onChange={(e) => setAnswer(f.key, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                              />
                            )}

                            {f.fieldType === 'date' && (
                              <input
                                type="date"
                                required={f.isRequired}
                                value={getAnswer(f.key)}
                                onChange={(e) => setAnswer(f.key, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono"
                              />
                            )}

                            {f.fieldType === 'number' && (
                              <input
                                type="number"
                                step="0.01"
                                required={f.isRequired}
                                value={getAnswer(f.key)}
                                onChange={(e) => setAnswer(f.key, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-center font-bold"
                              />
                            )}

                            {f.fieldType === 'text' && (
                              <input
                                type="text"
                                required={f.isRequired}
                                placeholder="أدخل البيانات..."
                                value={getAnswer(f.key)}
                                onChange={(e) => setAnswer(f.key, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. كتلة جدول الفحص والتفتيش */}
                {block.blockType === 'table' && block.rows?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
                      <span className="font-bold">📋 {block.title}</span>
                      <span className="bg-slate-800 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
                        عدد البنود: {block.rows.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center">
                        <thead className="bg-slate-100 text-gray-700">
                          <tr>
                            <th className="py-2.5 px-3 w-12">م</th>
                            <th className="py-2.5 px-3 text-right">البند المطلوب فحصه والتأكد منه</th>
                            {block.columns?.map(col => (
                              <th key={col.key} className="py-2.5 px-3">{col.title}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {block.rows.map((row, rIdx) => {
                            const rowKey = row.id || `row_${rIdx}`;
                            return (
                              <tr key={rowKey} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-mono text-gray-400 font-bold">{rIdx + 1}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-gray-900">{row.label}</td>

                                {block.columns?.map(col => {
                                  const cellKey = `${rowKey}_${col.key}`;
                                  const curVal = getAnswer(cellKey);

                                  return (
                                    <td key={col.key} className="py-2.5 px-3">
                                      {col.columnType === 'radio' && (
                                        <div className="flex justify-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => setAnswer(cellKey, 'مطابق')}
                                            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                                              curVal === 'مطابق'
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            }`}
                                          >
                                            ✓ مطابق
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setAnswer(cellKey, 'غير مطابق')}
                                            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                                              curVal === 'غير مطابق'
                                                ? 'bg-rose-600 text-white shadow-xs'
                                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                            }`}
                                          >
                                            ✕ غير مطابق
                                          </button>
                                        </div>
                                      )}

                                      {col.columnType === 'checkbox' && (
                                        <input
                                          type="checkbox"
                                          checked={curVal === 'true'}
                                          onChange={(e) => setAnswer(cellKey, e.target.checked ? 'true' : 'false')}
                                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                                        />
                                      )}

                                      {col.columnType === 'text' && (
                                        <input
                                          type="text"
                                          placeholder="سجل هنا..."
                                          value={curVal}
                                          onChange={(e) => setAnswer(cellKey, e.target.value)}
                                          className="w-full px-2 py-1 bg-slate-50 border rounded-lg text-center"
                                        />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. كتلة مسار الاعتمادات الإدارية */}
                {block.blockType === 'approval' && block.approvalStages?.length > 0 && (
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                    <h6 className="font-bold text-amber-900 text-xs border-b border-amber-200 pb-2">
                      ⚖️ {block.title}
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {block.approvalStages.map(stage => {
                        const decisionKey = `${stage.stageId}_decision`;
                        const notesKey = `${stage.stageId}_notes`;
                        const signKey = `${stage.stageId}_sign`;
                        const currentDecision = getAnswer(decisionKey);

                        return (
                          <div key={stage.stageId} className="p-4 bg-white rounded-xl border border-amber-300 shadow-xs space-y-3">
                            <div>
                              <h6 className="font-bold text-indigo-700 text-xs">{stage.roleTitle}</h6>
                              {stage.condition && (
                                <span className="text-gray-400 text-[10px] block mt-0.5">{stage.condition}</span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {stage.decisionOptions?.map(opt => {
                                const isAgree = opt.includes('أوافق') || opt.includes('مطابق');
                                const isSelected = currentDecision === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setAnswer(decisionKey, opt)}
                                    className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-xs ${
                                      isSelected
                                        ? isAgree
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-rose-600 text-white shadow-xs'
                                        : isAgree
                                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {stage.hasNotes && (
                              <div>
                                <label className="block text-gray-500 font-bold text-[10px] mb-1">ملاحظات القرار:</label>
                                <input
                                  type="text"
                                  placeholder="سجل ملاحظات القرار..."
                                  value={getAnswer(notesKey)}
                                  onChange={(e) => setAnswer(notesKey, e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl"
                                />
                              </div>
                            )}

                            {stage.hasSignature && (
                              <div className="pt-2 border-top">
                                <label className="block text-gray-500 font-bold text-[10px] mb-1">التوقيع والاعتماد:</label>
                                <input
                                  type="text"
                                  placeholder="اسم المعتمد / توقيع إلكتروني..."
                                  value={getAnswer(signKey)}
                                  onChange={(e) => setAnswer(signKey, e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-indigo-900"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 5. قسم المرفقات والوسائط التوثيقية */}
            <div className="p-4 bg-slate-50 rounded-xl border border-cyan-200 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h6 className="font-bold text-cyan-900 text-xs flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-600" />
                  <span>📎 المرفقات والوسائط التوثيقية للمحضر</span>
                </h6>
                <span className="text-gray-400 text-[10px]">إرفاق صور لإثبات الحالة ميدانياً</span>
              </div>

              <div className="bg-white p-4 rounded-xl border text-center space-y-2 max-w-sm">
                <span className="font-bold text-gray-700 block text-[11px]">📷 صورة توثيقية للموقع / الفحص</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleMediaUpload(e, 'report_attachment_image')}
                  className="w-full text-[10px] text-slate-500 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-cyan-50 file:text-cyan-700"
                />
                {getAnswer('report_attachment_image') && (
                  <div className="space-y-1 mt-2">
                    <img
                      src={getAnswer('report_attachment_image')}
                      alt="attachment"
                      className="max-h-32 mx-auto rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAnswer('report_attachment_image', null)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-[10px]"
                    >
                      🗑️ حذف الصورة
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-100 border-t flex flex-wrap justify-between items-center gap-3">
            <span className="text-gray-500 text-[11px]">
              يرجى مراجعة كافة البيانات والقرارات والمرفقات قبل الاعتماد النهائي.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs transition-colors disabled:opacity-50 text-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ والتوثيق...' : '🚀 حفظ واعتماد المستند رقمياً'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-16 text-center rounded-2xl border text-gray-400 font-bold text-xs">
          يرجى اختيار نموذج من القائمة أعلاه لبدء التعبئة.
        </div>
      )}
    </div>
  );
};
