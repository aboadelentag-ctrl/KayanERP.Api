import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
  CreditCard,
  PlusCircle,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { AuthorizeView, usePermission } from './AuthorizeView';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const AuthorizeDemoPage: React.FC<Props> = ({ onNavigate }) => {
  const { user, switchRole } = useAuth();
  const { hasPermission } = usePermission();
  const [lastAction, setLastAction] = useState<string>('لا يوجد إجراء حتى الآن');

  const permissionsToTest = [
    { code: 'Production.Create', label: 'إنشاء أمر تشغيل في عنبر الإنتاج' },
    { code: 'Recipes.Edit', label: 'تعديل معايير ووصفات الـ BOM' },
    { code: 'Sales.CreateInvoice', label: 'إصدار واعتماد فاتورة مبيعات' },
    { code: 'Purchasing.Approve', label: 'اعتماد أسعار التوريد وأوامر الشراء' },
    { code: 'Treasury.Vouchers', label: 'صرف سندات الخزينة وسداد الموردين' },
    { code: 'Roles.Manage', label: 'إدارة الأدوار والمستخدمين (Admin حصراً)' },
  ];

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. رأس الصفحة */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-black text-amber-400">
              مكون حماية الصلاحيات والأزرار (AuthorizeView RBAC Guard)
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            مغلف برمجي يحكم ظهور أو تعطيل الأزرار والإجراءات الميدانية حسب دور وصلاحيات المستخدم النشط.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300">الدور النشط بالمحاكاة:</span>
          <select
            value={user?.role}
            onChange={(e) => switchRole(e.target.value as any)}
            className="bg-slate-800 text-white border border-slate-700 text-xs rounded-xl px-3 py-1.5 font-bold outline-none"
          >
            <option value="Admin">مدير عام (صلاحيات كاملة)</option>
            <option value="ProductionManager">مدير إنتاج ومعمل</option>
            <option value="Accountant">محاسب عام</option>
            <option value="BranchManager">مشرف فرع دكرنس</option>
            <option value="Cashier">كاشير فرع شربين</option>
          </select>
        </div>
      </div>

      {/* 2. بطاقة معلومات المستخدم والصلاحيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">المستخدم الحالي</span>
          <strong className="text-base text-gray-900 block mt-1">{user?.fullName}</strong>
          <span className="text-[11px] text-gray-400 font-mono">@{user?.username}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">مستوى الدور والصلاحية</span>
          <strong className="text-base text-amber-600 block mt-1">{user?.role}</strong>
          <span className="text-[11px] text-gray-400">
            {user?.role === 'Admin' ? 'صلاحية كاملة (Full Control)' : 'صلاحيات تشغيلية محددة'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">آخر إجراء تم تنفيذه</span>
          <strong className="text-xs text-emerald-700 block mt-1 truncate">{lastAction}</strong>
        </div>
      </div>

      {/* 3. مصفوفة فحص الصلاحيات بالمقارنة بين وضع الحجب التام ووضع الإظهار المعطل */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-xs font-bold flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>مصفوفة فحص وسلوك مكون الحماية (AuthorizeView)</span>
          </h2>
          <span className="text-[11px] text-slate-400">تجربة تفاعلية مباشرة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-gray-600 font-bold border-b text-center">
              <tr>
                <th className="py-3 px-3">كود الصلاحية</th>
                <th className="py-3 px-3 text-right">البيان الوظيفي للصلاحية</th>
                <th className="py-3 px-3">حالة الصلاحية للدور</th>
                <th className="py-3 px-3">السلوك عند الحجب (RenderDisabled = false)</th>
                <th className="py-3 px-3">السلوك عند التعطيل (RenderDisabled = true)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-center">
              {permissionsToTest.map((p) => {
                const granted = hasPermission(p.code);
                return (
                  <tr key={p.code} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">{p.code}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-gray-900">{p.label}</td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        granted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {granted ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{granted ? 'ممنوحة' : 'محجوبة'}</span>
                      </span>
                    </td>

                    {/* الحالة الأولى: الإخفاء التام عند غياب الصلاحية */}
                    <td className="py-3.5 px-3">
                      <AuthorizeView permission={p.code} renderDisabled={false}>
                        <button
                          onClick={() => setLastAction(`تم تنفيذ: ${p.label}`)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          تنفيذ الإجراء
                        </button>
                      </AuthorizeView>
                      {!granted && (
                        <span className="text-gray-400 italic text-[11px]">مخفي تماماً من الواجهة</span>
                      )}
                    </td>

                    {/* الحالة الثانية: الظهور معطلاً مع تلميح الصلاحية */}
                    <td className="py-3.5 px-3">
                      <AuthorizeView permission={p.code} renderDisabled={true}>
                        <button
                          onClick={() => setLastAction(`تم تنفيذ: ${p.label}`)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          زر معطل رقابياً
                        </button>
                      </AuthorizeView>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
