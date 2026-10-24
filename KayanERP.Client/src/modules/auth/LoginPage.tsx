import React, { useState } from 'react';
import {
  Building2,
  KeyRound,
  User,
  Lock,
  ArrowRight,
  Check,
  AlertTriangle,
  RefreshCw,
  Boxes
} from 'lucide-react';
import { verifyTenantApi, loginUserApi } from './authApi';
import type { UserLoginResult } from './authApi';

interface Props {
  onLoginSuccess: (userResult: UserLoginResult) => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // مدخلات المرحلة 1: اعتماد المنشأة
  const [tenantCode, setTenantCode] = useState<string>('ABUADEL');
  const [tenantKey, setTenantKey] = useState<string>('AbuAdel@2026');
  const [verifiedCompanyId, setVerifiedCompanyId] = useState<number>(1);
  const [verifiedCompanyName, setVerifiedCompanyName] = useState<string>('');

  // مدخلات المرحلة 2: دخول المستخدم
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('123456');

  // معالجة الخطوة 1
  const handleVerifyTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await verifyTenantApi(tenantCode, tenantKey);
      if (result.success) {
        setVerifiedCompanyId(result.companyId);
        setVerifiedCompanyName(result.companyName);
        setCurrentStep(2);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل التحقق من هوية المنشأة.');
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة الخطوة 2
  const handleLoginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const userResult = await loginUserApi(verifiedCompanyId, username, password);
      if (userResult.success) {
        onLoginSuccess(userResult);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'بيانات الدخول غير صحيحة.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToTenantStep = () => {
    setCurrentStep(1);
    setErrorMessage(null);
    setPassword('');
  };

  return (
    <div className="relative min-h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none overflow-hidden" dir="rtl">
      {/* خلفية الشبكة الهندسية العصبية */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:40px_40px]"
      />

      {/* بطاقة تسجيل الدخول المركزية */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        {/* الترويسة والشعار المضيء */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border border-purple-400/40 rounded-2xl flex items-center justify-center text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.35)]">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">منصة كيان السحابية</h1>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">KAYAN ENTERPRISE • ANTIGRAVITY v2.0</span>
        </div>

        {/* مؤشر مسار الخطوتين */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-bold ${currentStep === 1 ? 'text-indigo-400' : 'text-emerald-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 1 ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-emerald-500 text-white'
            }`}>
              {currentStep > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
            </span>
            <span>اعتماد المنشأة</span>
          </div>

          <div className={`w-10 h-0.5 rounded-full transition-colors ${currentStep === 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />

          <div className={`flex items-center gap-1.5 text-xs font-bold ${currentStep === 2 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 2 ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800 border border-slate-700'
            }`}>
              2
            </span>
            <span>دخول المستخدم</span>
          </div>
        </div>

        {/* رسائل التنبيه والخطأ */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-center">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* المرحلة 1: اعتماد هوية المنشأة */}
        {currentStep === 1 ? (
          <form onSubmit={handleVerifyTenant} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                كود / اسم المنشأة المستأجرة <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute right-3 text-cyan-400">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="مثال: ABUADEL"
                  value={tenantCode}
                  onChange={(e) => setTenantCode(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-950/80 border border-slate-700 text-white font-bold rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                مفتاح الدخول السري للمنشأة (Tenant Key) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute right-3 text-amber-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={tenantKey}
                  onChange={(e) => setTenantKey(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-950/80 border border-slate-700 text-white font-mono rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق من ترخيص المنشأة...</span>
                </>
              ) : (
                <>
                  <span>التالي: اعتماد المنشأة والمتابعة</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* المرحلة 2: تسجيل دخول المستخدم التابع للمنشأة */
          <div>
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">المنشأة المعتمدة:</span>
                <strong className="text-emerald-400 font-bold block mt-0.5">🏢 {verifiedCompanyName || 'حلويات أبو عادل'}</strong>
              </div>
              <button
                type="button"
                onClick={handleResetToTenantStep}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-[11px] font-semibold"
              >
                تغيير المنشأة
              </button>
            </div>

            <form onSubmit={handleLoginUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  اسم المستخدم الشخصي <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute right-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="اسم المستخدم (مثال: admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-950/80 border border-slate-700 text-white font-bold rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  كلمة المرور الشخصية <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute right-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-950/80 border border-slate-700 text-white font-mono rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري تفعيل الصلاحيات...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>تسجيل الدخول لمنظومة كيان</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="text-center mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          نظام الرقابة والحوكمة السحابية الصارم © 2026
        </div>
      </div>
    </div>
  );
};
