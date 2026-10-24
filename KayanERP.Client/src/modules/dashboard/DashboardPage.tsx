import React, { useState, useEffect } from 'react';
import {
  Wallet2,
  TrendingUp,
  Truck,
  ShieldAlert,
  RotateCw,
  Building2,
  ShieldCheck,
  Boxes,
  AlertTriangle,
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { fetchExecutiveDashboardApi } from './dashboardApi';
import type { ExecutiveDashboardData } from './dashboardApi';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadMetrics = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetchExecutiveDashboardApi();
      setData(res);
    } catch (err) {
      console.error('فشل جلب المؤشرات التنفيذية:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 font-sans" dir="rtl">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold">جاري تحميل لوحة المؤشرات التنفيذية العليا...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. رأس لوحة المؤشرات (Executive Header) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <span>👑 لوحة المؤشرات التنفيذية العليا</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>بث لحظي مباشر (Live)</span>
              </span>
            </div>
            <p className="text-xs text-slate-300">
              مرحباً بك، <strong className="text-amber-300 font-bold">{user?.fullName || 'أبو عادل (المدير العام والتنفيذي)'}</strong> 
              {' '}({user?.role || 'مدير عام المنظومة'}) — مرصد اتخاذ القرار ومتابعة الكفاءة التشغيلية لمصنع كيان ERP.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block">تاريخ التحديث اللحظي</span>
              <span className="font-mono font-bold text-amber-400 text-xs">{data.lastRefreshTime}</span>
            </div>
            <button
              onClick={() => loadMetrics(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'جاري التحديث...' : 'تحديث مرئي'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. بطاقات المؤشرات المالية والإنتاجية الكبرى (Top Executive KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        
        {/* إجمالي قيمة المخزون */}
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">إجمالي قيمة المخزون الحالي</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black font-mono text-indigo-700">
                {data.totalInventoryValue.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-gray-500">ج.م</span>
            </div>
            <span className="inline-block mt-2 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
              تثمين لحظي للخامات والمنتج
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Wallet2 className="w-6 h-6" />
          </div>
        </div>

        {/* كفاءة الإنتاج اليومي */}
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">كفاءة الإنتاج اليومي</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black font-mono text-emerald-600">
                {data.productionEfficiencyRate}%
              </span>
            </div>
            <span className="inline-block mt-2 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
              مقارنة بالخطط الاستراتيجية
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* شحنات التحويلات العالقة */}
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">شحنات التحويلات العالقة</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black font-mono text-amber-600">
                {data.inTransitTransfers}
              </span>
              <span className="text-xs font-bold text-gray-500">شحنة</span>
            </div>
            <span className="inline-block mt-2 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-md">
              قيد النقل بين المستودعات
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* منازعات وهالك النقل */}
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-rose-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">منازعات وهالك النقل</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black font-mono text-rose-600">
                {data.disputedTransfers}
              </span>
              <span className="text-xs font-bold text-gray-500">نزاع</span>
            </div>
            <span className="inline-block mt-2 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-md">
              بانتظار بت لجنة التسوية
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. لوحة الأداء التشغيلي حسب صالات المصنع + رقابة سلاسل الإمداد */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* صالات التصنيع والإنتاج */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>مؤشرات أداء صالات التصنيع والإنتاج اللحظية</span>
            </h2>
            <span className="text-[11px] text-gray-400 font-mono">3 صالات رئيسية</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-right">صالة الإنتاج</th>
                  <th className="py-3 px-4">أوامر التشغيل النشطة</th>
                  <th className="py-3 px-4" style={{ minWidth: '160px' }}>نسبة الإنجاز الفعلية</th>
                  <th className="py-3 px-4">معدل الجودة والمطابقة</th>
                  <th className="py-3 px-4">الحالة العامة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.productionLines.map((line) => (
                  <tr key={line.lineId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">{line.lineName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{line.activeOrders} أمر</td>
                    <td className="py-3.5 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-1">
                        <div
                          className={`h-full ${line.progressColor} rounded-full transition-all`}
                          style={{ width: `${line.completionRate}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[11px] text-gray-700">{line.completionRate}%</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{line.qualityRate}%</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${line.statusColor}`}>
                        {line.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* رقابة الحاويات وسلاسل الإمداد والعهد */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>رقابة الحاويات وسلاسل الإمداد</span>
              </h2>
              <span className="text-[10px] text-gray-400">حوكمة الأصول</span>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <span className="text-gray-600 font-medium">إجمالي الإسبات البلاستيكية بالعهد:</span>
                <span className="font-mono font-black text-indigo-700 text-sm">{data.cratesAtClients} إسبتة</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-gray-600 font-medium">تنبيهات نواقص الخامات الحرجة:</span>
                <span className="font-mono font-black text-rose-600 text-sm">{data.lowStockAlerts} أصناف</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-gray-600 font-medium">نسبة توفر الخامات بمستودع الإنتاج:</span>
                <span className="font-mono font-black text-emerald-600 text-sm">{data.rawMaterialAvailabilityRate}%</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-gray-600 font-medium">حالة الربط المالي والمحاسبي:</span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{data.accountingSyncStatus}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-slate-400 text-center font-mono">
            نظام الرقابة المستمر • متوافق مع معايير HACCP
          </div>
        </div>
      </div>

      {/* 4. متابعة مشروع تطوير وإصلاح الإنتاج الاستراتيجي */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <span className="inline-block bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-md mb-2">
              المبادرة الإستراتيجية العليا
            </span>
            <h3 className="text-base font-bold text-white mb-1.5">متابعة مشروع إصلاح وتطوير الإنتاج لعام 2027</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              استعراض خطط رفع الكفاءة الاستيعابية، خفض نسبة الهالك التراكمي في صالات التصنيع، وتعظيم العائد على أصول المؤسسة. نسبة إنجاز المبادرة العامة وصلت إلى {data.strategicInitiativeProgress}%.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[200px]">
              <span className="text-[11px] text-slate-400 block mb-1">مؤشر الجاهزية الإستراتيجية</span>
              <span className="text-3xl font-black font-mono text-amber-400">{data.strategicInitiativeProgress}%</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
