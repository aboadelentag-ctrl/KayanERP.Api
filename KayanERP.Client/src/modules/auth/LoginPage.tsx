import React, { useState } from 'react';
import {
  Boxes,
  KeyRound,
  Building,
  User,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Building2,
  Check
} from 'lucide-react';
import type { UserLoginResult } from './authApi';

interface LoginPageProps {
  onLoginSuccess?: (user: UserLoginResult) => void;
}

interface TenantPreset {
  code: string;
  name: string;
  key: string;
  defaultUser: {
    username: string;
    fullName: string;
    role: string;
    branchId: string;
    branchName: string;
  };
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [tenantCode, setTenantCode] = useState('ABUADEL');
  const [tenantKey, setTenantKey] = useState('TENANT-KEY-2026-ABUADEL');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  // الشركات التجريبية المجهزة لاختبار العزل
  const tenantPresets: TenantPreset[] = [
    {
      code: 'ABUADEL',
      name: 'مجموعة مصانع ومنافذ أبو عادل للحلويات',
      key: 'TENANT-KEY-2026-ABUADEL',
      defaultUser: {
        username: 'admin',
        fullName: 'أبو عادل (المدير العام والتنفيذي)',
        role: 'مدير عام (صلاحيات كاملة)',
        branchId: 'BRANCH1',
        branchName: 'المصنع والإدارة المركزية'
      }
    },
    {
      code: 'DELTA-FOOD',
      name: 'شركة الدلتا للصناعات والتوريدات الغذائية',
      key: 'TENANT-KEY-2026-DELTA',
      defaultUser: {
        username: 'delta_manager',
        fullName: 'م. طارق العوضي (مدير عمليات الدلتا)',
        role: 'مدير قطاع الإمداد والتوريدات',
        branchId: 'DELTA-HQ',
        branchName: 'مستودعات الدلتا المركزية - المنصورة'
      }
    },
    {
      code: 'AHRAM-BAKERY',
      name: 'مجموعة الأهرام للمخابز والحلويات',
      key: 'TENANT-KEY-2026-AHRAM',
      defaultUser: {
        username: 'ahram_admin',
        fullName: 'أ. حسام الشرقاوي (مدير التشغيل)',
        role: 'مدير تشغيل الفروع والمنافذ',
        branchId: 'AHRAM-BR01',
        branchName: 'الفرع الرئيسي - الزقازيق'
      }
    }
  ];

  const handleSelectPreset = (t: TenantPreset) => {
    setTenantCode(t.code);
    setTenantKey(t.key);
    setUsername(t.defaultUser.username);
    setError(null);
  };

  const currentPreset = tenantPresets.find(t => t.code === tenantCode);

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantCode.trim()) {
      setError('يرجى تحديد أو إدخال كود المنشأة');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    const matchedTenant = tenantPresets.find(t => t.code === tenantCode);

    const userProfile: UserLoginResult = matchedTenant
      ? {
          userId: 100 + matchedTenant.code.length,
          username: username,
          fullName: matchedTenant.defaultUser.fullName,
          role: matchedTenant.defaultUser.role,
          branchId: matchedTenant.defaultUser.branchId,
          branchName: matchedTenant.defaultUser.branchName,
          token: `jwt-token-${matchedTenant.code.toLowerCase()}-2026`
        }
      : {
          userId: 999,
          username: username,
          fullName: `مدير منشأة (${tenantCode})`,
          role: 'مدير عام المنشأة',
          branchId: `${tenantCode}-HQ`,
          branchName: `المقر الرئيسي (${tenantCode})`,
          token: `jwt-token-${tenantCode.toLowerCase()}-2026`
        };

    try {
      localStorage.setItem('user', JSON.stringify(userProfile));
      localStorage.setItem('token', userProfile.token);
      localStorage.setItem('kayan_tenant_code', tenantCode);
      localStorage.setItem('kayan_active_branch_id', userProfile.branchId);
      localStorage.setItem('kayan_active_branch_name', userProfile.branchName);
      localStorage.removeItem('kayan_logged_out');
    } catch (err) {}

    if (onLoginSuccess) {
      onLoginSuccess(userProfile);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#08090b] text-zinc-100 font-sans flex flex-col justify-center items-center p-4 transition-colors" dir="rtl">
      
      <div className="w-full max-w-lg bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative">
        
        {/* الترويسة */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-zinc-100 tracking-wide mb-1">
            منصة كيان السحابية
          </h1>
          <p className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 tracking-wider">
            KAYAN ENTERPRISE • MULTI-TENANCY V2.0
          </p>
        </div>

        {/* مؤشر الخطوات */}
        <div className="flex items-center justify-center gap-2 mb-6 text-xs font-bold text-slate-600 dark:text-zinc-400">
          <span className={`px-2.5 py-1 rounded-xl transition-all ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
            1. اعتماد المنشأة (الشركة)
          </span>
          <span className="text-zinc-600 font-mono">───</span>
          <span className={`px-2.5 py-1 rounded-xl transition-all ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
            2. دخول المستخدم
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-700/60 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* الخطوة 1: اختيار واعتماد المنشأة */}
        {step === 1 && (
          <div>
            {/* اختيار سريع للشركات التجريبية */}
            <div className="mb-4">
              <label className="block text-slate-600 dark:text-zinc-400 text-[11px] font-bold mb-2">
                اختر شركة للتجربة المباشرة أو أدخل بيانات شركة جديدة:
              </label>
              <div className="space-y-2">
                {tenantPresets.map(t => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => handleSelectPreset(t)}
                    className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      tenantCode === t.code
                        ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                        : 'bg-slate-50 dark:bg-[#171922] border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <div>
                        <span className="font-bold text-xs block">{t.name}</span>
                        <small className="text-zinc-500 font-mono text-[10px]">كود المنشأة: {t.code}</small>
                      </div>
                    </div>
                    {tenantCode === t.code && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleTenantSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1.5">
                  كود المنشأة المستأجرة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tenantCode}
                    onChange={(e) => setTenantCode(e.target.value.toUpperCase())}
                    placeholder="مثال: DELTA-FOOD"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 font-mono font-bold outline-none focus:border-indigo-500 text-left"
                    dir="ltr"
                  />
                  <Building className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1.5">
                  مفتاح الدخول السري للمنشأة (Tenant Key) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={tenantKey}
                    onChange={(e) => setTenantKey(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 font-mono outline-none focus:border-indigo-500 text-left"
                    dir="ltr"
                  />
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>التالي: اعتماد المنشأة والمتابعة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* الخطوة 2: تسجيل دخول المستخدم التابع للمنشأة */}
        {step === 2 && (
          <form onSubmit={handleUserSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-[#171922] border border-indigo-500/30 rounded-xl mb-3 flex items-center justify-between">
              <div>
                <span className="text-slate-600 dark:text-zinc-400 block text-[10px]">المنشأة المعتمدة حالياً:</span>
                <span className="font-bold text-amber-400 text-xs">
                  {currentPreset ? currentPreset.name : tenantCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                تغيير المنشأة
              </button>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1.5">
                اسم المستخدم <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 font-mono font-bold outline-none focus:border-indigo-500 text-left"
                  dir="ltr"
                />
                <User className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1.5">
                كلمة المرور <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 font-mono outline-none focus:border-indigo-500 text-left"
                  dir="ltr"
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl border border-slate-300 dark:border-zinc-700 transition-all cursor-pointer"
              >
                رجوع
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>دخول النظام</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800/80 text-center">
          <span className="text-[11px] text-zinc-500 font-mono">
            نظام الرقابة وعزل المنشآت السحابية الصارم © 2026
          </span>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;


