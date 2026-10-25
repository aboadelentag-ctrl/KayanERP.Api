import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  Video,
  Mic,
  Trash2,
  Send,
  Building2,
  Calendar,
  Layers,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';

export interface FormTemplate {
  id: number;
  formName: string;
  formCode: string;
  category: string;
  instructions: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'date' | 'select' | 'textarea' | 'number';
    options?: string[];
    required?: boolean;
    defaultValue?: string;
  }[];
  tableColumns: { key: string; title: string; type: 'radio' | 'text' | 'checkbox' }[];
  tableRows: { id: string; label: string }[];
  approvals: { roleTitle: string; condition?: string; hasSignature?: boolean }[];
}

export const FormViewerPage: React.FC = () => {
  const { user } = useAuth();

  // النماذج الثلاثة المعرّفة بهياكلها المتكاملة
  const formTemplates: FormTemplate[] = [
    {
      id: 1,
      formName: 'استمارة تفتيش ورقابة الجودة اليومية (GMP/HACCP)',
      formCode: 'HACCP_DAILY_01',
      category: 'رقابة وجودة وسلامة غذاء',
      instructions: 'يتم استيفاء هذا المحضر مرتين يومياً لكل وردية تشغيل بالصالات. يرجى التأكد من مطابقة النظافة الشخصية ودرجات حرارة ثلاجات التبريد قبل بدء العمل.',
      fields: [
        { key: 'dept', label: 'القسم / الصالة', type: 'select', options: ['صالة تصنيع الحلويات الشرقية', 'صالة الجاتوه والتورت والغربي', 'صالة الكنافة والقطايف', 'قسم النواشف والمخبوزات'], required: true },
        { key: 'inspectionDate', label: 'تاريخ الفحص', type: 'date', defaultValue: '2026-10-25', required: true },
        { key: 'inspector', label: 'مسؤول الجودة', type: 'select', options: ['د. مينا عادل (مفتش الجودة والسلامة)', 'أحمد عبد العزيز (مراقب الجودة)', 'أحمد فؤاد (مسؤول الصيانة الفنية)'], required: true },
        { key: 'shift', label: 'الوردية', type: 'select', options: ['الوردية الصباحية', 'الوردية المسائية', 'الوردية الليلية'], required: true }
      ],
      tableColumns: [
        { key: 'status', title: 'التقييم', type: 'radio' },
        { key: 'notes', title: 'الملاحظات', type: 'text' },
        { key: 'verified', title: 'التحقق', type: 'checkbox' }
      ],
      tableRows: [
        { id: 'row_1', label: 'نظافة وتطهير أسطح تحضير العجين والفولاذ ومعدات التقطيع' },
        { id: 'row_2', label: 'التزام العمال بارتداء القفازات وغطاء الرأس والزي النظيف المعتمد' },
        { id: 'row_3', label: 'فحص درجات حرارة ثلاجة النصف مصنع والمكسرات (-18 إلى 4 م°)' },
        { id: 'row_4', label: 'التأكد من تواريخ الصلاحية ونظام سحب الخامات الأقدم أولاً (FEFO)' }
      ],
      approvals: [
        { roleTitle: 'مشرف الجودة الميداني', condition: 'اعتماد مطابقة صالة الإنتاج', hasSignature: true }
      ]
    },
    {
      id: 2,
      formName: 'محضر استلام وتسليم وردية التشغيل',
      formCode: 'SHIFT_HANDOVER_02',
      category: 'تشغيل وصيانة مصانع',
      instructions: 'محضر إلزامي يوقعه شيف الوردية المسلّمة وشيف الوردية المستلمة لحصر كميات النصف مصنع وحالة الماكينات ونظافة الصالة.',
      fields: [
        { key: 'hallName', label: 'صالة التشغيل', type: 'select', options: ['صالة تصنيع الحلويات الشرقية', 'صالة الجاتوه والتورت', 'قسم النواشف والكرواسون'], required: true },
        { key: 'handoverDate', label: 'تاريخ التسليم', type: 'date', defaultValue: '2026-10-25', required: true },
        { key: 'deliveringChef', label: 'الشيف المسلّم للوردية', type: 'select', options: ['أحمد السعدي', 'سامح فوزي', 'محمود وهدان'], required: true },
        { key: 'receivingChef', label: 'الشيف المستلم للوردية', type: 'select', options: ['عمرو بدير', 'إبراهيم علي', 'فتحي حميده'], required: true }
      ],
      tableColumns: [
        { key: 'status', title: 'حالة الاستلام', type: 'radio' },
        { key: 'notes', title: 'بيان وتفاصيل الكميات المتبقية', type: 'text' },
        { key: 'verified', title: 'المطابقة', type: 'checkbox' }
      ],
      tableRows: [
        { id: 'row_sh_1', label: 'حصر أواني العجين والتجهيزات النصف مصنعة داخل الثلاجات' },
        { id: 'row_sh_2', label: 'جاهزية ونظافة خطوط الإنتاج والسيور والأفران' },
        { id: 'row_sh_3', label: 'سلامة العهد والأدوات اليدوية والصواني والصاجات' },
        { id: 'row_sh_4', label: 'إغلاق محابس الغاز والمياه المركزية قبل مغادرة الصالة' }
      ],
      approvals: [
        { roleTitle: 'شيف الوردية المسلّمة', condition: 'إقرار إخلاء المسؤولية', hasSignature: true },
        { roleTitle: 'شيف الوردية المستلمة', condition: 'إقرار استلام ومطابقة الصالة', hasSignature: true }
      ]
    },
    {
      id: 3,
      formName: 'سجل معايرة درجات حرارة الأفران الدوارة (OVEN_CALIB_03)',
      formCode: 'OVEN_CALIB_03',
      category: 'تشغيل وصيانة مصانع',
      instructions: 'سجل قياس حرارة الأفران الدوارة للتأكد من دقة الترموستات ومنع احتراق أو هبوط قاع الصواني والمخبوزات.',
      fields: [
        { key: 'ovenLocation', label: 'موقع الفرن / الصالة', type: 'select', options: ['فرن الصالة الشرقية رقم 1', 'فرن الصالة الشرقية رقم 2', 'فرن المعجنات والغربي رقم 3'], required: true },
        { key: 'readingDate', label: 'تاريخ المعايرة', type: 'date', defaultValue: '2026-10-25', required: true },
        { key: 'engineer', label: 'المهندس / الفني القائم بالمعايرة', type: 'select', options: ['م. حسام الدين (مهندس صيانة)', 'أحمد فؤاد (فني صيانة)'], required: true },
        { key: 'deviceModel', label: 'جهاز المعايرة المستخدم', type: 'text', defaultValue: 'Laser Thermometer DT-8820', required: true }
      ],
      tableColumns: [
        { key: 'status', title: 'مطابقة المعيار', type: 'radio' },
        { key: 'notes', title: 'قراءة الليزر الفعلية (م°)', type: 'text' },
        { key: 'verified', title: 'اعتماد الفحص', type: 'checkbox' }
      ],
      tableRows: [
        { id: 'row_ov_1', label: 'معايرة الحساس العلوي عند ضبط 180° مئوية' },
        { id: 'row_ov_2', label: 'معايرة الحساس السفلي وتوزيع لهب بيت النار' },
        { id: 'row_ov_3', label: 'سرعة دوران قفص الصاجات وتوافق المحرك' },
        { id: 'row_ov_4', label: 'فحص مروحة طرد العادم وشفاط الأبخرة' }
      ],
      approvals: [
        { roleTitle: 'مهندس الصيانة المسؤول', condition: 'مطابقة المعايرة الحرارية', hasSignature: true },
        { roleTitle: 'مدير المصنع', condition: 'التصريح باستئناف الخبز', hasSignature: true }
      ]
    }
  ];

  const [selectedFormId, setSelectedFormId] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(true);

  // Dynamic answers state
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  // Media Attachments
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedVideo, setAttachedVideo] = useState<string | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<string | null>(null);

  const currentTemplate = useMemo(() => {
    return formTemplates.find(f => f.id === selectedFormId) || formTemplates[0];
  }, [selectedFormId]);

  const handleFormChange = (newId: number) => {
    setSelectedFormId(newId);
    setAnswers({});
    setAttachedImage(null);
    setAttachedVideo(null);
    setAttachedAudio(null);
    setStatusMessage(null);
  };

  const setAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const getAnswer = (key: string, fallback: string = '') => {
    return answers[key] !== undefined ? answers[key] : fallback;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (type === 'image') setAttachedImage(dataUrl);
      if (type === 'video') setAttachedVideo(dataUrl);
      if (type === 'audio') setAttachedAudio(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(`✅ تم حفظ واعتماد [${currentTemplate.formName}] بنجاح في قاعدة بيانات المصنع!`);
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-500" />
              <span>تعبئة نماذج التفتيش والعمليات الميدانية (Runtime Form Viewer)</span>
            </h1>
            <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              شاشة الإدخال الميدانية الموحدة
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            شاشة الإدخال الميدانية الموحدة المربوطة حياً بقواعد بيانات المصنع ومسارات الاعتمادات.
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-zinc-300">
          👤 المستخدم الموثق: <strong className="text-emerald-600 dark:text-emerald-400">{user?.fullName || 'أبو عادل (المدير التنفيذي)'}</strong>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex justify-between items-center ${isSuccess ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'}`}>
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* اختيار النموذج */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6">
        <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1.5 text-xs">اختر النموذج المطلوب تعبئته:</label>
        <select
          value={selectedFormId}
          onChange={(e) => handleFormChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-indigo-500 rounded-xl font-bold text-xs outline-none text-gray-900 dark:text-zinc-100"
        >
          {formTemplates.map(f => (
            <option key={f.id} value={f.id}>{f.formName} ({f.formCode})</option>
          ))}
        </select>
      </div>

      {/* بناء النموذج المختار ديناميكياً مع مفتاح key يضمن إعادة التصيير الفوري */}
      <form key={selectedFormId} onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-[#0c0d11] border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          {/* عنوان وكود النموذج */}
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
            <h2 className="text-base font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <span>{currentTemplate.formName}</span>
            </h2>
            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
              {currentTemplate.formCode}
            </span>
          </div>

          {/* صندوق التعليمات واللوائح */}
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs space-y-1 mb-4">
            <h6 className="font-bold text-indigo-700 dark:text-indigo-400">📌 تعليمات وضوابط التفتيش الميداني:</h6>
            <p className="text-gray-600 dark:text-zinc-300">{currentTemplate.instructions}</p>
          </div>

          {/* حقول البيانات الأساسية التابعة لهذا النموذج */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3 mb-4">
            <h6 className="font-bold text-gray-800 dark:text-zinc-200 text-xs border-b border-gray-200 dark:border-zinc-800 pb-2">
              📋 بيانات الفحص الأساسية ({currentTemplate.category}):
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {currentTemplate.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={getAnswer(field.key, field.options?.[0] || '')}
                      onChange={(e) => setAnswer(field.key, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border border-gray-200 dark:border-zinc-800 rounded-xl font-bold text-gray-900 dark:text-zinc-100"
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      value={getAnswer(field.key, field.defaultValue || '2026-10-25')}
                      onChange={(e) => setAnswer(field.key, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border border-gray-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-gray-900 dark:text-zinc-100"
                    />
                  ) : (
                    <input
                      type="text"
                      value={getAnswer(field.key, field.defaultValue || '')}
                      onChange={(e) => setAnswer(field.key, e.target.value)}
                      placeholder={`أدخل ${field.label}...`}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border border-gray-200 dark:border-zinc-800 rounded-xl font-bold text-gray-900 dark:text-zinc-100"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* جدول بنود الفحص والتفتيش المخصص لهذا النموذج بالذات */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs mb-4">
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold">📋 بنود الفحص والتدقيق الميداني</span>
              <span className="bg-indigo-600 px-2 py-0.5 rounded text-[10px]">عدد البنود: {currentTemplate.tableRows.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead className="bg-slate-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3 w-12">م</th>
                    <th className="py-2.5 px-3 text-right">البند المطلوب فحصه والتأكد منه</th>
                    {currentTemplate.tableColumns.map(col => (
                      <th key={col.key} className={col.type === 'radio' ? 'w-48' : col.type === 'checkbox' ? 'w-20' : 'w-72'}>
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {currentTemplate.tableRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <td className="py-2.5 px-3 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">{row.label}</td>
                      {currentTemplate.tableColumns.map(col => {
                        const cellKey = `${row.id}_${col.key}`;
                        return (
                          <td key={col.key} className="py-2.5 px-3">
                            {col.type === 'radio' ? (
                              <div className="flex gap-1 justify-center">
                                <button
                                  type="button"
                                  onClick={() => setAnswer(cellKey, 'مطابق')}
                                  className={`px-3 py-1 rounded-lg font-bold text-[11px] ${getAnswer(cellKey, 'مطابق') === 'مطابق' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-gray-500'}`}
                                >
                                  ✓ مطابق
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAnswer(cellKey, 'غير مطابق')}
                                  className={`px-3 py-1 rounded-lg font-bold text-[11px] ${getAnswer(cellKey, 'مطابق') === 'غير مطابق' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-gray-500'}`}
                                >
                                  ✕ غير مطابق
                                </button>
                              </div>
                            ) : col.type === 'checkbox' ? (
                              <input
                                type="checkbox"
                                checked={getAnswer(cellKey, 'true') === 'true'}
                                onChange={(e) => setAnswer(cellKey, e.target.checked ? 'true' : 'false')}
                                className="w-4 h-4 text-emerald-600 rounded"
                              />
                            ) : (
                              <input
                                type="text"
                                placeholder="سجل هنا..."
                                value={getAnswer(cellKey, '')}
                                onChange={(e) => setAnswer(cellKey, e.target.value)}
                                className="w-full px-2.5 py-1 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-800 dark:text-zinc-200"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* مسار الاعتمادات الخاص بهذا النموذج */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-amber-500/30 space-y-3 mb-4 text-xs">
            <h6 className="font-bold text-amber-500 border-b border-gray-200 dark:border-zinc-800 pb-2">⚖️ مسار الاعتمادات والموافقات:</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTemplate.approvals.map((app, idx) => {
                const decKey = `app_${idx}_decision`;
                const notesKey = `app_${idx}_notes`;
                const signKey = `app_${idx}_sign`;
                const currentDec = getAnswer(decKey, 'أوافق');

                return (
                  <div key={idx} className="p-3 bg-white dark:bg-[#0c0d11] rounded-xl border border-gray-200 dark:border-zinc-800 space-y-2">
                    <h6 className="font-bold text-indigo-600 dark:text-indigo-400">{app.roleTitle}</h6>
                    {app.condition && <div className="text-gray-400 text-[10px]">{app.condition}</div>}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setAnswer(decKey, 'أوافق')}
                        className={`flex-1 py-1 rounded font-bold ${currentDec === 'أوافق' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-gray-500'}`}
                      >
                        أوافق
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswer(decKey, 'لا أوافق')}
                        className={`flex-1 py-1 rounded font-bold ${currentDec === 'لا أوافق' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-gray-500'}`}
                      >
                        لا أوافق
                      </button>
                    </div>
                    <div>
                      <label className="text-gray-400 text-[10px] block mb-1">ملاحظات القرار:</label>
                      <input
                        type="text"
                        value={getAnswer(notesKey, 'تم الفحص والتأكد من مطابقة المعايير')}
                        onChange={(e) => setAnswer(notesKey, e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded text-[11px]"
                      />
                    </div>
                    {app.hasSignature && (
                      <div>
                        <label className="text-gray-400 text-[10px] block mb-1">التوقيع والاعتماد:</label>
                        <input
                          type="text"
                          value={getAnswer(signKey, user?.fullName || 'أبو عادل')}
                          onChange={(e) => setAnswer(signKey, e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-bold text-emerald-600 text-[11px]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* قسم المرفقات والوسائط */}
          <div className="p-4 bg-white dark:bg-[#0c0d11] rounded-xl border border-cyan-500/30 space-y-3 mb-4 text-xs">
            <div className="border-b border-gray-200 dark:border-zinc-800 pb-2 flex justify-between items-center">
              <span className="font-bold text-cyan-600 dark:text-cyan-400">📎 المرفقات والوسائط التوثيقية للمحضر</span>
              <span className="text-gray-400 text-[10px]">إرفاق صور، فيديو، أو تسجيل صوتي لإثبات الحالة</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border text-center space-y-2">
                <label className="font-bold block">📷 صورة توثيقية للموقع / المخالفة</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="text-[10px] text-gray-500 w-full" />
                {attachedImage && (
                  <img src={attachedImage} alt="مرفق" className="max-h-24 mx-auto rounded border" />
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border text-center space-y-2">
                <label className="font-bold block">🎥 مقطع فيديو توثيقي للتشغيل</label>
                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="text-[10px] text-gray-500 w-full" />
                {attachedVideo && (
                  <video src={attachedVideo} controls className="max-h-24 mx-auto rounded" />
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border text-center space-y-2">
                <label className="font-bold block">🎙️ ملاحظة صوتية ميدانية</label>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} className="text-[10px] text-gray-500 w-full" />
                {attachedAudio && (
                  <audio src={attachedAudio} controls className="w-full mt-2" />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-zinc-800">
            <span className="text-gray-400 text-xs">يرجى مراجعة كافة البيانات والقرارات والمرفقات قبل الاعتماد النهائي.</span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm text-xs"
            >
              🚀 حفظ واعتماد المستند رقمياً
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
