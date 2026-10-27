import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ScreenId, Branch, TenantInfo, UserSession } from '../types/navigation';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  session: UserSession;
  branches: Branch[];
  activeBranch: Branch;
  switchBranch: (branchId: string) => void;
  addBranch: (newBranch: Omit<Branch, 'id' | 'isActive'>) => void;
  deleteBranch: (branchId: string) => void; // دالة الحذف الجديدة
  isAddBranchModalOpen: boolean;
  setIsAddBranchModalOpen: (open: boolean) => void;
  hasPermission: (code: string, type?: 'view' | 'execute') => boolean;
}

const defaultTenant: TenantInfo = {
  tenantId: 'TENANT-ABU-ADEL-01',
  organizationName: 'حلويات أبو عادل',
  brandSubTitle: 'نظام كيان الصناعي لإدارة العمليات والإنتاج V2.0',
};

const initialBranches: Branch[] = [
  { id: 'BR-101', code: 'FAC-MAIN', name: 'المصنع المركزي - صالة الإنتاج', type: 'FACTORY', isProductionHub: true, isActive: true },
  { id: 'BR-102', code: 'SHW-MAIN', name: 'المعرض الرئيسي - المنصورة', type: 'SHOWROOM', isProductionHub: false, isActive: true },
  { id: 'BR-103', code: 'BR-DAKARNES', name: 'فرع دكرنس', type: 'SHOWROOM', isProductionHub: false, isActive: true },
  { id: 'BR-104', code: 'BR-SHERBIN', name: 'فرع شربين', type: 'SHOWROOM', isProductionHub: false, isActive: true }
];

const mockDefaultSession: UserSession = {
  userId: 'EMP-104',
  name: 'م. أحمد عادل',
  role: 'مدير العمليات والجودة المركزية',
  tenant: defaultTenant,
  currentBranchId: 'BR-101',
  currentBranchName: 'المصنع المركزي - صالة الإنتاج',
  shift: 'صباحي',
  permissions: {
    canView: ['mes_production', 'scale_custody', 'inventory_matrix', 'branch_dispatch', 'branches_management', 'accounting_ledger', 'rbac_studio'],
    canExecute: ['mes.post_batch', 'scale.sign_custody', 'dispatch.create_manifest', 'branch.create']
  }
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('kayan_theme') as 'light' | 'dark') || 'dark');
  const [activeScreen, setActiveScreen] = useState<ScreenId>(() => (localStorage.getItem('kayan_active_screen') as ScreenId) || 'mes_production');
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('kayan_saas_branches');
    return saved ? JSON.parse(saved) : initialBranches;
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('kayan_user_session');
    return saved ? JSON.parse(saved) : mockDefaultSession;
  });

  useEffect(() => {
    const root = document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('kayan_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('kayan_saas_branches', JSON.stringify(branches));
  }, [branches]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const handleScreenChange = (screen: ScreenId) => {
    setActiveScreen(screen);
    setIsMobileDrawerOpen(false);
    localStorage.setItem('kayan_active_screen', screen);
  };

  const switchBranch = (branchId: string) => {
    const targetBranch = branches.find(b => b.id === branchId);
    if (!targetBranch) return;
    const updatedSession: UserSession = { ...session, currentBranchId: targetBranch.id, currentBranchName: targetBranch.name };
    setSession(updatedSession);
    localStorage.setItem('kayan_user_session', JSON.stringify(updatedSession));
  };

  const addBranch = (newBranchData: Omit<Branch, 'id' | 'isActive'>) => {
    const newId = `BR-${Date.now().toString().slice(-4)}`;
    setBranches(prev => [...prev, { ...newBranchData, id: newId, isActive: true }]);
    setIsAddBranchModalOpen(false);
  };

  // وظيفة الحذف الجديدة
  const deleteBranch = (branchId: string) => {
    setBranches(prev => {
      const updated = prev.filter(b => b.id !== branchId);
      // إذا قمنا بحذف الفرع الذي نقف عليه حالياً، ننقل المستخدم للفرع الأول تلقائياً
      if (session.currentBranchId === branchId && updated.length > 0) {
        const fallbackSession = { ...session, currentBranchId: updated[0].id, currentBranchName: updated[0].name };
        setSession(fallbackSession);
        localStorage.setItem('kayan_user_session', JSON.stringify(fallbackSession));
      }
      return updated;
    });
  };

  const hasPermission = (code: string, type: 'view' | 'execute' = 'view'): boolean => {
    return type === 'view' ? session.permissions.canView.includes(code as ScreenId) : session.permissions.canExecute.includes(code);
  };

  const activeBranch = branches.find(b => b.id === session.currentBranchId) || branches[0] || null;

  return (
    <AppContext.Provider value={{ theme, toggleTheme, activeScreen, setActiveScreen, isMobileDrawerOpen, setIsMobileDrawerOpen, session, branches, activeBranch, switchBranch, addBranch, deleteBranch, isAddBranchModalOpen, setIsAddBranchModalOpen, hasPermission }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};