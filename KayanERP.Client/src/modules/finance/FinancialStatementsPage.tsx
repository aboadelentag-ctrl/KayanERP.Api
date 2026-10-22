import React, { useState, useEffect } from 'react';
import { fetchAccountsApi } from '../accounts/accountsApi';
import type { AccountItem } from '../accounts/accountsApi';
import { calculateFinancialReports } from './financeApi';
import type { TrialBalanceRow, IncomeStatementData, BalanceSheetData } from './financeApi';
import {
  PieChart,
  Scale,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';

export const FinancialStatementsPage: React.FC = () => {
  const [activeReportTab, setActiveReportTab] = useState<'trial_balance' | 'income_statement' | 'balance_sheet'>('trial_balance');
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchAccountsApi();
      setAccounts(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const reports = calculateFinancialReports(accounts);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500" dir="rtl">
        جاري تجميع وحساب البيانات المحاسبية من دفتر الأستاذ...
      </div>
    );
  }

  const { trialBalance, totalDebit, totalCredit, incomeStatement, balanceSheet } = reports;
  const isTrialBalanced = Math.abs(totalDebit - totalCredit) < 1;

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* الترويسة وبطاقات المؤشرات الرئيسية */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-7 h-7 text-indigo-600" />
            <span>القوائم المالية والختامية (Financial Statements)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ميزان المراجعة بالأرصدة، قائمة الدخل والأرباح التشغيلية، والميزانية العمومية المركزية
          </p>
        </div>

        {/* أزرار التبديل بين القوائم الثلاث */}
        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
          <button
            onClick={() => setActiveReportTab('trial_balance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeReportTab === 'trial_balance'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>ميزان المراجعة</span>
          </button>

          <button
            onClick={() => setActiveReportTab('income_statement')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeReportTab === 'income_statement'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>قائمة الدخل (P&L)</span>
          </button>

          <button
            onClick={() => setActiveReportTab('balance_sheet')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeReportTab === 'balance_sheet'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>الميزانية العمومية</span>
          </button>
        </div>
      </div>

      {/* 1. ميزان المراجعة بالأرصدة */}
      {activeReportTab === 'trial_balance' && (
        <div className="space-y-4 animate-fadeIn">
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
            isTrialBalanced ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {isTrialBalanced ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
              <div>
                <span className="font-bold text-sm block">
                  {isTrialBalanced ? 'ميزان المراجعة متوازن ومطابق محاسبياً' : 'تنبيه: ميزان المراجعة غير متطابق'}
                </span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  جميع أرصدة الحسابات الفرعية مطابقة لدفتر اليومية العامة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono font-bold text-sm">
              <div>
                <span className="text-[11px] text-gray-500 block">مجموع الأرصدة المدينة:</span>
                <span className="text-emerald-700">{totalDebit.toLocaleString()} ج.م</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block">مجموع الأرصدة الدائنة:</span>
                <span className="text-amber-700">{totalCredit.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold">
                <tr>
                  <th className="py-3 px-4">كود الحساب</th>
                  <th className="py-3 px-4">اسم الحساب المالي</th>
                  <th className="py-3 px-4 text-center">التبويب</th>
                  <th className="py-3 px-4 text-center">رصيد مدين</th>
                  <th className="py-3 px-4 text-center">رصيد دائن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trialBalance.map((row) => (
                  <tr key={row.accountCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">{row.accountCode}</td>
                    <td className="py-2.5 px-4 font-semibold text-gray-900">{row.accountName}</td>
                    <td className="py-2.5 px-4 text-center text-gray-500">{row.category}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-700">
                      {row.debitBalance > 0 ? `${row.debitBalance.toLocaleString()} ج.م` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-700">
                      {row.creditBalance > 0 ? `${row.creditBalance.toLocaleString()} ج.م` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100/80 font-bold border-t border-gray-200 text-gray-900">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-sm">المجموع الإجمالي العام</td>
                  <td className="py-3 px-4 text-center font-mono text-sm text-emerald-800">{totalDebit.toLocaleString()} ج.م</td>
                  <td className="py-3 px-4 text-center font-mono text-sm text-amber-800">{totalCredit.toLocaleString()} ج.م</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 2. قائمة الدخل (P&L) */}
      {activeReportTab === 'income_statement' && (
        <div className="space-y-4 animate-fadeIn">
          {/* بطاقات تلخيص الدخل */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-xs text-gray-500 block">إجمالي إيرادات المبيعات</span>
              <span className="text-lg font-bold font-mono text-indigo-900 mt-1 block">
                {incomeStatement.totalRevenue.toLocaleString()} ج.م
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-xs text-gray-500 block">تكلفة الخامات المستخدمة (COGS)</span>
              <span className="text-lg font-bold font-mono text-rose-700 mt-1 block">
                {incomeStatement.totalCOGS.toLocaleString()} ج.م
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-xs text-gray-500 block">مجمل الربح التجاري</span>
              <span className="text-lg font-bold font-mono text-emerald-700 mt-1 block">
                {incomeStatement.grossProfit.toLocaleString()} ج.م
              </span>
            </div>

            <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-xs">
              <span className="text-xs text-emerald-200 block">صافي الأرباح التشغيلية</span>
              <span className="text-xl font-black font-mono mt-1 block">
                {incomeStatement.netProfit.toLocaleString()} ج.م
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            {/* 1. الإيرادات */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-sm font-bold text-indigo-900">
                <span className="flex items-center gap-1.5"><ArrowUpRight className="w-4 h-4 text-emerald-600" /> الإيرادات والمبيعات</span>
                <span className="font-mono">{incomeStatement.totalRevenue.toLocaleString()} ج.م</span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {incomeStatement.revenues.map((item) => (
                  <div key={item.code} className="py-2 flex justify-between text-gray-700">
                    <span>{item.code} - {item.name}</span>
                    <span className="font-mono font-semibold">{item.amount.toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. تكلفة الإنتاج */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-sm font-bold text-rose-900">
                <span className="flex items-center gap-1.5"><ArrowDownRight className="w-4 h-4 text-rose-600" /> تكلفة الخامات المباعة والتشغيل (COGS)</span>
                <span className="font-mono">({incomeStatement.totalCOGS.toLocaleString()}) ج.م</span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {incomeStatement.costOfGoodsSold.map((item) => (
                  <div key={item.code} className="py-2 flex justify-between text-gray-700">
                    <span>{item.code} - {item.name}</span>
                    <span className="font-mono font-semibold">({item.amount.toLocaleString()}) ج.م</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. المصروفات التشغيلية */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-sm font-bold text-amber-900">
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-amber-600" /> المصروفات العمومية والتشغيلية والأجور</span>
                <span className="font-mono">({incomeStatement.totalExpenses.toLocaleString()}) ج.م</span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {incomeStatement.operatingExpenses.map((item) => (
                  <div key={item.code} className="py-2 flex justify-between text-gray-700">
                    <span>{item.code} - {item.name}</span>
                    <span className="font-mono font-semibold">({item.amount.toLocaleString()}) ج.م</span>
                  </div>
                ))}
              </div>
            </div>

            {/* الإجمالي الصافي */}
            <div className="pt-4 border-t-2 border-gray-900 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">صافي ربح النشاط النهائي للفترة:</span>
              <span className="text-2xl font-black font-mono text-emerald-700">{incomeStatement.netProfit.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. الميزانية العمومية (Balance Sheet) */}
      {activeReportTab === 'balance_sheet' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* جانب الأصول */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <div className="flex justify-between items-center pb-3 border-b-2 border-indigo-600 text-base font-bold text-indigo-950">
                <span>جانب الأصول (Assets)</span>
                <span className="font-mono">{balanceSheet.totalAssets.toLocaleString()} ج.م</span>
              </div>
              <div className="divide-y divide-gray-100 text-xs mt-2">
                {balanceSheet.assets.map((item) => (
                  <div key={item.code} className="py-2.5 flex justify-between text-gray-700">
                    <span>{item.code} - {item.name}</span>
                    <span className="font-mono font-bold text-gray-900">{item.amount.toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-200 mt-4 flex justify-between text-sm font-bold text-indigo-900">
                <span>إجمالي الأصول:</span>
                <span className="font-mono text-base">{balanceSheet.totalAssets.toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* جانب الالتزامات وحقوق الملكية */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b-2 border-slate-800 text-base font-bold text-gray-900">
                  <span>الالتزامات وحقوق الملكية (Liabilities & Equity)</span>
                  <span className="font-mono">{balanceSheet.totalLiabilitiesAndEquity.toLocaleString()} ج.م</span>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-bold text-amber-800 block mb-1">1. الخصوم والذمم الدائنة:</span>
                  <div className="divide-y divide-gray-100 text-xs">
                    {balanceSheet.liabilities.map((item) => (
                      <div key={item.code} className="py-1.5 flex justify-between text-gray-700">
                        <span>{item.code} - {item.name}</span>
                        <span className="font-mono font-bold">{item.amount.toLocaleString()} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-bold text-blue-800 block mb-1">2. حقوق الملكية ورأس المال:</span>
                  <div className="divide-y divide-gray-100 text-xs">
                    {balanceSheet.equity.map((item) => (
                      <div key={item.code} className="py-1.5 flex justify-between text-gray-700">
                        <span>{item.code} - {item.name}</span>
                        <span className="font-mono font-bold">{item.amount.toLocaleString()} ج.م</span>
                      </div>
                    ))}
                    <div className="py-1.5 flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 rounded">
                      <span>أرباح النشاط المرحلة للفترة الحالية</span>
                      <span className="font-mono">{balanceSheet.netProfitPeriod.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-6 flex justify-between text-sm font-bold text-gray-900">
                <span>إجمالي الخصوم وحقوق الملكية:</span>
                <span className="font-mono text-base">{balanceSheet.totalLiabilitiesAndEquity.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
