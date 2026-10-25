import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Landmark,
  Scale,
  Printer,
  RotateCw,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import {
  fetchFinancialReportsApi
} from './financeApi';
import type {
  IncomeStatementDto,
  BalanceSheetDto,
  TrialBalanceItemDto
} from './financeApi';

interface FinancialStatementsPageProps {
  onNavigate?: (tab: string) => void;
}

export const FinancialStatementsPage: React.FC<FinancialStatementsPageProps> = () => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1); // 1: P&L, 2: Balance Sheet, 3: Trial Balance
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [incomeData, setIncomeData] = useState<IncomeStatementDto | null>(null);
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetDto | null>(null);
  const [trialBalanceList, setTrialBalanceList] = useState<TrialBalanceItemDto[]>([]);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFinancialReportsApi();
      setIncomeData(data.income);
      setBalanceSheetData(data.balance);
      setTrialBalanceList(data.trial);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const trialTotalDebit = trialBalanceList.reduce((sum, t) => sum + t.debit, 0);
  const trialTotalCredit = trialBalanceList.reduce((sum, t) => sum + t.credit, 0);
  const isTrialBalanced = trialTotalDebit === trialTotalCredit;

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* رأس الشاشة المالي الختامي */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-amber-400" />
              <span>القوائم والتقارير المالية الختامية والمركز المالي (Financial Statements Hub)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              الحسابات الختامية والأرباح
            </span>
          </div>
          <p className="text-xs text-slate-400">
            عرض ميزان المراجعة، قائمة الدخل والأرباح والخسائر، والميزانية العمومية لمصانع ومنافذ أبو عادل.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadAllReports}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 shadow-xs transition-colors"
          >
            <RotateCw className="w-4 h-4 text-emerald-400" />
            <span>تحديث القوائم</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* أزرار التبديل بين القوائم المالية الثلاث */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-fit gap-1 mb-6 text-xs font-bold flex-wrap print:hidden">
        <button
          onClick={() => setActiveTab(1)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
            activeTab === 1
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>📈 قائمة الدخل والأرباح والخسائر (P&L)</span>
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
            activeTab === 2
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>🏛️ قائمة المركز المالي (الميزانية العمومية)</span>
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
            activeTab === 3
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>⚖️ ميزان المراجعة بالمجاميع والأرصدة</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white p-16 text-center rounded-2xl border text-indigo-600 font-bold text-xs">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>جاري احتساب المؤشرات المالية وتدقيق التوازن المحاسبي...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: قائمة الدخل والأرباح والخسائر */}
          {activeTab === 1 && incomeData && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <span className="font-bold text-sm">📈 قائمة الأرباح والخسائر التشغيلية - حلواني ومصانع أبو عادل</span>
                <span className="bg-emerald-500 text-slate-950 font-mono font-black text-xs px-3 py-1 rounded-lg">
                  صافي ربح الفترة: {incomeData.netProfit.toLocaleString()} ج.م
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* 1. إيرادات النشاط والمبيعات */}
                <div>
                  <h6 className="font-bold text-emerald-700 text-xs border-b border-emerald-100 pb-2 mb-3 flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>1. إيرادات النشاط والمبيعات</span>
                  </h6>
                  <table className="w-full text-right">
                    <tbody className="divide-y divide-gray-100">
                      {incomeData.revenues.map(item => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-gray-400 w-24">{item.code}</td>
                          <td className="py-2 px-3 font-bold text-gray-800">{item.name}</td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-700 text-left w-48">
                            {item.amount.toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-50/70 font-black text-emerald-900">
                        <td colSpan={2} className="py-2.5 px-3">إجمالي إيرادات المبيعات</td>
                        <td className="py-2.5 px-3 font-mono text-left text-sm">
                          {incomeData.totalRevenues.toLocaleString()} ج.م
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. تكلفة الإنتاج والخامات */}
                <div>
                  <h6 className="font-bold text-rose-700 text-xs border-b border-rose-100 pb-2 mb-3 flex items-center gap-1.5">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>2. تكلفة البضاعة المباعة والإنتاج المباشر (COGS)</span>
                  </h6>
                  <table className="w-full text-right">
                    <tbody className="divide-y divide-gray-100">
                      {incomeData.costOfGoodsSold.map(item => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-gray-400 w-24">{item.code}</td>
                          <td className="py-2 px-3 font-bold text-gray-800">{item.name}</td>
                          <td className="py-2 px-3 font-mono font-bold text-rose-600 text-left w-48">
                            {item.amount.toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-rose-50/60 font-black text-rose-900">
                        <td colSpan={2} className="py-2.5 px-3">إجمالي تكاليف الإنتاج والخامات المباشرة</td>
                        <td className="py-2.5 px-3 font-mono text-left text-sm">
                          {incomeData.totalCOGS.toLocaleString()} ج.م
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* مجمل الربح */}
                <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 flex justify-between items-center">
                  <span className="font-bold text-indigo-900 text-sm">مجمل ربح التصنيع (Gross Profit):</span>
                  <span className="font-mono font-black text-indigo-700 text-xl">
                    {incomeData.grossProfit.toLocaleString()} ج.م
                  </span>
                </div>

                {/* 3. مصاريف التشغيل والطاقة والإيجارات */}
                <div>
                  <h6 className="font-bold text-amber-800 text-xs border-b border-amber-100 pb-2 mb-3 flex items-center gap-1.5">
                    <ArrowDownRight className="w-4 h-4 text-amber-600" />
                    <span>3. مصاريف التشغيل، الطاقة، وأجور الخدمات (OPEX)</span>
                  </h6>
                  <table className="w-full text-right">
                    <tbody className="divide-y divide-gray-100">
                      {incomeData.operatingExpenses.map(item => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-gray-400 w-24">{item.code}</td>
                          <td className="py-2 px-3 font-bold text-gray-800">{item.name}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-700 text-left w-48">
                            {item.amount.toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-black text-slate-900">
                        <td colSpan={2} className="py-2.5 px-3">إجمالي مصاريف التشغيل والطاقة والإيجار</td>
                        <td className="py-2.5 px-3 font-mono text-left text-sm">
                          {incomeData.totalOperatingExpenses.toLocaleString()} ج.م
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* صافي الربح النهائي */}
                <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-base m-0">🏆 صافي الأرباح التشغيلية النهائية (Net Profit):</h4>
                    <p className="text-emerald-100 text-xs mt-1 mb-0">
                      بعد خصم كافة الخامات، أجور العمال، فواتير الغاز والكهرباء، والإيجارات.
                    </p>
                  </div>
                  <div className="font-mono font-black text-3xl">
                    {incomeData.netProfit.toLocaleString()} ج.م
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: قائمة المركز المالي */}
          {activeTab === 2 && balanceSheetData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* جانب الأصول */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-indigo-600 text-white font-bold flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-amber-300" />
                      <span>🏦 الأصول وممتلكات المصنع (Assets)</span>
                    </div>

                    <div className="p-4 space-y-4">
                      <div>
                        <span className="font-bold text-gray-500 block border-b pb-1 mb-2 text-[11px]">
                          الأصول الثابتة (Fixed Assets)
                        </span>
                        <table className="w-full text-right border">
                          <tbody className="divide-y">
                            {balanceSheetData.fixedAssets.map(item => (
                              <tr key={item.code} className="hover:bg-slate-50">
                                <td className="py-2 px-2.5 text-gray-800 font-medium">{item.name}</td>
                                <td className="py-2 px-2.5 font-mono font-bold text-left w-36">
                                  {item.amount.toLocaleString()} ج.م
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <span className="font-bold text-gray-500 block border-b pb-1 mb-2 text-[11px]">
                          الأصول المتداولة (Current Assets)
                        </span>
                        <table className="w-full text-right border">
                          <tbody className="divide-y">
                            {balanceSheetData.currentAssets.map(item => (
                              <tr key={item.code} className="hover:bg-slate-50">
                                <td className="py-2 px-2.5 text-gray-800 font-medium">{item.name}</td>
                                <td className="py-2 px-2.5 font-mono font-bold text-indigo-700 text-left w-36">
                                  {item.amount.toLocaleString()} ج.م
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 border-t border-indigo-200 flex justify-between items-center m-4 rounded-xl">
                    <span className="font-black text-indigo-900 text-sm">إجمالي الأصول (Total Assets):</span>
                    <span className="font-mono font-black text-indigo-700 text-lg">
                      {balanceSheetData.totalAssets.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {/* جانب الالتزامات وحقوق الملكية */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-slate-900 text-white font-bold flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span>📑 الالتزامات وحقوق الملكية (Liabilities & Equity)</span>
                    </div>

                    <div className="p-4 space-y-4">
                      <div>
                        <span className="font-bold text-gray-500 block border-b pb-1 mb-2 text-[11px]">
                          الالتزامات المتداولة (Liabilities)
                        </span>
                        <table className="w-full text-right border">
                          <tbody className="divide-y">
                            {balanceSheetData.currentLiabilities.map(item => (
                              <tr key={item.code} className="hover:bg-slate-50">
                                <td className="py-2 px-2.5 text-gray-800 font-medium">{item.name}</td>
                                <td className="py-2 px-2.5 font-mono font-bold text-rose-600 text-left w-36">
                                  {item.amount.toLocaleString()} ج.م
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <span className="font-bold text-gray-500 block border-b pb-1 mb-2 text-[11px]">
                          حقوق الملكية ورأس المال (Equity)
                        </span>
                        <table className="w-full text-right border">
                          <tbody className="divide-y">
                            {balanceSheetData.equity.map(item => (
                              <tr key={item.code} className="hover:bg-slate-50">
                                <td className="py-2 px-2.5 text-gray-800 font-medium">{item.name}</td>
                                <td className="py-2 px-2.5 font-mono font-bold text-left w-36">
                                  {item.amount.toLocaleString()} ج.م
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-emerald-50/70 font-bold text-emerald-900">
                              <td className="py-2 px-2.5">صافي أرباح تشغيل الفترة الحالية</td>
                              <td className="py-2 px-2.5 font-mono font-bold text-emerald-700 text-left">
                                {balanceSheetData.currentYearNetProfit.toLocaleString()} ج.م
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100 border-t border-slate-300 flex justify-between items-center m-4 rounded-xl">
                    <span className="font-black text-slate-900 text-sm">إجمالي الالتزامات وحقوق الملكية:</span>
                    <span className="font-mono font-black text-slate-900 text-lg">
                      {balanceSheetData.totalLiabilitiesAndEquity.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* مؤشر توازن المركز المالي */}
              <div
                className={`p-4 rounded-2xl text-center font-bold text-xs border ${
                  balanceSheetData.isBalanced
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {balanceSheetData.isBalanced ? (
                  <span>
                    ⚖️ الميزانية العمومية متزنة تماماً: الأصول ({balanceSheetData.totalAssets.toLocaleString()} ج.م) = الالتزامات وحقوق الملكية ({balanceSheetData.totalLiabilitiesAndEquity.toLocaleString()} ج.م) ✓
                  </span>
                ) : (
                  <span>
                    ⚠️ يوجد فارق عدم اتزان في الميزانية بمقدار: {Math.abs(balanceSheetData.totalAssets - balanceSheetData.totalLiabilitiesAndEquity).toLocaleString()} ج.م
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ميزان المراجعة بالمجاميع والأرصدة */}
          {activeTab === 3 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <span className="font-bold text-sm">⚖️ ميزان المراجعة بالأرصدة لمصانع ومنافذ أبو عادل</span>
                <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold ${isTrialBalanced ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                  {isTrialBalanced ? 'كافة الحسابات متزنة 100% ✓' : '⚠️ تنبيه: ميزان المراجعة غير متزن'}
                </span>
              </div>

              <table className="w-full text-center">
                <thead className="bg-slate-100 text-gray-700">
                  <tr>
                    <th className="py-2.5 px-3 w-32">كود الحساب</th>
                    <th className="py-2.5 px-3 text-right">اسم الحساب المالي</th>
                    <th className="py-2.5 px-3 w-48 text-left">أرصدة مدينة (Debit)</th>
                    <th className="py-2.5 px-3 w-48 text-left">أرصدة دائنة (Credit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trialBalanceList.map(item => (
                    <tr key={item.accountCode} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{item.accountCode}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-800">{item.accountName}</td>
                      <td className={`py-2.5 px-3 font-mono font-bold text-left ${item.debit > 0 ? 'text-emerald-700' : 'text-gray-300'}`}>
                        {item.debit > 0 ? `${item.debit.toLocaleString()} ج.م` : '-'}
                      </td>
                      <td className={`py-2.5 px-3 font-mono font-bold text-left ${item.credit > 0 ? 'text-rose-600' : 'text-gray-300'}`}>
                        {item.credit > 0 ? `${item.credit.toLocaleString()} ج.م` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-black text-sm">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 text-right text-gray-900">إجمالي ميزان المراجعة:</td>
                    <td className="py-3 px-3 font-mono text-emerald-700 text-left">
                      {trialTotalDebit.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-700 text-left">
                      {trialTotalCredit.toLocaleString()} ج.م
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
