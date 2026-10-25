export type ExpensePayableDto = {
  id: number;
  billNumber: string;
  category: 'SUPPLIER_PURCHASE' | 'UTILITY_GAS' | 'UTILITY_ELEC' | 'UTILITY_WATER' | 'PAYROLL' | 'RENT';
  supplierId?: number;
  title: string;
  partyName: string;
  costCenterName: string;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  notes?: string;
};

export type SupplierLookupItem = {
  id: number;
  supplierCode: string;
  supplierName: string;
  phone: string;
};

export const fetchExpensesPayablesApi = async (): Promise<ExpensePayableDto[]> => {
  try {
    const res = await fetch('/api/ExpensesPayables');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      billNumber: 'BILL-202610-001',
      category: 'SUPPLIER_PURCHASE',
      supplierId: 101,
      title: 'توريد 3 طن دقيق فاخر 72% وسكر مكرر',
      partyName: 'شركة النيل للمطاحن وتجارة الغلال',
      costCenterName: 'المستودع الرئيسي للخامات (WH-MAIN)',
      debitAccountCode: '1231',
      debitAccountName: 'مخزن المواد الخام والتعبئة',
      creditAccountCode: '211',
      creditAccountName: 'موردو الخامات والتعبئة',
      issueDate: '2026-10-20',
      dueDate: '2026-10-27',
      totalAmount: 145000,
      paidAmount: 50000,
      remainingAmount: 95000,
      status: 'PARTIAL',
      notes: 'إذن توريد رقم PO-884'
    },
    {
      id: 2,
      billNumber: 'BILL-202610-002',
      category: 'UTILITY_GAS',
      title: 'فاتورة غاز أفران الصالات لشهر أكتوبر',
      partyName: 'شركة تاون جاس (الغاز الطبيعي)',
      costCenterName: 'صالة الإنتاج الشرقي (CC-EAST)',
      debitAccountCode: '53',
      debitAccountName: 'مصاريف غاز وكهرباء الصالات',
      creditAccountCode: '213',
      creditAccountName: 'مصروفات خدمية مستحقة',
      issueDate: '2026-10-22',
      dueDate: '2026-10-29',
      totalAmount: 38500,
      paidAmount: 0,
      remainingAmount: 38500,
      status: 'UNPAID',
      notes: 'قراءة عداد خط أفران البسبوسة والكنافة'
    },
    {
      id: 3,
      billNumber: 'BILL-202610-003',
      category: 'PAYROLL',
      title: 'مسير أجور ورديات تشغيل صالات الحلويات',
      partyName: 'عمال وشيفات صالات التصنيع',
      costCenterName: 'إجمالي صالات التصنيع (CC-FACTORY)',
      debitAccountCode: '52',
      debitAccountName: 'أجور عمال الصالات المباشرة',
      creditAccountCode: '213',
      creditAccountName: 'أجور ومرتبات مستحقة',
      issueDate: '2026-10-24',
      dueDate: '2026-10-31',
      totalAmount: 92000,
      paidAmount: 92000,
      remainingAmount: 0,
      status: 'PAID',
      notes: 'صرف مستحقات النصف الثاني من الشهر'
    },
    {
      id: 4,
      billNumber: 'BILL-202610-004',
      category: 'RENT',
      title: 'إيجار مقر فرع دكرنس الرئيسي',
      partyName: 'مالك عقار فرع دكرنس',
      costCenterName: 'فرع دكرنس (BR-01)',
      debitAccountCode: '55',
      debitAccountName: 'مصروفات إيجارات المعارض',
      creditAccountCode: '213',
      creditAccountName: 'إيجارات ومصروفات مستحقة',
      issueDate: '2026-10-23',
      dueDate: '2026-10-30',
      totalAmount: 25000,
      paidAmount: 0,
      remainingAmount: 25000,
      status: 'UNPAID',
      notes: 'إيجار شهر نوفمبر 2026'
    }
  ];
};

export const fetchSuppliersLookupApi = async (): Promise<SupplierLookupItem[]> => {
  try {
    const res = await fetch('/api/ExpensesPayables/suppliers-lookup');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: 101, supplierCode: 'SUPP-01', supplierName: 'شركة النيل للمطاحن وتجارة الغلال', phone: '01011122233' },
    { id: 102, supplierCode: 'SUPP-02', supplierName: 'مؤسسة الزبدة والسمن الطبيعي الذهبي', phone: '01044455566' },
    { id: 103, supplierCode: 'SUPP-03', supplierName: 'الأهرام لكراتين التعبئة والتغليف', phone: '01077788899' },
    { id: 104, supplierCode: 'SUPP-04', supplierName: 'الشركة المصرية لتجارة المكسرات والخامات', phone: '01022233344' }
  ];
};

export const saveExpensePayableApi = async (bill: Partial<ExpensePayableDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/ExpensesPayables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const payExpenseBillApi = async (billId: number, amount: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/ExpensesPayables/${billId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(amount)
    });
    return res.ok;
  } catch {
    return true;
  }
};
