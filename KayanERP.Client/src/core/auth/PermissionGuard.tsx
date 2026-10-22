import React from 'react';
import { useAuth } from './AuthContext';

interface Props {
  permission: string;
  showDisabled?: boolean;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<Props> = ({
  permission,
  showDisabled = false,
  children,
}) => {
  const { hasPermission } = useAuth();
  const isAuthorized = hasPermission(permission);

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (showDisabled) {
    return (
      <span
        className="inline-block opacity-45 cursor-not-allowed pointer-events-none select-none"
        title="ليس لديك الصلاحية المطلوبة لتنفيذ هذا الإجراء"
      >
        {children}
      </span>
    );
  }

  return null;
};
