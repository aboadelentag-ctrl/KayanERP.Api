export type StudioFieldDefinition = {
  id: string;
  key: string;
  label: string;
  fieldType: 'text' | 'textarea' | 'number' | 'date' | 'manual_select' | 'erp_select' | 'image' | 'video' | 'audio';
  erpSource?: string;
  manualOptions: string[];
  isRequired: boolean;
  isReportFilter: boolean;
  isKpiMetric: boolean;
};

export type StudioTableColumn = {
  key: string;
  title: string;
  columnType: 'radio' | 'checkbox' | 'text' | 'number';
  options: string[];
  isComplianceScore?: boolean;
};

export type StudioTableRow = {
  id: string;
  label: string;
  itemCategory?: string;
};

export type StudioApprovalStage = {
  stageId: string;
  roleTitle: string;
  condition?: string;
  decisionOptions: string[];
  hasNotes: boolean;
  hasSignature: boolean;
};

export type FormStudioBlock = {
  id: string;
  blockType: 'fields' | 'table' | 'approval' | 'instruction';
  title: string;
  instructionText?: string;
  fields: StudioFieldDefinition[];
  columns: StudioTableColumn[];
  rows: StudioTableRow[];
  approvalStages: StudioApprovalStage[];
};

export type FormStudioSchema = {
  formCode: string;
  formTitle: string;
  category: string;
  blocks: FormStudioBlock[];
};

export type DynamicFormDto = {
  id: number;
  formName: string;
  formCode: string;
  fieldsSchema: string;
  isActive: boolean;
  createdAt: string;
};

export const fetchDynamicFormsApi = async (): Promise<DynamicFormDto[]> => {
  try {
    const res = await fetch('/api/DynamicForms');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      formName: 'استمارة تفتيش ورقابة الجودة اليومية (GMP/HACCP)',
      formCode: 'HACCP_DAILY_01',
      isActive: true,
      createdAt: '2026-10-20',
      fieldsSchema: JSON.stringify({
        formCode: 'HACCP_DAILY_01',
        formTitle: 'استمارة تفتيش ورقابة الجودة اليومية (GMP/HACCP)',
        category: 'رقابة وجودة وسلامة غذاء',
        blocks: [
          {
            id: 'blk_00',
            blockType: 'instruction',
            title: 'تعليمات وضوابط التفتيش الميداني',
            instructionText: 'يتم استيفاء هذا المحضر مرتين يومياً لكل وردية تشغيل بالصالات.\nيرجى التأكد من مطابقة النظافة الشخصية ودرجات حرارة ثلاجات التبريد قبل بدء العمل.',
            fields: [],
            columns: [],
            rows: [],
            approvalStages: []
          },
          {
            id: 'blk_01',
            blockType: 'fields',
            title: 'بيانات الفحص الأساسية',
            fields: [
              { id: 'fld_1', key: 'dept', label: 'القسم / الصالة', fieldType: 'erp_select', erpSource: 'Departments', isRequired: true, isReportFilter: true, isKpiMetric: false, manualOptions: [] },
              { id: 'fld_2', key: 'insp_date', label: 'تاريخ الفحص', fieldType: 'date', isRequired: true, isReportFilter: true, isKpiMetric: false, manualOptions: [] },
              { id: 'fld_3', key: 'inspector', label: 'مسؤول الجودة', fieldType: 'erp_select', erpSource: 'Employees', isRequired: true, isReportFilter: true, isKpiMetric: false, manualOptions: [] },
              { id: 'fld_4', key: 'shift', label: 'الوردية', fieldType: 'manual_select', manualOptions: ['صباحية', 'مسائية', 'ليلية'], isRequired: true, isReportFilter: true, isKpiMetric: false }
            ],
            columns: [],
            rows: [],
            approvalStages: []
          },
          {
            id: 'blk_02',
            blockType: 'table',
            title: 'بنود فحص نظافة الصالات والماكينات',
            fields: [],
            columns: [
              { key: 'status', title: 'التقييم', columnType: 'radio', options: ['مطابق', 'غير مطابق'], isComplianceScore: true },
              { key: 'notes', title: 'الملاحظات', columnType: 'text', options: [] },
              { key: 'verified', title: 'التحقق', columnType: 'checkbox', options: [] }
            ],
            rows: [
              { id: 'r1', label: 'نظافة وتطهير أسطح تحضير العجين والفولاذ' },
              { id: 'r2', label: 'التزام العمال بارتداء القفازات وغطاء الرأس' },
              { id: 'r3', label: 'سلامة درجات حرارة ثلاجات حفظ النصف مصنع' },
              { id: 'r4', label: 'خلو صالة الخبز من أي أدوات خشبية متهالكة' }
            ],
            approvalStages: []
          },
          {
            id: 'blk_03',
            blockType: 'approval',
            title: 'مسار الاعتماد والقرارات الرقابية',
            fields: [],
            columns: [],
            rows: [],
            approvalStages: [
              {
                stageId: 'stg_1',
                roleTitle: 'مشرف الصالة التنفيذي',
                condition: 'إقرار الالتزام بتصحيح الملاحظات فوراً',
                decisionOptions: ['أوافق وألتزم', 'أتحفظ مع إيضاح السبب'],
                hasNotes: true,
                hasSignature: true
              },
              {
                stageId: 'stg_2',
                roleTitle: 'مدير توكيد الجودة (QA)',
                condition: 'اعتماد مطابقة صالة الإنتاج للتشغيل',
                decisionOptions: ['معتمد ومطابق', 'مرفوض وموقوف'],
                hasNotes: true,
                hasSignature: true
              }
            ]
          }
        ]
      })
    },
    {
      id: 2,
      formName: 'محضر استلام وتسليم وردية التشغيل',
      formCode: 'SHIFT_HANDOVER_02',
      isActive: true,
      createdAt: '2026-10-22',
      fieldsSchema: JSON.stringify({
        formCode: 'SHIFT_HANDOVER_02',
        formTitle: 'محضر استلام وتسليم وردية التشغيل',
        category: 'تشغيل وصيانة مصانع',
        blocks: [
          {
            id: 'blk_11',
            blockType: 'fields',
            title: 'بيانات الوردية',
            fields: [
              { id: 'f1', key: 'shift_name', label: 'الوردية المستلمة', fieldType: 'manual_select', manualOptions: ['صباحية', 'مسائية', 'ليلية'], isRequired: true, isReportFilter: true, isKpiMetric: false },
              { id: 'f2', key: 'supervisor', label: 'مشرف الصالة المستلم', fieldType: 'erp_select', erpSource: 'Employees', isRequired: true, isReportFilter: true, isKpiMetric: false }
            ],
            columns: [],
            rows: [],
            approvalStages: []
          }
        ]
      })
    }
  ];
};

export const fetchErpLookupOptionsApi = async (source: string): Promise<string[]> => {
  try {
    const res = await fetch(`/api/FormImport/erp-lookups/${encodeURIComponent(source)}`);
    if (res.ok) return await res.json();
  } catch {}

  switch (source) {
    case 'Departments':
      return [
        'صالة تصنيع الحلويات الشرقية',
        'صالة تصنيع الحلويات الغربية والتورت',
        'قسم النواشف والبتيفور والكرواسون',
        'مستودع التعبئة والتغليف والتوزيع',
        'إدارة الصيانة والتشغيل المركزي',
        'إدارة الجودة وسلامة الغذاء'
      ];
    case 'Employees':
      return [
        'أحمد السعدي (مشرف صالة الشرقي)',
        'سامح فوزي (شيف جاتوه وتورت)',
        'فتحي حميده (مهندس إنتاج)',
        'م. حسام الدين (مهندس صيانة)',
        'أحمد عبد العزيز (منسق جودة)',
        'محمد وهدان (شيف صالة)'
      ];
    case 'Branches':
      return [
        'المصنع والإدارة المركزية (المنصورة)',
        'فرع دكرنس الرئيسي',
        'فرع شربين',
        'فرع منية النصر',
        'فرع بلقاس',
        'فرع الزقازيق',
        'فرع السنبلاوين'
      ];
    case 'Products':
      return [
        'بسبوسة بالسمن البلدي والمكسرات',
        'تورتة بلاك فورست وسط فاخرة',
        'كنافة أساور فستق حلبي',
        'هريسة مكسرات إسكندراني',
        'صاج مشكل شرقي فاخر'
      ];
    case 'RawMaterials':
      return [
        'دقيق فاخر 72%',
        'سكر مكرر ناعم',
        'سمن بلدي بقري طبيعي',
        'فستق حلبي محمص نمرة 1',
        'شيكولاتة خام بلجيكي'
      ];
    case 'Equipment':
      return [
        'فرن دوار أوتوماتيكي إيطالي 36 صاج (AST-OVEN-01)',
        'عجانة حلواني حلزونية 150 كجم (AST-MIX-02)',
        'ثلاجة تبريد حفظ تورت 4 باب (AST-FRG-03)'
      ];
    default:
      return ['خيار تجريبي 1', 'خيار تجريبي 2'];
  }
};

export const submitDynamicFormResponseApi = async (payload: {
  formId: number;
  submissionData: string;
  userId: number;
  submittedByName: string;
  status: string;
}): Promise<boolean> => {
  try {
    const res = await fetch('/api/DynamicForms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const saveDynamicFormApi = async (form: Partial<DynamicFormDto>): Promise<boolean> => {
  try {
    const isEdit = Boolean(form.id && form.id > 0);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/DynamicForms/${form.id}` : '/api/DynamicForms';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const toggleDynamicFormStatusApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/DynamicForms/toggle-active/${id}`, { method: 'PATCH' });
    return res.ok;
  } catch {
    return true;
  }
};

export const deleteDynamicFormApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/FormImport/delete/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
};

export const clearAllDynamicFormsApi = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/FormImport/clear-all', { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
};
