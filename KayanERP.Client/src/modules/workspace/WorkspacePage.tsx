import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Boxes,
  Store,
  Landmark,
  Package,
  Truck,
  ShieldCheck,
  AlertOctagon,
  Users,
  Lock,
  Search,
  X,
  LogOut,
  Gauge,
  Layers,
  ChefHat,
  ShoppingBag,
  Cake,
  TrendingUp,
  Receipt,
  Building2,
  FileSpreadsheet,
  FileText,
  Sliders,
  BarChart3,
  CalendarCheck,
  Award,
  Archive,
  RefreshCw,
  Warehouse,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';

interface WorkspaceProps {
  onNavigate: (tabKey: string) => void;
}

interface ModuleItem {
  id: string;
  title: string;
  targetTab: string;
  icon: React.ReactNode;
  highlightClass?: string;
  keywords: string;
}

interface DomainSection {
  code: 'MES' | 'SCM' | 'SALES' | 'FINANCE' | 'PROCUREMENT' | 'QUALITY' | 'EMERGENCY' | 'HR' | 'ALL';
  title: string;
  subtitle: string;
  borderColor: string;
  iconColor: string;
  icon: React.ReactNode;
  keywords: string;
  modules: ModuleItem[];
}

export const WorkspacePage: React.FC<WorkspaceProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const domainSections = useMemo<DomainSection[]>(() => [
    {
      code: 'MES',
      title: 'العمليات الصناعية والتشغيل (MES)',
      subtitle: 'إدارة أوامر التصنيع، وصفات الخلط، والتحويل',
      borderColor: 'border-r-amber-500',
      iconColor: 'text-amber-400',
      icon: <Cpu className="w-5 h-5" />,
      keywords: 'الإنتاج التصنيع تشغيل غرف عمليات وصفات BOM خامات كتالوج تحويل',
      modules: [
        { id: 'mes-1', title: 'غرفة عمليات الإنتاج والتكاليف', targetTab: 'production', icon: <Gauge className="w-4 h-4" />, highlightClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600 hover:text-white', keywords: 'إنتاج تكاليف مصنع صالة' },
        { id: 'mes-2', title: 'تحويل وتسليم المنتج التام (المراحل الخمس)', targetTab: 'finished-goods', icon: <Truck className="w-4 h-4" />, highlightClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-600 hover:text-white', keywords: 'تسليم تام شحن حلويات' },
        { id: 'mes-3', title: 'وصفات التصنيع المعيارية (BOM)', targetTab: 'recipes', icon: <ChefHat className="w-4 h-4" />, keywords: 'وصفات بوم مقادير عجن خبيز' },
        { id: 'mes-4', title: 'طلب وصرف خامات صالة التشغيل', targetTab: 'materials', icon: <ShoppingBag className="w-4 h-4" />, keywords: 'صرف خامات شيكارة سكر دقيق' },
        { id: 'mes-5', title: 'كتالوج المنتجات التامة والمواصفات', targetTab: 'finished-goods', icon: <Cake className="w-4 h-4" />, keywords: 'كتالوج حلويات شرقية غربية تورت' },
      ]
    },
    {
      code: 'SCM',
      title: 'المخازن وسلاسل الإمداد اللوجستية',
      subtitle: 'الأرصدة اللحظية، تتبع اللوطات، وتحويلات الفروع',
      borderColor: 'border-r-cyan-500',
      iconColor: 'text-cyan-400',
      icon: <Boxes className="w-5 h-5" />,
      keywords: 'المخازن المستودعات أرصدة كارت الصنف إمداد الفروع شحنات خامات أصول حاويات أسبات',
      modules: [
        { id: 'scm-1', title: 'أرصدة المخازن اللحظية والرقابة', targetTab: 'inventory', icon: <TrendingUp className="w-4 h-4" />, highlightClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600 hover:text-white', keywords: 'أرصدة مخزون بضاعة كميات' },
        { id: 'scm-2', title: 'كارت الصنف والمسار المخزني التراكمي', targetTab: 'inventory', icon: <FileSpreadsheet className="w-4 h-4" />, keywords: 'كارت صنف حركة وارد منصرف' },
        { id: 'scm-3', title: 'إمداد الفروع واستلام المنافذ ولجنة النزاع', targetTab: 'transfers', icon: <Truck className="w-4 h-4" />, highlightClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-600 hover:text-white', keywords: 'تحويل فروع استلام نزاع شحنات' },
        { id: 'scm-4', title: 'فحص واستلام الخامات الموردة (GMP)', targetTab: 'receiving', icon: <ShieldCheck className="w-4 h-4" />, keywords: 'فحص استلام رطوبة نقاء سلامة' },
        { id: 'scm-5', title: 'إدارة وتعريف المستودعات والصالات', targetTab: 'warehouses', icon: <Warehouse className="w-4 h-4" />, keywords: 'مستودعات ثلاجات صالات تخزين' },
        { id: 'scm-6', title: 'حوكمة الأصول الثابتة والماكينات', targetTab: 'assets', icon: <Layers className="w-4 h-4" />, keywords: 'أصول أفران خلاطات صيانة دورية' },
        { id: 'scm-7', title: 'تتبع دوران وحركة الصناديق والأسبات', targetTab: 'crates', icon: <RefreshCw className="w-4 h-4" />, keywords: 'أسبات صواني فوارغ حركة تتبع' },
      ]
    },
    {
      code: 'SALES',
      title: 'المبيعات والتوزيع وشبكة الفروع',
      subtitle: 'الفواتير اللحظية، حسابات العملاء، ونقاط البيع',
      borderColor: 'border-r-emerald-500',
      iconColor: 'text-emerald-400',
      icon: <Store className="w-5 h-5" />,
      keywords: 'المبيعات الفروع فواتير العملاء التجار منافذ الكاشير توزيع مديونيات',
      modules: [
        { id: 'sal-1', title: 'بوابة الفروع والعمليات (سياق التشغيل المعزول)', targetTab: 'branches', icon: <Building2 className="w-4 h-4" />, highlightClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600 hover:text-white', keywords: 'فروع دكرنس شربين المنصورة معارض' },
        { id: 'sal-2', title: 'إدارة فواتير المبيعات والترحيل المالي المباشر', targetTab: 'sales', icon: <Receipt className="w-4 h-4" />, keywords: 'فواتير بيع كاشير عملاء جملة تجزئة' },
        { id: 'sal-3', title: 'سجل العملاء والتجار ومديونيات المنافذ', targetTab: 'customers', icon: <Users className="w-4 h-4" />, keywords: 'عملاء تجار مديونية سقف ائتماني' },
        { id: 'sal-4', title: 'إدارة بيانات الفروع ومنافذ المعارض', targetTab: 'branches', icon: <Store className="w-4 h-4" />, keywords: 'منافذ بيع كاشيرات معارض' },
      ]
    },
    {
      code: 'FINANCE',
      title: 'الإدارة المالية والمحاسبة العامة',
      subtitle: 'دليل الحسابات، الخزائن، والقيود الآلية المزدوجة',
      borderColor: 'border-r-purple-500',
      iconColor: 'text-purple-400',
      icon: <Landmark className="w-5 h-5" />,
      keywords: 'المالية الحسابات شجرة الخزينة سندات قيود يومية مصروفات قوائم أرباح',
      modules: [
        { id: 'fin-1', title: 'شجرة الحسابات ودليل المركز المالي', targetTab: 'accounts', icon: <Layers className="w-4 h-4" />, keywords: 'شجرة حسابات أصول خصوم حقوق ملكية' },
        { id: 'fin-2', title: 'سندات القبض والصرف وخزائن الفروع', targetTab: 'treasury', icon: <Receipt className="w-4 h-4" />, keywords: 'سند قبض صرف خزينة نقدية بنك' },
        { id: 'fin-3', title: 'دفتر قيود اليومية العامة والأستاذ', targetTab: 'journal', icon: <FileText className="w-4 h-4" />, keywords: 'قيود محاسبية دفتر أستاذ ميزان' },
        { id: 'fin-4', title: 'مصروفات التشغيل، الغاز، ومستحقات الموردين', targetTab: 'expenses', icon: <FileSpreadsheet className="w-4 h-4" />, keywords: 'غاز كهرباء إيجار مصروفات عمومية' },
        { id: 'fin-5', title: 'القوائم المالية وميزان المراجعة والأرباح', targetTab: 'finance', icon: <TrendingUp className="w-4 h-4" />, keywords: 'قائمة دخل أرباح وخسائر تدفقات' },
      ]
    },
    {
      code: 'SCM',
      title: 'دليل الأصناف والخامات المعيارية',
      subtitle: 'بطاقات الأصناف، التسعير، والهيكل الشجري',
      borderColor: 'border-r-blue-500',
      iconColor: 'text-blue-400',
      icon: <Package className="w-5 h-5" />,
      keywords: 'الأصناف المواد خامات هيكل تصنيفات كود باركود',
      modules: [
        { id: 'itm-1', title: 'مركز إدارة الأصناف والأسعار الشامل', targetTab: 'products', icon: <Boxes className="w-4 h-4" />, highlightClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600 hover:text-white', keywords: 'أصناف خامات تسعير منتج تام' },
        { id: 'itm-2', title: 'الهيكل الشجري للأصناف والخامات (UOM)', targetTab: 'hierarchy', icon: <Layers className="w-4 h-4" />, keywords: 'شجرة أصناف وحدات قياس كيلو جرام دستة' },
        { id: 'itm-3', title: 'تصنيفات وبنود المجموعات السلعية', targetTab: 'products', icon: <Package className="w-4 h-4" />, keywords: 'مجموعات تصنيفات شرقي غربي مخبوزات' },
      ]
    },
    {
      code: 'PROCUREMENT',
      title: 'إدارة المشتريات والموردين',
      subtitle: 'أوامر التوريد، التسعير، وتقييم جودة الموردين',
      borderColor: 'border-r-indigo-500',
      iconColor: 'text-indigo-400',
      icon: <Truck className="w-5 h-5" />,
      keywords: 'المشتريات الموردين أوامر الشراء PO فواتير الشراء أسعار التوريد تقييم COA',
      modules: [
        { id: 'prc-1', title: 'سجل الموردين المعتمدين وبياناتهم', targetTab: 'vendor-qc', icon: <Users className="w-4 h-4" />, keywords: 'موردين تجار خامات عناوين هواتف' },
        { id: 'prc-2', title: 'أوامر الشراء والتوريد (Purchase Orders)', targetTab: 'procurement', icon: <FileText className="w-4 h-4" />, keywords: 'أمر شراء توريد خامات PO' },
        { id: 'prc-3', title: 'فواتير الشراء والتكاليف المباشرة', targetTab: 'purchasing', icon: <Receipt className="w-4 h-4" />, keywords: 'فاتورة شراء خامات فحص استلام' },
        { id: 'prc-4', title: 'قوائم أسعار التوريد وعروض الأسعار', targetTab: 'purchasing', icon: <FileSpreadsheet className="w-4 h-4" />, keywords: 'أسعار توريد عروض دقيق سمن سكر' },
        { id: 'prc-5', title: 'تقييم جودة الموردين والشهادات (QC Rating)', targetTab: 'vendor-qc', icon: <Award className="w-4 h-4 text-amber-400" />, highlightClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-600 hover:text-white', keywords: 'جودة موردين قبول رفض COA تحليل' },
      ]
    },
    {
      code: 'QUALITY',
      title: 'منظومة الجودة ونماذج التفتيش (HACCP)',
      subtitle: 'تصميم الاستمارات، الفحص الميداني، ومحاضر الجودة',
      borderColor: 'border-r-teal-500',
      iconColor: 'text-teal-400',
      icon: <ShieldCheck className="w-5 h-5" />,
      keywords: 'الجودة النماذج محاضر الفحص HACCP استمارات تفتيش معمل نظافة تعقيم تبريد',
      modules: [
        { id: 'qlt-1', title: 'مصمم وإدارة النماذج التفاعلية', targetTab: 'forms', icon: <Sliders className="w-4 h-4" />, keywords: 'نماذج فحص قوائم تحقق استمارات' },
        { id: 'qlt-2', title: 'تعبئة نماذج الفحص الميداني والمعملي', targetTab: 'forms', icon: <FileText className="w-4 h-4" />, keywords: 'فحص نظافة تعقيم درجات حرارة ثلاجة' },
        { id: 'qlt-3', title: 'تقارير واستجابات نماذج الجودة', targetTab: 'forms', icon: <FileSpreadsheet className="w-4 h-4" />, keywords: 'سجلات تفتيش تدقيق ISO HACCP' },
      ]
    },
    {
      code: 'EMERGENCY',
      title: 'منظومة الطوارئ والأعطال (SOS Hub)',
      subtitle: 'البلاغات الفورية، استجابة الصيانة، ومؤشرات SLA',
      borderColor: 'border-r-rose-500',
      iconColor: 'text-rose-400',
      icon: <AlertOctagon className="w-5 h-5" />,
      keywords: 'الطوارئ الأعطال SOS التدخل السريع بلاغات SLA صيانة أفران كهرباء غاز',
      modules: [
        { id: 'emg-1', title: 'غرفة المهام الطارئة والأعطال (SOS)', targetTab: 'emergency', icon: <AlertOctagon className="w-4 h-4" />, highlightClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-600 hover:text-white', keywords: 'بلاغ عطل طارئ توقف خط إنتاج' },
        { id: 'emg-2', title: 'تقارير مؤشرات سرعة الاستجابة (SLA)', targetTab: 'emergency', icon: <BarChart3 className="w-4 h-4" />, keywords: 'سرعة استجابة صيانة فنيين إغلاق بلاغ' },
      ]
    },
    {
      code: 'HR',
      title: 'الموارد البشرية والهيكل الإداري',
      subtitle: 'بيانات الكيانات، الصالات، والورديات وجدولة العمال',
      borderColor: 'border-r-slate-500',
      iconColor: 'text-slate-400',
      icon: <Users className="w-5 h-5" />,
      keywords: 'الموارد البشرية العاملين الموظفين الورديات الشركات الأقسام الهيكل شيفات فنيين',
      modules: [
        { id: 'hr-1', title: 'إدارة الشركات والكيانات القانونية', targetTab: 'hr', icon: <Building2 className="w-4 h-4" />, keywords: 'شركات سجل تجاري بطاقة ضريبية كيانات' },
        { id: 'hr-2', title: 'إدارة الأقسام وصالات التشغيل', targetTab: 'departments', icon: <Layers className="w-4 h-4" />, keywords: 'أقسام صالة شرقي غربي أفران تعبئة' },
        { id: 'hr-3', title: 'سجل العاملين وملفات الموظفين', targetTab: 'hr', icon: <Users className="w-4 h-4" />, keywords: 'عاملين شيفات رواتب ملفات موظفين' },
        { id: 'hr-4', title: 'جدولة وتوزيع الورديات اليومية', targetTab: 'hr', icon: <CalendarCheck className="w-4 h-4" />, keywords: 'ورديات شفت صباحي مسائي مناوبات' },
      ]
    },
    {
      code: 'ALL',
      title: 'التحليلات الذكية وأمن المنظومة (RBAC)',
      subtitle: 'مؤشرات الأداء، الأرشيف، وصلاحيات المستخدمين',
      borderColor: 'border-r-slate-200',
      iconColor: 'text-slate-100',
      icon: <Lock className="w-5 h-5" />,
      keywords: 'التقارير المؤشرات KPIs المستخدمين الصلاحيات الأمان الإعدادات RBAC مطبوعات',
      modules: [
        { id: 'adm-1', title: 'مركز المطبوعات والفواتير الرسمية', targetTab: 'print-center', icon: <FileText className="w-4 h-4" />, highlightClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-600 hover:text-white', keywords: 'طباعة فواتير سندات باركود QR' },
        { id: 'adm-2', title: 'لوحات مؤشرات أداء الأقسام (KPIs)', targetTab: 'departments', icon: <BarChart3 className="w-4 h-4" />, keywords: 'مؤشرات أداء أهداف إنتاجية جودة' },
        { id: 'adm-3', title: 'أرشيف التقارير والسجلات الرسمية', targetTab: 'forms', icon: <Archive className="w-4 h-4" />, keywords: 'أرشيف مستندات تقارير تاريخية' },
        { id: 'adm-4', title: 'إدارة المستخدمين، الأدوار، والصلاحيات (RBAC)', targetTab: 'security', icon: <KeyRound className="w-4 h-4 text-amber-400" />, highlightClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600 hover:text-white', keywords: 'مستخدمين كلمات سر أدوار مصفوفة صلاحيات' },
      ]
    }
  ], []);

  // فلترة الأقسام والموديولات حسب التبويب والبحث
  const filteredSections = useMemo(() => {
    return domainSections
      .filter((sec) => {
        // فحص التبويب
        if (selectedCategory !== 'ALL' && sec.code !== selectedCategory) {
          return false;
        }

        // فحص نص البحث
        if (!searchTerm.trim()) return true;
        const term = searchTerm.trim().toLowerCase();

        const matchSec = sec.title.toLowerCase().includes(term) || sec.keywords.toLowerCase().includes(term);
        const matchAnyModule = sec.modules.some(
          (m) => m.title.toLowerCase().includes(term) || m.keywords.toLowerCase().includes(term)
        );

        return matchSec || matchAnyModule;
      })
      .map((sec) => {
        if (!searchTerm.trim()) return sec;
        const term = searchTerm.trim().toLowerCase();
        // إبقاء الموديولات المطابقة فقط في حال البحث
        const matchedMods = sec.modules.filter(
          (m) =>
            m.title.toLowerCase().includes(term) ||
            m.keywords.toLowerCase().includes(term) ||
            sec.title.toLowerCase().includes(term)
        );
        return {
          ...sec,
          modules: matchedMods.length > 0 ? matchedMods : sec.modules
        };
      });
  }, [domainSections, selectedCategory, searchTerm]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden" dir="rtl">
      {/* خلفية الشبكة الهندسية المضيئة */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px]"
      />

      {/* 1. الشريط التنفيذي العلوي */}
      <header className="relative z-10 flex flex-wrap items-center justify-between px-6 py-3.5 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl shadow-xs">
            <span className="bg-indigo-600 text-white font-black text-xs px-2 py-0.5 rounded">KAYAN</span>
            <span className="font-bold text-xs text-slate-200">ENTERPRISE</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>مجموعة كيان ERP • بيئة التشغيل الصناعي الموحدة</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/60 border border-slate-700/80 px-3 py-1 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400">إجمالي القطاعات:</span>
            <span className="text-amber-400 font-bold font-mono">10 قطاعات</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold font-mono">35 موديول نشط</span>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج للوحة التحكم</span>
          </button>
        </div>
      </header>

      {/* 2. منطقة البحث والفلترة السريعة */}
      <div className="relative z-10 px-6 pt-6 max-w-5xl mx-auto w-full">
        {/* شريط البحث المضيء */}
        <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border border-indigo-500/40 rounded-2xl px-4 py-2.5 shadow-2xl transition-all focus-within:border-indigo-400 focus-within:shadow-[0_0_25px_rgba(99,102,241,0.3)]">
          <Search className="w-5 h-5 text-indigo-400 ml-3 shrink-0" />
          <input
            type="text"
            placeholder="ابحث فوراً بالاسم عن أي شاشة أو وظيفة (مثال: فواتير، كارت الصنف، مستودعات، خزينة، نزاع، خامات، وصفات)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-white text-sm outline-none placeholder-slate-500 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* أزرار الفلترة السريعة للقطاعات */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold">
          {[
            { code: 'ALL', label: '🌐 كافة القطاعات' },
            { code: 'MES', label: '🏭 الإنتاج والتصنيع' },
            { code: 'SCM', label: '🚚 المخازن واللوجستيات' },
            { code: 'SALES', label: '🧾 المبيعات والفروع' },
            { code: 'FINANCE', label: '💵 الإدارة المالية' },
            { code: 'PROCUREMENT', label: '📦 المشتريات والموردين' },
            { code: 'HR', label: '👥 الموارد البشرية' },
            { code: 'QUALITY', label: '🔬 الجودة وHACCP' },
            { code: 'EMERGENCY', label: '🚨 الطوارئ والـ SOS' },
          ].map((pill) => (
            <button
              key={pill.code}
              onClick={() => setSelectedCategory(pill.code)}
              className={`px-3.5 py-1.5 rounded-full border transition-all ${
                selectedCategory === pill.code
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. شبكة قطاعات وموديولات المنظومة */}
      <main className="relative z-10 flex-1 px-6 py-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {filteredSections.map((domain) => (
            <div
              key={domain.title}
              className={`bg-slate-900/75 backdrop-blur-md rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl hover:-translate-y-1 transition-transform border-r-4 ${domain.borderColor}`}
            >
              <div>
                {/* رأس القطاع */}
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-800/80">
                  <div className={`p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 ${domain.iconColor}`}>
                    {domain.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{domain.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{domain.subtitle}</p>
                  </div>
                </div>

                {/* قائمة الموديولات والشاشات الفرعية */}
                <div className="space-y-1.5">
                  {domain.modules.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => onNavigate(mod.targetTab)}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        mod.highlightClass || 'bg-slate-800/30 border-slate-800/60 text-slate-300 hover:bg-slate-800/90 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="shrink-0">{mod.icon}</span>
                      <span className="flex-1 truncate">{mod.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
