import React, { useState } from 'react';
import {
  Search,
  Factory,
  Warehouse,
  ShoppingBag,
  Coins,
  Boxes,
  Users,
  ShieldAlert,
  ClipboardCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface WorkspacePageProps {
  onNavigate: (tab: string) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');

  const sectors = [
    { id: 'ALL', name: 'كافة القطاعات' },
    { id: 'PROD', name: 'الإنتاج والتصنيع' },
    { id: 'SCM', name: 'المخازن واللوجستيات' },
    { id: 'SALES', name: 'المبيعات والفروع' },
    { id: 'FIN', name: 'الإدارة المالية' },
    { id: 'PURCH', name: 'المشتريات والموردين' },
    { id: 'HR', name: 'الموارد البشرية' },
    { id: 'QC', name: 'الجودة والـ HACCP' },
    { id: 'SOS', name: 'الطوارئ والـ SOS' }
  ];

  const modules = [
    // 1. الإنتاج والتصنيع
    {
      sector: 'PROD',
      title: 'العمليات الصناعية والتشغيل (MES)',
      desc: 'إدارة أوامر التصنيع، ومحطات الحوكمة وتكاليف الصالات',
      icon: Factory,
      items: [
        { label: 'غرفة عمليات الإنتاج والتكاليف (MES)', tab: 'production' },
        { label: 'حوكمة تحويل المنتج التام والكنترول (المراحل الخمس)', tab: 'fg-transfers', badge: 'هام' },
        { label: 'وصفات التصنيع المعيارية (BOM)', tab: 'recipes' },
        { label: 'طلب وصرف خامات صالة التشغيل', tab: 'materials' },
        { label: 'كتالوج المنتجات التامة والمواصفات والنكهات', tab: 'finished-goods-catalog' }
      ]
    },

    // 2. المخازن واللوجستيات
    {
      sector: 'SCM',
      title: 'المخازن وسلاسل الإمداد اللوجستية',
      desc: 'الأرصدة اللحظية، تتبع اللوطات، وتحويلات الفروع',
      icon: Warehouse,
      items: [
        { label: 'أرصدة المخازن اللحظية والرقابة (Live Inventory)', tab: 'inventory' },
        { label: 'كارت الصنف والمسار المخزني التراكمي', tab: 'stock-card' },
        { label: 'إمداد الفروع واستلام المنافذ ولجنة النزاع', tab: 'transfers' },
        { label: 'فحص واستلام الخامات الموردة (GMP)', tab: 'receiving' },
        { label: 'إدارة وتعريف المستودعات والصالات', tab: 'warehouses' },
        { label: 'تتبع دوران وحركة الصناديق والأسبات', tab: 'crates' }
      ]
    },

    // 3. المبيعات والتوزيع
    {
      sector: 'SALES',
      title: 'المبيعات والتوزيع وشبكة الفروع',
      desc: 'الفواتير اللحظية، حسابات العملاء، ونقاط البيع',
      icon: ShoppingBag,
      items: [
        { label: 'بوابة الفروع والعمليات (سياق التشغيل المعزول)', tab: 'branches-portal' },
        { label: 'إدارة فواتير المبيعات والترحيل المالي المباشر', tab: 'sales' },
        { label: 'سجل العملاء والتجار ومديونيات المنافذ', tab: 'customers' },
        { label: 'إدارة بيانات الفروع ومنافذ المعارض', tab: 'branches' }
      ]
    },

    // 4. الإدارة المالية
    {
      sector: 'FIN',
      title: 'الإدارة المالية والمحاسبة العامة',
      desc: 'دليل الحسابات، الميزان، والقيود الآلية المزدوجة',
      icon: Coins,
      items: [
        { label: 'شجرة الحسابات ودليل المركز المالي', tab: 'accounts' },
        { label: 'القوائم المالية الختامية وميزان المراجعة (P&L)', tab: 'finance', badge: 'جديد' },
        { label: 'سندات القبض والصرف وخزائن الفروع', tab: 'treasury' },
        { label: 'دفتر قيود اليومية العامة والاستاذ', tab: 'journal' },
        { label: 'مصروفات التشغيل، الغاز، ومستحقات الموردين (AP)', tab: 'expenses' }
      ]
    },

    // 5. المشتريات والموردين
    {
      sector: 'PURCH',
      title: 'إدارة المشتريات والموردين',
      desc: 'أوامر التوريد، التسعير، وتقييم جودة الموردين',
      icon: Boxes,
      items: [
        { label: 'سجل الموردين المعتمدين وبياناتهم', tab: 'suppliers' },
        { label: 'أوامر الشراء والتوريد (Purchase Orders)', tab: 'purchasing' },
        { label: 'فواتير الشراء والتكاليف المباشرة', tab: 'procurement' },
        { label: 'قوائم أسعار التوريد وعروض الأسعار', tab: 'supplier-prices' },
        { label: 'تقييم جودة خامات الموردين (Vendor QC)', tab: 'vendor-qc' }
      ]
    },

    // 6. الجودة والـ HACCP
    {
      sector: 'QC',
      title: 'الجودة والتفتيش الميداني الرقمي',
      desc: 'محرك تعبئة الاستمارات، أرشيف الفحوصات، ومصمم النماذج',
      icon: ClipboardCheck,
      items: [
        { label: 'تعبئة نماذج التفتيش والعمليات الميدانية', tab: 'form-viewer', badge: 'حي' },
        { label: 'أرشيف سجلات الفحص المعتمدة والتقارير', tab: 'form-reports' },
        { label: 'مصمم قوالب النماذج الرقمية (Form Studio)', tab: 'dynamic-forms' }
      ]
    },

    // 7. الموارد البشرية
    {
      sector: 'HR',
      title: 'إدارة القوة العاملة وشؤون الموظفين',
      desc: 'حصر العمال، توزيع الصالات، وتقييم الإنتاجية',
      icon: Users,
      items: [
        { label: 'إدارة وتوزيع القوى العاملة بالصالات', tab: 'employees-management' },
        { label: 'سجل الموظفين والمسميات وتكلفة الساعة', tab: 'employees' },
        { label: 'قياس إنتاجية العمال والورديات', tab: 'productivity' }
      ]
    },

    // 8. الطوارئ والـ SOS
    {
      sector: 'SOS',
      title: 'غرفة الطوارئ والمهام الحرجة (SOS)',
      desc: 'البلاغات العاجلة، انقطاع التيار، وأعطال الماكينات',
      icon: ShieldAlert,
      items: [
        { label: 'تسجيل بلاغ عاجل أو استدعاء طارئ', tab: 'emergency' },
        { label: 'أرشيف وتقارير مهام الطوارئ المنجزة', tab: 'emergency-reports' }
      ]
    }
  ];

  const filteredModules = modules.filter(m => {
    if (selectedSector !== 'ALL' && m.sector !== selectedSector) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const inTitle = m.title.toLowerCase().includes(term);
    const inDesc = m.desc.toLowerCase().includes(term);
    const inItems = m.items.some(it => it.label.toLowerCase().includes(term));
    return inTitle || inDesc || inItems;
  });

  return (
    <div className="p-6 min-h-screen font-sans transition-colors duration-200 bg-slate-100/70 dark:bg-black" dir="rtl">
      {/* البانر الترحيبي المنقى (أبيض ناصع نهاراً / أسود صافي ليلاً بدون أزرق) */}
      <div className="bg-white dark:bg-[#0a0a0d] border border-gray-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400">
              منصة كيان المركزية لإدارة العمليات (Enterprise Workspace)
            </h1>
            <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              أبو عادل - بيئة التشغيل الصناعي
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            الوصول المباشر لكافة وحدات التصنيع، المخازن، سلاسل الإمداد، الجودة، والمحاسبة المالية.
          </p>
        </div>

        {/* حقل البحث السريع */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="ابحث فوراً عن أي شاشة أو وظيفة (فواتير، كارت صنف، خامات...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 rounded-2xl pr-10 pl-4 py-2 text-xs font-bold text-gray-800 dark:text-zinc-100 outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* شريط فلترة القطاعات */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 text-xs font-bold scrollbar-none">
        {sectors.map(sec => (
          <button
            key={sec.id}
            onClick={() => setSelectedSector(sec.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedSector === sec.id
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'bg-white dark:bg-[#101115] text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800/80 hover:border-amber-500/50'
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* شبكة كروت الموديولات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#0c0d11] border border-gray-200 dark:border-zinc-800/90 rounded-2xl shadow-sm p-5 flex flex-col justify-between hover:border-amber-500/60 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-3 mb-3 border-b border-gray-100 dark:border-zinc-800/80 pb-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-amber-500 dark:text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-zinc-100">{mod.title}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-1">{mod.desc}</p>
                  </div>
                </div>

                <div className="space-y-1.5 my-3">
                  {mod.items.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      onClick={() => onNavigate(item.tab)}
                      className="w-full text-right p-2 rounded-xl text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 flex items-center justify-between transition-colors group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:bg-amber-500"></span>
                        <span className="group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {item.label}
                        </span>
                      </span>
                      {item.badge && (
                        <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded text-[9px] font-mono">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
