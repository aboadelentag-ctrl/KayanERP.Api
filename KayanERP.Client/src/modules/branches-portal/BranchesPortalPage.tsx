import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Store,
  Building2,
  Truck,
  Factory,
  ShoppingBag,
  Home,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useBranchContext } from '../../core/context/BranchContext';
import { fetchBranchesPortalApi } from './branchesPortalApi';
import type { ActiveBranchDto } from './branchesPortalApi';

interface BranchesPortalPageProps {
  onNavigate?: (tab: string) => void;
}

export const BranchesPortalPage: React.FC<BranchesPortalPageProps> = ({ onNavigate }) => {
  const { setActiveBranchId, setActiveBranchName } = useBranchContext();
  const [branches, setBranches] = useState<ActiveBranchDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchBranchesPortalApi();
      setBranches(data);
    } catch (ex: any) {
      setErrorMessage(`تعذر الاتصال بالخادم: ${ex.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBranch = (branch: ActiveBranchDto) => {
    setActiveBranchId(branch.id);
    setActiveBranchName(branch.nameAr);
    if (onNavigate) {
      onNavigate('sales');
    }
  };

  const getBranchIcon = (code: string) => {
    switch (code) {
      case 'BRANCH1': return <Home className="w-6 h-6 text-indigo-400" />;
      case 'BRANCH2':
      case 'BRANCH10': return <Store className="w-6 h-6 text-sky-400" />;
      case 'BRANCH7': return <ShoppingBag className="w-6 h-6 text-rose-400" />;
      case 'BRANCH11': return <Truck className="w-6 h-6 text-blue-400" />;
      case 'BRANCH12': return <Factory className="w-6 h-6 text-amber-400" />;
      default: return <Building2 className="w-6 h-6 text-emerald-400" />;
    }
  };

  const getBranchThemeBg = (code: string) => {
    switch (code) {
      case 'BRANCH1': return 'bg-indigo-950/40 border-indigo-800/40 hover:border-indigo-500';
      case 'BRANCH11': return 'bg-blue-950/40 border-blue-800/40 hover:border-blue-500';
      case 'BRANCH12': return 'bg-amber-950/30 border-amber-800/40 hover:border-amber-500';
      case 'BRANCH7': return 'bg-rose-950/30 border-rose-800/40 hover:border-rose-500';
      default: return 'bg-slate-900/60 border-slate-800 hover:border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6" dir="rtl">
      {/* الشريط العلوي */}
      <header className="max-w-7xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800/80 mb-8">
        <div className="text-xs text-slate-400 font-medium">
          نظام كيان ERP ⇦ بوابة التحكم وعزل نطاق الفروع المركزية
        </div>

        <button
          onClick={() => onNavigate?.('workspace')}
          className="w-10 h-10 bg-slate-900 border border-slate-700/80 rounded-xl flex items-center justify-center text-indigo-400 hover:text-white hover:bg-slate-800 transition-all shadow-xs"
          title="العودة لمساحة العمل"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </header>

      {/* رأس الصفحة المركزي */}
      <section className="text-center max-w-4xl mx-auto mb-10">
        <h1 className="text-3xl font-black tracking-wider text-slate-100 uppercase">
          BRANCHES OPERATIONS
        </h1>
        <p className="text-xs font-bold text-slate-500 tracking-widest mt-1 uppercase">
          KAYAN ENTERPRISE SYSTEM V2.0
        </p>
        <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto">
          اختر الفرع لتثبيت نطاق العمل والتحويل المباشر لعمليات وفواتير المبيعات الخاصة به.
        </p>
      </section>

      {/* المحتوى وشبكة الكروت */}
      <main className="max-w-7xl mx-auto">
        {errorMessage && (
          <div className="p-4 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-slate-500 text-xs font-bold">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            جاري تحميل شبكة فروع ومنافذ كيان...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {branches.map(branch => (
              <div
                key={branch.id}
                onClick={() => handleSelectBranch(branch)}
                className={`p-5 rounded-2xl border backdrop-blur-md cursor-pointer transition-all duration-200 hover:-translate-y-1 flex items-center justify-between shadow-lg ${getBranchThemeBg(branch.code)}`}
              >
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-indigo-300">
                    {branch.nameAr}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                    ID: {branch.code}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700/60 shadow-inner">
                  {getBranchIcon(branch.code)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
