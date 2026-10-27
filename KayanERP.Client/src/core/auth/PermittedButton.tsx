import React from 'react';
import { usePermission } from './usePermission';
import { Lock } from 'lucide-react';

export interface PermittedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  actionId: string;
  fallbackHidden?: boolean; // هل يختفي تماماً إذا لم يكن مسموحاً له بالرؤية؟ (الافتراضي نعم)
  showLockIcon?: boolean;
  children: React.ReactNode;
}

export const PermittedButton: React.FC<PermittedButtonProps> = ({
  actionId,
  fallbackHidden = true,
  showLockIcon = true,
  children,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const { getPermission } = usePermission();
  const { canView, canExecute } = getPermission(actionId);

  // إذا لم يملك صلاحية الرؤية، يُحذف من الواجهة تماماً
  if (!canView && fallbackHidden) {
    return null;
  }

  // إذا كان يرى الزر ولكن لا يملك صلاحية التنفيذ، يظهر معطلاً مع قفل
  const isExecutionBlocked = !canExecute || disabled;

  return (
    <button
      {...props}
      disabled={isExecutionBlocked}
      onClick={(e) => {
        if (isExecutionBlocked) {
          e.preventDefault();
          return;
        }
        if (onClick) onClick(e);
      }}
      title={!canExecute ? 'هذا الإجراء مقفل ويتطلب اعتماد إداري حسب صلاحيات دورك' : props.title}
      className={`${className} ${
        !canExecute
          ? 'opacity-40 cursor-not-allowed filter grayscale hover:border-transparent'
          : 'cursor-pointer active:scale-95'
      } transition-all`}
    >
      {!canExecute && showLockIcon && <Lock className="w-3.5 h-3.5 shrink-0 inline-block ml-1 text-amber-500" />}
      {children}
    </button>
  );
};
