import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ScreenId, NavItemConfig, BranchType } from '../types/navigation';
import { 
  Factory, Scale, Boxes, Truck, Building2, BookOpen, ShieldAlert, 
  Sun, Moon, Menu, X, ChevronDown, UserCheck, Plus, Check
} from 'lucide-react';

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'mes_production', label: 'الإنتاج والتشغيل', iconName: 'Factory', requiredPermission: 'mes_production' },
  { id: 'scale_custody', label: 'الميزان والكنترول', badge: 'مباشر', iconName: 'Scale', requiredPermission: 'scale_custody' },
  { id: 'inventory_matrix', label: 'المخازن والأرصدة', iconName: 'Boxes', requiredPermission: 'inventory_matrix' },
  { id: 'branch_dispatch', label: 'توزيع الفروع', iconName: 'Truck', requiredPermission: 'branch_dispatch' },
  { id: 'branches_management', label: 'إدارة الفروع', iconName: 'Building2', requiredPermission: 'branches_management' },
  { id: 'accounting_ledger', label: 'الحسابات العامة', iconName: 'BookOpen', requiredPermission: 'accounting_ledger' },
];

const renderNavIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName) {
    case 'Factory': return <Factory className={className} />;
    case 'Scale': return <Scale className={className} />;
    case 'Boxes': return <Boxes className={className} />;
    case 'Truck': return <Truck className={className} />;
    case 'Building2': return <Building2 className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    default: return <ShieldAlert className={className} />;
  }
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    theme, toggleTheme, activeScreen, setActiveScreen, 
    isMobileDrawerOpen, setIsMobileDrawerOpen, session, 
    branches, activeBranch, switchBranch, 
    isAddBranchModalOpen, setIsAddBranchModalOpen, addBranch, hasPermission
  } = useApp();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  
  // حالات نموذج إضافة فرع جديد
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchType, setNewBranchType] = useState<BranchType>('SHOWROOM');
  const [newBranchIsProduction, setNewBranchIsProduction] = useState(false);

  const filteredNav = NAV_ITEMS.filter(item => hasPermission(item.id, 'view'));

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchCode) return;
    addBranch({
      name: newBranchName,
      code: newBranchCode,
      type: newBranchType,
      isProductionHub: newBranchIsProduction
    });
    setNewBranchName(''); setNewBranchCode('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col font-sans antialiased" dir="rtl">
      
      {/* --- الشريط العلوي للمنظومة (Header) --- */}
      <header className="sticky top-0 z-40 w-full h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-4 flex items-center justify-between shadow-sm">
        
        {/* اليمين: زر الموبايل واسم المنشأة */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
          >
            {isMobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg text-white font-black text-xl">
              {session.tenant.organizationName.charAt(0)}
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="font-extrabold text-base tracking-tight text-[var(--brand-primary)]">
                {session.tenant.organizationName}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium">
                {session.tenant.brandSubTitle}
              </span>
            </div>
          </div>
        </div>

        {/* الوسط: محول الفروع الديناميكي (Branch Switcher) */}
        <div className="relative">
          <button 
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--brand-primary)] transition-all"
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-xs font-bold">{activeBranch.name}</span>
              <span className="text-[9px] text-[var(--text-muted)]">{activeBranch.type}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>

          {/* قائمة الفروع المنسدلة */}
          {isBranchDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-secondary)]">الفروع المتاحة</span>
                <button 
                  onClick={() => { setIsBranchDropdownOpen(false); setIsAddBranchModalOpen(true); }}
                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded hover:bg-emerald-500/20"
                >
                  <Plus className="w-3 h-3" /> إضافة فرع
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { switchBranch(b.id); setIsBranchDropdownOpen(false); }}
                    className={`w-full text-right px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-surface-elevated)] transition-colors border-b border-[var(--border-subtle)] last:border-0 ${
                      activeBranch.id === b.id ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <div>
                      <div className={`text-sm font-bold ${activeBranch.id === b.id ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                        {b.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">{b.code} • {b.type}</div>
                    </div>
                    {activeBranch.id === b.id && <Check className="w-4 h-4 text-amber-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* اليسار: أدوات المستخدم والوضع الليلي */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-amber-500 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold">{session.name}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{session.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- جسم التطبيق (Body) --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* القائمة الجانبية (Desktop Sidebar) */}
        <aside className="hidden lg:flex flex-col w-64 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 justify-between">
          <nav className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              لوحة التحكم المركزية
            </div>
            {filteredNav.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {renderNavIcon(item.iconName, `w-4 h-4 ${isActive ? 'text-amber-500' : 'text-[var(--text-muted)]'}`)}
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* منطقة المحتوى المتغيرة (Main Viewport) */}
        <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 pb-24 lg:pb-6 bg-[var(--bg-app)]">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* --- شريط التنقل السفلي للموبايل (Bottom Mobile Nav) --- */}
      <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden h-16 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-lg flex items-center justify-around px-2 pb-1 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {filteredNav.slice(0, 5).map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex flex-col items-center justify-center flex-1 pt-2 pb-1 transition-all ${
                isActive ? 'text-amber-500 scale-110 -translate-y-1' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {renderNavIcon(item.iconName, "w-5 h-5 mb-1")}
              <span className="text-[9px] font-bold tracking-tight truncate max-w-[65px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* --- نافذة إضافة فرع جديد (Add Branch Modal) --- */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-surface-elevated)]">
              <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" /> إضافة منشأة / فرع جديد
              </h2>
              <button onClick={() => setIsAddBranchModalOpen(false)} className="text-[var(--text-muted)] hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddBranchSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">اسم الفرع (عربي)</label>
                <input 
                  type="text" required value={newBranchName} onChange={e => setNewBranchName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-amber-500 focus:outline-none"
                  placeholder="مثال: معرض المنصورة الجديد"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">كود الفرع (إنجليزي)</label>
                  <input 
                    type="text" required value={newBranchCode} onChange={e => setNewBranchCode(e.target.value)}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-amber-500 focus:outline-none uppercase"
                    placeholder="e.g. BR-MANSOURA"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">نوع المنشأة</label>
                  <select 
                    value={newBranchType} onChange={e => setNewBranchType(e.target.value as BranchType)}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-amber-500 focus:outline-none"
                  >
                    <option value="SHOWROOM">معرض بيع</option>
                    <option value="FACTORY">مصنع</option>
                    <option value="CENTRAL_WAREHOUSE">مخزن رئيسي</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-3 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-app)] hover:bg-[var(--bg-surface-elevated)] transition-colors">
                <input 
                  type="checkbox" checked={newBranchIsProduction} onChange={e => setNewBranchIsProduction(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-sm font-bold text-[var(--text-primary)]">يحتوي على صالة إنتاج وميزان (MES Hub)</span>
              </label>

              <div className="pt-2 flex gap-3">
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-colors">
                  حفظ الفرع
                </button>
                <button type="button" onClick={() => setIsAddBranchModalOpen(false)} className="flex-1 bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-bold py-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};