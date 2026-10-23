import React, { useState } from 'react';
import { X, Save, ShieldCheck, Check } from 'lucide-react';
import type { SystemUser } from './securityApi';
import { ALL_PERMISSIONS_LIST } from './securityApi';
import type { Permission } from '../../core/auth/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onSave: (updatedUser: SystemUser) => void;
}

export const UserPermissionsModal: React.FC<Props> = ({ isOpen, onClose, user, onSave }) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    user ? user.customPermissions : []
  );

  React.useEffect(() => {
    if (user) {
      setSelectedPermissions(user.customPermissions);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const togglePermission = (perm: Permission) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleSelectAll = () => {
    setSelectedPermissions(ALL_PERMISSIONS_LIST.map((p) => p.key));
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = () => {
    onSave({
      ...user,
      customPermissions: selectedPermissions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-gray-900">
                مصفوفة الصلاحيات: {user.fullName}
              </h2>
              <span className="text-[11px] text-gray-500 font-mono">
                الدور: {user.role} | الفرع: {user.branchName}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs shrink-0">
          <span className="text-indigo-900 font-medium">
            تم تفعيل <b className="font-bold font-mono text-indigo-700">{selectedPermissions.length}</b> من أصل {ALL_PERMISSIONS_LIST.length} صلاحيات
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold"
            >
              تحديد الكل
            </button>
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-[11px] font-semibold"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {ALL_PERMISSIONS_LIST.map((perm) => {
            const isChecked = selectedPermissions.includes(perm.key);
            return (
              <div
                key={perm.key}
                onClick={() => togglePermission(perm.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isChecked
                    ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{perm.label}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                      {perm.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">{perm.description}</p>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>حفظ مصفوفة الصلاحيات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
