import React, { useState } from 'react';
import {
  Factory,
  Boxes,
  Store,
  Receipt,
  Scale,
  Users,
  AlertTriangle,
  ClipboardCheck,
  Search,
  ChevronLeft,
  ShieldCheck,
  Truck,
  HeartPulse,
  Flame,
  FileSpreadsheet,
  Layers,
  Settings
} from 'lucide-react';

interface WorkspacePageProps {
  onNavigate?: (tab: string) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate }) => {
  const [activeSector, setActiveSector] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const sectors = [
    { id: 'ALL', name: 'كافة القطاعات' },
    { id: 'MES', name: 'الإنتاج والتصنيع' },
    { id: 'LOGISTICS', name: 'المخازن واللوجستيات' },
    { id: 'SALES', name: 'المبيعات والفروع' },
    { id: 'FINANCE', name: 'الإدارة المالية' },
    { id: 'PROCUREMENT', name: 'المشتريات والموردين' },
    { id: 'QA', name: 'الجودة والـ HACCP' },
    { id: 'HR', name: 'الموارد البشرية' },
    { id: 'SOS', name: 'الطوارئ والـ SOS' },
  ];

  const handleNav = (tabKey: string) => {
    if (onNavigate) {
      onNavigate(tabKey);
    }
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-50 dark:bg-[#08090b] text-slate-800 dark:text-zinc-100 transition-colors" dir="rtl">
      
      {/* الترويسة الرئيسية للمنصة */}
      <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg p-5 rounded-2xl border mb-6 flex flex-wrap justify-between items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-600 dark:text-amber-400 flex items-center gap-2">
              <span>منصة كيان المركزية لإدارة العمليات (Enterprise Workspace)</span>
            </h1>
            <span className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 border px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              أبو عادل - بيئة التشغيل الصناعي
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            الوصول المباشر لكافة وحدات التصنيع، المخازن، سلاسل الإمداد، الجودة، والمحاسبة المالية.
          </p>
        </div>
      </div>

      {/* شريط البحث السريع */}
      <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-md p-3.5 rounded-2xl border mb-6 flex items-center gap-3 transition-colors">
        <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث فوراً عن أي شاشة أو وظيفة (فواتير، كارت صنف، خامات، أوامر تصنيع، قيود، رواتب...)"
          className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 font-bold"
        />
      </div>

      {/* شريط تبويبات القطاعات التسعة كاملة */}
      <div className="flex overflow-x-auto pb-2 gap-2 mb-6 text-xs no-scrollbar">
        {sectors.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSector(sec.id)}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSector === sec.id
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:text-zinc-200 border'
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* شبكة القطاعات الثمانية كاملة 8 Modules متوافقة مع الليل والنهار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. العمليات الصناعية والتشغيل (MES) */}
        {(activeSector === 'ALL' || activeSector === 'MES') && (
          <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 rounded-2xl border p-5 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100">العمليات الصناعية والتشغيل (MES)</h2>
              </div>
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNav('production')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• غرفة عمليات الإنتاج والتكاليف (MES)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('finished-goods')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• حوكمة تحويل المنتج التام والكنترول (المراحل الخمس)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">هام</span>
              </button>
              <button onClick={() => handleNav('recipes')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• وصفات التصنيع المعيارية (BOM)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('materials')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• طلب وصرف خامات صالة التشغيل</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('finished-goods-catalog')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• كتالوج المنتجات التامة والمواصفات والنكهات</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>
        )}

        {/* 2. المخازن وسلاسل الإمداد اللوجستية */}
        {(activeSector === 'ALL' || activeSector === 'LOGISTICS') && (
          <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 rounded-2xl border p-5 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100">المخازن وسلاسل الإمداد اللوجستية</h2>
              </div>
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNav('inventory')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• أرصدة المخازن اللحظية والرقابة (Live Inventory)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('stock-card')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• كارت الصنف والمسار المخزني التراكمي</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('transfers')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• إمداد الفروع واستلام المنافذ ولجنة النزاع</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('receiving')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• فحص واستلام الخامات الموردة (GMP)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('warehouses')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• إدارة وتعريف المستودعات والصالات</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('crates')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• تتبع دوران وحركة الصناديق والأسبات</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>
        )}

        {/* 3. المبيعات والتوزيع وشبكة الفروع */}
        {(activeSector === 'ALL' || activeSector === 'SALES') && (
          <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 rounded-2xl border p-5 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100">المبيعات والتوزيع وشبكة الفروع</h2>
              </div>
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNav('branches-portal')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• بوابة الفروع والعمليات (سياق التشغيل المعزول)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('sales')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• إدارة فواتير المبيعات والترحيل المالي المباشر</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('customers')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• سجل العملاء والتجار ومديونيات المنافذ</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('branches')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• إدارة بيانات الفروع ومنافذ المعارض</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>
        )}

        {/* 4. الإدارة المالية والمحاسبة العامة */}
        {(activeSector === 'ALL' || activeSector === 'FINANCE') && (
          <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 rounded-2xl border p-5 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100">الإدارة المالية والمحاسبة العامة</h2>
              </div>
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNav('accounts')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• شجرة الحسابات ودليل المركز المالي</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('finance')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• القوائم المالية الختامية وميزان المراجعة (P&L)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">جديد</span>
              </button>
              <button onClick={() => handleNav('treasury')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• سندات القبض والصرف وخزائن الفروع</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('journal')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• دفتر قيود اليومية العامة والاستاد</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('expenses')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• مصروفات التشغيل، الغاز، ومستحقات الموردين (AP)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>
        )}

        {/* 5. إدارة المشتريات والموردين */}
        {(activeSector === 'ALL' || activeSector === 'PROCUREMENT') && (
          <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 rounded-2xl border p-5 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100">إدارة المشتريات والموردين</h2>
              </div>
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNav('suppliers')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• سجل الموردين المعتمدين وبياناتهم</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('procurement')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• طلبات واحتياجات الشراء (Procurement)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('supplier-prices')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• قوائم أسعار التوريد وعروض الأسعار</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('vendor-qc')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• تقييم جودة خامات الموردين (Vendor QC)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>
        )}

        {/* 6. الجودة والتفتيش الميداني الرقمي */}
        {(activeSector === 'ALL' || activeSector === 'QA') && (
          <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 rounded-2xl border p-5 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-rose-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100">الجودة والتفتيش الميداني الرقمي</h2>
              </div>
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNav('dynamic-forms')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• تعبئة نماذج التفتيش والعمليات الميدانية</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-bold">حي</span>
              </button>
              <button onClick={() => handleNav('reports-archive')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• أرشيف سجلات الفحص المعتمدة والتقارير</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('form-viewer')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• مصمم قوالب النماذج الرقمية (Form Studio)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>
        )}

        {/* 7. الموارد البشرية وشؤون العاملين */}
        {(activeSector === 'ALL' || activeSector === 'HR') && (
          <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 rounded-2xl border p-5 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100">الموارد البشرية وشؤون العاملين</h2>
              </div>
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNav('employees')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• سجلات العاملين، الأقسام، وتقييم مؤشرات الأداء</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('department-kpis')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• مؤشرات أداء الورديات وصالات الإنتاج</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('security')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• صلاحيات المستخدمين والمصادقة الأمنية</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>
        )}

        {/* 8. الطوارئ والـ SOS والمهام العاجلة */}
        {(activeSector === 'ALL' || activeSector === 'SOS') && (
          <div className="bg-white dark:bg-[#0f1117] border-slate-200 dark:border-zinc-800 rounded-2xl border p-5 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100">الطوارئ والـ SOS والمهام العاجلة</h2>
              </div>
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNav('emergency')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• بلاغات الأعطال الحرجة، الصيانة، ومهام الطوارئ</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
              <button onClick={() => handleNav('emergency-reports')} className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 transition-colors">
                <span>• غرفة إغلاق البلاغات والأعطال النشطة (SOS)</span>
                <ChevronLeft className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkspacePage;
