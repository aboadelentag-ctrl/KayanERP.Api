import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

export interface BranchContextItem {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface BranchContextType {
  activeBranchId: number;
  activeBranchName: string;
  setActiveBranchId: (id: number) => void;
  canSwitchBranch: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeBranchId, setActiveBranchId] = useState<number>(user?.branchId || 1);
  const [activeBranchName, setActiveBranchName] = useState<string>(user?.branchName || 'المصنع');

  const canSwitchBranch = user?.role === 'Admin';

  // مزامنة الفرع عند تغيير المستخدم الحالي
  useEffect(() => {
    if (user) {
      setActiveBranchId(user.branchId);
      setActiveBranchName(user.branchName);
    }
  }, [user]);

  const handleSetBranch = (id: number) => {
    const branches = JSON.parse(localStorage.getItem('kayan_branches_data') || '[]');
    const match = branches.find((b: any) => b.id === id);
    if (match) {
      setActiveBranchId(match.id);
      setActiveBranchName(match.name);
    } else {
      setActiveBranchId(id);
    }
  };

  return (
    <BranchContext.Provider
      value={{
        activeBranchId,
        activeBranchName,
        setActiveBranchId: handleSetBranch,
        canSwitchBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranchContext = () => {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranchContext must be used within a BranchProvider');
  return ctx;
};
