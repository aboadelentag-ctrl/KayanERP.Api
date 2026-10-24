export interface TreasuryVoucherDto {
  id: number;
  voucherNumber: string;
  voucherType: 'RECEIPT' | 'PAYMENT';
  voucherDate: string;
  amount: number;
  treasuryCode: string;
  treasuryName: string;
  branchName: string;
  partyType: 'CUSTOMER' | 'EXPENSE' | 'SUPPLIER';
  partyId?: number | null;
  partyName: string;
  oppositeAccountCode: string;
  oppositeAccountName: string;
  paymentMethod: 'نقدي (كاش)' | 'تحويل بنكي / محفظة إلكترونية' | 'شيك بنكي';
  description: string;
  createdBy: string;
}

export interface PartyLookupDto {
  id: number;
  code: string;
  name: string;
  phone: string;
}

const STORAGE_VOUCHERS_KEY = 'kayan_treasury_vouchers_data';
const STORAGE_PARTIES_KEY = 'kayan_treasury_parties_lookup';

const initialParties: PartyLookupDto[] = [
  { id: 1, code: 'CUST-101', name: 'مؤسسة البركة لتوزيع الحلويات (دكرنس)', phone: '01012345678' },
  { id: 2, code: 'CUST-102', name: 'معارض التوحيد والنور (شربين)', phone: '01123456789' },
  { id: 3, code: 'CUST-103', name: 'سوبر ماركت الفهد (المنصورة)', phone: '01234567890' },
  { id: 4, code: 'CUST-104', name: 'موزع حلويات منية النصر الرئيسي', phone: '01545678901' },
];

const initialVouchers: TreasuryVoucherDto[] = [
  {
    id: 1,
    voucherNumber: 'VCH-REC-2026-001',
    voucherType: 'RECEIPT',
    voucherDate: '2026-10-24',
    amount: 85000,
    treasuryCode: '1212',
    treasuryName: 'خزينة فرع التوزيع الخارجي',
    branchName: 'فرع المبيعات الخارجية والتوزيع',
    partyType: 'CUSTOMER',
    partyId: 1,
    partyName: 'مؤسسة البركة لتوزيع الحلويات (دكرنس)',
    oppositeAccountCode: '1221',
    oppositeAccountName: 'حسابات كبار التجار والعملاء',
    paymentMethod: 'نقدي (كاش)',
    description: 'تحصيل دفعة نقدية عن فواتير توزيع طلبيات صواني البسبوسة والكنافة للأسبوع الثالث',
    createdBy: 'كاشير التوزيع',
  },
  {
    id: 2,
    voucherNumber: 'VCH-PAY-2026-002',
    voucherType: 'PAYMENT',
    voucherDate: '2026-10-23',
    amount: 14500,
    treasuryCode: '1211',
    treasuryName: 'الخزينة الرئيسية - المصنع',
    branchName: 'المعرض الرئيسي (المصنع)',
    partyType: 'EXPENSE',
    partyId: null,
    partyName: 'فاتورة غاز صالة الشرقي والأفران الدوارة',
    oppositeAccountCode: '53',
    oppositeAccountName: 'مصاريف غاز وصيانة الصالات',
    paymentMethod: 'نقدي (كاش)',
    description: 'سداد استهلاك عداد الغاز الصناعي لخط أفران تسوية صالة الشرقي عن شهر أكتوبر',
    createdBy: 'المحاسب المالي',
  },
  {
    id: 3,
    voucherNumber: 'VCH-REC-2026-003',
    voucherType: 'RECEIPT',
    voucherDate: '2026-10-22',
    amount: 42000,
    treasuryCode: '1211',
    treasuryName: 'الخزينة الرئيسية - المصنع',
    branchName: 'المعرض الرئيسي (المصنع)',
    partyType: 'CUSTOMER',
    partyId: 2,
    partyName: 'معارض التوحيد والنور (شربين)',
    oppositeAccountCode: '1221',
    oppositeAccountName: 'حسابات كبار التجار والعملاء',
    paymentMethod: 'تحويل بنكي / محفظة إلكترونية',
    description: 'سداد تحويل فودافون كاش ومحفظة إلكترونية لحساب طلبيات جاتوه وتورت معارض شربين',
    createdBy: 'المحاسب المالي',
  },
  {
    id: 4,
    voucherNumber: 'VCH-PAY-2026-004',
    voucherType: 'PAYMENT',
    voucherDate: '2026-10-21',
    amount: 6800,
    treasuryCode: '1212',
    treasuryName: 'خزينة فرع التوزيع الخارجي',
    branchName: 'فرع المبيعات الخارجية والتوزيع',
    partyType: 'EXPENSE',
    partyId: null,
    partyName: 'صيانة سيارة نقل مبرد رقم 4912 دقهلية',
    oppositeAccountCode: '53',
    oppositeAccountName: 'مصاريف صيانة ونقل لوجستي',
    paymentMethod: 'نقدي (كاش)',
    description: 'تغيير طقم سيور وصيانة وحدة تبريد كابينة نقل التورت والشحن الخارجي',
    createdBy: 'مسؤول الحركة',
  },
];

export const fetchTreasuryVouchersApi = async (): Promise<TreasuryVoucherDto[]> => {
  try {
    const res = await fetch('/api/TreasuryVouchers');
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_VOUCHERS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_VOUCHERS_KEY, JSON.stringify(initialVouchers));
  return initialVouchers;
};

export const fetchPartiesLookupApi = async (): Promise<PartyLookupDto[]> => {
  try {
    const res = await fetch('/api/TreasuryVouchers/parties-lookup');
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_PARTIES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_PARTIES_KEY, JSON.stringify(initialParties));
  return initialParties;
};

export const saveTreasuryVoucherApi = async (voucher: TreasuryVoucherDto): Promise<TreasuryVoucherDto> => {
  try {
    const res = await fetch('/api/TreasuryVouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucher),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_VOUCHERS_KEY);
  const list: TreasuryVoucherDto[] = stored ? JSON.parse(stored) : initialVouchers;
  
  voucher.id = Date.now();
  voucher.voucherNumber = `VCH-${voucher.voucherType === 'RECEIPT' ? 'REC' : 'PAY'}-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
  
  list.unshift(voucher);
  localStorage.setItem(STORAGE_VOUCHERS_KEY, JSON.stringify(list));
  return voucher;
};
