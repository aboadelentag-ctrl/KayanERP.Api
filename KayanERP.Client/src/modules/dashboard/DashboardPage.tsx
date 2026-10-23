import React, { useState, useEffect } from 'react';
import { useBranchContext } from '../../core/context/BranchContext';
import {
  TrendingUp,
  DollarSign,
  Factory,
  AlertOctagon,
  Truck,
  Users,
  Award,
  Wrench,
  Boxes,
  PieChart,
  Scale,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { activeBranchName } = useBranchContext();
  const [metrics, setMetrics] = useState({
    totalSales: 195000,
    netProfit: 90000,
    activeWorkOrders: 2,
    completedBatches: 1,
    criticalAlerts: 1,
    teamEfficiency: 97,
    treasuryBalance: 117000,
    supplierPayables: 103500,
    assetCount: 4,
    emergencyCount: 3,
  });

  useEffect(() => {
    // قراءة البيانات الفعلية المحفوظة محلياً إن وجدت لتحديث المؤشرات لحظياً
    try {
      const prodOrders = JSON.parse(localStorage.getItem('kayan_production_orders') || '[]');
      const journalEntries = JSON.parse(localStorage.getItem('kayan_journal_entries') || '[]');
      const emgTasks = JSON.parse(localStorage.getItem('kayan_emergency_tasks') || '[]');

      if (prodOrders.length > 0) {
        const active = prodOrders.filter((p: any) => p.status !== 'مكتمل ومرحل للتوزيع').length;
        const completed = prodOrders.filter((p: any) => p.status === 'مكتمل ومرحل للتوزيع').length;
        setMetrics((prev) => ({ ...prev, activeWorkOrders: active, completedBatches: completed }));
      }

      if (emgTasks.length > 0) {
        const critical = emgTasks.filter((t: any) => t.priority.includes('حرجة') && t.status !== 'مغلق ومعتمد').length;
        setMetrics((prev) => ({ ...prev, criticalAlerts: critical, emergencyCount: emgTasks.length }));
      }
    } catch {}
  }, []);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen space-y-6" dir="rtl">
      {/* ترويسة غرفة القيادة */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">لوحة الرقابة والقيادة المركزية (Executive Cockpit)</h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-200">
              مباشر (Live)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            الرؤية التنفيذية الشاملة لسياق التشغيل الحالي: <b className="text-indigo-900">{activeBranchName}</b>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-gray-200 text-gray-600">
            <span>تاريخ اليوم المالي: </span>
            <b className="font-mono text-gray-900">2026-10-23</b>
          </div>
          <div className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>جميع الأنظمة متصلة وتعمل بكفاءة</span>
          </div>
        </div>
      </div>

      {/* المؤشرات المالية والتجارية الكبرى */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>إجمالي إيرادات المبيعات</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-gray-900">{metrics.totalSales.toLocaleString()} ج.م</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.5% عن المستهدف الشهري</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>صافي أرباح التشغيل (P&L)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700">{metrics.netProfit.toLocaleString()} ج.م</div>
          <div className="text-[11px] text-gray-400 mt-2">هامش ربح تشغيلي 46.1%</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>السيولة النقدية في الخزائن</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Scale className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-blue-900">{metrics.treasuryBalance.toLocaleString()} ج.م</div>
          <div className="text-[11px] text-gray-400 mt-2">تشمل خزن المصنع والفروع</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>التزامات الموردين (ذمم دائنة)</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><PieChart className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">{metrics.supplierPayables.toLocaleString()} ج.م</div>
          <div className="text-[11px] text-gray-400 mt-2">مستحقات فواتير توريد الخامات</div>
        </div>
      </div>

      {/* نبض صالات الإنتاج وتشغيل المعمل */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* حالة خطوط التشغيل والمعمل */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
            <span className="flex items-center gap-2"><Factory className="w-4 h-4 text-indigo-600" /> نبض خطوط المعمل والتشغيل</span>
            <span className="text-xs font-mono text-indigo-600 font-bold">{metrics.activeWorkOrders} أوامر نشطة</span>
          </div>

          <div className="space-y-3 mt-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 block">بسبوسة مكسرات لوكس (طبخة 100 كجم)</span>
                <span className="text-[11px] text-gray-400">وردية صباحية - الشيف سمير</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                مكتمل ومرحل
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 block">كنافة أساور نوتيلا (45 كجم)</span>
                <span className="text-[11px] text-gray-400">وردية مسائية - الشيف نبيل</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                قيد الخبز
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 block">تورتة شوكولاتة كروكانت (20 قطعة)</span>
                <span className="text-[11px] text-gray-400">صالة الغربي - الشيف شادي</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                مجدول
              </span>
            </div>
          </div>
        </div>

        {/* كفاءة الأفراد والورديات */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
              <span className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600" /> كفاءة الورديات وهادر الخامات</span>
              <span className="text-xs font-mono text-emerald-700 font-bold">{metrics.teamEfficiency}% كفاءة عامة</span>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-semibold text-gray-700">
                  <span>الشيف سمير إبراهيم (حلويات شرقية)</span>
                  <span className="font-mono text-emerald-700">104% (هادر 1.5%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold text-gray-700">
                  <span>الشيف شادي فكري (تورت وحلواني غربي)</span>
                  <span className="font-mono text-indigo-700">96% (هادر 2.1%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold text-gray-700">
                  <span>الشيف نبيل محمود (كنافة وبقلاوة)</span>
                  <span className="font-mono text-amber-700">92% (هادر 3.4%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>متوسط هادر التشغيل بالمعمل:</span>
            <b className="font-mono text-rose-700 font-bold">2.3% (ضمن النطاق المسموح)</b>
          </div>
        </div>

        {/* تذاكر الأعطال الطارئة وجاهزية الأصول */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
              <span className="flex items-center gap-2"><AlertOctagon className="w-4 h-4 text-rose-600" /> تذاكر الطوارئ وجاهزية الأصول</span>
              {metrics.criticalAlerts > 0 ? (
                <span className="bg-rose-100 text-rose-800 text-[11px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {metrics.criticalAlerts} بلاغ حرج نشط
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded-full font-bold">
                  لا توجد أعطال
                </span>
              )}
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                <div className="flex justify-between items-center font-bold text-rose-900">
                  <span>شاحنة تبريد التوزيع 01</span>
                  <span className="font-mono text-[10px]">EMG-2026-011</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">انخفاض مفاجئ في تبريد كابينة حفظ الطلبيات</p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 font-mono">
                  <span>الفني: م. حسام الدين</span>
                  <span className="text-emerald-700 font-bold">تم الإصلاح واختبار التشغيل</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div className="flex justify-between items-center font-bold text-amber-900">
                  <span>ولاعة غاز الفرن الدوار 1</span>
                  <span className="font-mono text-[10px]">EMG-2026-012</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">تذبذب في الشعلات ومعايرة منظم الضغط</p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 font-mono">
                  <span>فني شركة أفران النيل</span>
                  <span className="text-amber-700 font-bold">قيد المعاينة والإصلاح</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>معدات المعمل المسجلة:</span>
            <b className="font-mono text-indigo-900 font-bold">{metrics.assetCount} أصول رأسمالية نشطة</b>
          </div>
        </div>
      </div>
    </div>
  );
};
