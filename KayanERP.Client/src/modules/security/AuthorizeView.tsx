import React, { useEffect, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';

export interface AuthorizeViewProps {
  permission: string;
  showDisabled?: boolean;
  children: React.ReactNode;
}

export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'Admin') return true;

    const permissionsList = permission.split(',').map((p) => p.trim()).filter(Boolean);
    if (permissionsList.length === 0) return true;

    const rolePermissions: Record<string, string[]> = {
      ProductionManager: [
        'Production.View', 'Production.Create', 'Production.Execute',
        'Recipes.View', 'Recipes.Create', 'Recipes.Edit',
        'Materials.Request', 'Materials.Issue',
        'Quality.Check', 'Assets.View', 'Assets.ReportDefect',
        'Productivity.View', 'Productivity.Record'
      ],
      Accountant: [
        'Accounts.View', 'Accounts.Manage', 'Journal.View', 'Journal.Create',
        'Treasury.View', 'Treasury.Vouchers', 'Finance.Reports',
        'Sales.View', 'Sales.CreateInvoice', 'Purchasing.View', 'Purchasing.Approve'
      ],
      BranchManager: [
        'Sales.View', 'Sales.CreateInvoice', 'Branch.Manage',
        'Transfers.View', 'Transfers.Receive', 'Crates.Receive',
        'Stock.ViewBalances', 'Customers.View'
      ],
      Cashier: [
        'Sales.View', 'Sales.CreateInvoice', 'Customers.View'
      ]
    };

    const userPerms = rolePermissions[user.role] || [];
    return permissionsList.some((p) => userPerms.includes(p));
  };

  return { hasPermission };
};

export const AuthorizeView: React.FC<AuthorizeViewProps> = ({
  permission,
  showDisabled = false,
  children,
}) => {
  const { hasPermission } = usePermission();
  const isAuthorized = hasPermission(permission);

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (showDisabled) {
    return (
      <span
        className="inline-block opacity-40 select-none cursor-not-allowed pointer-events-none"
        title="ليس لديك الصلاحية المطلوبة لتنفيذ هذا الإجراء"
      >
        {children}
      </span>
    );
  }

  return null;
};
