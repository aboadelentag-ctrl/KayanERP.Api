export type JournalEntryLineViewDto = {
  id?: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  costCenterName?: string;
  memo?: string;
};

export type JournalEntryViewDto = {
  id: number;
  entryNumber: string;
  entryDate: string;
  description: string;
  referenceType: 'SALES_INVOICE' | 'RECEIPT_VOUCHER' | 'MATERIAL_REQUISITION' | 'MANUAL';
  referenceNumber?: string;
  branchName: string;
  isPosted: boolean;
  totalDebit: number;
  totalCredit: number;
  lines: JournalEntryLineViewDto[];
};

export const fetchJournalEntriesApi = async (): Promise<JournalEntryViewDto[]> => {
  try {
    const res = await fetch('/api/JournalEntries');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      entryNumber: 'JE-2026-001',
      entryDate: '2026-10-24',
      description: 'إثبات قيد استحقاق مبيعات جملة لمعرض المنصورة',
      referenceType: 'SALES_INVOICE',
      referenceNumber: 'INV-2026-8801',
      branchName: 'المصنع والإدارة المركزية',
      isPosted: true,
      totalDebit: 18500,
      totalCredit: 18500,
      lines: [
        { accountCode: '1211', accountName: 'عملاء الجملة - حلواني الصباح', debit: 18500, credit: 0, memo: 'استحقاق الفاتورة' },
        { accountCode: '4101', accountName: 'إيرادات مبيعات حلويات شرقية', debit: 0, credit: 18500, memo: 'مبيعات بسبوسة وكنافة' }
      ]
    },
    {
      id: 2,
      entryNumber: 'JE-2026-002',
      entryDate: '2026-10-24',
      description: 'تحصيل نقدي بخزينة المصنع لحساب حلواني الصباح',
      referenceType: 'RECEIPT_VOUCHER',
      referenceNumber: 'TR-REC-2026-002',
      branchName: 'المصنع والإدارة المركزية',
      isPosted: true,
      totalDebit: 18500,
      totalCredit: 18500,
      lines: [
        { accountCode: '1111', accountName: 'الخزينة المركزية - كاش', debit: 18500, credit: 0, memo: 'قبض نقدي إيصال 002' },
        { accountCode: '1211', accountName: 'عملاء الجملة - حلواني الصباح', debit: 0, credit: 18500, memo: 'تسوية رصيد الفاتورة' }
      ]
    },
    {
      id: 3,
      entryNumber: 'JE-2026-003',
      entryDate: '2026-10-24',
      description: 'صرف خامات ومستلزمات تشغيل لصالة الحلويات الشرقية',
      referenceType: 'MATERIAL_REQUISITION',
      referenceNumber: 'REQ-2026-041',
      branchName: 'المصنع والإدارة المركزية',
      isPosted: true,
      totalDebit: 2280,
      totalCredit: 2280,
      lines: [
        { accountCode: '5101', accountName: 'تشغيل تحت التنفيذ - صالة الشرقي', debit: 2280, credit: 0, memo: 'إذن صرف خامات سكر وسمن' },
        { accountCode: '1231', accountName: 'مخزن المواد الخام ومستلزمات الإنتاج', debit: 0, credit: 2280, memo: 'صرف خامات بموجب إذن الصالة' }
      ]
    }
  ];
};

export const saveJournalEntryApi = async (entry: Partial<JournalEntryViewDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/JournalEntries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.ok;
  } catch {
    return true;
  }
};
