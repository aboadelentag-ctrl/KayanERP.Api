import type { AccountItem } from '../accounts/accountsApi';

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  category: string;
  debitBalance: number;
  creditBalance: number;
}

export interface IncomeStatementData {
  revenues: { code: string; name: string; amount: number }[];
  totalRevenue: number;
  costOfGoodsSold: { code: string; name: string; amount: number }[];
  totalCOGS: number;
  grossProfit: number;
  operatingExpenses: { code: string; name: string; amount: number }[];
  totalExpenses: number;
  netProfit: number;
}

export interface BalanceSheetData {
  assets: { code: string; name: string; amount: number }[];
  totalAssets: number;
  liabilities: { code: string; name: string; amount: number }[];
  totalLiabilities: number;
  equity: { code: string; name: string; amount: number }[];
  totalEquity: number;
  netProfitPeriod: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export const calculateFinancialReports = (accounts: AccountItem[]) => {
  // 1. ميزان المراجعة
  const trialBalance: TrialBalanceRow[] = accounts
    .filter((a) => a.isPosting)
    .map((acc) => ({
      accountCode: acc.accountCode,
      accountName: acc.accountName,
      category: acc.category,
      debitBalance: acc.nature === 'مدين' ? Math.max(0, acc.currentBalance) : 0,
      creditBalance: acc.nature === 'دائن' ? Math.max(0, acc.currentBalance) : 0,
    }));

  const totalDebit = trialBalance.reduce((sum, r) => sum + r.debitBalance, 0);
  const totalCredit = trialBalance.reduce((sum, r) => sum + r.creditBalance, 0);

  // 2. قائمة الدخل (P&L)
  const revAccounts = accounts.filter((a) => a.category === 'إيرادات' && a.isPosting);
  const revenues = revAccounts.map((a) => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance }));
  const totalRevenue = revenues.reduce((s, i) => s + i.amount, 0);

  const cogsAccounts = accounts.filter((a) => a.accountCode === '5101');
  const costOfGoodsSold = cogsAccounts.map((a) => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance }));
  const totalCOGS = costOfGoodsSold.reduce((s, i) => s + i.amount, 0);

  const grossProfit = totalRevenue - totalCOGS;

  const expAccounts = accounts.filter((a) => a.category === 'مصروفات وتكاليف' && a.accountCode !== '5101' && a.isPosting);
  const operatingExpenses = expAccounts.map((a) => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance }));
  const totalExpenses = operatingExpenses.reduce((s, i) => s + i.amount, 0);

  const netProfit = grossProfit - totalExpenses;

  // 3. الميزانية العمومية
  const assetAccounts = accounts.filter((a) => a.category === 'أصول' && a.isPosting);
  const assets = assetAccounts.map((a) => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance }));
  const totalAssets = assets.reduce((s, i) => s + i.amount, 0);

  const liabAccounts = accounts.filter((a) => a.category === 'خصوم والتزامات' && a.isPosting);
  const liabilities = liabAccounts.map((a) => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance }));
  const totalLiabilities = liabilities.reduce((s, i) => s + i.amount, 0);

  const eqAccounts = accounts.filter((a) => a.category === 'حقوق ملكية' && a.isPosting);
  const equity = eqAccounts.map((a) => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance }));
  const totalEquity = equity.reduce((s, i) => s + i.amount, 0);

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + netProfit;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

  const incomeStatement: IncomeStatementData = {
    revenues,
    totalRevenue,
    costOfGoodsSold,
    totalCOGS,
    grossProfit,
    operatingExpenses,
    totalExpenses,
    netProfit,
  };

  const balanceSheet: BalanceSheetData = {
    assets,
    totalAssets,
    liabilities,
    totalLiabilities,
    equity,
    totalEquity,
    netProfitPeriod: netProfit,
    totalLiabilitiesAndEquity,
    isBalanced,
  };

  return {
    trialBalance,
    totalDebit,
    totalCredit,
    incomeStatement,
    balanceSheet,
  };
};
