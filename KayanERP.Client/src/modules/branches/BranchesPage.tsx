import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Store, Warehouse, Plus, ArrowLeft } from 'lucide-react';

export const BranchesPage = () => {
  // استدعاء الفروع الديناميكية وأدوات التحكم من الـ Context
  const { branches, activeBranch, switchBranch, setIsAddBranchModalOpen } = useApp();

  // دالة لاختيار الأيقونة المناسبة حسب نوع المنشأة
  const getBranchIcon = (type: string) => {
    switch (type) {
      case 'FACTORY': return <Building2 className="w-6 h-6" />;
      case 'CENTRAL_WAREHOUSE': return <Warehouse className="w-6 h-6" />;
      default: return <Store className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* الترويسة وزر إضافة فرع جديد */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)]">
        <div className="text-center sm:text-right">
          <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-wider mb-1">
            BRANCHES OPERATIONS
          </h1>
          <p className="text-sm font-bold text-amber-500">
            KAYAN ENTERPRISE SYSTEM V2.0
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            اضغط على أي فرع لتثبيت نطاق العمل الميداني والبدء الفوري بإصدار فواتير المبيعات والعمليات.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddBranchModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 px-5 py-2.5 rounded-xl font-bold transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة فرع جديد
        </button>
      </div>

      {/* شبكة كروت الفروع الديناميكية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {branches.map((branch) => {
          const isActive = activeBranch.id === branch.id;
          
          return (
            <button
              key={branch.id}
              onClick={() => switchBranch(branch.id)}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center overflow-hidden
                ${isActive 
                  ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-amber-500/50 hover:shadow-lg'
                }
              `}
            >
              {/* شريط علوي صغير لتحديد الفرع النشط */}
              {isActive && (
                <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors
                ${isActive ? 'bg-amber-500 text-white' : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] group-hover:text-amber-500'}
              `}>
                {getBranchIcon(branch.type)}
              </div>
              
              <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                {branch.name}
              </h3>
              
              <div className="text-[10px] text-[var(--text-muted)] font-mono font-bold tracking-widest uppercase mb-6">
                ID: {branch.code}
              </div>
              
              <div className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors
                ${isActive 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] group-hover:bg-amber-500/10 group-hover:text-amber-500'
                }
              `}>
                {isActive ? (
                  <>نطاق العمل النشط الآن</>
                ) : (
                  <>
                    اضغط للدخول <ArrowLeft className="w-3 h-3" />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};