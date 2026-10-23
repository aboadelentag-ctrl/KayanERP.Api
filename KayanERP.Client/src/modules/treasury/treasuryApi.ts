export interface TreasuryVoucher {
  id: number;
  voucherNumber: string;
  type: 'سند قبض نقدية' | 'سند صرف نقدية';
  date: string;
  treasuryAccountId: number;
  treasuryName: string;
  targetAccountId: number;
  targetAccountName: string;
  amount: number;
  paymentMethod: 'نقدي' | 'شيك بنكي' | 'تحويل فوري';
  checkNumber?: string;
  receivedFromOrPaidTo: string; // استلمنا من / صرفنا إلى
  description: string;
  status: 'معتمد ومرحل' | 'مسودة';
  createdBy: string;
}

export interface TreasuryBalanceInfo {
  accountId: number;
  accountCode: string;
  name: string;
  currentBalance: number;
}

const STORAGE_KEY = 'kayan_treasury_vouchers';

const getInitialVouchers = (): TreasuryVoucher[] => [
  {
    id: 1,
    voucherNumber: 'VCH-REC-2026-001',
    type: 'سند قبض نقدية',
    date: '2026-10-23',
    treasuryAccountId: 3,
    treasuryName: 'خزينة المركز الرئيسي والمصنع',
    targetAccountId: 6,
    targetAccountName: 'أرصدة العملاء والمدينون',
    amount: 15000,
    paymentMethod: 'نقدي',
    receivedFromOrPaidTo: 'سوبر ماركت الفهد (تحصيل دفعة)',
    description: 'تحصيل نقدي تحت حساب مديونية فواتير توريد الحلويات',
    status: 'معتمد ومرحل',
    createdBy: 'أحمد سعيد (أمين الخزينة)',
  },
  {
    id: 2,
    voucherNumber: 'VCH-PAY-2026-001',
    type: 'سند صرف نقدية',
    date: '2026-10-23',
    treasuryAccountId: 3,
    treasuryName: 'خزينة المركز الرئيسي والمصنع',
    targetAccountId: 14,
    targetAccountName: 'حسابات الموردين (ذمم دائنة)',
    amount: 10000,
    paymentMethod: 'نقدي',
    receivedFromOrPaidTo: 'شركة مطاحن الدلتا والصعيد',
    description: 'سداد دفعة نقدية فورية من مستحقات توريد الدقيق الفاخر',
    status: 'معتمد ومرحل',
    createdBy: 'خالد ممدوح (رئيس الحسابات)',
  },
  {
    id: 3,
    voucherNumber: 'VCH-PAY-2026-002',
    type: 'سند صرف نقدية',
    date: '2026-10-22',
    treasuryAccountId: 4,
    treasuryName: 'خزينة فرع دكرنس',
    targetAccountId: 25,
    targetAccountName: 'استهلاك غاز وكهرباء المعمل',
    amount: 3200,
    paymentMethod: 'نقدي',
    receivedFromOrPaidTo: 'محصل شركة كهرباء الدقهلية',
    description: 'سداد فاتورة استهلاك كهرباء تشغيل صالة العرض والمخازن',
    status: 'معتمد ومرحل',
    createdBy: 'مشرف فرع دكرنس',
  },
];

export const fetchTreasuryVouchersApi = async (): Promise<TreasuryVoucher[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  const initial = getInitialVouchers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveTreasuryVouchersToLocal = (data: TreasuryVoucher[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
