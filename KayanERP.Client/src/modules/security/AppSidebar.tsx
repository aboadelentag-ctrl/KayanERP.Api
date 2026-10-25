import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Archive,
  Cpu,
  ChefHat,
  ShoppingBag,
  Cake,
  Truck,
  Users,
  Building2,
  Receipt,
  Grid2X2,
  CheckSquare,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Printer,
  Boxes,
  Activity,
  Layers,
  FileCheck2,
  UserCheck,
  Factory,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';

interface AppSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ currentTab, onSelectTab }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    production: true,
    inventory: true,
    procurement: true,
    assets: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const navItemClass = (tab: string) => `
    flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all w-full text-right
    ${currentTab === tab 
      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-xs' 
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}
  `;

  return (
    <aside className="w-64 bg-slate-950 border-l border-slate-800/80 flex flex-col h-screen shrink-0 text-slate-300 select-none overflow-hidden" dir="rtl">
      {/* الشعار */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
            K
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-none">KayanERP</h2>
            <span className="text-[10px] text-amber-400 font-bold">منظومة الإدارة المتكاملة</span>
          </div>
        </div>
      </div>

      {/* قائمة الروابط */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* عام */}
        <div className="space-y-1">
          <button onClick={() => onSelectTab('workspace')} className={navItemClass('workspace')}>
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>منصة كيان المركزية (Workspace)</span>
          </button>
          <button onClick={() => onSelectTab('dashboard')} className={navItemClass('dashboard')}>
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>الرئيسية (لوحة المؤشرات)</span>
          </button>
          <button onClick={() => onSelectTab('reports-archive')} className={navItemClass('reports-archive')}>
            <Archive className="w-4 h-4 text-cyan-400" />
            <span>أرشيف التقارير وكفاءة الأقسام</span>
          </button>
        </div>

        {/* قطاع الإنتاج والعمليات */}
        <div>
          <button 
            onClick={() => toggleSection('production')}
            className="flex items-center justify-between w-full text-[11px] font-black text-amber-400/90 uppercase tracking-wider mb-1.5 px-2 py-1"
          >
            <span>الإنتاج والعمليات الصناعية</span>
            {openSections['production'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {openSections['production'] && (
            <div className="space-y-1 pr-1 border-r border-slate-800/80 mr-1.5">
              <button onClick={() => onSelectTab('production')} className={navItemClass('production')}>
                <Factory className="w-4 h-4 text-amber-400" />
                <span>غرفة عمليات الإنتاج والتكاليف (MES)</span>
              </button>
              <button onClick={() => onSelectTab('recipes')} className={navItemClass('recipes')}>
                <ChefHat className="w-4 h-4 text-sky-400" />
                <span>(BOM) وصفات التصنيع المعيارية</span>
              </button>
              <button onClick={() => onSelectTab('materials')} className={navItemClass('materials')}>
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span>طلب وصرف خامات الصالة</span>
              </button>
              <button onClick={() => onSelectTab('finished-goods')} className={navItemClass('finished-goods')}>
                <Cake className="w-4 h-4 text-rose-400" />
                <span>كتالوج وتسليم المنتج التام</span>
              </button>
            </div>
          )}
        </div>

        {/* قطاع الأصول والآلات */}
        <div>
          <button 
            onClick={() => toggleSection('assets')}
            className="flex items-center justify-between w-full text-[11px] font-black text-amber-300 uppercase tracking-wider mb-1.5 px-2 py-1"
          >
            <span>الأصول الرأسمالية والخطوط</span>
            {openSections['assets'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {openSections['assets'] && (
            <div className="space-y-1 pr-1 border-r border-slate-800/80 mr-1.5">
              <button onClick={() => onSelectTab('assets')} className={navItemClass('assets')}>
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>إدارة الأصول والآلات (Asset Management)</span>
              </button>
            </div>
          )}
        </div>

        {/* قطاع المشتريات وفحص الجودة */}
        <div>
          <button 
            onClick={() => toggleSection('procurement')}
            className="flex items-center justify-between w-full text-[11px] font-black text-indigo-400/90 uppercase tracking-wider mb-1.5 px-2 py-1"
          >
            <span>المشتريات وفحص الجودة (GMP)</span>
            {openSections['procurement'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {openSections['procurement'] && (
            <div className="space-y-1 pr-1 border-r border-slate-800/80 mr-1.5">
              <button onClick={() => onSelectTab('receiving')} className={navItemClass('receiving')}>
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>فحص الجودة واستلام الخامات (GMP)</span>
              </button>
              <button onClick={() => onSelectTab('purchasing')} className={navItemClass('purchasing')}>
                <Receipt className="w-4 h-4 text-blue-400" />
                <span>أوامر الشراء والتوريد</span>
              </button>
              <button onClick={() => onSelectTab('suppliers')} className={navItemClass('suppliers')}>
                <Truck className="w-4 h-4 text-teal-400" />
                <span>سجل الموردين المعتمدين</span>
              </button>
            </div>
          )}
        </div>

        {/* الصلاحيات والأمان */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          <button onClick={() => onSelectTab('auth-demo')} className={navItemClass('auth-demo')}>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>مصفوفة فحص الصلاحيات (RBAC)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
