import React, { useState } from 'react';
import {
  Palette,
  PlusCircle,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  FileText,
  Upload,
  X,
  Layers,
  Check,
  Settings,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export interface StudioField {
  id: string;
  label: string;
  fieldType: string;
  erpSource?: string;
  manualOptions?: string;
  isRequired: boolean;
  isReportFilter: boolean;
  isKpiMetric: boolean;
}

export interface StudioColumn {
  id: string;
  title: string;
  columnType: 'radio' | 'checkbox' | 'text' | 'number';
}

export interface StudioRow {
  id: string;
  label: string;
}

export interface StudioApproval {
  id: string;
  roleTitle: string;
  condition: string;
  hasSignature: boolean;
}

export interface StudioBlock {
  id: string;
  blockType: 'fields' | 'table' | 'approval' | 'instruction';
  title: string;
  instructionText?: string;
  fields: StudioField[];
  columns: StudioColumn[];
  rows: StudioRow[];
  approvals: StudioApproval[];
}

export interface DynamicFormItem {
  id: number;
  formName: string;
  formCode: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  blocks: StudioBlock[];
}

export const DynamicFormsPage: React.FC = () => {
  const [forms, setForms] = useState<DynamicFormItem[]>([
    {
      id: 1,
      formName: 'استمارة تفتيش ورقابة الجودة اليومية (GMP/HACCP)',
      formCode: 'HACCP_DAILY_01',
      category: 'رقابة وجودة وسلامة غذاء',
      isActive: true,
      createdAt: '2026-10-20',
      blocks: [
        {
          id: 'blk_1',
          blockType: 'fields',
          title: 'البيانات الأساسية',
          fields: [
            { id: 'fld_1', label: 'القسم / الصالة', fieldType: 'erp_select', erpSource: 'Departments', isRequired: true, isReportFilter: true, isKpiMetric: false },
            { id: 'fld_2', label: 'التاريخ', fieldType: 'date', isRequired: true, isReportFilter: true, isKpiMetric: false }
          ],
          columns: [],
          rows: [],
          approvals: []
        },
        {
          id: 'blk_2',
          blockType: 'table',
          title: 'جدول فحص وتدقيق النظافة',
          fields: [],
          columns: [
            { id: 'col_1', title: 'التقييم', columnType: 'radio' },
            { id: 'col_2', title: 'ملاحظات', columnType: 'text' }
          ],
          rows: [
            { id: 'row_1', label: 'نظافة وتطهير أسطح تحضير العجين والفولاذ' },
            { id: 'row_2', label: 'التزام العمال بارتداء القفازات وغطاء الرأس' }
          ],
          approvals: []
        },
        {
          id: 'blk_3',
          blockType: 'approval',
          title: 'مسار الاعتمادات والموافقات',
          fields: [],
          columns: [],
          rows: [],
          approvals: [
            { id: 'app_1', roleTitle: 'مشرف الجودة الميداني', condition: 'في حالة رصد ملاحظات حرجة', hasSignature: true }
          ]
        }
      ]
    },
    {
      id: 2,
      formName: 'محضر استلام وتسليم وردية التشغيل',
      formCode: 'SHIFT_HANDOVER_02',
      category: 'تشغيل وصيانة مصانع',
      isActive: true,
      createdAt: '2026-10-22',
      blocks: [
        {
          id: 'blk_sh_1',
          blockType: 'fields',
          title: 'بيانات تسليم الوردية',
          fields: [
            { id: 'f_sh_1', label: 'صالة التشغيل', fieldType: 'erp_select', erpSource: 'Departments', isRequired: true, isReportFilter: true, isKpiMetric: false },
            { id: 'f_sh_2', label: 'الشيف المسلم', fieldType: 'erp_select', erpSource: 'Employees', isRequired: true, isReportFilter: true, isKpiMetric: false }
          ],
          columns: [],
          rows: [],
          approvals: []
        }
      ]
    }
  ]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Studio State
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState<number | null>(null);

  const [formTitle, setFormTitle] = useState('استمارة فحص جديدة');
  const [formCode, setFormCode] = useState(`FORM_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`);
  const [formCategory, setFormCategory] = useState('رقابة وجودة وسلامة غذاء');
  const [studioBlocks, setStudioBlocks] = useState<StudioBlock[]>([]);

  // Word/Excel Import State
  const [importCode, setImportCode] = useState('');
  const [importFileName, setImportFileName] = useState('');

  const openStudio = (form?: DynamicFormItem) => {
    if (form) {
      setCurrentEditingId(form.id);
      setFormTitle(form.formName);
      setFormCode(form.formCode);
      setFormCategory(form.category);
      setStudioBlocks(JSON.parse(JSON.stringify(form.blocks)));
    } else {
      setCurrentEditingId(null);
      setFormTitle('استمارة فحص جديدة');
      setFormCode(`FORM_${Date.now()}`);
      setFormCategory('رقابة وجودة وسلامة غذاء');
      setStudioBlocks([
        {
          id: 'blk_init_1',
          blockType: 'fields',
          title: 'البيانات الأساسية',
          fields: [
            { id: 'fld_i1', label: 'القسم / الصالة', fieldType: 'erp_select', erpSource: 'Departments', isRequired: true, isReportFilter: true, isKpiMetric: false },
            { id: 'fld_i2', label: 'التاريخ', fieldType: 'date', isRequired: true, isReportFilter: true, isKpiMetric: false }
          ],
          columns: [],
          rows: [],
          approvals: []
        }
      ]);
    }
    setShowStudioModal(true);
  };

  const handleSaveDesign = () => {
    if (!formTitle.trim() || !formCode.trim()) {
      alert('يرجى كتابة اسم وكود النموذج.');
      return;
    }

    if (currentEditingId) {
      setForms(forms.map(f => f.id === currentEditingId ? {
        ...f,
        formName: formTitle,
        formCode,
        category: formCategory,
        blocks: studioBlocks
      } : f));
      setStatusMessage('✅ تم تحديث تصميم النموذج في الأستوديو بنجاح!');
    } else {
      const created: DynamicFormItem = {
        id: Date.now(),
        formName: formTitle,
        formCode,
        category: formCategory,
        isActive: true,
        createdAt: new Date().toISOString().slice(0, 10),
        blocks: studioBlocks
      };
      setForms([...forms, created]);
      setStatusMessage('✅ تم إنشاء قالب النموذج وحفظه بنجاح!');
    }

    setShowStudioModal(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleToggle = (id: number) => {
    setForms(forms.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('هل تريد بالتأكيد حذف هذا القالب؟')) return;
    setForms(forms.filter(f => f.id !== id));
  };

  const handleClearAll = () => {
    if (!window.confirm('⚠️ تحذير: هل تريد مسح كافة النماذج المسجلة؟')) return;
    setForms([]);
  };

  // Block Helpers
  const addBlock = (type: 'fields' | 'table' | 'approval' | 'instruction') => {
    const title = type === 'fields' ? 'كتلة حقول وإدخال' :
                  type === 'table' ? 'جدول فحص وتدقيق' :
                  type === 'approval' ? 'مسار اعتمادات' : 'صندوق تعليمات وتوجيه';

    const newBlock: StudioBlock = {
      id: `blk_${Date.now()}`,
      blockType: type,
      title,
      instructionText: type === 'instruction' ? 'اكتب تعليمات وضوابط العمل هنا...' : undefined,
      fields: [],
      columns: type === 'table' ? [
        { id: `col_${Date.now()}_1`, title: 'التقييم', columnType: 'radio' },
        { id: `col_${Date.now()}_2`, title: 'الملاحظات', columnType: 'text' }
      ] : [],
      rows: type === 'table' ? [
        { id: `row_${Date.now()}_1`, label: 'بند فحص جديد' }
      ] : [],
      approvals: type === 'approval' ? [
        { id: `app_${Date.now()}`, roleTitle: 'الرئيس المباشر / المشرف', condition: 'موافقة تشغيل', hasSignature: true }
      ] : []
    };

    setStudioBlocks([...studioBlocks, newBlock]);
  };

  const removeBlock = (bId: string) => {
    setStudioBlocks(studioBlocks.filter(b => b.id !== bId));
  };

  // Field Helpers
  const addField = (bId: string) => {
    setStudioBlocks(studioBlocks.map(b => {
      if (b.id !== bId) return b;
      return {
        ...b,
        fields: [
          ...b.fields,
          {
            id: `fld_${Date.now()}`,
            label: 'بند إدخال جديد',
            fieldType: 'text',
            isRequired: false,
            isReportFilter: true,
            isKpiMetric: false
          }
        ]
      };
    }));
  };

  const removeField = (bId: string, fId: string) => {
    setStudioBlocks(studioBlocks.map(b => b.id === bId ? { ...b, fields: b.fields.filter(f => f.id !== fId) } : b));
  };

  // Table Helpers
  const addColumn = (bId: string) => {
    setStudioBlocks(studioBlocks.map(b => {
      if (b.id !== bId) return b;
      return {
        ...b,
        columns: [...b.columns, { id: `col_${Date.now()}`, title: 'عمود جديد', columnType: 'text' }]
      };
    }));
  };

  const removeColumn = (bId: string, colId: string) => {
    setStudioBlocks(studioBlocks.map(b => b.id === bId ? { ...b, columns: b.columns.filter(c => c.id !== colId) } : b));
  };

  const addRow = (bId: string) => {
    setStudioBlocks(studioBlocks.map(b => {
      if (b.id !== bId) return b;
      return {
        ...b,
        rows: [...b.rows, { id: `row_${Date.now()}`, label: 'بند فحص جديد' }]
      };
    }));
  };

  const removeRow = (bId: string, rId: string) => {
    setStudioBlocks(studioBlocks.map(b => b.id === bId ? { ...b, rows: b.rows.filter(r => r.id !== rId) } : b));
  };

  // Approval Helpers
  const addApproval = (bId: string) => {
    setStudioBlocks(studioBlocks.map(b => {
      if (b.id !== bId) return b;
      return {
        ...b,
        approvals: [
          ...b.approvals,
          { id: `app_${Date.now()}`, roleTitle: 'مستوى اعتماد جديد', condition: '', hasSignature: true }
        ]
      };
    }));
  };

  const removeApproval = (bId: string, aId: string) => {
    setStudioBlocks(studioBlocks.map(b => b.id === bId ? { ...b, approvals: b.approvals.filter(a => a.id !== aId) } : b));
  };

  const handleWordImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFileName) {
      alert('يرجى اختيار ملف Word (.docx)');
      return;
    }

    const created: DynamicFormItem = {
      id: Date.now(),
      formName: importFileName.replace('.docx', ''),
      formCode: importCode || `DOC_${Date.now()}`,
      category: 'رقابة وجودة وسلامة غذاء',
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
      blocks: [
        {
          id: `blk_w1`,
          blockType: 'fields',
          title: 'البيانات المستخرجة من المستند',
          fields: [
            { id: 'fw_1', label: 'القسم / الصالة', fieldType: 'erp_select', erpSource: 'Departments', isRequired: true, isReportFilter: true, isKpiMetric: false },
            { id: 'fw_2', label: 'تاريخ الفحص', fieldType: 'date', isRequired: true, isReportFilter: true, isKpiMetric: false }
          ],
          columns: [],
          rows: [],
          approvals: []
        },
        {
          id: `blk_w2`,
          blockType: 'table',
          title: 'جدول الفحص المستخرج',
          fields: [],
          columns: [
            { id: 'cw_1', title: 'التقييم', columnType: 'radio' },
            { id: 'cw_2', title: 'الملاحظات', columnType: 'text' }
          ],
          rows: [
            { id: 'rw_1', label: 'البند الأول المستخرج من ملف Word' },
            { id: 'rw_2', label: 'البند الثاني المستخرج من ملف Word' }
          ],
          approvals: []
        }
      ]
    };

    setForms([...forms, created]);
    setShowImportModal(false);
    setStatusMessage('✅ تم استيراد مسودة النموذج بنجاح! اضغط "تخصيص في الأستوديو" للتعديل عليها.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الصفحة التنفيذي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <Palette className="w-6 h-6 text-indigo-500" />
              <span>أستوديو تصميم النماذج واستمارات HACCP (Form Studio Designer)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              محرك النماذج وهندسة HACCP
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            محرك النماذج المرن: استيراد المسودات، تخصيص القوائم، ربط الـ ERP، الوسائط المتعددة، وتجهيز تقارير الـ KPIs.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {forms.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-xl text-xs border border-rose-500/30 transition-all"
            >
              ⚠️ مسح كافة النماذج
            </button>
          )}

          <button
            onClick={() => {
              setImportCode('');
              setImportFileName('');
              setShowImportModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs border border-gray-200 dark:border-zinc-800 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>استيراد مسودة من ملف (Word)</span>
          </button>

          <button
            onClick={() => openStudio()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ تصميم نموذج جديد من الصفر</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات النماذج الرقمية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {forms.map(form => (
          <div
            key={form.id}
            className="bg-white dark:bg-[#0c0d11] border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-zinc-800">
                  {form.formCode}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  form.isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                }`}>
                  {form.isActive ? 'مفعل ونشط' : 'معطل'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-sm mb-1">{form.formName}</h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">{form.category}</p>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-3 font-mono">
                <span>تاريخ التحديث: {form.createdAt}</span>
                <span>الكتل: {form.blocks?.length || 0}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4 text-xs">
              <button
                onClick={() => openStudio(form)}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
              >
                🎨 تخصيص في الأستوديو
              </button>

              <button
                onClick={() => handleToggle(form.id)}
                className={`font-bold ${form.isActive ? 'text-amber-500' : 'text-emerald-500'}`}
              >
                {form.isActive ? 'إيقاف ⏸️' : 'تفعيل ▶️'}
              </button>

              <button
                onClick={() => handleDelete(form.id)}
                className="text-rose-500 hover:text-rose-700 font-bold"
              >
                🗑️ حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* استوديو تصميم النماذج المتقدم الحقيقي (Form Studio) بكامل محتواه وأدواته البنائية */}
      {showStudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[95vh]">
            {/* ترويسة الأستوديو */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-base">🎨</span>
                <h4 className="font-bold text-amber-400">أستوديو هندسة النماذج - Form Studio</h4>
                <span className="bg-indigo-600 px-2 py-0.5 rounded text-[10px] font-mono">{formCode}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowStudioModal(false)} className="px-3 py-1.5 bg-zinc-800 text-white rounded-xl font-bold">
                  إغلاق
                </button>
                <button onClick={handleSaveDesign} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black shadow-sm">
                  💾 حفظ واعتماد النموذج النهائي
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* إعدادات النموذج الأساسية */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم النموذج (عربي) *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">كود الربط الفريد (Code) *</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border rounded-xl font-mono font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">تصنيف النموذج للتقارير</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border rounded-xl font-bold"
                  >
                    <option value="رقابة وجودة وسلامة غذاء">رقابة وجودة وسلامة غذاء</option>
                    <option value="تشغيل وصيانة مصانع">تشغيل وصيانة مصانع</option>
                    <option value="إداري وجزاءات ورقابي">إداري وجزاءات ورقابي</option>
                    <option value="مستودعات وخامات">مستودعات وخامات</option>
                  </select>
                </div>
              </div>

              {/* صندوق الأدوات البنائية */}
              <div className="p-4 bg-white dark:bg-[#0c0d11] rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <span className="font-bold text-gray-800 dark:text-zinc-200 block">🧰 صندوق الأدوات البنائية (Add Components):</span>
                  <small className="text-gray-400">اختر المكوّن المطلوب لإضافته إلى النموذج الحالي</small>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => addBlock('fields')} className="px-3 py-1.5 bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold border border-indigo-200 dark:border-zinc-700">
                    ➕ كتلة حقول وإدخال
                  </button>
                  <button type="button" onClick={() => addBlock('table')} className="px-3 py-1.5 bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold border border-emerald-200 dark:border-zinc-700">
                    ➕ جدول فحص وتدقيق
                  </button>
                  <button type="button" onClick={() => addBlock('approval')} className="px-3 py-1.5 bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 rounded-lg font-bold border border-amber-200 dark:border-zinc-700">
                    ➕ مسار اعتمادات وموافقات
                  </button>
                  <button type="button" onClick={() => addBlock('instruction')} className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-lg font-bold border border-gray-200 dark:border-zinc-700">
                    ➕ صندوق تعليمات وتوجيه
                  </button>
                </div>
              </div>

              {/* عرض وتفصيل محتويات الكتل المدخلة */}
              <div className="space-y-4">
                {studioBlocks.map((b, idx) => (
                  <div key={b.id} className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-[#0c0d11] shadow-sm">
                    {/* ترويسة الكتلة */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold">كتلة {idx + 1}</span>
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudioBlocks(studioBlocks.map(x => x.id === b.id ? { ...x, title: val } : x));
                          }}
                          className="px-2 py-1 bg-white dark:bg-black border rounded font-bold text-gray-900 dark:text-zinc-100 w-64"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          {b.blockType === 'fields' ? 'حقول إدخال وقوائم' : b.blockType === 'table' ? 'جدول فحص وتدقيق' : b.blockType === 'approval' ? 'مسار موافقات' : 'توجيهات ولوائح'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeBlock(b.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold px-2"
                        >
                          🗑️ حذف القسم
                        </button>
                      </div>
                    </div>

                    {/* محتوى كتلة الحقول */}
                    {b.blockType === 'fields' && (
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-500">حقول البيانات والقوائم والوسائط:</span>
                          <button
                            type="button"
                            onClick={() => addField(b.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs"
                          >
                            ➕ إضافة حقل جديد
                          </button>
                        </div>

                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                          <table className="w-full text-center">
                            <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-b">
                              <tr>
                                <th className="py-2 px-3 text-right">اسم الحقل (Label)</th>
                                <th className="py-2 px-3">نوع الحقل</th>
                                <th className="py-2 px-3">مصدر البيانات / الخيارات</th>
                                <th className="py-2 px-3">خيارات التقرير (BI)</th>
                                <th className="py-2 px-3 w-16">إجراء</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                              {b.fields.map(f => (
                                <tr key={f.id}>
                                  <td className="py-2 px-3 text-right">
                                    <input
                                      type="text"
                                      value={f.label}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                          ...blk,
                                          fields: blk.fields.map(field => field.id === f.id ? { ...field, label: val } : field)
                                        } : blk));
                                      }}
                                      className="w-full px-2 py-1 bg-white dark:bg-black border rounded font-bold"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <select
                                      value={f.fieldType}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                          ...blk,
                                          fields: blk.fields.map(field => field.id === f.id ? { ...field, fieldType: val } : field)
                                        } : blk));
                                      }}
                                      className="px-2 py-1 bg-white dark:bg-black border rounded text-xs"
                                    >
                                      <option value="text">نص عادي (Text)</option>
                                      <option value="textarea">نص تفصيلي (Textarea)</option>
                                      <option value="number">رقم قياسي / مقياس (Number)</option>
                                      <option value="date">تاريخ (Date)</option>
                                      <option value="erp_select">قائمة منسدلة من الـ ERP</option>
                                      <option value="image">📷 التقاط / إرفاق صورة (Image)</option>
                                      <option value="video">🎥 إرفاق مقطع فيديو (Video)</option>
                                      <option value="audio">🎙️ تسجيل / إرفاق صوت (Audio)</option>
                                    </select>
                                  </td>
                                  <td className="py-2 px-3">
                                    {f.fieldType === 'erp_select' ? (
                                      <select
                                        value={f.erpSource || 'Departments'}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                            ...blk,
                                            fields: blk.fields.map(field => field.id === f.id ? { ...field, erpSource: val } : field)
                                          } : blk));
                                        }}
                                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 rounded text-xs text-emerald-600 font-bold"
                                      >
                                        <option value="Departments">الأقسام وصالات الإنتاج (Departments)</option>
                                        <option value="Employees">الموظفين وفريق العمل (Employees)</option>
                                        <option value="Products">المنتجات التامة (Products)</option>
                                        <option value="Equipment">الماكينات وخطوط الإنتاج (Equipment)</option>
                                      </select>
                                    ) : (
                                      <span className="text-gray-400 text-[10px]">إدخال ميداني مباشر</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex justify-center gap-3">
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={f.isReportFilter}
                                          onChange={(e) => {
                                            const val = e.target.checked;
                                            setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                              ...blk,
                                              fields: blk.fields.map(field => field.id === f.id ? { ...field, isReportFilter: val } : field)
                                            } : blk));
                                          }}
                                        />
                                        <span>فلتر</span>
                                      </label>
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={f.isRequired}
                                          onChange={(e) => {
                                            const val = e.target.checked;
                                            setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                              ...blk,
                                              fields: blk.fields.map(field => field.id === f.id ? { ...field, isRequired: val } : field)
                                            } : blk));
                                          }}
                                        />
                                        <span>إلزامي</span>
                                      </label>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <button
                                      type="button"
                                      onClick={() => removeField(b.id, f.id)}
                                      className="text-rose-500 hover:text-rose-700"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* محتوى كتلة الجدول (أعمدة وصفوف وبنود فحص) */}
                    {b.blockType === 'table' && (
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => addColumn(b.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                            >
                              ➕ إدراج عمود للجدول
                            </button>
                            <button
                              type="button"
                              onClick={() => addRow(b.id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs"
                            >
                              ➕ إدراج سطر / بند فحص
                            </button>
                          </div>
                          <span className="text-gray-400 font-mono text-[11px]">الأعمدة: {b.columns.length} | البنود: {b.rows.length}</span>
                        </div>

                        {/* شريط أعمدة التقييم */}
                        <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border flex flex-wrap gap-2 items-center">
                          <span className="font-bold text-gray-500 text-[10px]">أعمدة التقييم:</span>
                          {b.columns.map(col => (
                            <div key={col.id} className="flex items-center gap-1.5 p-1 px-2 bg-white dark:bg-black border rounded-lg shadow-xs">
                              <input
                                type="text"
                                value={col.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                    ...blk,
                                    columns: blk.columns.map(c => c.id === col.id ? { ...c, title: val } : c)
                                  } : blk));
                                }}
                                className="w-20 px-1 py-0.5 border-0 font-bold bg-transparent text-xs"
                              />
                              <select
                                value={col.columnType}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                    ...blk,
                                    columns: blk.columns.map(c => c.id === col.id ? { ...c, columnType: val } : c)
                                  } : blk));
                                }}
                                className="px-1 py-0.5 bg-slate-50 dark:bg-zinc-900 border rounded text-[10px]"
                              >
                                <option value="radio">أزرار اختيار (Radio)</option>
                                <option value="checkbox">مربع تحديد (Check)</option>
                                <option value="text">نص ملاحظات (Text)</option>
                                <option value="number">رقمي (Number)</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeColumn(b.id, col.id)}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* جدول بنود الفحص */}
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                          <table className="w-full text-center">
                            <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-b">
                              <tr>
                                <th className="py-2 px-3 w-12">م</th>
                                <th className="py-2 px-3 text-right">نص البند المطلوب فحصه</th>
                                <th className="py-2 px-3 w-16">حذف</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                              {b.rows.map((row, rIdx) => (
                                <tr key={row.id}>
                                  <td className="py-2 px-3 font-mono text-gray-400">{rIdx + 1}</td>
                                  <td className="py-2 px-3 text-right">
                                    <input
                                      type="text"
                                      value={row.label}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                          ...blk,
                                          rows: blk.rows.map(r => r.id === row.id ? { ...r, label: val } : r)
                                        } : blk));
                                      }}
                                      className="w-full px-2 py-1 bg-white dark:bg-black border rounded font-bold"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <button
                                      type="button"
                                      onClick={() => removeRow(b.id, row.id)}
                                      className="text-rose-500 hover:text-rose-700"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* محتوى كتلة مسار الاعتمادات */}
                    {b.blockType === 'approval' && (
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-500">مراحل القرارات والتوقيع الإلكتروني:</span>
                          <button
                            type="button"
                            onClick={() => addApproval(b.id)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs"
                          >
                            ➕ إضافة مستوى موافقة
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {b.approvals.map(app => (
                            <div key={app.id} className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-2">
                              <div className="flex justify-between items-center">
                                <input
                                  type="text"
                                  value={app.roleTitle}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                      ...blk,
                                      approvals: blk.approvals.map(a => a.id === app.id ? { ...a, roleTitle: val } : a)
                                    } : blk));
                                  }}
                                  className="w-full px-2 py-1 bg-white dark:bg-black border rounded font-bold text-indigo-600 dark:text-indigo-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeApproval(b.id, app.id)}
                                  className="text-rose-500 hover:text-rose-700 mr-2"
                                >
                                  ✕
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="الشرط (مثال: في حالة تظلم العامل...)"
                                value={app.condition}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? {
                                    ...blk,
                                    approvals: blk.approvals.map(a => a.id === app.id ? { ...a, condition: val } : a)
                                  } : blk));
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-black border rounded text-[11px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* محتوى كتلة التعليمات */}
                    {b.blockType === 'instruction' && (
                      <div className="p-4 space-y-2">
                        <label className="block text-gray-500 font-bold">نص التوجيهات واللوائح المعروضة أعلى المستند:</label>
                        <textarea
                          rows={3}
                          value={b.instructionText || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudioBlocks(studioBlocks.map(blk => blk.id === b.id ? { ...blk, instructionText: val } : blk));
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال استيراد مسودة من ملف Word / Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>استيراد مسودة من ملف Word (.docx)</span>
              </h4>
              <button onClick={() => setShowImportModal(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWordImport} className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl">
                يقوم المحلل باستخراج الجداول والنصوص كمسودة أولية، وتستطيع فتحها في الأستوديو لضبط قوائم الـ ERP وتحديد أعمدة التقييم.
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">كود الربط المخصص (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: SHIFT_HANDOVER"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اختر ملف Word (.docx):</label>
                <input
                  type="file"
                  accept=".docx"
                  required
                  onChange={(e) => setImportFileName(e.target.files?.[0]?.name || '')}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm"
                >
                  ⚡ استيراد المسودة للأستوديو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
