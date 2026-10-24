import React from 'react';
import { Compass, LayoutDashboard, Search, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export const NotFoundPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[calc(100vh-60px)] bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans select-none overflow-hidden" dir="rtl">
      {/* خلفية الشبكة الهندسية المضيئة */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative z-10 w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.25)]">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-black font-mono text-white mb-2 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-amber-400 mb-2">المسار أو المحتوى غير موجود</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          عذراً، الشاشة أو المورد الذي تحاول الوصول إليه غير متاح أو تم نقله إلى موقع آخر ضمن قطاعات المنظومة الصناعية.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('workspace')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>منصة كيان المركزية (Workspace)</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة المؤشرات التنفيذية</span>
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
          KayanERP • Enterprise Navigation Guard © 2026
        </div>
      </div>
    </div>
  );
};
