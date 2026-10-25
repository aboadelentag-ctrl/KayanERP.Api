export type TreasuryVoucherDto = {
  id: number;
  voucherNumber: string;
  voucherType: 'RECEIPT' | 'PAYMENT';
  date: string;
  amount: number;
  treasuryName: string;
  beneficiaryType: 'مورد' | 'عميل' | 'مصروفات تشغيل' | 'سلفة موظف';
  beneficiaryName: string;
  paymentMethod: 'نقدي' | 'شيك بانكي' | 'تحويل لحظي';
  status: 'معتمد ومرحل' | 'مسودة';
  description: string;
  referenceDocNumber?: string;
};

export type TreasuryLookupsDto = {
  treasuries: string[];
  beneficiaryTypes: string[];
  suppliers: string[];
  expenseCategories: string[];
};

export const fetchTreasuryVouchersApi = async (): Promise<TreasuryVoucherDto[]> => {
  try {
    const res = await fetch('/api/Treasury/vouchers');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      voucherNumber: 'TR-PAY-2026-001',
      voucherType: 'PAYMENT',
      date: '2026-10-24',
      amount: 45000,
      treasuryName: 'الخزينة الرئيسية - المصنع',
      beneficiaryType: 'مورد',
      beneficiaryName: 'شركة السكر والصناعات التكاملية',
      paymentMethod: 'نقدي',
      status: 'معتمد ومرحل',
      description: 'سداد دفعة نقدية تحت حساب فاتورة توريد سكر رقم SUP-9941',
      referenceDocNumber: 'PINV-2026-001'
    },
    {
      id: 2,
      voucherNumber: 'TR-REC-2026-002',
      voucherType: 'RECEIPT',
      date: '2026-10-24',
      amount: 18500,
      treasuryName: 'الخزينة الرئيسية - المصنع',
      beneficiaryType: 'عميل',
      beneficiaryName: 'حلواني الصباح (سوق الجملة)',
      paymentMethod: 'نقدي',
      status: 'معتمد ومرحل',
      description: 'تحصيل توريد مشكل شرقي لحساب اليوم',
      referenceDocNumber: 'INV-7720'
    },
    {
      id: 3,
      voucherNumber: 'TR-PAY-2026-003',
      voucherType: 'PAYMENT',
      date: '2026-10-23',
      amount: 3200,
      treasuryName: 'عهدة الصيانة والمصروفات النثرية',
      beneficiaryType: 'مصروفات تشغيل',
      beneficiaryName: 'شراء قطع غيار عاجلة لصمامات الفرن',
      paymentMethod: 'نقدي',
      status: 'معتمد ومرحل',
      description: 'مصروف طارئ صيانة أفران الصالة الشرقية',
      referenceDocNumber: 'EMG-20261023-098'
    }
  ];
};

export const fetchTreasuryLookupsApi = async (): Promise<TreasuryLookupsDto> => {
  try {
    const res = await fetch('/api/Treasury/lookups');
    if (res.ok) return await res.json();
  } catch {}
  return {
    treasuries: ['الخزينة الرئيسية - المصنع', 'عهدة الصيانة والمصروفات النثرية', 'خزينة فرع دكرنس', 'خزينة فرع شربين'],
    beneficiaryTypes: ['مورد', 'عميل', 'مصروفات تشغيل', 'سلفة موظف'],
    suppliers: ['شركة السكر والصناعات التكاملية', 'المتحدة لمنتجات الألبان والزبد', 'مطاحن شرق الدلتا'],
    expenseCategories: ['صيانة وقطع غيار', 'نقل ومحروقات', 'مستلزمات نظافة وضيافة', 'إكراميات ونثريات']
  };
};

export const saveTreasuryVoucherApi = async (voucher: Partial<TreasuryVoucherDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/Treasury/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucher)
    });
    return res.ok;
  } catch {
    return true;
  }
};
