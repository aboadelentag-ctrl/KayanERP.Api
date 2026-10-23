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
  ArrowLeftRight,
  Wrench,
  Boxes,
  FolderTree,
  BadgeCheck,
  FileText,
  Landmark,
  HandCoins,
  Scale,
  Wallet2,
  PieChart,
  ClipboardCheck,
  AlertOctagon,
  UserCog,
  ShieldCheck,
  Search,
  X
} from 'lucide-react';

interface NavSidebarProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
}

export const AppSidebar: React.FC<NavSidebarProps> = ({ currentTab, onSelectTab }) => {
  const [menuSearch, setMenuSearch] = useState('');

  const matchesSearch = (keywords: string) => {
    if (!menuSearch.trim()) return true;
    return keywords.toLowerCase().includes(menuSearch.trim().toLowerCase());
  };

  const navItemClass = (tabKey: string, extra = '') => {
    const isActive = currentTab === tabKey;
    return `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 shadow-xs'
        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
    } ${extra}`;
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-l border-slate-800 flex flex-col h-screen shrink-0 select-none" dir="rtl">
      {/* الترويسة والشعار */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow-sm">
            K
          </div>
          <div>
            <h1 className="text-base font-black text-amber-400 tracking-tight leading-none">KayanERP</h1>
            <span className="text-[10px] text-slate-400 block mt-1">منظومة الإدارة المتكاملة</span>
          </div>
        </div>
      </div>

      {/* حقل البحث السريع والذكي في القائمة */}
      <div className="p-3 border-b border-slate-800 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute right-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="بحث سريع بالشاشات..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-xl pr-8 pl-8 py-2 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {menuSearch && (
            <button
              onClick={() => setMenuSearch('')}
              className="absolute left-2.5 text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* قائمة الروابط والبنود - قابلة للتمرير */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-4 text-xs">
        {/* 1. الرئيسية والـ KPIs */}
        {matchesSearch('الرئيسية لوحة المؤشرات مؤشرات أداء الأقسام تقارير أرشيف') && (
          <div className="space-y-1">
            <button onClick={() => onSelectTab('dashboard')} className={`w-full ${navItemClass('dashboard')}`}>
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>الرئيسية (لوحة المؤشرات)</span>
            </button>

            <button onClick={() => onSelectTab('departments')} className={`w-full ${navItemClass('departments')}`}>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>مؤشرات أداء الأقسام (KPIs) 📈</span>
            </button>

            <button onClick={() => onSelectTab('forms')} className={`w-full ${navItemClass('forms')}`}>
              <Archive className="w-4 h-4 text-amber-400" />
              <span>أرشيف التقارير والسجلات 🗄️</span>
            </button>
          </div>
        )}

        {/* 2. الإنتاج والعمليات الصناعية (MES) */}
        {matchesSearch('الإنتاج العمليات الصناعية غرفة عمليات التكاليف وصفات BOM طلب وصرف خامات كتالوج تسليم') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-amber-400/80 px-2 py-1">
              ─── الإنتاج والعمليات الصناعية ───
            </div>

            <button onClick={() => onSelectTab('production')} className={`w-full ${navItemClass('production')}`}>
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>غرفة عمليات الإنتاج والتكاليف 🏭</span>
            </button>

            <button onClick={() => onSelectTab('recipes')} className={`w-full ${navItemClass('recipes')}`}>
              <ChefHat className="w-4 h-4 text-slate-400" />
              <span>(BOM) وصفات التصنيع المعيارية</span>
            </button>

            <button onClick={() => onSelectTab('materials')} className={`w-full ${navItemClass('materials')}`}>
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>طلب وصرف خامات الصالة</span>
            </button>

            <button onClick={() => onSelectTab('finished-goods')} className={`w-full ${navItemClass('finished-goods')}`}>
              <Cake className="w-4 h-4 text-cyan-400" />
              <span>كتالوج وتسليم المنتج التام 🎂</span>
            </button>

            <button onClick={() => onSelectTab('productivity')} className={`w-full ${navItemClass('productivity')}`}>
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>إنتاجية الشيفات والورديات 🏆</span>
            </button>
          </div>
        )}

        {/* 3. المبيعات والتوزيع والشجرة */}
        {matchesSearch('المبيعات التوزيع فواتير سجل العملاء والمنافذ التجار الفروع') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-emerald-400/80 px-2 py-1">
              ─── المبيعات والتوزيع والشجرة ───
            </div>

            <button onClick={() => onSelectTab('customers')} className={`w-full ${navItemClass('customers')}`}>
              <Users className="w-4 h-4 text-emerald-400" />
              <span>سجل العملاء والتجار والمنافذ 👥</span>
            </button>

            <button onClick={() => onSelectTab('branches')} className={`w-full ${navItemClass('branches')}`}>
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>إدارة الفروع ومنافذ التوزيع 🏢</span>
            </button>

            <button onClick={() => onSelectTab('sales')} className={`w-full ${navItemClass('sales')}`}>
              <Receipt className="w-4 h-4 text-slate-300" />
              <span>فواتير المبيعات اليومية 🧾</span>
            </button>
          </div>
        )}

        {/* 4. المخازن واللوجستيات والأصول */}
        {matchesSearch('المخازن المستودعات فحص استلام أرصدة كارت الصنف تحويلات الأسبات حوكمة الأصول تتبع الحاويات') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
              ─── المخازن واللوجستيات والأصول ───
            </div>

            <button onClick={() => onSelectTab('inventory')} className={`w-full ${navItemClass('inventory')}`}>
              <Grid2X2 className="w-4 h-4 text-cyan-400" />
              <span>لوحة مؤشرات المخزون 🏬</span>
            </button>

            <button onClick={() => onSelectTab('receiving')} className={`w-full ${navItemClass('receiving')}`}>
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>فحص واستلام الخامات (GMP)</span>
            </button>

            <button onClick={() => onSelectTab('transfers')} className={`w-full ${navItemClass('transfers')}`}>
              <ArrowLeftRight className="w-4 h-4 text-slate-400" />
              <span>التحويلات وفض المنازعات ⚖️</span>
            </button>

            <button onClick={() => onSelectTab('assets')} className={`w-full ${navItemClass('assets')}`}>
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>الأصول والماكينات والصيانة 🏭</span>
            </button>

            <button onClick={() => onSelectTab('crates')} className={`w-full ${navItemClass('crates')}`}>
              <Boxes className="w-4 h-4 text-slate-400" />
              <span>تتبع وحركة الأسبات والصواني 🔄</span>
            </button>
          </div>
        )}

        {/* 5. دليل الأصناف والمواد */}
        {matchesSearch('الأصناف دليل المواد الهيكل الشجري تصنيفات') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
              ─── دليل الأصناف والمواد ───
            </div>

            <button onClick={() => onSelectTab('products')} className={`w-full ${navItemClass('products')}`}>
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>مركز إدارة الأصناف الشامل 📦</span>
            </button>

            <button onClick={() => onSelectTab('hierarchy')} className={`w-full ${navItemClass('hierarchy')}`}>
              <FolderTree className="w-4 h-4 text-cyan-400" />
              <span>الهيكل الشجري للأصناف (UOM) 🌳</span>
            </button>
          </div>
        )}

        {/* 6. المشتريات والموردين */}
        {matchesSearch('المشتريات الموردين أسعار التوريد أوامر الشراء PO فواتير تقييم جودة COA') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
              ─── المشتريات والموردين ───
            </div>

            <button onClick={() => onSelectTab('procurement')} className={`w-full ${navItemClass('procurement')}`}>
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>أوامر الشراء وجودة الموردين (COA) 🛡</span>
            </button>

            <button onClick={() => onSelectTab('purchasing')} className={`w-full ${navItemClass('purchasing')}`}>
              <FileText className="w-4 h-4 text-slate-400" />
              <span>فواتير الشراء والتسعير</span>
            </button>
          </div>
        )}

        {/* 6.5. الإدارة المالية والحسابات العامة */}
        {matchesSearch('المالية الحسابات الخزينة الخزائن قيود يومية مصروفات القوائم الأرباح الموردين') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-amber-400/80 px-2 py-1">
              ─── الإدارة المالية والحسابات العامة ───
            </div>

            <button onClick={() => onSelectTab('accounts')} className={`w-full ${navItemClass('accounts')}`}>
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>شجرة الحسابات والمركز المالي 🏛️</span>
            </button>

            <button onClick={() => onSelectTab('treasury')} className={`w-full ${navItemClass('treasury')}`}>
              <HandCoins className="w-4 h-4 text-emerald-400" />
              <span>سندات القبض والصرف والخزائن 💵</span>
            </button>

            <button onClick={() => onSelectTab('journal')} className={`w-full ${navItemClass('journal')}`}>
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>دفتر قيود اليومية العامة 📖</span>
            </button>

            <button onClick={() => onSelectTab('expenses')} className={`w-full ${navItemClass('expenses')}`}>
              <Wallet2 className="w-4 h-4 text-rose-400" />
              <span>الموردين والغاز ومصروفات التشغيل 🏭</span>
            </button>

            <button onClick={() => onSelectTab('finance')} className={`w-full ${navItemClass('finance')}`}>
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>القوائم المالية والأرباح 📊</span>
            </button>
          </div>
        )}

        {/* 7. منظومة النماذج ومحاضر الفحص الرقمية (HACCP) */}
        {matchesSearch('النماذج محاضر الفحص مصمم النماذج تعبئة تقارير استجابات HACCP') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
              ─── النماذج ومحاضر الفحص الرقمية ───
            </div>

            <button onClick={() => onSelectTab('forms')} className={`w-full ${navItemClass('forms')}`}>
              <ClipboardCheck className="w-4 h-4 text-cyan-400" />
              <span>مصمم وإدارة النماذج (HACCP) 📋</span>
            </button>
          </div>
        )}

        {/* 8. منظومة الطوارئ والتدخل السريع (SOS) */}
        {matchesSearch('الطوارئ المهام الطارئة الأعطال SOS مؤشرات SLA') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-rose-400/80 px-2 py-1">
              ─── الطوارئ والتدخل السريع (SOS) ───
            </div>

            <button onClick={() => onSelectTab('emergency')} className={`w-full ${navItemClass('emergency')}`}>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>المهام الطارئة والأعطال (SOS) 🚨</span>
            </button>
          </div>
        )}

        {/* 9. الهيكل الإداري (HR) */}
        {matchesSearch('الهيكل الإداري الشركات الكيانات الفروع الأقسام الصالات العاملين الورديات جدول') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
              ─── الهيكل الإداري (HR) ───
            </div>

            <button onClick={() => onSelectTab('hr')} className={`w-full ${navItemClass('hr')}`}>
              <UserCog className="w-4 h-4 text-slate-400" />
              <span>الشركات وجدولة العمال (HR)</span>
            </button>

            <button onClick={() => onSelectTab('departments')} className={`w-full ${navItemClass('departments')}`}>
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>إدارة الأقسام وصالات التشغيل</span>
            </button>
          </div>
        )}

        {/* 10. أمن النظام والصلاحيات (RBAC) */}
        {matchesSearch('أمن النظام الصلاحيات المستخدمين RBAC الأدوار') && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
              ─── أمن النظام والصلاحيات ───
            </div>

            <button onClick={() => onSelectTab('security')} className={`w-full ${navItemClass('security')}`}>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>المستخدمين والصلاحيات 🛡️</span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
};
