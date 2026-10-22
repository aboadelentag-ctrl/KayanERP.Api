import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserSession {
  id: number;
  username: string;
  fullName: string;
  role: 'Admin' | 'BranchManager' | 'Cashier' | 'ProductionManager' | 'Accountant';
  branchId: number;
  branchName: string;
  permissions: string[];
}

interface AuthContextType {
  user: UserSession | null;
  isLoggedIn: boolean;
  hasPermission: (permissionCode: string) => boolean;
  switchRole: (role: UserSession['role']) => void;
  logout: () => void;
}

// أدوار جاهزة للتجربة والتبديل الميداني
const DEMO_USERS: Record<UserSession['role'], UserSession> = {
  Admin: {
    id: 1,
    username: 'admin',
    fullName: 'أبو عادل (المدير التنفيذي)',
    role: 'Admin',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    permissions: ['*'], // صلاحيات شاملة
  },
  ProductionManager: {
    id: 2,
    username: 'prod_manager',
    fullName: 'م. إبراهيم (مدير التشغيل والجودة)',
    role: 'ProductionManager',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    permissions: [
      'Production.View',
      'Production.Create',
      'Recipes.View',
      'Recipes.Manage',
      'Materials.Requisition',
      'Stock.View',
    ],
  },
  BranchManager: {
    id: 3,
    username: 'dekernes_mgr',
    fullName: 'أحمد محمود (مشرف فرع دكرنس)',
    role: 'BranchManager',
    branchId: 2,
    branchName: 'فرع دكرنس الرئيسي',
    permissions: [
      'Sales.View',
      'Sales.Create',
      'Sales.Approve',
      'Transfers.Receive',
      'Crates.Manage',
      'Stock.View',
    ],
  },
  Cashier: {
    id: 4,
    username: 'sherbin_cashier',
    fullName: 'محمد السعيد (كاشير فرع شربين)',
    role: 'Cashier',
    branchId: 3,
    branchName: 'فرع شربين',
    permissions: ['Sales.View', 'Sales.Create'],
  },
  Accountant: {
    id: 5,
    username: 'accountant',
    fullName: 'خالد ممدوح (رئيس الحسابات)',
    role: 'Accountant',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    permissions: [
      'Accounts.View',
      'Journal.Post',
      'Reports.Financial',
      'Expenses.Create',
    ],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem('kayan_active_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.Admin;
  });

  useEffect(() => {
    localStorage.setItem('kayan_active_user', JSON.stringify(user));
  }, [user]);

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role.toLowerCase() === 'admin' || user.permissions.includes('*')) return true;
    if (!permissionCode.trim()) return true;

    // دعم الصلاحيات المتعددة المفصولة بفاصلة مثل Blazor تماماً
    const requiredList = permissionCode.split(',').map((p) => p.trim());
    return requiredList.some((req) => user.permissions.includes(req));
  };

  const switchRole = (newRole: UserSession['role']) => {
    const target = DEMO_USERS[newRole];
    if (target) setUser(target);
  };

  const logout = () => {
    setUser(DEMO_USERS.Cashier);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        hasPermission,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
