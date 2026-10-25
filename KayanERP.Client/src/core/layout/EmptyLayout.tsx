import React from 'react';

interface EmptyLayoutProps {
  children?: React.ReactNode;
}

export const EmptyLayout: React.FC<EmptyLayoutProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans" dir="rtl">
      {children}
    </div>
  );
};
