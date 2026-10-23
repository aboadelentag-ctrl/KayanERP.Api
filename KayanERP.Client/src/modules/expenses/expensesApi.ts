export interface OperatingExpense {
  id: number;
  billNumber: string;
  category: 'غاز طبيعي للأفران' | 'كهرباء المعمل والمستودعات' | 'مياه ومرافق' | 'صيانة وقطع غيار' | 'نثريات وإعاشة';
  date: string;
  dueDate: string;
  supplierOrEntityName: string; // شركة الغاز / محطة المياه / فني الصيانة
  costCenter: string; // صالة الشرقي / صالة الغربي / المصنع الرئيسي / فرع دكرنس
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentType: 'نقدي فوري' | 'آجل / ورقة دفع' | 'شيك بنكي مؤجل';
  checkNumber?: string;
  status: 'مسدد بالكامل' | 'مستحق السداد' | 'متأخر';
  notes: string;
}

const STORAGE_KEY = 'kayan_operating_expenses';

const getInitialExpenses = (): OperatingExpense[] => [
  {
    id: 1,
    billNumber: 'EXP-GAS-2026-041',
    category: 'غاز طبيعي للأفران',
    date: '2026-10-20',
    dueDate: '2026-10-25',
    supplierOrEntityName: 'شركة غاز مصر (منطقة الدقهلية)',
    costCenter: 'صالة تصنيع الحلويات الشرقية (المصنع الرئيسي)',
    amount: 14500,
    paidAmount: 14500,
    remainingAmount: 0,
    paymentType: 'نقدي فوري',
    status: 'مسدد بالكامل',
    notes: 'فاتورة استهلاك الغاز الطبيعي لشعلات الأفران الدوارة',
  },
  {
    id: 2,
    billNumber: 'EXP-POW-2026-088',
    category: 'كهرباء المعمل والمستودعات',
    date: '2026-10-22',
    dueDate: '2026-10-28',
    supplierOrEntityName: 'شركة شمال الدلتا لتوزيع الكهرباء',
    costCenter: 'غرف التبريد والتجميد المركزي (-18°C)',
    amount: 8200,
    paidAmount: 0,
    remainingAmount: 8200,
    paymentType: 'آجل / ورقة دفع',
    status: 'مستحق السداد',
    notes: 'مطالبة شهرية لتشغيل كمبروسرات التبريد وحفظ الخامات',
  },
  {
    id: 3,
    billNumber: 'EXP-MNT-2026-015',
    category: 'صيانة وقطع غيار',
    date: '2026-10-21',
    dueDate: '2026-11-05',
    supplierOrEntityName: 'مؤسسة الدلتا للصيانة الهندسية',
    costCenter: 'خط العجانات الآلية 150 كجم',
    amount: 5400,
    paidAmount: 2000,
    remainingAmount: 3400,
    paymentType: 'شيك بنكي مؤجل',
    checkNumber: 'CHK-99410',
    status: 'مستحق السداد',
    notes: 'تغيير سيور ورولمان بلي للعجانة وتصفية زيت التروس',
  },
];

export const fetchOperatingExpensesApi = async (): Promise<OperatingExpense[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  const initial = getInitialExpenses();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveOperatingExpensesToLocal = (data: OperatingExpense[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
