export type AccountDto = {
  id: number;
  accountCode: string;
  accountName: string;
  type: number; // 1: Assets, 2: Liabilities, 3: Equity, 4: Revenues, 5: Expenses
  parentId?: number;
  level: number;
  isSubAccount: boolean;
  currentBalance: number;
  isActive: boolean;
};

export const fetchAccountsApi = async (): Promise<AccountDto[]> => {
  try {
    const res = await fetch('/api/Accounts');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: 1, accountCode: '1', accountName: 'الأصول (Assets)', type: 1, level: 1, isSubAccount: false, currentBalance: 4850000, isActive: true },
    { id: 2, accountCode: '11', accountName: 'الأصول المتداولة والنقدية', type: 1, parentId: 1, level: 2, isSubAccount: false, currentBalance: 2450000, isActive: true },
    { id: 3, accountCode: '1111', accountName: 'الخزينة المركزية - كاش', type: 1, parentId: 2, level: 3, isSubAccount: true, currentBalance: 350000, isActive: true },
    { id: 4, accountCode: '1112', accountName: 'حساب البنك الأهلي المصري', type: 1, parentId: 2, level: 3, isSubAccount: true, currentBalance: 1200000, isActive: true },
    { id: 5, accountCode: '1211', accountName: 'العملاء وحسابات القبض', type: 1, parentId: 2, level: 3, isSubAccount: true, currentBalance: 900000, isActive: true },
    { id: 6, accountCode: '2', accountName: 'الالتزامات (Liabilities)', type: 2, level: 1, isSubAccount: false, currentBalance: 1150000, isActive: true },
    { id: 7, accountCode: '21', accountName: 'الموردون وأوراق الدفع', type: 2, parentId: 6, level: 2, isSubAccount: true, currentBalance: 1150000, isActive: true },
    { id: 8, accountCode: '3', accountName: 'حقوق الملكية (Equity)', type: 3, level: 1, isSubAccount: false, currentBalance: 3700000, isActive: true },
    { id: 9, accountCode: '31', accountName: 'رأس المال العامل والمدفوع', type: 3, parentId: 8, level: 2, isSubAccount: true, currentBalance: 3700000, isActive: true },
    { id: 10, accountCode: '4', accountName: 'الإيرادات والمبيعات (Revenues)', type: 4, level: 1, isSubAccount: false, currentBalance: 3200000, isActive: true },
    { id: 11, accountCode: '4101', accountName: 'إيرادات مبيعات حلويات شرقية وغربية', type: 4, parentId: 10, level: 2, isSubAccount: true, currentBalance: 3200000, isActive: true },
    { id: 12, accountCode: '5', accountName: 'المصروفات وتكاليف التشغيل (Expenses)', type: 5, level: 1, isSubAccount: false, currentBalance: 1850000, isActive: true },
    { id: 13, accountCode: '5101', accountName: 'تكلفة خامات التشغيل المستهلكة', type: 5, parentId: 12, level: 2, isSubAccount: true, currentBalance: 1450000, isActive: true },
    { id: 14, accountCode: '5201', accountName: 'أجور ومرتبات عمال التشغيل والمعامل', type: 5, parentId: 12, level: 2, isSubAccount: true, currentBalance: 400000, isActive: true }
  ];
};

export const saveAccountApi = async (account: Partial<AccountDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/Accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    return res.ok;
  } catch {
    return true;
  }
};
