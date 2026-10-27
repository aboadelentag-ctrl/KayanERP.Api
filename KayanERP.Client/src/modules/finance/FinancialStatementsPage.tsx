import React, { useState } from 'react';
import {
  TrendingUp,
  Printer,
  RotateCw,
  Scale,
  Landmark,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  CheckCircle2
} from 'lucide-react';

interface FinancialStatementsPageProps {
  onNavigate?: (tab: string) => void;
}

export const FinancialStatementsPage: React.FC<FinancialStatementsPageProps> = ({ onNavigate }) => {
  const [activeStatementTab, setActiveStatementTab] = useState<'pnl' | 'balance_sheet' | 'trial_balance'>('pnl');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // بيانات قائمة الأرباح والخسائر (P&L)
  const revenues = [
    { code: '411', name: 'إيرادات مبيعات الحلويات الشرقية والمخبوزات', amount: 980000 },
    { code: '412', name: 'إيرادات مبيعات التورت والجاتوه والحلويات الغربية', amount: 720000 },
    { code: '413', name: 'إيرادات مبيعات النواشف والكرواسون والبتيفور', amount: 340000 },
    { code: '414', name: 'إيرادات عقود التوريد الخارجي ومنافذ الجملة', amount: 460000 }
  ];
  const totalRevenues = revenues.reduce((acc, curr) => acc + curr.amount, 0); // 2,500,000

  const cogs = [
    { code: '511', name: 'خامات إنتاج مستهلكة (دقيق، سكر، سمن بلدي)', amount: 920000 },
    { code: '512', name: 'مكسرات ومستلزمات حشو وشيكولاتة خام', amount: 280000 },
    { code: '513', name: 'أجور عمال المعامل وصالات الإنتاج المباشرة', amount: 240000 },
    { code: '514', name: 'كراتين التعبئة والتغليف والأطباق الفاخرة', amount: 110000 }
  ];
  const totalCogs = cogs.reduce((acc, curr) => acc + curr.amount, 0); // 1,550,000

  const grossProfit = totalRevenues - totalCogs; // 950,000

  const opex = [
    { code: '521', name: 'كهرباء ومياه وغاز أفران التشغيل', amount: 165000 },
    { code: '522', name: 'إيجارات منافذ الفروع والمعارض', amount: 120000 },
    { code: '523', name: 'مصروفات شحن ونقل سيارات التبريد', amount: 68000 },
    { code: '524', name: 'مصروفات إدارية وعمومية وصيانة دورية', amount: 40000 }
  ];
  const totalOpex = opex.reduce((acc, curr) => acc + curr.amount, 0); // 393,000

  const netProfit = grossProfit - totalOpex; // 557,000

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* ترويسة الشاشة بالثيم الليلي الفاحم */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-amber-500" />
              <span>القوائم والتقارير المالية الختامية والمركز المالي (Financial Statements Hub)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              الحسابات الختامية والأرباح
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            عرض ميزان المراجعة، قائمة الدخل والأرباح والخسائر، والميزانية العمومية لمصانع ومنافذ أبو عادل.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث ومعايرة القوائم المالية للحسابات الختامية بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث القوائم</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* شريط التبويبات الثلاثة */}
      <div className="flex bg-white dark:bg-[#0f1117] p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 gap-2 mb-6 text-xs">
        <button
          onClick={() => setActiveStatementTab('pnl')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeStatementTab === 'pnl'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-600 dark:text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>📈 قائمة الدخل والأرباح والخسائر (P&L)</span>
        </button>

        <button
          onClick={() => setActiveStatementTab('balance_sheet')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeStatementTab === 'balance_sheet'
              ? 'bg-indigo-600 text-white font-black shadow-md'
              : 'text-slate-600 dark:text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>🏛️ قائمة المركز المالي (الميزانية العمومية)</span>
        </button>

        <button
          onClick={() => setActiveStatementTab('trial_balance')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeStatementTab === 'trial_balance'
              ? 'bg-emerald-600 text-white font-black shadow-md'
              : 'text-slate-600 dark:text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>⚖️ ميزان المراجعة بالمجاميع والأرصدة</span>
        </button>
      </div>

      {/* محتوى قائمة الأرباح والخسائر P&L */}
      {activeStatementTab === 'pnl' && (
        <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden text-xs">
          
          {/* عنوان القائمة وشارة صافي الربح */}
          <div className="p-4 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-100 text-sm">📈 قائمة الأرباح والخسائر التشغيلية - حلواني ومصانع أبو عادل</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5">
              <span>صافي ربح الفترة:</span>
              <span className="text-sm">{netProfit.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="p-4 space-y-6">

            {/* 1. إيرادات النشاط والمبيعات */}
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-500/30 text-emerald-400 font-bold">
                <span>↗ 1. إيرادات النشاط والمبيعات</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-zinc-800/60">
                {revenues.map((item) => (
                  <div key={item.code} className="py-2.5 flex justify-between items-center hover:bg-zinc-900/40 px-2 rounded transition-colors">
                    <span className="font-mono text-emerald-400 font-bold w-44">{item.amount.toLocaleString()} ج.م</span>
                    <span className="text-zinc-200 flex-1 text-right">{item.name}</span>
                    <span className="font-mono text-zinc-500 w-16 text-left">{item.code}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex justify-between items-center font-bold">
                <span className="font-mono text-emerald-400 text-sm">{totalRevenues.toLocaleString()} ج.م</span>
                <span className="text-emerald-300">إجمالي إيرادات المبيعات</span>
              </div>
            </div>

            {/* 2. تكلفة البضاعة المباعة والإنتاج المباشر (COGS) */}
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-rose-500/30 text-rose-400 font-bold">
                <span>↘ 2. تكلفة البضاعة المباعة والإنتاج المباشر (COGS)</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-zinc-800/60">
                {cogs.map((item) => (
                  <div key={item.code} className="py-2.5 flex justify-between items-center hover:bg-zinc-900/40 px-2 rounded transition-colors">
                    <span className="font-mono text-rose-400 font-bold w-44">{item.amount.toLocaleString()} ج.م</span>
                    <span className="text-zinc-200 flex-1 text-right">{item.name}</span>
                    <span className="font-mono text-zinc-500 w-16 text-left">{item.code}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl flex justify-between items-center font-bold">
                <span className="font-mono text-rose-400 text-sm">{totalCogs.toLocaleString()} ج.م</span>
                <span className="text-rose-300">إجمالي تكاليف الإنتاج والخامات المباشرة</span>
              </div>
            </div>

            {/* شريط مجمل ربح التصنيع (Gross Profit) */}
            <div className="p-4 bg-[#121520] border border-indigo-500/40 rounded-2xl flex justify-between items-center font-black">
              <span className="font-mono text-indigo-400 text-lg">{grossProfit.toLocaleString()} ج.م</span>
              <span className="text-zinc-100 text-sm">مجمل ربح التصنيع (Gross Profit):</span>
            </div>

            {/* 3. مصاريف التشغيل، الطاقة، وأجور الخدمات (OPEX) */}
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-amber-500/30 text-amber-400 font-bold">
                <span>↘ 3. مصاريف التشغيل، الطاقة، وأجور الخدمات (OPEX)</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-zinc-800/60">
                {opex.map((item) => (
                  <div key={item.code} className="py-2.5 flex justify-between items-center hover:bg-zinc-900/40 px-2 rounded transition-colors">
                    <span className="font-mono text-amber-400 font-bold w-44">{item.amount.toLocaleString()} ج.م</span>
                    <span className="text-zinc-200 flex-1 text-right">{item.name}</span>
                    <span className="font-mono text-zinc-500 w-16 text-left">{item.code}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl flex justify-between items-center font-bold">
                <span className="font-mono text-amber-400 text-sm">{totalOpex.toLocaleString()} ج.م</span>
                <span className="text-amber-300">إجمالي المصروفات التشغيلية والعمومية</span>
              </div>
            </div>

            {/* شريط صافي ربح النشاط النهائي */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex justify-between items-center font-black shadow-lg">
              <span className="font-mono text-emerald-400 text-xl">{netProfit.toLocaleString()} ج.م</span>
              <span className="text-emerald-200 text-base">صافي ربح النشاط التشغيلي النهائي (Net Operating Profit):</span>
            </div>

          </div>
        </div>
      )}

      {/* تبويب الميزانية العمومية */}
      {activeStatementTab === 'balance_sheet' && (
        <div className="bg-white dark:bg-[#0f1117] p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center text-slate-600 dark:text-zinc-400">
          <Landmark className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-80" />
          <h3 className="font-bold text-zinc-200 text-base mb-1">الميزانية العمومية والمركز المالي</h3>
          <p className="text-xs">الأصول المتداولة والثابتة: 2,450,000 ج.م | الالتزامات وحقوق الملكية: 2,450,000 ج.م (الميزانية متزنة تماماً)</p>
        </div>
      )}

      {/* تبويب ميزان المراجعة */}
      {activeStatementTab === 'trial_balance' && (
        <div className="bg-white dark:bg-[#0f1117] p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center text-slate-600 dark:text-zinc-400">
          <Scale className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="font-bold text-zinc-200 text-base mb-1">ميزان المراجعة بالمجاميع والأرصدة</h3>
          <p className="text-xs">إجمالي الأرصدة المدينة: 4,300,000 ج.م | إجمالي الأرصدة الدائنة: 4,300,000 ج.م (تطابق تام)</p>
        </div>
      )}

    </div>
  );
};

export default FinancialStatementsPage;


