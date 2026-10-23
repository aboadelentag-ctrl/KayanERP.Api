export interface Department {
  id: number;
  code: string;
  name: string;
  type: 'صالة تصنيع وإنتاج' | 'صالة خبز وتجهيز' | 'تعبئة وتغليف' | 'لوجستيات وتوزيع' | 'معرض وبيع';
  supervisorName: string;
  workerCount: number;
  dailyCapacityKg: number;
  activeLinesCount: number;
  location: string;
  status: 'نشط ويعمل' | 'صيانة وتطهير' | 'متوقف مؤقتاً';
}

export interface DepartmentKpiMetric {
  id: number;
  departmentId: number;
  departmentName: string;
  date: string;
  efficiencyPercentage: number; // نسبة الكفاءة %
  targetOutputKg: number;
  actualOutputKg: number;
  wastePercentage: number;      // نسبة الهادر %
  downtimeMinutes: number;      // زمن التوقف بالدقائق
  safetyCompliance: number;     // درجة الامتثال لمعايير السلامة %
  statusEvaluation: 'أداء متميز' | 'ضمن المستهدف' | 'يحتاج تدخل وتحسين';
}

const STORAGE_DEPTS_KEY = 'kayan_departments_data';
const STORAGE_KPIS_KEY = 'kayan_department_kpis_data';

const getInitialDepartments = (): Department[] => [
  {
    id: 1,
    code: 'DEP-EAST',
    name: 'صالة تصنيع الحلويات الشرقية',
    type: 'صالة تصنيع وإنتاج',
    supervisorName: 'الشيف سمير إبراهيم',
    workerCount: 14,
    dailyCapacityKg: 850,
    activeLinesCount: 3,
    location: 'مجمع المصانع الرئيسي - الطابق الأول',
    status: 'نشط ويعمل',
  },
  {
    id: 2,
    code: 'DEP-WEST',
    name: 'صالة الحلويات الغربية والتورت',
    type: 'صالة تصنيع وإنتاج',
    supervisorName: 'الشيف شادي فكري',
    workerCount: 10,
    dailyCapacityKg: 400,
    activeLinesCount: 2,
    location: 'مجمع المصانع الرئيسي - الطابق الثاني',
    status: 'نشط ويعمل',
  },
  {
    id: 3,
    code: 'DEP-OVN',
    name: 'صالة الأفران والمخبوزات الآلية',
    type: 'صالة خبز وتجهيز',
    supervisorName: 'أحمد جلال (كبير الخبازين)',
    workerCount: 8,
    dailyCapacityKg: 1200,
    activeLinesCount: 4,
    location: 'عنبر الأفران المركزي',
    status: 'نشط ويعمل',
  },
  {
    id: 4,
    code: 'DEP-PKG',
    name: 'صالة التعبئة والتغليف والعلب',
    type: 'تعبئة وتغليف',
    supervisorName: 'محمود الصاوي',
    workerCount: 12,
    dailyCapacityKg: 1500,
    activeLinesCount: 2,
    location: 'عنبر التعبئة المبردة',
    status: 'نشط ويعمل',
  },
  {
    id: 5,
    code: 'DEP-LOG',
    name: 'أسطول الشحن والتوزيع الميداني',
    type: 'لوجستيات وتوزيع',
    supervisorName: 'ك. عادل منصور (مسؤول الحركة)',
    workerCount: 6,
    dailyCapacityKg: 2000,
    activeLinesCount: 4,
    location: 'حوش الشاحنات المبردة',
    status: 'نشط ويعمل',
  },
];

const getInitialKpis = (): DepartmentKpiMetric[] => [
  {
    id: 1,
    departmentId: 1,
    departmentName: 'صالة تصنيع الحلويات الشرقية',
    date: '2026-10-23',
    efficiencyPercentage: 104,
    targetOutputKg: 850,
    actualOutputKg: 884,
    wastePercentage: 1.6,
    downtimeMinutes: 20,
    safetyCompliance: 98,
    statusEvaluation: 'أداء متميز',
  },
  {
    id: 2,
    departmentId: 2,
    departmentName: 'صالة الحلويات الغربية والتورت',
    date: '2026-10-23',
    efficiencyPercentage: 96,
    targetOutputKg: 400,
    actualOutputKg: 384,
    wastePercentage: 2.1,
    downtimeMinutes: 15,
    safetyCompliance: 99,
    statusEvaluation: 'ضمن المستهدف',
  },
  {
    id: 3,
    departmentId: 3,
    departmentName: 'صالة الأفران والمخبوزات الآلية',
    date: '2026-10-23',
    efficiencyPercentage: 91,
    targetOutputKg: 1200,
    actualOutputKg: 1092,
    wastePercentage: 3.2,
    downtimeMinutes: 45,
    safetyCompliance: 95,
    statusEvaluation: 'يحتاج تدخل وتحسين',
  },
  {
    id: 4,
    departmentId: 4,
    departmentName: 'صالة التعبئة والتغليف والعلب',
    date: '2026-10-23',
    efficiencyPercentage: 101,
    targetOutputKg: 1500,
    actualOutputKg: 1515,
    wastePercentage: 0.8,
    downtimeMinutes: 10,
    safetyCompliance: 100,
    statusEvaluation: 'أداء متميز',
  },
];

export const fetchDepartmentsApi = async (): Promise<Department[]> => {
  const stored = localStorage.getItem(STORAGE_DEPTS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialDepartments();
  localStorage.setItem(STORAGE_DEPTS_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchDepartmentKpisApi = async (): Promise<DepartmentKpiMetric[]> => {
  const stored = localStorage.getItem(STORAGE_KPIS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialKpis();
  localStorage.setItem(STORAGE_KPIS_KEY, JSON.stringify(initial));
  return initial;
};

export const saveDepartmentsToLocal = (data: Department[]) => {
  localStorage.setItem(STORAGE_DEPTS_KEY, JSON.stringify(data));
};

export const saveDepartmentKpisToLocal = (data: DepartmentKpiMetric[]) => {
  localStorage.setItem(STORAGE_KPIS_KEY, JSON.stringify(data));
};
