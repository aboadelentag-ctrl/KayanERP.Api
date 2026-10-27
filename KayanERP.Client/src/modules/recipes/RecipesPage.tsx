import React, { useState, useMemo } from 'react';
import {
  ChefHat,
  PlusCircle,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCw,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  Clock,
  Percent,
  Scale
} from 'lucide-react';

export interface RecipeLineDto {
  componentItemId: number;
  componentItemCode: string;
  componentItemName: string;
  itemType: 'خامات' | 'نصف مصنع';
  quantity: number;
  unit: string;
  wastePercentage: number;
  notes?: string;
  costEstimate?: number;
}

export interface RecipeDto {
  id: number;
  recipeCode: string;
  recipeName: string;
  productItemId: number;
  productItemName: string;
  stage: 'semi_weight' | 'semi_piece' | 'finished';
  batchQuantity: number;
  batchUnit: string;
  yieldQuantity: number;
  piecesPerBatch: number;
  wastePercentage: number;
  preparationTimeMinutes: number;
  totalEstimatedCost: number;
  costPerPiece: number;
  active: boolean;
  notes?: string;
  lines: RecipeLineDto[];
}

export interface ItemLookup {
  id: number;
  itemCode: string;
  itemName: string;
  itemType: 'منتج تام' | 'نصف مصنع' | 'خامات';
  unit: string;
}

export const RecipesPage: React.FC = () => {
  const allItems: ItemLookup[] = [
    { id: 101, itemCode: 'RAW-FLR-04', itemName: 'دقيق فاخر استخراج 72%', itemType: 'خامات', unit: 'كجم' },
    { id: 102, itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي ممتاز', itemType: 'خامات', unit: 'كجم' },
    { id: 103, itemCode: 'RAW-SUG-01', itemName: 'سكر مكرر ناعم فاخر', itemType: 'خامات', unit: 'كجم' },
    { id: 104, itemCode: 'RAW-SMD-03', itemName: 'سميد بسبوسة نمرة 1', itemType: 'خامات', unit: 'كجم' },
    { id: 105, itemCode: 'RAW-PST-05', itemName: 'فستق حلبي محمص نمرة 1', itemType: 'خامات', unit: 'كجم' },
    { id: 106, itemCode: 'RAW-EGG-01', itemName: 'بيض مزارع طازج', itemType: 'خامات', unit: 'قطعة' },

    { id: 201, itemCode: 'SEMI-BSB-10', itemName: 'عجين بسبوسة متبلة ومخمرة', itemType: 'نصف مصنع', unit: 'كجم' },
    { id: 202, itemCode: 'SEMI-SPG-40', itemName: 'بلكة اسبونج فانيليا 40*60', itemType: 'نصف مصنع', unit: 'بلكة' },
    { id: 203, itemCode: 'SEMI-CRM-01', itemName: 'كريمة حشو تورت مخفوقة', itemType: 'نصف مصنع', unit: 'كجم' },

    { id: 301, itemCode: 'FG-BSB-LUX', itemName: 'صينية بسبوسة مكسرات لوكس سمن بلدي', itemType: 'منتج تام', unit: 'صاج' },
    { id: 302, itemCode: 'FG-TRT-ROY', itemName: 'تورتة شوكولاتة ملوكي مقاس 26', itemType: 'منتج تام', unit: 'قطعة' },
    { id: 303, itemCode: 'FG-GTO-MIX', itemName: 'دستة سواريه جاتوه مشكل', itemType: 'منتج تام', unit: 'دستة' }
  ];

  const [recipes, setRecipes] = useState<RecipeDto[]>([
    {
      id: 1,
      recipeCode: 'BOM-SEMI-201',
      recipeName: 'خلطة عجين بسبوسة معيار 10 كجم (تجهيز وردية 1)',
      productItemId: 201,
      productItemName: 'عجين بسبوسة متبلة ومخمرة',
      stage: 'semi_weight',
      batchQuantity: 10,
      batchUnit: 'كجم',
      yieldQuantity: 10,
      piecesPerBatch: 0,
      wastePercentage: 0,
      preparationTimeMinutes: 30,
      totalEstimatedCost: 480.0,
      costPerPiece: 0,
      active: true,
      notes: 'عجن وتتبيل مسبق للوردية الأولى',
      lines: [
        { componentItemId: 104, componentItemCode: 'RAW-SMD-03', componentItemName: 'سميد بسبوسة نمرة 1', itemType: 'خامات', quantity: 5, unit: 'كجم', wastePercentage: 0, notes: 'سميد مرمل' },
        { componentItemId: 102, componentItemCode: 'RAW-BTR-02', componentItemName: 'سمن بلدي بقري طبيعي ممتاز', itemType: 'خامات', quantity: 2, unit: 'كجم', wastePercentage: 0, notes: 'تسييح دافئ' },
        { componentItemId: 103, componentItemCode: 'RAW-SUG-01', componentItemName: 'سكر مكرر ناعم فاخر', itemType: 'خامات', quantity: 3, unit: 'كجم', wastePercentage: 0, notes: 'سكر ناعم' }
      ]
    },
    {
      id: 2,
      recipeCode: 'BOM-SEMI-202',
      recipeName: 'خبز بلكة اسبونج فانيليا 40*60 (تجهيز وسيط قطعي)',
      productItemId: 202,
      productItemName: 'بلكة اسبونج فانيليا 40*60',
      stage: 'semi_piece',
      batchQuantity: 1,
      batchUnit: 'بلكة',
      yieldQuantity: 1,
      piecesPerBatch: 1,
      wastePercentage: 2,
      preparationTimeMinutes: 45,
      totalEstimatedCost: 165.0,
      costPerPiece: 165.0,
      active: true,
      notes: 'خبز بلكات وتبريدها قبل الفينش',
      lines: [
        { componentItemId: 101, componentItemCode: 'RAW-FLR-04', componentItemName: 'دقيق فاخر استخراج 72%', itemType: 'خامات', quantity: 2, unit: 'كجم', wastePercentage: 0, notes: 'منخول جيدا' },
        { componentItemId: 103, componentItemCode: 'RAW-SUG-01', componentItemName: 'سكر مكرر ناعم فاخر', itemType: 'خامات', quantity: 1.5, unit: 'كجم', wastePercentage: 0, notes: 'خالي من الرطوبة' },
        { componentItemId: 106, componentItemCode: 'RAW-EGG-01', componentItemName: 'بيض مزارع طازج', itemType: 'خامات', quantity: 30, unit: 'قطعة', wastePercentage: 0, notes: 'بدرجة حرارة الغرفة' }
      ]
    },
    {
      id: 3,
      recipeCode: 'BOM-FG-301',
      recipeName: 'تفنيش وخبز صاج بسبوسة مكسرات (تفنيش وردية 2)',
      productItemId: 301,
      productItemName: 'صينية بسبوسة مكسرات لوكس سمن بلدي',
      stage: 'finished',
      batchQuantity: 1,
      batchUnit: 'صاج',
      yieldQuantity: 1,
      piecesPerBatch: 0,
      wastePercentage: 3,
      preparationTimeMinutes: 40,
      totalEstimatedCost: 620.0,
      costPerPiece: 0,
      active: true,
      notes: 'سحب العجين وسكب الشربات والمكسرات بالوردية 2',
      lines: [
        { componentItemId: 201, componentItemCode: 'SEMI-BSB-10', componentItemName: 'عجين بسبوسة متبلة ومخمرة', itemType: 'نصف مصنع', quantity: 8, unit: 'كجم', wastePercentage: 0, notes: 'سحب من مخزن النصف مصنع' },
        { componentItemId: 105, componentItemCode: 'RAW-PST-05', componentItemName: 'فستق حلبي محمص نمرة 1', itemType: 'خامات', quantity: 0.5, unit: 'كجم', wastePercentage: 0, notes: 'تزيين الوجه' },
        { componentItemId: 102, componentItemCode: 'RAW-BTR-02', componentItemName: 'سمن بلدي بقري طبيعي ممتاز', itemType: 'خامات', quantity: 0.5, unit: 'كجم', wastePercentage: 0, notes: 'تلميع الصاج' }
      ]
    },
    {
      id: 4,
      recipeCode: 'BOM-FG-302',
      recipeName: 'تفنيش تورتة شوكولاتة ملوكي مقاس 26 (تفنيش أوردرات)',
      productItemId: 302,
      productItemName: 'تورتة شوكولاتة ملوكي مقاس 26',
      stage: 'finished',
      batchQuantity: 1,
      batchUnit: 'قطعة',
      yieldQuantity: 1,
      piecesPerBatch: 1,
      wastePercentage: 1,
      preparationTimeMinutes: 25,
      totalEstimatedCost: 195.0,
      costPerPiece: 195.0,
      active: true,
      notes: 'حشو وتجليس وفينش الشوكولاتة',
      lines: [
        { componentItemId: 202, componentItemCode: 'SEMI-SPG-40', componentItemName: 'بلكة اسبونج فانيليا 40*60', itemType: 'نصف مصنع', quantity: 0.33, unit: 'بلكة', wastePercentage: 0, notes: 'تقطيع ديسكات' },
        { componentItemId: 203, componentItemCode: 'SEMI-CRM-01', componentItemName: 'كريمة حشو تورت مخفوقة', itemType: 'نصف مصنع', quantity: 0.8, unit: 'كجم', wastePercentage: 0, notes: 'حشو وتجليس' }
      ]
    }
  ]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [productFilter, setProductFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<RecipeDto | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Quick Item Modal
  const [showQuickItemModal, setShowQuickItemModal] = useState(false);
  const [quickItemName, setQuickItemName] = useState('');
  const [quickItemCode, setQuickItemCode] = useState('');
  const [quickItemType, setQuickItemType] = useState<'منتج تام' | 'نصف مصنع' | 'خامات'>('نصف مصنع');
  const [quickItemUnit, setQuickItemUnit] = useState('كجم');

  // KPIs
  const countWeightSemi = useMemo(() => recipes.filter(r => r.stage === 'semi_weight').length, [recipes]);
  const countPieceSemi = useMemo(() => recipes.filter(r => r.stage === 'semi_piece').length, [recipes]);
  const countFinished = useMemo(() => recipes.filter(r => r.stage === 'finished').length, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
      if (unitFilter !== 'all' && r.batchUnit !== unitFilter) return false;
      if (productFilter > 0 && r.productItemId !== productFilter) return false;
      if (statusFilter === 'active' && !r.active) return false;
      if (statusFilter === 'inactive' && r.active) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.recipeCode.toLowerCase().includes(term) ||
        r.recipeName.toLowerCase().includes(term) ||
        r.productItemName.toLowerCase().includes(term)
      );
    });
  }, [recipes, stageFilter, unitFilter, productFilter, statusFilter, searchTerm]);

  const handleCreateNew = () => {
    const newBOM: RecipeDto = {
      id: Date.now(),
      recipeCode: `BOM-SEMI-${Math.floor(100 + Math.random() * 900)}`,
      recipeName: '',
      productItemId: 201,
      productItemName: 'عجين بسبوسة متبلة ومخمرة',
      stage: 'semi_weight',
      batchQuantity: 10,
      batchUnit: 'كجم',
      yieldQuantity: 10,
      piecesPerBatch: 0,
      wastePercentage: 0,
      preparationTimeMinutes: 30,
      totalEstimatedCost: 150.0,
      costPerPiece: 0,
      active: true,
      lines: [
        {
          componentItemId: 104,
          componentItemCode: 'RAW-SMD-03',
          componentItemName: 'سميد بسبوسة نمرة 1',
          itemType: 'خامات',
          quantity: 5,
          unit: 'كجم',
          wastePercentage: 0,
          notes: ''
        }
      ]
    };
    setActiveRecipe(newBOM);
    setIsEditing(true);
  };

  const handleEditRecipe = (r: RecipeDto) => {
    setActiveRecipe(JSON.parse(JSON.stringify(r)));
    setIsEditing(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleAddLine = () => {
    if (!activeRecipe) return;
    const defaultRaw = allItems[0];
    setActiveRecipe({
      ...activeRecipe,
      lines: [
        ...activeRecipe.lines,
        {
          componentItemId: defaultRaw.id,
          componentItemCode: defaultRaw.itemCode,
          componentItemName: defaultRaw.itemName,
          itemType: defaultRaw.itemType as any,
          quantity: 1,
          unit: defaultRaw.unit,
          wastePercentage: 0,
          notes: ''
        }
      ]
    });
  };

  const handleRemoveLine = (idx: number) => {
    if (!activeRecipe) return;
    setActiveRecipe({
      ...activeRecipe,
      lines: activeRecipe.lines.filter((_, i) => i !== idx)
    });
  };

  const handleLineItemChange = (idx: number, itemId: number) => {
    if (!activeRecipe) return;
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const copy = [...activeRecipe.lines];
    copy[idx] = {
      ...copy[idx],
      componentItemId: item.id,
      componentItemCode: item.itemCode,
      componentItemName: item.itemName,
      itemType: item.itemType as any,
      unit: item.unit
    };
    setActiveRecipe({ ...activeRecipe, lines: copy });
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecipe || !activeRecipe.recipeName.trim()) return;

    const exists = recipes.find(r => r.id === activeRecipe.id);
    if (exists) {
      setRecipes(recipes.map(r => r.id === activeRecipe.id ? activeRecipe : r));
      setStatusMessage('✅ تم تحديث بطاقة معايير الخلطة بنجاح.');
    } else {
      setRecipes([activeRecipe, ...recipes]);
      setStatusMessage('✅ تم حفظ واعتماد بطاقة المعايير (BOM) بنجاح.');
    }
    setIsEditing(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const exportToExcel = () => {
    let csv = 'كود_الوصفة,اسم_الخلطة_المعيار,المرحلة_الوردية,المنتج_المستهدف,حجم_الوجبة,وحدة_الوجبة,عدد_القطع,التكلفة_التقديرية,تكلفة_القطعة,عدد_المكونات,الحالة\n';
    filteredRecipes.forEach(r => {
      const stageName = r.stage === 'semi_weight' ? 'نصف مصنع وزني' : (r.stage === 'semi_piece' ? 'نصف مصنع قطعي' : 'تفنيش تام');
      csv += `"${r.recipeCode}","${r.recipeName}","${stageName}","${r.productItemName}",${r.batchQuantity},"${r.batchUnit}",${r.piecesPerBatch},${r.totalEstimatedCost},${r.costPerPiece},${r.lines.length},"${r.active ? 'نشطة' : 'معطلة'}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `معايير_خلطات_التصنيع_BOM_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      {/* رأس الصفحة مع مسافة pt-10 وثيم داكن فاحم خالص */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-amber-500" />
              <span>معايير وبطاقات خلطات التصنيع (BOM / Recipes)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              شجرة التصنيع متعددة المراحل (تجهيز الوردية 1 ⟵ تفنيش الوردية 2)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            تحديد مقادير ونسب الخامات وهدر التشغيل للخلطات النصف مصنعة والمنتجات التامة لضبط التكاليف.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={() => {
              setQuickItemName('');
              setQuickItemCode(`ITM-${Date.now().toString().slice(-4)}`);
              setShowQuickItemModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إضافة صنف جديد للدليل</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إنشاء معيار / خلطة جديدة</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات المؤشرات اللحظية (KPIs) بالثيم الليلي الفاحم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border-r-4 border-r-indigo-600 border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي خلطات الـ BOM</span>
          <h4 className="text-2xl font-black text-amber-400 font-mono mt-1">{recipes.length} معيار</h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border-r-4 border-r-cyan-500 border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">نصف مصنع وزني (عجائن / كجم)</span>
          <h4 className="text-2xl font-black text-cyan-400 font-mono mt-1">{countWeightSemi} خلطة وزنية</h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">نصف مصنع قطعي (بلكات / تارت)</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">{countPieceSemi} خلطة قطعية</h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border-r-4 border-r-emerald-500 border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">خلطات تفنيش تام (وردية 2)</span>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">{countFinished} خلطة تفنيش</h4>
        </div>
      </div>

      {/* شريط فلاتر البحث المتقدمة */}
      <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">🔍 البحث بكود أو اسم الخلطة</label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم أو الكود..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">🏭 مرحلة التصنيع (الوردية)</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100 outline-none"
            >
              <option value="all">-- كل المراحل والورديات --</option>
              <option value="semi_weight">🥣 نصف مصنع وزني (عجائن - كجم)</option>
              <option value="semi_piece">🍰 نصف مصنع قطعي (بلكات / تارت)</option>
              <option value="finished">🎂 تفنيش منتج تام (وردية 2)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">⚖️ وحدة الوجبة</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100 outline-none"
            >
              <option value="all">كل الوحدات</option>
              <option value="كجم">كجم (وزن)</option>
              <option value="صاج">صاج</option>
              <option value="بلكة">بلكة</option>
              <option value="قطعة">قطعة</option>
              <option value="دستة">دستة</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">🎯 الصنف المستهدف</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(Number(e.target.value))}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100 outline-none"
            >
              <option value="0">-- كل الأصناف --</option>
              {allItems.filter(i => i.itemType !== 'خامات').map(p => (
                <option key={p.id} value={p.id}>{p.itemName}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end pt-5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100 outline-none"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="inactive">معطلة</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setStageFilter('all');
                setUnitFilter('all');
                setProductFilter(0);
                setStatusFilter('all');
              }}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl"
              title="إعادة ضبط"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* نموذج إنشاء وتعديل المعايير (BOM Editor) */}
      {isEditing && activeRecipe && (
        <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-amber-500/40 shadow-2xl p-5 mb-6 text-xs animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4">
            <div>
              <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <span>✏️ {activeRecipe.recipeName ? activeRecipe.recipeName : 'إنشاء بطاقة معيار خلطة جديدة'}</span>
              </h2>
              <small className="text-zinc-500">تحديد مدخلات ومخرجات كل مرحلة بدقة لضبط التكلفة والمخزون بين الورديتين</small>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
            >
              إلغاء والعودة
            </button>
          </div>

          <form onSubmit={handleSaveRecipe} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-black/40 rounded-xl border border-slate-200 dark:border-zinc-800">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">المنتج المراد تصنيعه *</label>
                <select
                  value={activeRecipe.productItemId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const prod = allItems.find(i => i.id === id);
                    if (prod) {
                      const isSemi = prod.itemType === 'نصف مصنع';
                      setActiveRecipe({
                        ...activeRecipe,
                        productItemId: prod.id,
                        productItemName: prod.itemName,
                        stage: isSemi ? (prod.unit === 'بلكة' ? 'semi_piece' : 'semi_weight') : 'finished',
                        batchUnit: prod.unit
                      });
                    }
                  }}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-amber-500/50 rounded-xl font-bold text-zinc-100"
                >
                  <optgroup label="🎂 منتجات تامة (أوردرات الوردية 2)">
                    {allItems.filter(i => i.itemType === 'منتج تام').map(p => (
                      <option key={p.id} value={p.id}>{p.itemName} ({p.itemCode})</option>
                    ))}
                  </optgroup>
                  <optgroup label="🥣 أصناف نصف مصنعة (تجهيز الوردية 1)">
                    {allItems.filter(i => i.itemType === 'نصف مصنع').map(p => (
                      <option key={p.id} value={p.id}>{p.itemName} ({p.itemCode})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">اسم الخلطة / المعيار *</label>
                <input
                  type="text"
                  required
                  value={activeRecipe.recipeName}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, recipeName: e.target.value })}
                  placeholder="مثال: خلطة عجين بسبوسة معيار 10 كجم..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">كود الوصفة (BOM Code)</label>
                <input
                  type="text"
                  value={activeRecipe.recipeCode}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, recipeCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-amber-400 text-center"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">مرحلة التشغيل</label>
                <select
                  value={activeRecipe.stage}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, stage: e.target.value as any })}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-indigo-400"
                >
                  <option value="semi_weight">نصف مصنع وزني (وردية 1)</option>
                  <option value="semi_piece">نصف مصنع قطعي (وردية 1)</option>
                  <option value="finished">تفنيش تام (وردية 2)</option>
                </select>
              </div>
            </div>

            {/* محددات الوجبة والهدر */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-3 bg-black/40 rounded-xl border border-slate-200 dark:border-zinc-800">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">حجم الوجبة المعياري</label>
                <input
                  type="number"
                  step="any"
                  value={activeRecipe.batchQuantity}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, batchQuantity: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-center text-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">وحدة الوجبة</label>
                <select
                  value={activeRecipe.batchUnit}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, batchUnit: e.target.value })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-center text-zinc-200"
                >
                  <option value="كجم">كجم</option>
                  <option value="صاج">صاج</option>
                  <option value="بلكة">بلكة</option>
                  <option value="قطعة">قطعة</option>
                  <option value="دستة">دستة</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">الخرج الصافي (Yield)</label>
                <input
                  type="number"
                  step="any"
                  value={activeRecipe.yieldQuantity}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, yieldQuantity: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-center text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">عدد القطع (0 للوزني)</label>
                <input
                  type="number"
                  value={activeRecipe.piecesPerBatch}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, piecesPerBatch: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-center text-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">فاقد التشغيل (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={activeRecipe.wastePercentage}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, wastePercentage: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-center text-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">وقت التحضير (دقيقة)</label>
                <input
                  type="number"
                  value={activeRecipe.preparationTimeMinutes}
                  onChange={(e) => setActiveRecipe({ ...activeRecipe, preparationTimeMinutes: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-center text-zinc-200"
                />
              </div>
            </div>

            {/* جدول مكونات الخلطة */}
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-[#0a0c10]">
              <div className="p-3 bg-[#13161f] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                <span className="font-bold text-zinc-200">🧂 مقادير الخامات والمكونات الوسيطة الداخلة في الخلطة:</span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                >
                  ➕ إضافة مكون / خامة للخلطة
                </button>
              </div>

              <table className="w-full text-center">
                <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3 text-right" style={{ width: '40%' }}>اسم المكون (خامة أولية أو نصف مصنع) *</th>
                    <th className="py-2.5 px-3 w-32">الكمية المعيارية</th>
                    <th className="py-2.5 px-3 w-24">الوحدة</th>
                    <th className="py-2.5 px-3 w-28">فاقد المكون (%)</th>
                    <th className="py-2.5 px-3 text-right">ملاحظات تشغيلية</th>
                    <th className="py-2.5 px-3 w-14">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
                  {activeRecipe.lines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-right">
                        <select
                          value={line.componentItemId}
                          onChange={(e) => handleLineItemChange(idx, Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-zinc-100 text-xs"
                        >
                          <optgroup label="🌾 خامات أولية">
                            {allItems.filter(i => i.itemType === 'خامات').map(m => (
                              <option key={m.id} value={m.id}>{m.itemName} ({m.itemCode})</option>
                            ))}
                          </optgroup>
                          <optgroup label="🥣 مكونات نصف مصنعة">
                            {allItems.filter(i => i.itemType === 'نصف مصنع').map(m => (
                              <option key={m.id} value={m.id}>{m.itemName} ({m.itemCode})</option>
                            ))}
                          </optgroup>
                        </select>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={line.quantity}
                          onChange={(e) => {
                            const copy = [...activeRecipe.lines];
                            copy[idx].quantity = Number(e.target.value);
                            setActiveRecipe({ ...activeRecipe, lines: copy });
                          }}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded font-mono font-bold text-center text-amber-400"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <span className="bg-zinc-800 px-2 py-1 rounded text-slate-700 dark:text-zinc-300 font-mono text-[11px] block border border-slate-300 dark:border-zinc-700">
                          {line.unit}
                        </span>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.1"
                          value={line.wastePercentage}
                          onChange={(e) => {
                            const copy = [...activeRecipe.lines];
                            copy[idx].wastePercentage = Number(e.target.value);
                            setActiveRecipe({ ...activeRecipe, lines: copy });
                          }}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded font-mono text-center text-rose-400"
                        />
                      </td>

                      <td className="py-2 px-3 text-right">
                        <input
                          type="text"
                          value={line.notes || ''}
                          placeholder="سحب وردية 1 / نخل / تسييح..."
                          onChange={(e) => {
                            const copy = [...activeRecipe.lines];
                            copy[idx].notes = e.target.value;
                            setActiveRecipe({ ...activeRecipe, lines: copy });
                          }}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded text-xs text-zinc-200"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-rose-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg"
              >
                💾 حفظ واعتماد بطاقة المعايير (BOM)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* جدول استعراض بطاقات الخلطات المسجلة */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
          <span className="font-bold text-zinc-200">📋 سجل معايير ووصفات الإنتاج المسجلة</span>
          <span className="bg-indigo-600 px-2.5 py-0.5 rounded-lg text-white font-mono text-[11px]">
            المعروض: {filteredRecipes.length} معايير
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">كود الوصفة</th>
                <th className="py-3 px-3 text-right">اسم الخلطة / المعيار</th>
                <th className="py-3 px-3 text-right">المنتج المستهدف ومرحلته</th>
                <th className="py-3 px-3">حجم الوجبة المعياري</th>
                <th className="py-3 px-3">عدد المكونات</th>
                <th className="py-3 px-3">التكلفة التقديرية للوجبة</th>
                <th className="py-3 px-3">تكلفة القطعة</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 w-28">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredRecipes.map(r => (
                <tr key={r.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{r.recipeCode}</td>
                  <td className="py-3 px-3 text-right font-bold text-zinc-100">{r.recipeName}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-zinc-200 block">{r.productItemName}</span>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      r.stage === 'semi_weight'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : (r.stage === 'semi_piece' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30')
                    }`}>
                      {r.stage === 'semi_weight' ? '🥣 نصف مصنع وزني (وردية 1)' : (r.stage === 'semi_piece' ? '🍰 نصف مصنع قطعي (وردية 1)' : '🎂 تفنيش تام (وردية 2)')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-zinc-300">{r.batchQuantity} {r.batchUnit}</td>
                  <td className="py-3 px-3">
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-slate-700 dark:text-zinc-300 font-mono border border-slate-300 dark:border-zinc-700">
                      {r.lines.length} مكونات
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {r.totalEstimatedCost.toFixed(2)} ج.م
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-zinc-300">
                    {r.piecesPerBatch > 0 ? `${r.costPerPiece.toFixed(2)} ج.م` : 'بالوزن (0 قطع)'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      r.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {r.active ? 'نشطة' : 'معطلة'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleEditRecipe(r)}
                      className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 mx-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إضافة صنف جديد للدليل */}
      {showQuickItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0f1117] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-slate-100 dark:bg-[#151822] text-white flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-indigo-400">
                <PlusCircle className="w-4 h-4" />
                <span>إضافة صنف جديد لدليل الأصناف</span>
              </h4>
              <button onClick={() => setShowQuickItemModal(false)} className="text-slate-600 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">كود الصنف *</label>
                <input
                  type="text"
                  value={quickItemCode}
                  onChange={(e) => setQuickItemCode(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-mono text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">اسم الصنف *</label>
                <input
                  type="text"
                  value={quickItemName}
                  onChange={(e) => setQuickItemName(e.target.value)}
                  placeholder="مثال: ديسك اسبونج شيكولاتة..."
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">نوع الصنف *</label>
                <select
                  value={quickItemType}
                  onChange={(e) => setQuickItemType(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100"
                >
                  <option value="نصف مصنع">🥣 نصف مصنع / وسيط (تجهيز الوردية 1)</option>
                  <option value="منتج تام">🎂 منتج تام جاهز للبيع (وردية 2)</option>
                  <option value="خامات">🌾 خامات ومستلزمات إنتاج أولية</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">الوحدة الافتراضية *</label>
                <select
                  value={quickItemUnit}
                  onChange={(e) => setQuickItemUnit(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100"
                >
                  <option value="كجم">كجم</option>
                  <option value="بلكة">بلكة</option>
                  <option value="قطعة">قطعة</option>
                  <option value="صاج">صاج</option>
                  <option value="دستة">دستة</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowQuickItemModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickItemModal(false);
                    setStatusMessage(`✅ تم إدراج الصنف [${quickItemName}] في الدليل بنجاح.`);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
                >
                  حفظ في الدليل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;


