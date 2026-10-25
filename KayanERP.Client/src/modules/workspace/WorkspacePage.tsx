import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Boxes,
  Cpu,
  Store,
  ShieldCheck,
  Calculator,
  Users,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

interface WorkspacePageProps {
  onNavigate?: (tab: string) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = (tabKey: string) => {
    if (onNavigate) {
      onNavigate(tabKey);
    }
  };

  const categories = [
    { id: 'all', label: 'كافة القطاعات' },
    { id: 'mes', label: 'الإنتاج والتصنيع' },
    { id: 'inventory', label: 'المخازن واللوجستيات' },
    { id: 'pos', label: 'المبيعات والفروع' },
    { id: 'finance', label: 'الإدارة المالية' },
    { id: 'procurement', label: 'المشتريات والموردين' },
    { id: 'hr', label: 'الموارد البشرية' },
    { id: 'qc', label: 'الجودة والـ HACCP' },
    { id: 'emergency', label: 'الطوارئ والـ SOS' }
  ];

  return (
    <div className="p-6 pt-4 min-h-screen font-sans bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      {/* ترويسة المنصة المركزية */}
      <div className="bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-zinc-800 mb-5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <span>منصة كيان المركزية لإدارة العمليات (Enterprise Workspace)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              أبو عادل - بيئة التشغيل الصناعي
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            الوصول المباشر لكافة وحدات التصنيع، المخازن، سلاسل الإمداد، الجودة، والمحاسبة المالية.
          </p>
        </div>
      </div>

      {/* شريط البحث المباشر */}
      <div className="mb-4 relative">
        <Search className="w-4 h-4 text-zinc-500 absolute right-4 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث فوراً عن أي شاشة أو وظيفة (فواتير، كارت صنف، خامات، أوامر تصنيع، قيود، رواتب...)"
          className="w-full pr-11 pl-4 py-2.5 bg-[#0f1117] border border-zinc-800 rounded-xl text-xs text-zinc-100 outline-none focus:border-amber-500 shadow-md transition-all"
        />
      </div>

      {/* أزرار فلاتر القطاعات */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 text-xs">
        {categories.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === c.id
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-[#0f1117] text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* شبكة القطاعات الـ 8 كاملة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. العمليات الصناعية والتشغيل (MES) */}
        {(activeCategory === 'all' || activeCategory === 'mes') && (
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">العمليات الصناعية والتشغيل (MES)</h3>
                  <small className="text-[10px] text-zinc-500">إدارة أوامر التصنيع، ومحطات الحوكمة وتكاليف الصالات</small>
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <button type="button" onClick={() => navigateTo('production')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>غرفة عمليات الإنتاج والتكاليف (MES)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('production')} className="w-full text-right hover:text-amber-400 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>حوكمة تحويل المنتج التام والكنترول (المراحل الخمس)</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded text-[9px] font-bold">هام</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('recipes')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>وصفات التصنيع المعيارية (BOM)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('materials')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>طلب وصرف خامات صالة التشغيل</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('finished-goods-catalog')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>كتالوج المنتجات التامة والمواصفات والنكهات</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* 2. المخازن وسلاسل الإمداد اللوجستية */}
        {(activeCategory === 'all' || activeCategory === 'inventory') && (
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">المخازن وسلاسل الإمداد اللوجستية</h3>
                  <small className="text-[10px] text-zinc-500">الأرصدة اللحظية، تتبع اللوطات، وتحويلات الفروع</small>
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <button type="button" onClick={() => navigateTo('inventory')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>أرصدة المخازن اللحظية والرقابة (Live Inventory)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('stock-card')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>كارت الصنف والمسار المخزني التراكمي</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('transfers')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>إمداد الفروع واستلام المنافذ ولجنة النزاع</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('receiving')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>فحص واستلام الخامات الموردة (GMP)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('warehouses')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>إدارة وتعريف المستودعات والصالات</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('crates')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>تتبع دوران وحركة الصناديق والأسبات</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* 3. المبيعات والتوزيع وشبكة الفروع */}
        {(activeCategory === 'all' || activeCategory === 'pos') && (
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">المبيعات والتوزيع وشبكة الفروع</h3>
                  <small className="text-[10px] text-zinc-500">الفواتير اللحظية، حسابات العملاء، ونقاط البيع</small>
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <button type="button" onClick={() => navigateTo('branches-portal')} className="w-full text-right hover:text-emerald-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>بوابة الفروع والعمليات (سياق التشغيل المعزول)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('sales')} className="w-full text-right hover:text-emerald-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>إدارة فواتير المبيعات والترحيل المالي المباشر</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('customers')} className="w-full text-right hover:text-emerald-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>سجل العملاء والتجار ومديونيات المنافذ</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('branches')} className="w-full text-right hover:text-emerald-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>إدارة بيانات الفروع ومنافذ المعارض</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* 4. الإدارة المالية والمحاسبة العامة */}
        {(activeCategory === 'all' || activeCategory === 'finance') && (
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">الإدارة المالية والمحاسبة العامة</h3>
                  <small className="text-[10px] text-zinc-500">دليل الحسابات، الميزان، والقيود الآلية المزدوجة</small>
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <button type="button" onClick={() => navigateTo('accounts')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>شجرة الحسابات ودليل المركز المالي</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('finance')} className="w-full text-right hover:text-indigo-400 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span>القوائم المالية الختامية وميزان المراجعة (P&L)</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded text-[9px] font-bold">جديد</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('treasury')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>سندات القبض والصرف وخزائن الفروع</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('journal')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>دفتر قيود اليومية العامة والاستاذ</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('expenses')} className="w-full text-right hover:text-indigo-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>مصروفات التشغيل، الغاز، ومستحقات الموردين (AP)</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* 5. إدارة المشتريات والموردين */}
        {(activeCategory === 'all' || activeCategory === 'procurement') && (
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">إدارة المشتريات والموردين</h3>
                  <small className="text-[10px] text-zinc-500">أوامر التوريد، التسعير، وتقييم جودة الموردين</small>
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <button type="button" onClick={() => navigateTo('suppliers')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>سجل الموردين المعتمدين وبياناتهم</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('purchasing')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>طلبات واحتياجات الشراء (Procurement)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('procurement')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>أوامر توريد من الموردين (PO & COA)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('supplier-prices')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>قوائم أسعار التوريد وعروض الأسعار</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('vendor-qc')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>تقييم جودة خامات الموردين (Vendor QC)</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* 6. الجودة والتفتيش الميداني الرقمي */}
        {(activeCategory === 'all' || activeCategory === 'qc') && (
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">الجودة والتفتيش الميداني الرقمي</h3>
                  <small className="text-[10px] text-zinc-500">محرك تعبئة الاستمارات، أرشيف الفحوصات، ومصمم النماذج</small>
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <button type="button" onClick={() => navigateTo('dynamic-forms')} className="w-full text-right hover:text-rose-400 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>تعبئة نماذج التفتيش والعمليات الميدانية</span>
                  </div>
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded text-[9px] font-bold">حي</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('forms')} className="w-full text-right hover:text-rose-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>أرشيف سجلات الفحص المعتمدة والتقارير</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('form-viewer')} className="w-full text-right hover:text-rose-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>مصمم قوالب النماذج الرقمية (Form Studio)</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* 7. الموارد البشرية وإدارة المؤسسة */}
        {(activeCategory === 'all' || activeCategory === 'hr') && (
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">الموارد البشرية وشؤون العاملين</h3>
                  <small className="text-[10px] text-zinc-500">سجلات العاملين، الأقسام، وتقييم مؤشرات الأداء</small>
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <button type="button" onClick={() => navigateTo('employees-management')} className="w-full text-right hover:text-cyan-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>إدارة ملفات الموظفين والرواتب</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('departments')} className="w-full text-right hover:text-cyan-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>هيكل الإدارات والوظائف</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('department-kpis')} className="w-full text-right hover:text-cyan-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>مؤشرات أداء الإدارات (KPIs)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('companies')} className="w-full text-right hover:text-cyan-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>بيانات الشركات والفروع القانونية</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* 8. الطوارئ والـ SOS والمهام العاجلة */}
        {(activeCategory === 'all' || activeCategory === 'emergency') && (
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">الطوارئ والـ SOS والمهام العاجلة</h3>
                  <small className="text-[10px] text-zinc-500">بلاغات الأعطال الحرجة، الصيانة، ومهام الطوارئ</small>
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <button type="button" onClick={() => navigateTo('emergency')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>غرفة بلاغات الطوارئ والأعطال (SOS)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('emergency-reports')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>تقارير وسجلات مهام الطوارئ المنجزة</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('assets')} className="w-full text-right hover:text-amber-400 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>سجل أصول وخطوط إنتاج المصنع</span>
                </button>
              </li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkspacePage;
