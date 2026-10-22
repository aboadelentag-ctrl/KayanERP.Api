export interface Employee {
  id: number;
  code: string;
  name: string;
  roleTitle: 'شيف أول شرقي' | 'شيف تورت وحلواني غربي' | 'خباز أفران' | 'فني تعبئة وتغليف' | 'مساعد تشغيل';
  department: 'صالة تصنيع الحلويات الشرقية' | 'صالة الحلويات الغربية' | 'صالة الأفران' | 'التجهيز والتعبئة';
  shift: 'وردية صباحية' | 'وردية مسائية' | 'وردية ليلية';
  phone: string;
  dailyTargetKg: number; // المستهدف اليومي بالكيلو
  status: 'على رأس العمل' | 'إجازة' | 'منتدب لفرع';
}

export interface ShiftProductivityLog {
  id: number;
  date: string;
  employeeId: number;
  employeeName: string;
  shift: string;
  section: string;
  targetQuantity: number;
  actualProducedQuantity: number;
  wastePercentage: number; // نسبة الهادر المحققة
  efficiencyScore: number; // نسبة الكفاءة %
  notes: string;
}

const EMPLOYEES_KEY = 'kayan_employees_data';
const PRODUCTIVITY_KEY = 'kayan_productivity_logs';

const getInitialEmployees = (): Employee[] => [
  { id: 1, code: 'EMP-01', name: 'الشيف سمير إبراهيم', roleTitle: 'شيف أول شرقي', department: 'صالة تصنيع الحلويات الشرقية', shift: 'وردية صباحية', phone: '01011122233', dailyTargetKg: 120, status: 'على رأس العمل' },
  { id: 2, code: 'EMP-02', name: 'الشيف شادي فكري', roleTitle: 'شيف تورت وحلواني غربي', department: 'صالة الحلويات الغربية', shift: 'وردية صباحية', phone: '01044455566', dailyTargetKg: 60, status: 'على رأس العمل' },
  { id: 3, code: 'EMP-03', name: 'الشيف نبيل محمود', roleTitle: 'شيف أول شرقي', department: 'صالة تصنيع الحلويات الشرقية', shift: 'وردية مسائية', phone: '01122233344', dailyTargetKg: 100, status: 'على رأس العمل' },
  { id: 4, code: 'EMP-04', name: 'أحمد جلال', roleTitle: 'خباز أفران', department: 'صالة الأفران', shift: 'وردية صباحية', phone: '01233344455', dailyTargetKg: 150, status: 'على رأس العمل' },
  { id: 5, code: 'EMP-05', name: 'محمود الصاوي', roleTitle: 'فني تعبئة وتغليف', department: 'التجهيز والتعبئة', shift: 'وردية مسائية', phone: '01566677788', dailyTargetKg: 200, status: 'على رأس العمل' },
];

const getInitialProductivityLogs = (): ShiftProductivityLog[] => [
  { id: 1, date: '2026-10-22', employeeId: 1, employeeName: 'الشيف سمير إبراهيم', shift: 'وردية صباحية', section: 'صواني بسبوسة وكنافة', targetQuantity: 120, actualProducedQuantity: 125, wastePercentage: 1.5, efficiencyScore: 104, notes: 'إنتاجية ممتازة وهادر أقل من المعياري' },
  { id: 2, date: '2026-10-22', employeeId: 2, employeeName: 'الشيف شادي فكري', shift: 'وردية صباحية', section: 'تورت سبونج وجاتوه', targetQuantity: 60, actualProducedQuantity: 58, wastePercentage: 2.1, efficiencyScore: 96, notes: 'مطابق للمعيار المطلوب' },
  { id: 3, date: '2026-10-21', employeeId: 3, employeeName: 'الشيف نبيل محمود', shift: 'وردية مسائية', section: 'كنافة أساور وبقلاوة', targetQuantity: 100, actualProducedQuantity: 92, wastePercentage: 3.4, efficiencyScore: 92, notes: 'تأخير مؤقت بسبب صيانة خط الفريون' },
];

export const fetchEmployeesApi = async (): Promise<Employee[]> => {
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialEmployees();
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchProductivityLogsApi = async (): Promise<ShiftProductivityLog[]> => {
  const stored = localStorage.getItem(PRODUCTIVITY_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialProductivityLogs();
  localStorage.setItem(PRODUCTIVITY_KEY, JSON.stringify(initial));
  return initial;
};

export const saveEmployeesToLocal = (data: Employee[]) => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(data));
};

export const saveProductivityLogsToLocal = (data: ShiftProductivityLog[]) => {
  localStorage.setItem(PRODUCTIVITY_KEY, JSON.stringify(data));
};
