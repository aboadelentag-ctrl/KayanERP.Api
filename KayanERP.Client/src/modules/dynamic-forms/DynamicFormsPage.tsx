import React, { useState, useEffect } from 'react';
import {
  Wrench,
  PlusCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Edit2,
  Trash2,
  Upload,
  Play,
  Pause,
  Palette,
  FileCode,
  LayoutGrid,
  ListPlus,
  Table,
  CheckSquare,
  HelpCircle,
  Image,
  Video,
  Mic,
  Calendar,
  X
} from 'lucide-react';
import {
  fetchDynamicFormsApi,
  saveDynamicFormApi,
  toggleDynamicFormStatusApi,
  deleteDynamicFormApi,
  clearAllDynamicFormsApi
} from './dynamicFormsApi';
import type {
  DynamicFormDto,
  FormStudioSchema,
  FormStudioBlock,
  StudioFieldDefinition,
  StudioTableColumn,
  StudioTableRow,
  StudioApprovalStage
} from './dynamicFormsApi';

export const DynamicFormsPage: React.FC = () => {
  const [forms, setForms] = useState<DynamicFormDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  // Studio Modal State
  const [showStudioModal, setShowStudioModal] = useState<boolean>(false);
  const [currentEditingFormId, setCurrentEditingFormId] = useState<number>(0);
  const [editingSchema, setEditingSchema] = useState<FormStudioSchema>({
    formCode: '',
    formTitle: '',
    category: 'رقابة وجودة وسلامة غذاء',
    blocks: []
  });

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importFormCode, setImportFormCode] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDynamicFormsApi();
      setForms(data);
    } catch (ex: any) {
      setStatusMessage(`خطأ في جلب النماذج: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBlankForm = () => {
    setCurrentEditingFormId(0);
    const code = 'FORM_' + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const schema: FormStudioSchema = {
      formTitle: 'استمارة فحص جديدة',
      formCode: code,
      category: 'رقابة وجودة وسلامة غذاء',
      blocks: [
        {
          id: 'blk_init',
          blockType: 'fields',
          title: 'البيانات الأساسية',
          fields: [
            {
              id: 'fld_dept',
              key: 'dept',
              label: 'القسم / الصالة',
              fieldType: 'erp_select',
              erpSource: 'Departments',
              manualOptions: [],
              isRequired: true,
              isReportFilter: true,
              isKpiMetric: false
            },
            {
              id: 'fld_date',
              key: 'date',
              label: 'التاريخ',
              fieldType: 'date',
              manualOptions: [],
              isRequired: true,
              isReportFilter: true,
              isKpiMetric: false
            }
          ],
          columns: [],
          rows: [],
          approvalStages: []
        }
      ]
    };
    setEditingSchema(schema);
    setShowStudioModal(true);
  };

  const handleOpenStudio = (form: DynamicFormDto) => {
    setCurrentEditingFormId(form.id);
    try {
      const parsed: FormStudioSchema = JSON.parse(form.fieldsSchema);
      setEditingSchema(parsed);
    } catch {
      setEditingSchema({
        formTitle: form.formName,
        formCode: form.formCode,
        category: 'عام',
        blocks: []
      });
    }
    setShowStudioModal(true);
  };

  const handleToggleStatus = async (id: number) => {
    await toggleDynamicFormStatusApi(id);
    setForms(prev => prev.map(f => (f.id === id ? { ...f, isActive: !f.isActive } : f)));
    setStatusMessage('تم تحديث حالة النموذج بنجاح.');
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteForm = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا النموذج؟')) return;
    await deleteDynamicFormApi(id);
    setForms(prev => prev.filter(f => f.id !== id));
    setStatusMessage('تم حذف النموذج بنجاح.');
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleClearAll = async () => {
    if (!window.confirm('⚠️ تحذير: هل أنت متأكد من مسح كافة النماذج والاستمارات بالكامل؟')) return;
    await clearAllDynamicFormsApi();
    setForms([]);
    setStatusMessage('تم مسح كافة النماذج بنجاح.');
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Studio Builders
  const addBlock = (type: 'fields' | 'table' | 'approval' | 'instruction') => {
    const id = 'blk_' + Math.random().toString(36).substring(2, 8);
    const title =
      type === 'fields'
        ? 'حقول وبيانات'
        : type === 'table'
        ? 'جدول فحص وتدقيق'
        : type === 'approval'
        ? 'مسار اعتمادات'
        : 'توجيهات ولوائح';

    const newBlock: FormStudioBlock = {
      id,
      blockType: type,
      title,
      fields: [],
      columns:
        type === 'table'
          ? [
              { key: 'status', title: 'التقييم', columnType: 'radio', options: ['مطابق', 'غير مطابق'], isComplianceScore: true },
              { key: 'notes', title: 'ملاحظات', columnType: 'text', options: [] },
              { key: 'verified', title: 'التحقق', columnType: 'checkbox', options: [] }
            ]
          : [],
      rows: type === 'table' ? [{ id: 'row_1', label: 'بند الفحص الأول' }] : [],
      approvalStages: []
    };

    setEditingSchema(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const removeBlock = (index: number) => {
    setEditingSchema(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };

  const addFieldToBlock = (bIndex: number) => {
    const key = 'fld_' + Math.random().toString(36).substring(2, 8);
    const newField: StudioFieldDefinition = {
      id: key,
      key,
      label: 'بند إدخال جديد',
      fieldType: 'text',
      manualOptions: [],
      isRequired: false,
      isReportFilter: true,
      isKpiMetric: false
    };

    setEditingSchema(prev => {
      const blocks = [...prev.blocks];
      blocks[bIndex].fields = [...blocks[bIndex].fields, newField];
      return { ...prev, blocks };
    });
  };

  const addColumnToTable = (bIndex: number) => {
    const key = 'col_' + Math.random().toString(36).substring(2, 8);
    const newCol: StudioTableColumn = {
      key,
      title: 'عمود جديد',
      columnType: 'text',
      options: []
    };

    setEditingSchema(prev => {
      const blocks = [...prev.blocks];
      blocks[bIndex].columns = [...blocks[bIndex].columns, newCol];
      return { ...prev, blocks };
    });
  };

  const addRowToTable = (bIndex: number) => {
    const id = 'row_' + Math.random().toString(36).substring(2, 8);
    const newRow: StudioTableRow = { id, label: 'بند فحص جديد' };

    setEditingSchema(prev => {
      const blocks = [...prev.blocks];
      blocks[bIndex].rows = [...blocks[bIndex].rows, newRow];
      return { ...prev, blocks };
    });
  };

  const addApprovalStage = (bIndex: number) => {
    const stageId = 'stage_' + Math.random().toString(36).substring(2, 8);
    const newStage: StudioApprovalStage = {
      stageId,
      roleTitle: 'مستوى اعتماد جديد',
      decisionOptions: ['أوافق', 'لا أوافق'],
      hasNotes: true,
      hasSignature: true
    };

    setEditingSchema(prev => {
      const blocks = [...prev.blocks];
      blocks[bIndex].approvalStages = [...blocks[bIndex].approvalStages, newStage];
      return { ...prev, blocks };
    });
  };

  const handleSaveStudioDesign = async () => {
    if (!editingSchema.formTitle.trim() || !editingSchema.formCode.trim()) {
      alert('⚠️ يرجى التأكد من كتابة اسم وكود النموذج.');
      return;
    }

    const payload: DynamicFormDto = {
      id: currentEditingFormId,
      formName: editingSchema.formTitle,
      formCode: editingSchema.formCode,
      fieldsSchema: JSON.stringify(editingSchema),
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    await saveDynamicFormApi(payload);

    setForms(prev => {
      if (currentEditingFormId > 0) {
        return prev.map(f => (f.id === currentEditingFormId ? { ...payload } : f));
      }
      return [{ ...payload, id: Date.now() }, ...prev];
    });

    setShowStudioModal(false);
    setStatusMessage('✅ تم حفظ واعتماد تصميم النموذج وتجهيزه للميدان والتقارير بنجاح!');
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Word Import Mock
  const handleUploadAndGenerate = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setTimeout(() => {
      const newForm: DynamicFormDto = {
        id: Date.now(),
        formName: selectedFile.name.replace('.docx', ''),
        formCode: importFormCode || 'DOCX_' + Date.now().toString().slice(-6),
        fieldsSchema: JSON.stringify({
          formCode: importFormCode || 'DOCX_IMPORTED',
          formTitle: selectedFile.name.replace('.docx', ''),
          category: 'رقابة وجودة وسلامة غذاء',
          blocks: [
            {
              id: 'blk_doc',
              blockType: 'table',
              title: 'بنود الفحص المستخرجة من المستند',
              fields: [],
              columns: [
                { key: 'status', title: 'التقييم', columnType: 'radio', options: ['مطابق', 'غير مطابق'], isComplianceScore: true },
                { key: 'notes', title: 'الملاحظات', columnType: 'text', options: [] }
              ],
              rows: [
                { id: 'r1', label: 'البند الأول المستخرج من ملف Word' },
                { id: 'r2', label: 'البند الثاني المستخرج من الجداول' }
              ],
              approvalStages: []
            }
          ]
        }),
        isActive: true,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      setForms(prev => [newForm, ...prev]);
      setIsImporting(false);
      setShowImportModal(false);
      setStatusMessage('✅ تم استيراد مسودة النموذج بنجاح! اضغط "تخصيص في الأستوديو" لضبط الأدوات.');
      setIsSuccess(true);
      setTimeout(() => setStatusMessage(null), 4000);
    }, 1200);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-600" />
            <span>أستوديو تصميم النماذج واستمارات HACCP (Dynamic Forms Studio)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            محرك النماذج المرن: استيراد المسودات، تخصيص القوائم، ربط الـ ERP، الوسائط المتعددة، وتجهيز تقارير الـ KPIs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {forms.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح كافة النماذج</span>
            </button>
          )}
          <button
            onClick={() => {
              setImportFormCode('');
              setSelectedFile(null);
              setShowImportModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد مسودة من ملف (Word)</span>
          </button>
          <button
            onClick={handleCreateBlankForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تصميم نموذج جديد من الصفر</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* جدول النماذج */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-bold">جاري تحميل النماذج والاستمارات...</div>
        ) : forms.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold">
            لا توجد استمارات مسجلة حالياً. يمكنك استيراد مسودة من ملف Word أو إنشاء نموذج جديد للبدء بالتصميم.
          </div>
        ) : (
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-3">م</th>
                <th className="py-3 px-3 text-right">اسم النموذج</th>
                <th className="py-3 px-3">كود الربط (Form Code)</th>
                <th className="py-3 px-3">تاريخ التحديث</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3">الإجراءات وأدوات التصميم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forms.map((form, idx) => (
                <tr key={form.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-gray-500">{idx + 1}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">{form.formName}</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{form.formCode}</td>
                  <td className="py-3 px-3 font-mono text-gray-500">{form.createdAt}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        form.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {form.isActive ? 'مفعل ✓' : 'معطل ✕'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenStudio(form)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg flex items-center gap-1"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>تخصيص في الأستوديو</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(form.id)}
                        className={`px-2 py-1 rounded font-bold ${
                          form.isActive ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {form.isActive ? 'إيقاف ⏸️' : 'تفعيل ▶️'}
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        className="p-1 hover:text-rose-600"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: أستوديو تصميم النماذج المتقدم */}
      {showStudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm">أستوديو هندسة النماذج - Form Studio</h4>
                <span className="bg-indigo-950 text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded border border-indigo-700">
                  {editingSchema.formCode}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStudioModal(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg"
                >
                  إغلاق
                </button>
                <button
                  onClick={handleSaveStudioDesign}
                  className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  💾 حفظ واعتماد النموذج النهائي
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              {/* إعدادات النموذج */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-gray-700 font-bold mb-1">اسم النموذج (عربي) *</label>
                  <input
                    type="text"
                    value={editingSchema.formTitle}
                    onChange={(e) => setEditingSchema({ ...editingSchema, formTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">كود الربط الفريد (Code) *</label>
                  <input
                    type="text"
                    value={editingSchema.formCode}
                    onChange={(e) => setEditingSchema({ ...editingSchema, formCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">تصنيف النموذج للتقارير</label>
                  <select
                    value={editingSchema.category}
                    onChange={(e) => setEditingSchema({ ...editingSchema, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    <option value="رقابة وجودة وسلامة غذاء">رقابة وجودة وسلامة غذاء</option>
                    <option value="تشغيل وصيانة مصانع">تشغيل وصيانة مصانع</option>
                    <option value="إداري وجزاءات ورقابي">إداري وجزاءات ورقابي</option>
                    <option value="مستودعات وخامات">مستودعات وخامات</option>
                  </select>
                </div>
              </div>

              {/* صندوق الأدوات البنائية */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h6 className="font-bold text-gray-800">🧰 صندوق الأدوات البنائية (Add Components):</h6>
                  <span className="text-gray-400 text-[11px]">اختر المكوّن المطلوب لإضافته إلى النموذج الحالي</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => addBlock('fields')}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200"
                  >
                    ➕ كتلة حقول وإدخال
                  </button>
                  <button
                    onClick={() => addBlock('table')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200"
                  >
                    ➕ جدول فحص وتدقيق
                  </button>
                  <button
                    onClick={() => addBlock('approval')}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200"
                  >
                    ➕ مسار اعتمادات وموافقات
                  </button>
                  <button
                    onClick={() => addBlock('instruction')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300"
                  >
                    ➕ صندوق تعليمات وتوجيه
                  </button>
                </div>
              </div>

              {/* قائمة الكتل البنائية */}
              {editingSchema.blocks.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border text-gray-400 font-bold">
                  النموذج فارغ حالياً. استخدم صندوق الأدوات أعلاه لإضافة أول كتلة إلى استمارتك.
                </div>
              ) : (
                editingSchema.blocks.map((block, bIdx) => (
                  <div key={block.id} className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">كتلة {bIdx + 1}</span>
                        <input
                          type="text"
                          value={block.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingSchema(prev => {
                              const blocks = [...prev.blocks];
                              blocks[bIdx].title = val;
                              return { ...prev, blocks };
                            });
                          }}
                          className="bg-transparent font-bold border-b border-gray-300 outline-none px-1"
                        />
                      </div>
                      <button
                        onClick={() => removeBlock(bIdx)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-[11px]"
                      >
                        🗑️ حذف القسم
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* كتلة الحقول */}
                      {block.blockType === 'fields' && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 font-bold text-[11px]">حقول البيانات والقوائم والوسائط:</span>
                            <button
                              onClick={() => addFieldToBlock(bIdx)}
                              className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg"
                            >
                              ➕ إضافة حقل جديد
                            </button>
                          </div>

                          <table className="w-full text-center border">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="py-1.5 px-2 text-right">اسم الحقل (Label)</th>
                                <th className="py-1.5 px-2">نوع الحقل</th>
                                <th className="py-1.5 px-2">المصدر / الخيارات</th>
                                <th className="py-1.5 px-2">إلزامي</th>
                                <th className="py-1.5 px-2">حذف</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {block.fields.map((f, fIdx) => (
                                <tr key={f.id}>
                                  <td className="p-1.5 text-right">
                                    <input
                                      type="text"
                                      value={f.label}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setEditingSchema(prev => {
                                          const blocks = [...prev.blocks];
                                          blocks[bIdx].fields[fIdx].label = val;
                                          return { ...prev, blocks };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border rounded"
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <select
                                      value={f.fieldType}
                                      onChange={(e) => {
                                        const val = e.target.value as any;
                                        setEditingSchema(prev => {
                                          const blocks = [...prev.blocks];
                                          blocks[bIdx].fields[fIdx].fieldType = val;
                                          return { ...prev, blocks };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border rounded"
                                    >
                                      <option value="text">نص عادي (Text)</option>
                                      <option value="textarea">نص تفصيلي (Textarea)</option>
                                      <option value="number">رقم قياسي (Number)</option>
                                      <option value="date">تاريخ (Date)</option>
                                      <option value="manual_select">قائمة منسدلة يدوية</option>
                                      <option value="erp_select">قائمة منسدلة من الـ ERP</option>
                                      <option value="image">📷 التقاط / إرفاق صورة</option>
                                      <option value="video">🎥 إرفاق فيديو</option>
                                      <option value="audio">🎙️ تسجيل صوت</option>
                                    </select>
                                  </td>
                                  <td className="p-1.5">
                                    {f.fieldType === 'erp_select' ? (
                                      <select
                                        value={f.erpSource || 'Departments'}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setEditingSchema(prev => {
                                            const blocks = [...prev.blocks];
                                            blocks[bIdx].fields[fIdx].erpSource = val;
                                            return { ...prev, blocks };
                                          });
                                        }}
                                        className="w-full px-2 py-1 border border-emerald-400 rounded font-bold"
                                      >
                                        <option value="Departments">الأقسام وصالات الإنتاج (Departments)</option>
                                        <option value="Employees">الموظفين وفريق العمل (Employees)</option>
                                        <option value="Branches">الفروع والمعارض (Branches)</option>
                                        <option value="Products">المنتجات التامة (Products)</option>
                                        <option value="RawMaterials">الخامات والتعبئة (Materials)</option>
                                      </select>
                                    ) : f.fieldType === 'manual_select' ? (
                                      <input
                                        type="text"
                                        placeholder="مفصولة بفاصلة..."
                                        value={f.manualOptions.join(', ')}
                                        onChange={(e) => {
                                          const val = e.target.value.split(',').map(s => s.trim());
                                          setEditingSchema(prev => {
                                            const blocks = [...prev.blocks];
                                            blocks[bIdx].fields[fIdx].manualOptions = val;
                                            return { ...prev, blocks };
                                          });
                                        }}
                                        className="w-full px-2 py-1 border rounded"
                                      />
                                    ) : (
                                      <span className="text-gray-400">---</span>
                                    )}
                                  </td>
                                  <td className="p-1.5">
                                    <input
                                      type="checkbox"
                                      checked={f.isRequired}
                                      onChange={(e) => {
                                        const val = e.target.checked;
                                        setEditingSchema(prev => {
                                          const blocks = [...prev.blocks];
                                          blocks[bIdx].fields[fIdx].isRequired = val;
                                          return { ...prev, blocks };
                                        });
                                      }}
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingSchema(prev => {
                                          const blocks = [...prev.blocks];
                                          blocks[bIdx].fields = blocks[bIdx].fields.filter((_, idx) => idx !== fIdx);
                                          return { ...prev, blocks };
                                        });
                                      }}
                                      className="text-rose-600 hover:text-rose-800"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* كتلة جدول الفحص */}
                      {block.blockType === 'table' && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => addColumnToTable(bIdx)}
                                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-bold"
                              >
                                ➕ إدراج عمود للجدول
                              </button>
                              <button
                                onClick={() => addRowToTable(bIdx)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold"
                              >
                                ➕ إدراج سطر / بند فحص
                              </button>
                            </div>
                            <span className="text-gray-400 text-[11px]">
                              الأعمدة: {block.columns.length} | الصفوف: {block.rows.length}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {block.rows.map((row, rIdx) => (
                              <div key={row.id} className="flex items-center gap-2">
                                <span className="font-mono text-gray-400 w-6 text-center">{rIdx + 1}</span>
                                <input
                                  type="text"
                                  value={row.label}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingSchema(prev => {
                                      const blocks = [...prev.blocks];
                                      blocks[bIdx].rows[rIdx].label = val;
                                      return { ...prev, blocks };
                                    });
                                  }}
                                  className="flex-1 px-3 py-1.5 border rounded-lg"
                                />
                                <button
                                  onClick={() => {
                                    setEditingSchema(prev => {
                                      const blocks = [...prev.blocks];
                                      blocks[bIdx].rows = blocks[bIdx].rows.filter((_, idx) => idx !== rIdx);
                                      return { ...prev, blocks };
                                    });
                                  }}
                                  className="text-rose-600 hover:text-rose-800 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* كتلة الاعتمادات */}
                      {block.blockType === 'approval' && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 font-bold text-[11px]">مراحل القرارات والتوقيع الإلكتروني:</span>
                            <button
                              onClick={() => addApprovalStage(bIdx)}
                              className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded"
                            >
                              ➕ إضافة مستوى موافقة
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {block.approvalStages.map((stg, sIdx) => (
                              <div key={stg.stageId} className="p-3 border rounded-xl bg-slate-50 space-y-2">
                                <div className="flex justify-between items-center">
                                  <input
                                    type="text"
                                    value={stg.roleTitle}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingSchema(prev => {
                                        const blocks = [...prev.blocks];
                                        blocks[bIdx].approvalStages[sIdx].roleTitle = val;
                                        return { ...prev, blocks };
                                      });
                                    }}
                                    className="px-2 py-1 border rounded font-bold w-36"
                                  />
                                  <button
                                    onClick={() => {
                                      setEditingSchema(prev => {
                                        const blocks = [...prev.blocks];
                                        blocks[bIdx].approvalStages = blocks[bIdx].approvalStages.filter((_, idx) => idx !== sIdx);
                                        return { ...prev, blocks };
                                      });
                                    }}
                                    className="text-rose-600 hover:text-rose-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <span className="text-[10px] text-gray-500 block">يتضمن التوقيع والاعتماد الإلكتروني المباشر ✓</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* كتلة التوجيهات */}
                      {block.blockType === 'instruction' && (
                        <div>
                          <label className="block text-gray-500 font-bold text-[11px] mb-1">
                            نص التوجيهات واللوائح المعروضة أعلى المستند:
                          </label>
                          <textarea
                            rows={3}
                            value={block.instructionText || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingSchema(prev => {
                                const blocks = [...prev.blocks];
                                blocks[bIdx].instructionText = val;
                                return { ...prev, blocks };
                              });
                            }}
                            className="w-full px-3 py-2 border rounded-xl"
                            placeholder="اكتب التوجيهات هنا..."
                          ></textarea>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: استيراد المسودة من Word */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Upload className="w-4 h-4 text-white" />
                <span>استيراد مسودة من ملف Word (.docx)</span>
              </h4>
              <button onClick={() => setShowImportModal(false)} className="text-white">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-xl">
                سيقوم المحلل باستخراج الجداول والنصوص كمسودة أولية، وتستطيع فتحها في الأستوديو لضبط قوائم الـ ERP وتحديد أعمدة التقييم.
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">كود الربط المخصص (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: SHIFT_HANDOVER"
                  value={importFormCode}
                  onChange={(e) => setImportFormCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">اختر ملف Word (.docx):</label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || isImporting}
                  onClick={handleUploadAndGenerate}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isImporting ? '⏳ جاري الاستخراج والتوليد...' : '⚡ استيراد المسودة للأستوديو'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
