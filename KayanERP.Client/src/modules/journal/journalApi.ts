export interface JournalEntryLine {
  id: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntry {
  id: number;
  entryNumber: string;
  date: string;
  referenceType: 'فاتورة مبيعات' | 'صرف خامات معمل' | 'سند صرف مصروفات' | 'قيد تسوية يدوي';
  referenceNumber: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: 'مرحل للأستاذ العام' | 'مسودة قيد' | 'ملغى';
  createdBy: string;
  lines: JournalEntryLine[];
}

const STORAGE_KEY = 'kayan_journal_entries';

const getInitialJournalEntries = (): JournalEntry[] => [
  {
    id: 1,
    entryNumber: 'JRN-2026-001',
    date: '2026-10-22',
    referenceType: 'فاتورة مبيعات',
    referenceNumber: 'INV-2026-001',
    description: 'إثبات استحقاق مبيعات آجلة - سوبر ماركت الفهد',
    totalDebit: 3375,
    totalCredit: 3375,
    status: 'مرحل للأستاذ العام',
    createdBy: 'النظام الآلي (Auto-Post)',
    lines: [
      { id: 1, accountId: 6, accountCode: '1104', accountName: 'أرصدة العملاء والمدينون', debit: 3375, credit: 0, description: 'مديونية فاتورة مبيعات INV-2026-001' },
      { id: 2, accountId: 19, accountCode: '4101', accountName: 'مبيعات حلويات شرقية', debit: 0, credit: 3375, description: 'إيراد مبيعات حلويات شرقية' },
    ],
  },
  {
    id: 2,
    entryNumber: 'JRN-2026-002',
    date: '2026-10-22',
    referenceType: 'صرف خامات معمل',
    referenceNumber: 'REQ-2026-041',
    description: 'صرف خامات تشغيل طبقاً لمعادلة بسبوسة مكسرات لوكس',
    totalDebit: 2283,
    totalCredit: 2283,
    status: 'مرحل للأستاذ العام',
    createdBy: 'النظام الآلي (Auto-Post)',
    lines: [
      { id: 3, accountId: 23, accountCode: '5101', accountName: 'تكلفة الخامات المستهلكة بالتشغيل', debit: 2283, credit: 0, description: 'تحميل خامات تشغيلة معمل PRD-ORD-2026-081' },
      { id: 4, accountId: 7, accountCode: '1105', accountName: 'مخزون الخامات ومستلزمات الإنتاج', debit: 0, credit: 2283, description: 'صرف من مخزن الخامات الرئيسي' },
    ],
  },
  {
    id: 3,
    entryNumber: 'JRN-2026-003',
    date: '2026-10-22',
    referenceType: 'سند صرف مصروفات',
    referenceNumber: 'EXP-109',
    description: 'سداد فواتير غاز وكهرباء صالة التشغيل نقداً',
    totalDebit: 4500,
    totalCredit: 4500,
    status: 'مرحل للأستاذ العام',
    createdBy: 'خالد ممدوح (رئيس الحسابات)',
    lines: [
      { id: 5, accountId: 25, accountCode: '5103', accountName: 'استهلاك غاز وكهرباء المعمل', debit: 4500, credit: 0, description: 'مصروفات طاقة وتشغيل أفران' },
      { id: 6, accountId: 3, accountCode: '1101', accountName: 'خزينة المركز الرئيسي والمصنع', debit: 0, credit: 4500, description: 'صرف نقدي من خزينة المصنع' },
    ],
  },
];

export const fetchJournalEntriesApi = async (): Promise<JournalEntry[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialJournalEntries();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveJournalEntriesToLocal = (data: JournalEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
