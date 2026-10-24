import React, { useState, useEffect, useMemo } from 'react';
import {
  ChefHat,
  FileSpreadsheet,
  Download,
  Upload,
  PlusCircle,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
  Plus,
  Trash2,
  Save,
  Package,
  Clock,
  Percent,
  Cake,
  Boxes,
  Tag,
  Pencil
} from 'lucide-react';
import {
  fetchRecipesApi,
  fetchAllItemsApi,
  saveRecipeApi,
  saveQuickItemApi,
} from './recipesApi';
import type {
  RecipeDto,
  RecipeLineDto,
  ItemLookupDto,
  QuickItemCreateDto,
  RecipeImportPreviewDto,
} from './recipesApi';

export const RecipesPage: React.FC = () => {
  const [recipesList, setRecipesList] = useState<RecipeDto[]>([]);
  const [allItems, setAllItems] = useState<ItemLookupDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  // شريط الفلاتر
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [selectedProductFilter, setSelectedProductFilter] = useState<number>(0);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // وضع التحرير والإضافة
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeRecipe, setActiveRecipe] = useState<Partial<RecipeDto>>({
    id: 0,
    productItemId: 0,
    recipeCode: '',
    recipeName: '',
    batchQuantity: 10,
    batchUnit: 'كجم',
    yieldQuantity: 10,
    yieldUnit: 'كجم',
    piecesPerBatch: 0,
    wastePercentage: 0,
    preparationTimeMinutes: 30,
    active: true,
    lines: [],
  });

  // مودال الصنف السريع
  const [isQuickItemModalOpen, setIsQuickItemModalOpen] = useState<boolean>(false);
  const [newQuickItem, setNewQuickItem] = useState<QuickItemCreateDto>({
    itemCode: '',
    itemName: '',
    itemType: 'نصف مصنع',
    unit: 'كجم',
  });
  const [isSavingQuickItem, setIsSavingQuickItem] = useState<boolean>(false);

  // مودال استيراد الإكسيل
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importedPreviewList, setImportedPreviewList] = useState<RecipeImportPreviewDto[]>([]);
  const [isSavingImport, setIsSavingImport] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recs, itms] = await Promise.all([fetchRecipesApi(), fetchAllItemsApi()]);
      setRecipesList(recs);
      setAllItems(itms);
    } catch (err: any) {
      setStatusMessage(`فشل جلب المعايير: ${err.message}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const targetProductsList = useMemo(() => {
    return allItems.filter(
      (i) => i.itemType === 'منتج تام' || i.itemType === 'منتج وسيط' || i.itemType === 'نصف مصنع'
    );
  }, [allItems]);

  const allIngredientsList = useMemo(() => {
    return allItems.filter((i) => i.itemType !== 'منتج تام');
  }, [allItems]);

  // إحصائيات KPIs اللحظية
  const countWeightSemiFinished = useMemo(() => {
    return recipesList.filter((r) => {
      const itm = allItems.find((i) => i.id === r.productItemId);
      return itm && (itm.itemType === 'منتج وسيط' || itm.itemType === 'نصف مصنع') && (r.piecesPerBatch === 0 || r.batchUnit === 'كجم');
    }).length;
  }, [recipesList, allItems]);

  const countPieceSemiFinished = useMemo(() => {
    return recipesList.filter((r) => {
      const itm = allItems.find((i) => i.id === r.productItemId);
      return itm && (itm.itemType === 'منتج وسيط' || itm.itemType === 'نصف مصنع') && (r.piecesPerBatch > 0 && r.batchUnit !== 'كجم');
    }).length;
  }, [recipesList, allItems]);

  const countFinishedRecipes = useMemo(() => {
    return recipesList.filter((r) => {
      const itm = allItems.find((i) => i.id === r.productItemId);
      return !itm || itm.itemType === 'منتج تام';
    }).length;
  }, [recipesList, allItems]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedStageFilter !== 'all' ||
    selectedUnitFilter !== 'all' ||
    selectedProductFilter > 0 ||
    selectedStatusFilter !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStageFilter('all');
    setSelectedUnitFilter('all');
    setSelectedProductFilter(0);
    setSelectedStatusFilter('all');
  };

  const filteredRecipes = useMemo(() => {
    return recipesList.filter((r) => {
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchCode = r.recipeCode.toLowerCase().includes(term);
        const matchName = r.recipeName.toLowerCase().includes(term);
        const matchProd = r.productItemName.toLowerCase().includes(term);
        if (!matchCode && !matchName && !matchProd) return false;
      }

      if (selectedStageFilter === 'semi_weight') {
        const itm = allItems.find((i) => i.id === r.productItemId);
        if (!(itm && (itm.itemType === 'منتج وسيط' || itm.itemType === 'نصف مصنع') && (r.piecesPerBatch === 0 || r.batchUnit === 'كجم'))) {
          return false;
        }
      } else if (selectedStageFilter === 'semi_piece') {
        const itm = allItems.find((i) => i.id === r.productItemId);
        if (!(itm && (itm.itemType === 'منتج وسيط' || itm.itemType === 'نصف مصنع') && (r.piecesPerBatch > 0 && r.batchUnit !== 'كجم'))) {
          return false;
        }
      } else if (selectedStageFilter === 'finished') {
        const itm = allItems.find((i) => i.id === r.productItemId);
        if (itm && itm.itemType !== 'منتج تام') return false;
      }

      if (selectedUnitFilter !== 'all' && r.batchUnit !== selectedUnitFilter) return false;
      if (selectedProductFilter > 0 && r.productItemId !== selectedProductFilter) return false;
      if (selectedStatusFilter === 'active' && !r.active) return false;
      if (selectedStatusFilter === 'inactive' && r.active) return false;

      return true;
    });
  }, [recipesList, allItems, searchTerm, selectedStageFilter, selectedUnitFilter, selectedProductFilter, selectedStatusFilter]);

  const createNewRecipe = () => {
    setActiveRecipe({
      id: 0,
      productItemId: targetProductsList[0]?.id || 0,
      recipeCode: `BOM-${Date.now().toString().slice(-4)}`,
      recipeName: '',
      batchQuantity: 10,
      batchUnit: 'كجم',
      yieldQuantity: 10,
      yieldUnit: 'كجم',
      piecesPerBatch: 0,
      wastePercentage: 0,
      preparationTimeMinutes: 30,
      active: true,
      lines: [{ componentItemId: allIngredientsList[0]?.id || 0, quantity: 1, unit: 'كجم', wastePercentage: 0 }],
    });
    setIsEditing(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const editRecipe = (recipe: RecipeDto) => {
    setActiveRecipe({ ...recipe, lines: recipe.lines ? [...recipe.lines] : [] });
    setIsEditing(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleTargetProductSelected = (prodId: number) => {
    const item = allItems.find((i) => i.id === prodId);
    if (!item) return;

    const isSemi = item.itemType === 'منتج وسيط' || item.itemType === 'نصف مصنع';
    let bUnit = 'كجم';
    let pieces = 0;

    if (isSemi) {
      if (item.itemName.includes('اسبونج') || item.itemName.includes('بلكة') || item.unit === 'بلكة') {
        bUnit = item.unit || 'بلكة';
        pieces = 1;
      }
    } else {
      if (item.itemName.includes('تورتة') || item.itemName.includes('جاتوه') || item.unit === 'دستة') {
        bUnit = 'قطعة';
        pieces = 1;
      } else {
        bUnit = 'صاج';
      }
    }

    setActiveRecipe((prev) => ({
      ...prev,
      productItemId: prodId,
      productItemName: item.itemName,
      batchUnit: bUnit,
      yieldUnit: bUnit,
      piecesPerBatch: pieces,
      recipeName: isSemi ? `خلطة عجين/تجهيز ${item.itemName}` : `تفنيش ${item.itemName}`,
      recipeCode: `BOM-${item.itemCode}`,
    }));
  };

  const addIngredientLine = () => {
    setActiveRecipe((prev) => ({
      ...prev,
      lines: [
        ...(prev.lines || []),
        { componentItemId: allIngredientsList[0]?.id || 0, quantity: 1, unit: 'كجم', wastePercentage: 0 },
      ],
    }));
  };

  const removeIngredientLine = (idx: number) => {
    setActiveRecipe((prev) => ({
      ...prev,
      lines: prev.lines?.filter((_, i) => i !== idx),
    }));
  };

  const updateLineComponent = (idx: number, compId: number) => {
    const item = allIngredientsList.find((i) => i.id === compId);
    setActiveRecipe((prev) => {
      const copy = [...(prev.lines || [])];
      copy[idx] = {
        ...copy[idx],
        componentItemId: compId,
        componentItemName: item?.itemName,
        componentItemCode: item?.itemCode,
        unit: item?.unit || 'كجم',
      };
      return { ...prev, lines: copy };
    });
  };

  const handleSaveRecipe = async () => {
    if (!activeRecipe.productItemId || !activeRecipe.recipeName?.trim()) {
      setStatusMessage('يرجى تحديد المنتج المستهدف واسم الخلطة.');
      setIsSuccess(false);
      return;
    }

    if (!activeRecipe.lines?.length || activeRecipe.lines.some((l) => !l.componentItemId || l.quantity <= 0)) {
      setStatusMessage('يجب إضافة مكون واحد على الأقل وتحديد مقادير صالحة أكبر من الصفر.');
      setIsSuccess(false);
      return;
    }

    try {
      await saveRecipeApi(activeRecipe);
      setStatusMessage('تم حفظ واعتماد بطاقة معايير الخلطة بنجاح!');
      setIsSuccess(true);
      setIsEditing(false);
      await loadData();
    } catch (err: any) {
      setStatusMessage(`فشل الحفظ: ${err.message}`);
      setIsSuccess(false);
    }
  };

  const openQuickItemModal = () => {
    setNewQuickItem({
      itemCode: `ITM-${Date.now().toString().slice(-5)}`,
      itemName: '',
      itemType: 'نصف مصنع',
      unit: 'كجم',
    });
    setIsQuickItemModalOpen(true);
  };

  const handleSaveQuickItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickItem.itemName.trim()) return;

    setIsSavingQuickItem(true);
    try {
      const created = await saveQuickItemApi(newQuickItem);
      await loadData();
      setIsQuickItemModalOpen(false);
      setStatusMessage(`تم إدراج الصنف الجديد [${created.itemName}] بالدليل بنجاح!`);
      setIsSuccess(true);

      if (isEditing) {
        handleTargetProductSelected(created.id);
      }
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setIsSavingQuickItem(false);
    }
  };

  const handleExportCsv = () => {
    if (!filteredRecipes.length) return;

    const headers = [
      'كود_الوصفة',
      'اسم_الخلطة_المعيار',
      'المنتج_المستهدف',
      'حجم_الوجبة',
      'وحدة_الوجبة',
      'عدد_القطع',
      'الخرج_الصافي',
      'فاقد_التشغيل_%',
      'وقت_التحضير_دقيقة',
      'التكلفة_التقديرية',
      'تكلفة_القطعة',
      'كود_المكون',
      'اسم_المكون',
      'كمية_المكون',
      'وحدة_المكون',
      'فاقد_المكون_%',
      'الحالة',
    ];

    const rows: string[] = [];
    filteredRecipes.forEach((r) => {
      const lines = r.lines || [];
      if (lines.length > 0) {
        lines.forEach((l) => {
          rows.push(
            [
              `"${r.recipeCode}"`,
              `"${r.recipeName}"`,
              `"${r.productItemName}"`,
              r.batchQuantity,
              `"${r.batchUnit}"`,
              r.piecesPerBatch,
              r.yieldQuantity,
              r.wastePercentage,
              r.preparationTimeMinutes,
              r.totalEstimatedCost.toFixed(2),
              r.costPerPiece.toFixed(2),
              `"${l.componentItemCode || ''}"`,
              `"${l.componentItemName || ''}"`,
              l.quantity,
              `"${l.unit || ''}"`,
              l.wastePercentage,
              `"${r.active ? 'نشطة' : 'معطلة'}"`,
            ].join(',')
          );
        });
      } else {
        rows.push(
          [
            `"${r.recipeCode}"`,
            `"${r.recipeName}"`,
            `"${r.productItemName}"`,
            r.batchQuantity,
            `"${r.batchUnit}"`,
            r.piecesPerBatch,
            r.yieldQuantity,
            r.wastePercentage,
            r.preparationTimeMinutes,
            r.totalEstimatedCost.toFixed(2),
            r.costPerPiece.toFixed(2),
            '---',
            '---',
            0,
            '---',
            0,
            `"${r.active ? 'نشطة' : 'معطلة'}"`,
          ].join(',')
        );
      }
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `بطاقات_خلطات_التصنيع_BOM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'كود_الوصفة',
      'اسم_الخلطة_المعيار',
      'المنتج_المستهدف',
      'حجم_الوجبة',
      'وحدة_الوجبة',
      'عدد_القطع',
      'الخرج_الصافي',
      'فاقد_التشغيل_%',
      'وقت_التحضير_دقيقة',
      'كود_المكون',
      'اسم_المكون',
      'كمية_المكون',
      'وحدة_المكون',
      'فاقد_المكون_%',
    ];

    const sample = [
      'BOM-201001,خلطة عجين بسبوسة معيار 10 كجم,عجين بسبوسة,10,كجم,0,10,0,30,107,سميد بسبوسة خشن,5,كجم,0',
      'BOM-201001,خلطة عجين بسبوسة معيار 10 كجم,عجين بسبوسة,10,كجم,0,10,0,30,102,سمن بلدي بقري طبيعي,2.5,كجم,0',
      'BOM-202001,خبز بلكة اسبونج فانيليا 40*60,اسبونج فانيليا,1,بلكة,1,1,3,45,101,دقيق فاخر استخراج 72%,1.8,كجم,2',
      'BOM-202001,خبز بلكة اسبونج فانيليا 40*60,اسبونج فانيليا,1,بلكة,1,1,3,45,105,بيض مزارع طازج,30,قطعة,0',
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...sample].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'قالب_معايير_خلطات_التصنيع_BOM.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. رأس الصفحة وأزرار التحكم */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-indigo-600" />
            <span>معايير وبطاقات خلطات التصنيع (BOM / Recipes)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            نظام شجرة التصنيع متعددة المستويات (تجهيز النصف مصنع الوزني والقطعي للوردية الأولى + تفنيش الأوردرات للوردية الثانية)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            disabled={!filteredRecipes.length}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 rounded-xl border border-cyan-200 text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>تحميل القالب</span>
          </button>

          <button
            onClick={openQuickItemModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جديد للدليل</span>
          </button>

          <button
            onClick={createNewRecipe}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إنشاء معيار / خلطة جديدة</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            title="تحديث"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. رسائل التنبيه */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
          isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} className="text-gray-500 hover:text-gray-800 font-bold">×</button>
        </div>
      )}

      {/* 3. بطاقات المؤشرات اللحظية (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي خلطات الـ BOM</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-indigo-700">{recipesList.length}</span>
            <span className="text-xs font-bold text-gray-500">معيار</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-cyan-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">نصف مصنع وزني (عجائن / كجم)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-cyan-700">{countWeightSemiFinished}</span>
            <span className="text-xs font-bold text-gray-500">خلطة وزنية</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">نصف مصنع قطعي (بلكات / تارت)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-amber-600">{countPieceSemiFinished}</span>
            <span className="text-xs font-bold text-gray-500">خلطة قطعية</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">خلطات تفنيش تام (وردية 2)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-600">{countFinishedRecipes}</span>
            <span className="text-xs font-bold text-gray-500">خلطة تفنيش</span>
          </div>
        </div>
      </div>

      {/* 4. شريط فلاتر البحث المتقدمة */}
      <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-indigo-600 p-4 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-3">
            <label className="block text-gray-600 font-bold mb-1">🔍 البحث بكود الوصفة أو اسم الخلطة</label>
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بكود الوصفة، اسم الخلطة، أو المنتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-gray-600 font-bold mb-1">🏭 مرحلة التصنيع (الوردية)</label>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">-- كل المراحل والورديات --</option>
              <option value="semi_weight">🥣 نصف مصنع وزني (عجائن / شربات - كجم)</option>
              <option value="semi_piece">🍰 نصف مصنع قطعي (بلكات اسبونج / تارت)</option>
              <option value="finished">🎂 تفنيش منتج تام (أوردرات الوردية 2)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-bold mb-1">⚖️ وحدة الوجبة</label>
            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="all">كل الوحدات</option>
              <option value="كجم">كجم (وزن)</option>
              <option value="صاج">صاج</option>
              <option value="بلكة">بلكة</option>
              <option value="قطعة">قطعة</option>
              <option value="دستة">دستة</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-bold mb-1">🎯 الصنف المستهدف</label>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>-- كل الأصناف --</option>
              {targetProductsList.map((p) => (
                <option key={p.id} value={p.id}>{p.itemName}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end gap-1.5 pt-3">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="flex-1 px-2.5 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="inactive">معطلة</option>
            </select>
            <button
              onClick={resetFilters}
              title="إلغاء الفلاتر"
              className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <span className="text-xs text-indigo-700 font-bold">
              نتائج التصفية: ({filteredRecipes.length} معيار مطابق من أصل {recipesList.length})
            </span>
            <button onClick={resetFilters} className="text-xs text-rose-600 hover:text-rose-800 font-bold">
              عرض الكل
            </button>
          </div>
        )}
      </div>

      {/* 5. لوحة تحرير وإنشاء معايير الخلطة */}
      {isEditing && (
        <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-xl p-6 mb-6 text-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-black text-indigo-900">
                {activeRecipe.id === 0 ? '➕ إنشاء بطاقة تشغيل جديدة (BOM)' : `✏️ تعديل بطاقة خلطة: ${activeRecipe.recipeName}`}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">تحديد مدخلات ومخرجات كل مرحلة بدقة لضبط التكلفة والمخزون بين الورديتين</p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              إلغاء والعودة للقائمة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-4">
            <div className="md:col-span-5">
              <label className="block text-gray-700 font-bold mb-1">المنتج المراد تصنيعه وإدخاله المخزن *</label>
              <select
                value={activeRecipe.productItemId}
                onChange={(e) => handleTargetProductSelected(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-indigo-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
              >
                <option value={0}>-- اختر المنتج المراد تصنيعه --</option>
                <optgroup label="🎂 منتجات تامة (أوردرات وتفنيش الوردية الثانية)">
                  {targetProductsList.filter((i) => i.itemType === 'منتج تام').map((p) => (
                    <option key={p.id} value={p.id}>{p.itemName} ({p.itemCode})</option>
                  ))}
                </optgroup>
                <optgroup label="🥣 أصناف نصف مصنعة / وسيطة (تجهيز الوردية الأولى)">
                  {targetProductsList.filter((i) => i.itemType === 'منتج وسيط' || i.itemType === 'نصف مصنع').map((p) => (
                    <option key={p.id} value={p.id}>{p.itemName} ({p.itemCode})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-gray-700 font-bold mb-1">اسم الخلطة / المعيار التصنيعي *</label>
              <input
                type="text"
                placeholder="مثال: خلطة عجين بسبوسة / تفنيش بسبوسة مكسرات"
                value={activeRecipe.recipeName || ''}
                onChange={(e) => setActiveRecipe({ ...activeRecipe, recipeName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-gray-700 font-bold mb-1">كود الوصفة (BOM Code)</label>
              <input
                type="text"
                value={activeRecipe.recipeCode || ''}
                onChange={(e) => setActiveRecipe({ ...activeRecipe, recipeCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono text-gray-700 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-gray-200 mb-5">
            <div>
              <label className="block text-gray-700 font-bold mb-1">حجم الوجبة المعياري</label>
              <input
                type="number"
                step="0.01"
                value={activeRecipe.batchQuantity}
                onChange={(e) => setActiveRecipe({ ...activeRecipe, batchQuantity: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-center font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">وحدة الوجبة</label>
              <select
                value={activeRecipe.batchUnit}
                onChange={(e) => setActiveRecipe({ ...activeRecipe, batchUnit: e.target.value, yieldUnit: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg font-bold"
              >
                <option value="كجم">كجم (وزن)</option>
                <option value="صاج">صاج</option>
                <option value="بلكة">بلكة</option>
                <option value="قطعة">قطعة</option>
                <option value="دستة">دستة</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">الخرج الصافي (Yield)</label>
              <input
                type="number"
                step="0.01"
                value={activeRecipe.yieldQuantity}
                onChange={(e) => setActiveRecipe({ ...activeRecipe, yieldQuantity: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-center font-mono"
              />
            </div>

            <div>
              <label className="block text-indigo-700 font-bold mb-1">عدد القطع (0 للوزن)</label>
              <input
                type="number"
                value={activeRecipe.piecesPerBatch}
                onChange={(e) => setActiveRecipe({ ...activeRecipe, piecesPerBatch: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-white border border-indigo-300 rounded-lg text-center font-mono font-bold text-indigo-800"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">فاقد تشغيل (%)</label>
              <input
                type="number"
                step="0.1"
                value={activeRecipe.wastePercentage}
                onChange={(e) => setActiveRecipe({ ...activeRecipe, wastePercentage: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-center font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">التحضير (دقيقة)</label>
              <input
                type="number"
                value={activeRecipe.preparationTimeMinutes}
                onChange={(e) => setActiveRecipe({ ...activeRecipe, preparationTimeMinutes: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-center font-mono"
              />
            </div>
          </div>

          {/* بنود المكونات */}
          <div className="mb-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
              <div>
                <h4 className="font-bold text-indigo-900">🧂 مقادير الخامات والمكونات الوسيطة الداخلة في الخلطة:</h4>
                <p className="text-[11px] text-gray-400">يمكن لوردية التفنيش سحب الخامات الأولية وكذلك المكونات النصف مصنعة المحضرة مسبقاً</p>
              </div>
              <button
                type="button"
                onClick={addIngredientLine}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مكون / خامة للخلطة</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-50 text-gray-700 font-bold border-b">
                  <tr>
                    <th className="py-2.5 px-3 text-right" style={{ width: '35%' }}>اسم المكون (خامة أولية أو نصف مصنع) *</th>
                    <th className="py-2.5 px-3" style={{ width: '15%' }}>الكمية المعيارية</th>
                    <th className="py-2.5 px-3" style={{ width: '12%' }}>الوحدة</th>
                    <th className="py-2.5 px-3" style={{ width: '15%' }}>فاقد تشغيل المكون (%)</th>
                    <th className="py-2.5 px-3" style={{ width: '18%' }}>ملاحظات تشغيلية</th>
                    <th className="py-2.5 px-2" style={{ width: '5%' }}>حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!activeRecipe.lines || activeRecipe.lines.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-gray-400 font-bold">
                        اضغط «إضافة مكون / خامة للخلطة» لتحديد المقادير المعيارية.
                      </td>
                    </tr>
                  ) : (
                    activeRecipe.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-right">
                          <select
                            value={line.componentItemId}
                            onChange={(e) => updateLineComponent(idx, Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-lg font-bold text-gray-800 outline-none focus:border-indigo-600"
                          >
                            <option value={0}>-- اختر المكون أو الخامة --</option>
                            <optgroup label="🥣 أصناف نصف مصنعة (بلكات اسبونج، عجائن، كريمة)">
                              {allIngredientsList.filter((i) => i.itemType === 'منتج وسيط' || i.itemType === 'نصف مصنع').map((rm) => (
                                <option key={rm.id} value={rm.id}>{rm.itemName} ({rm.itemCode})</option>
                              ))}
                            </optgroup>
                            <optgroup label="🌾 خامات ومستلزمات إنتاج أولية">
                              {allIngredientsList.filter((i) => i.itemType === 'خامات').map((rm) => (
                                <option key={rm.id} value={rm.id}>{rm.itemName} ({rm.itemCode})</option>
                              ))}
                            </optgroup>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.001"
                            value={line.quantity}
                            onChange={(e) => {
                              const copy = [...(activeRecipe.lines || [])];
                              copy[idx].quantity = Number(e.target.value);
                              setActiveRecipe({ ...activeRecipe, lines: copy });
                            }}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono font-bold text-indigo-700 outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 font-bold text-gray-600">
                          {line.unit || 'كجم'}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.1"
                            value={line.wastePercentage}
                            onChange={(e) => {
                              const copy = [...(activeRecipe.lines || [])];
                              copy[idx].wastePercentage = Number(e.target.value);
                              setActiveRecipe({ ...activeRecipe, lines: copy });
                            }}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-center font-mono outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="سحب من الوردية 1 / نخل..."
                            value={line.notes || ''}
                            onChange={(e) => {
                              const copy = [...(activeRecipe.lines || [])];
                              copy[idx].notes = e.target.value;
                              setActiveRecipe({ ...activeRecipe, lines: copy });
                            }}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-[11px] outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <button
                            type="button"
                            onClick={() => removeIngredientLine(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveRecipe}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>💾 حفظ واعتماد بطاقة المعايير (BOM)</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. جدول استعراض بطاقات الخلطات المسجلة */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-xs font-bold">📋 سجل معايير ووصفات الإنتاج المسجلة</h2>
          <span className="bg-indigo-600 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full">
            المعروض: {filteredRecipes.length} معايير
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <RotateCw className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
              <p>جاري تحميل وصفات الـ BOM...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-bold">
              لا توجد وصفات تصنيع مطابقة لشروط البحث والفلترة.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                <tr>
                  <th className="py-3 px-3">كود الوصفة</th>
                  <th className="py-3 px-3 text-right">اسم الخلطة / المعيار</th>
                  <th className="py-3 px-3 text-right">المنتج المستهدف ومرحلته</th>
                  <th className="py-3 px-3">حجم الوجبة المعياري</th>
                  <th className="py-3 px-3">عدد المكونات</th>
                  <th className="py-3 px-3">التكلفة التقديرية للوجبة</th>
                  <th className="py-3 px-3">تكلفة القطعة</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3" style={{ width: '130px' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {filteredRecipes.map((r) => {
                  const targetItem = allItems.find((i) => i.id === r.productItemId);
                  const isSemi = targetItem && (targetItem.itemType === 'منتج وسيط' || targetItem.itemType === 'نصف مصنع');

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">{r.recipeCode}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900">{r.recipeName}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-gray-900">{r.productItemName}</div>
                        {isSemi ? (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                            🥣 تجهيز وسيط (وردية 1)
                          </span>
                        ) : (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            🎂 تفنيش تام (وردية 2)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-800">
                        {r.batchQuantity} {r.batchUnit}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                          {r.linesCount || r.lines?.length || 0} مكونات
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-emerald-600 text-sm">
                        {r.totalEstimatedCost.toFixed(2)} ج.م
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-800">
                        {r.piecesPerBatch > 0 && r.costPerPiece > 0 ? `${r.costPerPiece.toFixed(2)} ج.م` : 'بالوزن (0 قطع)'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.active ? 'نشطة' : 'معطلة'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => editRecipe(r)}
                          className="px-2.5 py-1 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>تعديل المعيار</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 7. نافذة إضافة صنف جديد للدليل */}
      {isQuickItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>إضافة صنف جديد لدليل الأصناف (خامة / نصف مصنع / تام)</span>
              </h4>
              <button onClick={() => setIsQuickItemModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickItem} className="p-5 space-y-3.5">
              <div>
                <label className="block text-gray-700 font-bold mb-1">كود الصنف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 201005 أو 302005"
                  value={newQuickItem.itemCode}
                  onChange={(e) => setNewQuickItem({ ...newQuickItem, itemCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم الصنف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ديسك اسبونج شيكولاتة / عجين بلح الشام"
                  value={newQuickItem.itemName}
                  onChange={(e) => setNewQuickItem({ ...newQuickItem, itemName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">نوع الصنف *</label>
                <select
                  value={newQuickItem.itemType}
                  onChange={(e) => setNewQuickItem({ ...newQuickItem, itemType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none focus:border-indigo-600"
                >
                  <option value="نصف مصنع">🥣 نصف مصنع / وسيط (تجهيز الوردية الأولى)</option>
                  <option value="منتج تام">🎂 منتج تام جاهز للبيع (تفنيش الوردية الثانية)</option>
                  <option value="خامات">🌾 خامات ومستلزمات إنتاج أولية</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">الوحدة الافتراضية *</label>
                <select
                  value={newQuickItem.unit}
                  onChange={(e) => setNewQuickItem({ ...newQuickItem, unit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none focus:border-indigo-600"
                >
                  <option value="كجم">كجم</option>
                  <option value="بلكة">بلكة</option>
                  <option value="قطعة">قطعة</option>
                  <option value="صاج">صاج</option>
                  <option value="دستة">دستة</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsQuickItemModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickItem}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSavingQuickItem ? 'جاري الحفظ...' : '💾 حفظ وإدراج بالقائمة فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
