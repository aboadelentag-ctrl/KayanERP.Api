import React from 'react';
import { LayoutGrid, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useBranchContext } from '../context/BranchContext';

interface ExecutiveLayoutProps {
  children: React.ReactNode;
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
}

export const ExecutiveLayout: React.FC<ExecutiveLayoutProps> = ({
  children,
  onNavigate,
  onLogout
}) => {
  const { user } = useAuth();
  const { activeBranchName } = useBranchContext();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-50 overflow-x-hidden font-sans" dir="rtl">
      {/* الشريط التنفيذي العلوي (كامل العرض 100% بدون أي قائمة جانبية) */}
      <header className="bg-slate-900 text-white px-8 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-50 shadow-sm flex-wrap gap-3">
        {/* اليمين: هوية المنصة والمستأجر وسياق الفرع المقفل */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* هوية منصة كيان */}
          <div
            onClick={() => onNavigate?.('workspace')}
            title="مساحة العمل"
            className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="bg-indigo-600 text-white font-extrabold text-xs px-2 py-0.5 rounded tracking-wider">KAYAN</span>
            <span className="font-bold text-xs text-slate-200 tracking-wide">ENTERPRISE</span>
          </div>

          {/* الشركة المستأجرة النشطة */}
          <span className="flex items-center gap-2 bg-rose-500/15 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg font-semibold text-xs">
            <span className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_#ef4444] animate-pulse"></span>
            <span>مجموعة كيان ERP</span>
          </span>

          {/* شارة الفرع المعزول المقفل */}
          <div className="flex items-center gap-2 bg-slate-800 border border-blue-500/80 px-3 py-1.5 rounded-lg text-xs">
            <span className="bg-blue-600 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded">سياق الفرع المقفل</span>
            <span className="text-white font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeBranchName || 'المصنع والإدارة المركزية'}</span>
            </span>
          </div>

          {/* زر العودة لمساحة العمل المركزية */}
          <button
            onClick={() => onNavigate?.('workspace')}
            title="العودة لمساحة العمل"
            className="flex items-center gap-1.5 bg-white/5 border border-white/15 text-slate-200 hover:bg-white/10 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <LayoutGrid className="w-4 h-4 text-indigo-400" />
            <span>مساحة العمل</span>
          </button>
        </div>

        {/* اليسار: بيانات الموظف الفعلي وزر تسجيل الخروج */}
        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
              <span>👤 {user?.fullName || 'أحمد عبدالعزيز (زيزو)'}</span>
            </div>
            <div className="flex gap-1.5 justify-end items-center mt-1">
              <span className="bg-white/10 border border-white/15 text-slate-400 text-[10px] px-1.5 py-0.5 rounded">
                الإدارة العامة
              </span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* مساحة المحتوى التنفيذي بكامل العرض 100% بدون قوائم جانبية */}
      <main className="flex-1 w-full box-border">
        {children}
      </main>
    </div>
  );
};
