export interface CompanyEntity {
  id: number;
  code: string;
  tradeName: string;
  legalName: string;
  commercialRegister: string; // السجل التجاري
  taxNumber: string;         // البطاقة الضريبية
  activityType: string;
  headquarters: string;
  phone: string;
  email: string;
  branchesCount: number;
  status: 'نشط ومعتمد' | 'تحت التجديد';
}

export interface ShiftScheduleAssignment {
  id: number;
  scheduleCode: string;
  employeeName: string;
  roleTitle: string;
  departmentName: string;
  shiftName: 'وردية صباحية (07:00 ص - 03:00 م)' | 'وردية مسائية (03:00 م - 11:00 م)' | 'وردية ليلية (11:00 م - 07:00 ص)';
  lineAssignment: string; // خط البسبوسة / فرن الكنافة / تجهيز التورت
  workDays: string;       // السبت إلى الخميس
  restDay: string;        // الجمعة
  status: 'على رأس العمل' | 'إجازة مجدولة' | 'منتدب';
  notes: string;
}

const STORAGE_COMPANIES_KEY = 'kayan_companies_data';
const STORAGE_ROSTER_KEY = 'kayan_shift_roster_data';

const getInitialCompanies = (): CompanyEntity[] => [
  {
    id: 1,
    code: 'CMP-KYN',
    tradeName: 'مجموعة حلويات أبو عادل (كيان)',
    legalName: 'شركة كيان لتصنيع وتوزيع الحلويات الشرقية والغربية ذ.م.م',
    commercialRegister: '108422 / الدقهلية',
    taxNumber: '492-810-334',
    activityType: 'تصنيع وتوزيع الحلويات والمخبوزات وسلاسل التوريد',
    headquarters: 'المنصورة - مجمع المصانع المركزي',
    phone: '0502334455',
    email: 'info@kayan-sweets.com',
    branchesCount: 8,
    status: 'نشط ومعتمد',
  },
  {
    id: 2,
    code: 'CMP-DIST',
    tradeName: 'كيان لخطوط التوزيع والشحن المبرد',
    legalName: 'شركة كيان لخدمات النقل اللوجستي وتجارة الجملة',
    commercialRegister: '115902 / المنصورة',
    taxNumber: '612-901-772',
    activityType: 'نقل وشحن مبرد للمنتجات الغذائية بين الفروع والمحافظات',
    headquarters: 'المنصورة - حي الجامعة',
    phone: '0502778899',
    email: 'logistics@kayan-sweets.com',
    branchesCount: 4,
    status: 'نشط ومعتمد',
  },
];

const getInitialRoster = (): ShiftScheduleAssignment[] => [
  {
    id: 1,
    scheduleCode: 'RST-2026-001',
    employeeName: 'الشيف سمير إبراهيم',
    roleTitle: 'شيف أول شرقي',
    departmentName: 'صالة تصنيع الحلويات الشرقية',
    shiftName: 'وردية صباحية (07:00 ص - 03:00 م)',
    lineAssignment: 'خط صواني البسبوسة والكنافة اللوكس',
    workDays: 'السبت - الخميس',
    restDay: 'الجمعة',
    status: 'على رأس العمل',
    notes: 'مسؤول خط الإنتاج الرئيسي للشرقي',
  },
  {
    id: 2,
    scheduleCode: 'RST-2026-002',
    employeeName: 'الشيف شادي فكري',
    roleTitle: 'شيف تورت وحلواني غربي',
    departmentName: 'صالة الحلويات الغربية والتورت',
    shiftName: 'وردية صباحية (07:00 ص - 03:00 م)',
    lineAssignment: 'خط التورت الفاخرة والسبونج',
    workDays: 'السبت - الخميس',
    restDay: 'الأحد',
    status: 'على رأس العمل',
    notes: 'إشراف على تجهيز طلبيات المعارض الصباحية',
  },
  {
    id: 3,
    scheduleCode: 'RST-2026-003',
    employeeName: 'أحمد جلال',
    roleTitle: 'كبير الخبازين',
    departmentName: 'صالة الأفران والمخبوزات الآلية',
    shiftName: 'وردية ليلية (11:00 م - 07:00 ص)',
    lineAssignment: 'الأفران الدوارة التركية 1 و 2',
    workDays: 'السبت - الخميس',
    restDay: 'الجمعة',
    status: 'على رأس العمل',
    notes: 'خبز صواني الصباح الباكر وتجهيز شحنات الفروع',
  },
  {
    id: 4,
    scheduleCode: 'RST-2026-004',
    employeeName: 'الشيف نبيل محمود',
    roleTitle: 'شيف شرقي مساعد',
    departmentName: 'صالة تصنيع الحلويات الشرقية',
    shiftName: 'وردية مسائية (03:00 م - 11:00 م)',
    lineAssignment: 'خط البقلاوات والجلاش والمشكلات',
    workDays: 'السبت - الخميس',
    restDay: 'الإثنين',
    status: 'على رأس العمل',
    notes: 'تغطية إنتاج المساء لتغذية المعارض الرئيسية',
  },
];

export const fetchCompaniesApi = async (): Promise<CompanyEntity[]> => {
  const stored = localStorage.getItem(STORAGE_COMPANIES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialCompanies();
  localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchShiftRosterApi = async (): Promise<ShiftScheduleAssignment[]> => {
  const stored = localStorage.getItem(STORAGE_ROSTER_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialRoster();
  localStorage.setItem(STORAGE_ROSTER_KEY, JSON.stringify(initial));
  return initial;
};

export const saveCompaniesToLocal = (data: CompanyEntity[]) => {
  localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(data));
};

export const saveShiftRosterToLocal = (data: ShiftScheduleAssignment[]) => {
  localStorage.setItem(STORAGE_ROSTER_KEY, JSON.stringify(data));
};
