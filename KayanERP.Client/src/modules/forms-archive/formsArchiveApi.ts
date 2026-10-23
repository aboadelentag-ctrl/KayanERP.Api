export interface DynamicFormField {
  id: string;
  label: string;
  type: 'checkbox' | 'number' | 'text' | 'select';
  options?: string[];
  required: boolean;
}

export interface InspectionFormTemplate {
  id: number;
  templateCode: string;
  title: string;
  category: 'سلامة غذاء (HACCP)' | 'نظافة وتطهير الصالات' | 'معايرة الأفران والمعدات' | 'فحص درجات التبريد';
  targetDepartment: string;
  frequency: 'يومي (كل وردية)' | 'أسبوعي' | 'شهري';
  fieldsCount: number;
  status: 'نشط ومعتمد' | 'مسودة';
}

export interface FormSubmissionRecord {
  id: number;
  submissionCode: string;
  templateTitle: string;
  departmentName: string;
  inspectorName: string;
  submissionDate: string;
  complianceScore: number; // درجة الامتثال %
  findingsCount: number;  // عدد الملاحظات والحيود
  status: 'معتمد ومطابق' | 'يحتاج إجراء تصحيحي' | 'مرفوض كلياً';
  notes: string;
}

const STORAGE_TEMPLATES_KEY = 'kayan_form_templates_data';
const STORAGE_SUBMISSIONS_KEY = 'kayan_form_submissions_data';

const getInitialTemplates = (): InspectionFormTemplate[] => [
  {
    id: 1,
    templateCode: 'FRM-HACCP-01',
    title: 'قائمة التحقق من درجات حرارة غرف التجميد والتبريد',
    category: 'فحص درجات التبريد',
    targetDepartment: 'غرف التبريد والتجميد المركزي (-18°C)',
    frequency: 'يومي (كل وردية)',
    fieldsCount: 5,
    status: 'نشط ومعتمد',
  },
  {
    id: 2,
    templateCode: 'FRM-CL-02',
    title: 'محضر تفتيش النظافة والتعقيم الشخصي للشيفات وصالات الحلويات',
    category: 'سلامة غذاء (HACCP)',
    targetDepartment: 'صالة تصنيع الحلويات الشرقية',
    frequency: 'يومي (كل وردية)',
    fieldsCount: 6,
    status: 'نشط ومعتمد',
  },
  {
    id: 3,
    templateCode: 'FRM-OVN-03',
    title: 'سجل معايرة درجات حرارة الأفران الدوارة ومداخن الغاز',
    category: 'معايرة الأفران والمعدات',
    targetDepartment: 'صالة الأفران والمخبوزات الآلية',
    frequency: 'أسبوعي',
    fieldsCount: 4,
    status: 'نشط ومعتمد',
  },
];

const getInitialSubmissions = (): FormSubmissionRecord[] => [
  {
    id: 1,
    submissionCode: 'SUB-2026-001',
    templateTitle: 'قائمة التحقق من درجات حرارة غرف التجميد والتبريد',
    departmentName: 'غرف التبريد والتجميد المركزي',
    inspectorName: 'د. مينا عادل (مفتش الجودة والسلامة)',
    submissionDate: '2026-10-23',
    complianceScore: 100,
    findingsCount: 0,
    status: 'معتمد ومطابق',
    notes: 'درجة حرارة الكابينة -18.5°C مع مطابقة الرطوبة',
  },
  {
    id: 2,
    submissionCode: 'SUB-2026-002',
    templateTitle: 'محضر تفتيش النظافة والتعقيم الشخصي للشيفات وصالات الحلويات',
    departmentName: 'صالة تصنيع الحلويات الشرقية',
    inspectorName: 'د. مينا عادل (مفتش الجودة والسلامة)',
    submissionDate: '2026-10-23',
    complianceScore: 94,
    findingsCount: 1,
    status: 'يحتاج إجراء تصحيحي',
    notes: 'التنبيه على ارتداء واقيات القفازات المخصصة لعجن صواني الكنافة',
  },
  {
    id: 3,
    submissionCode: 'SUB-2026-003',
    templateTitle: 'سجل معايرة درجات حرارة الأفران الدوارة ومداخن الغاز',
    departmentName: 'صالة الأفران والمخبوزات الآلية',
    inspectorName: 'أحمد فؤاد (مسؤول الصيانة الفنية)',
    submissionDate: '2026-10-22',
    complianceScore: 98,
    findingsCount: 0,
    status: 'معتمد ومطابق',
    notes: 'معايرة الحساسات وثرموستات الفرن التركي رقم 1 و 2 بنجاح',
  },
];

export const fetchFormTemplatesApi = async (): Promise<InspectionFormTemplate[]> => {
  const stored = localStorage.getItem(STORAGE_TEMPLATES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialTemplates();
  localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchFormSubmissionsApi = async (): Promise<FormSubmissionRecord[]> => {
  const stored = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialSubmissions();
  localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(initial));
  return initial;
};

export const saveFormTemplatesToLocal = (data: InspectionFormTemplate[]) => {
  localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(data));
};

export const saveFormSubmissionsToLocal = (data: FormSubmissionRecord[]) => {
  localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(data));
};
