export interface RecipeLineDto {
  componentItemId: number;
  componentItemCode?: string;
  componentItemName?: string;
  quantity: number;
  unit?: string;
  wastePercentage: number;
  notes?: string;
}

export interface RecipeDto {
  id: number;
  companyId?: number;
  productItemId: number;
  productItemName: string;
  recipeCode: string;
  recipeName: string;
  batchQuantity: number;
  batchUnit: string;
  yieldQuantity: number;
  yieldUnit: string;
  piecesPerBatch: number;
  wastePercentage: number;
  preparationTimeMinutes: number;
  totalEstimatedCost: number;
  costPerPiece: number;
  active: boolean;
  notes?: string;
  linesCount?: number;
  lines?: RecipeLineDto[];
}

export interface ItemLookupDto {
  id: number;
  itemCode: string;
  itemName: string;
  itemType: 'خامات' | 'منتج وسيط' | 'نصف مصنع' | 'منتج تام';
  unit: string;
  sellingPrice?: number;
}

export interface QuickItemCreateDto {
  itemCode: string;
  itemName: string;
  itemType: string;
  unit: string;
}

export interface RecipeImportPreviewDto {
  recipeCode: string;
  recipeName: string;
  rawProductName: string;
  productItemId: number;
  matchedProductName: string;
  batchQuantity: number;
  batchUnit: string;
  yieldQuantity: number;
  piecesPerBatch: number;
  wastePercentage: number;
  preparationTimeMinutes: number;
  lines: RecipeLineDto[];
}

const STORAGE_RECIPES_KEY = 'kayan_recipes_bom_v2';
const STORAGE_ITEMS_KEY = 'kayan_all_items_lookup_v2';

export const fallbackItemsList: ItemLookupDto[] = [
  // خامات أولية
  { id: 101, itemCode: 'RAW-FLOUR-72', itemName: 'دقيق فاخر استخراج 72%', itemType: 'خامات', unit: 'كجم' },
  { id: 102, itemCode: 'RAW-GHEE-NAT', itemName: 'سمن بلدي بقري طبيعي', itemType: 'خامات', unit: 'كجم' },
  { id: 103, itemCode: 'RAW-SUGAR-FINE', itemName: 'سكر أبيض ناعم', itemType: 'خامات', unit: 'كجم' },
  { id: 104, itemCode: 'RAW-PISTACHIO', itemName: 'فستق حلبي محمص مفروم', itemType: 'خامات', unit: 'كجم' },
  { id: 105, itemCode: 'RAW-EGGS', itemName: 'بيض مزارع طازج', itemType: 'خامات', unit: 'قطعة' },
  { id: 106, itemCode: 'RAW-CREAM-CHOC', itemName: 'شوكولاتة خام بلجيكي', itemType: 'خامات', unit: 'كجم' },
  { id: 107, itemCode: 'RAW-SEMOLINA', itemName: 'سميد بسبوسة خشن', itemType: 'خامات', unit: 'كجم' },

  // نصف مصنع / منتج وسيط (وردية 1)
  { id: 201, itemCode: 'SEMI-BAS-DOUGH', itemName: 'عجين بسبوسة متبلة ومخمرة', itemType: 'نصف مصنع', unit: 'كجم' },
  { id: 202, itemCode: 'SEMI-SPONGE-VAN', itemName: 'بلكة اسبونج فانيليا 40*60', itemType: 'نصف مصنع', unit: 'بلكة' },
  { id: 203, itemCode: 'SEMI-SPONGE-CHOC', itemName: 'بلكة اسبونج شيكولاتة 40*60', itemType: 'نصف مصنع', unit: 'بلكة' },
  { id: 204, itemCode: 'SEMI-SYRUP-HVY', itemName: 'شربات تقيل دافئ', itemType: 'منتج وسيط', unit: 'كجم' },

  // منتج تام جاهز للبيع (وردية 2)
  { id: 301, itemCode: 'FG-BAS-LUX', itemName: 'صينية بسبوسة مكسرات لوكس سمن بلدي', itemType: 'منتج تام', unit: 'صاج', sellingPrice: 950 },
  { id: 302, itemCode: 'FG-TRT-ROYAL', itemName: 'تورتة شوكولاتة كروكانت ملكي مقاس 26', itemType: 'منتج تام', unit: 'قطعة', sellingPrice: 380 },
  { id: 303, itemCode: 'FG-GAT-SOIR', itemName: 'جاتوه سواريه مشكل فاخر', itemType: 'منتج تام', unit: 'دستة', sellingPrice: 210 },
];

const initialSampleRecipes: RecipeDto[] = [
  {
    id: 1,
    productItemId: 201,
    productItemName: 'عجين بسبوسة متبلة ومخمرة',
    recipeCode: 'BOM-SEMI-201',
    recipeName: 'خلطة عجين بسبوسة معيار 10 كجم (تجهيز وردية 1)',
    batchQuantity: 10.0,
    batchUnit: 'كجم',
    yieldQuantity: 10.0,
    yieldUnit: 'كجم',
    piecesPerBatch: 0,
    wastePercentage: 1.5,
    preparationTimeMinutes: 30,
    totalEstimatedCost: 480.0,
    costPerPiece: 0,
    active: true,
    linesCount: 3,
    lines: [
      { componentItemId: 107, componentItemCode: 'RAW-SEMOLINA', componentItemName: 'سميد بسبوسة خشن', quantity: 5.0, unit: 'كجم', wastePercentage: 0, notes: 'نخل خشن' },
      { id: 2, componentItemId: 102, componentItemCode: 'RAW-GHEE-NAT', componentItemName: 'سمن بلدي بقري طبيعي', quantity: 2.5, unit: 'كجم', wastePercentage: 1.0, notes: 'تسييح دافئ' },
      { id: 3, componentItemId: 103, componentItemCode: 'RAW-SUGAR-FINE', componentItemName: 'سكر أبيض ناعم', quantity: 2.5, unit: 'كجم', wastePercentage: 0, notes: 'دمج على الجاف' },
    ],
  },
  {
    id: 2,
    productItemId: 202,
    productItemName: 'بلكة اسبونج فانيليا 40*60',
    recipeCode: 'BOM-SEMI-202',
    recipeName: 'خبز بلكة اسبونج فانيليا 40*60 (تجهيز وسيط قطعي)',
    batchQuantity: 1.0,
    batchUnit: 'بلكة',
    yieldQuantity: 1.0,
    yieldUnit: 'بلكة',
    piecesPerBatch: 1,
    wastePercentage: 3.0,
    preparationTimeMinutes: 45,
    totalEstimatedCost: 165.0,
    costPerPiece: 165.0,
    active: true,
    linesCount: 3,
    lines: [
      { componentItemId: 101, componentItemCode: 'RAW-FLOUR-72', componentItemName: 'دقيق فاخر استخراج 72%', quantity: 1.8, unit: 'كجم', wastePercentage: 2.0, notes: 'دقيق حلواني منخول 3 مرات' },
      { id: 5, componentItemId: 105, componentItemCode: 'RAW-EGGS', componentItemName: 'بيض مزارع طازج', quantity: 30.0, unit: 'قطعة', wastePercentage: 0, notes: 'خفق سريع بالعجانة' },
      { id: 6, componentItemId: 103, componentItemCode: 'RAW-SUGAR-FINE', componentItemName: 'سكر أبيض ناعم', quantity: 1.2, unit: 'كجم', wastePercentage: 0, notes: 'إضافة تدريجية' },
    ],
  },
  {
    id: 3,
    productItemId: 301,
    productItemName: 'صينية بسبوسة مكسرات لوكس سمن بلدي',
    recipeCode: 'BOM-FG-301',
    recipeName: 'تفنيش وخبز صاج بسبوسة مكسرات (تفنيش وردية 2)',
    batchQuantity: 1.0,
    batchUnit: 'صاج',
    yieldQuantity: 1.0,
    yieldUnit: 'صاج',
    piecesPerBatch: 0,
    wastePercentage: 2.0,
    preparationTimeMinutes: 40,
    totalEstimatedCost: 620.0,
    costPerPiece: 0,
    active: true,
    linesCount: 3,
    lines: [
      { componentItemId: 201, componentItemCode: 'SEMI-BAS-DOUGH', componentItemName: 'عجين بسبوسة متبلة ومخمرة', quantity: 7.0, unit: 'كجم', wastePercentage: 0, notes: 'سحب من ثلاجة الوردية 1' },
      { id: 8, componentItemId: 104, componentItemCode: 'RAW-PISTACHIO', componentItemName: 'فستق حلبي محمص مفروم', quantity: 0.8, unit: 'كجم', wastePercentage: 1.0, notes: 'تزيين السطح قبل الفرن' },
      { id: 9, componentItemId: 204, componentItemCode: 'SEMI-SYRUP-HVY', componentItemName: 'شربات تقيل دافئ', quantity: 3.0, unit: 'كجم', wastePercentage: 0, notes: 'تسقية فور خروج الصاج من الفرن' },
    ],
  },
  {
    id: 4,
    productItemId: 302,
    productItemName: 'تورتة شوكولاتة كروكانت ملكي مقاس 26',
    recipeCode: 'BOM-FG-302',
    recipeName: 'تفنيش تورتة شوكولاتة ملكي مقاس 26 (تفنيش أوردرات)',
    batchQuantity: 1.0,
    batchUnit: 'قطعة',
    yieldQuantity: 1.0,
    yieldUnit: 'قطعة',
    piecesPerBatch: 1,
    wastePercentage: 1.0,
    preparationTimeMinutes: 35,
    totalEstimatedCost: 195.0,
    costPerPiece: 195.0,
    active: true,
    linesCount: 2,
    lines: [
      { componentItemId: 203, componentItemCode: 'SEMI-SPONGE-CHOC', componentItemName: 'بلكة اسبونج شيكولاتة 40*60', quantity: 0.33, unit: 'بلكة', wastePercentage: 2.0, notes: 'تقطيع ديسكات تورتة' },
      { id: 11, componentItemId: 106, componentItemCode: 'RAW-CREAM-CHOC', componentItemName: 'شوكولاتة خام بلجيكي', quantity: 0.45, unit: 'كجم', wastePercentage: 1.5, notes: 'جناش وتجليس كامل' },
    ],
  },
];

export const fetchRecipesApi = async (): Promise<RecipeDto[]> => {
  try {
    const res = await fetch('/api/recipes');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_RECIPES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_RECIPES_KEY, JSON.stringify(initialSampleRecipes));
  return initialSampleRecipes;
};

export const fetchAllItemsApi = async (): Promise<ItemLookupDto[]> => {
  try {
    const res = await fetch('/api/items');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_ITEMS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(fallbackItemsList));
  return fallbackItemsList;
};

export const saveRecipeApi = async (recipe: Partial<RecipeDto>): Promise<RecipeDto> => {
  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_RECIPES_KEY);
  let list: RecipeDto[] = stored ? JSON.parse(stored) : initialSampleRecipes;

  const items = await fetchAllItemsApi();
  const targetItem = items.find((i) => i.id === recipe.productItemId);

  const newRecipe: RecipeDto = {
    id: recipe.id && recipe.id > 0 ? recipe.id : Date.now(),
    productItemId: recipe.productItemId || 0,
    productItemName: targetItem?.itemName || 'منتج مستهدف',
    recipeCode: recipe.recipeCode || `BOM-${Date.now().toString().slice(-4)}`,
    recipeName: recipe.recipeName || 'خلطة تصنيع معتمدة',
    batchQuantity: recipe.batchQuantity || 1,
    batchUnit: recipe.batchUnit || 'كجم',
    yieldQuantity: recipe.yieldQuantity || 1,
    yieldUnit: recipe.yieldUnit || recipe.batchUnit || 'كجم',
    piecesPerBatch: recipe.piecesPerBatch || 0,
    wastePercentage: recipe.wastePercentage || 0,
    preparationTimeMinutes: recipe.preparationTimeMinutes || 30,
    totalEstimatedCost: recipe.totalEstimatedCost || 350.0,
    costPerPiece: (recipe.piecesPerBatch || 0) > 0 ? (recipe.totalEstimatedCost || 350) / (recipe.piecesPerBatch || 1) : 0,
    active: recipe.active ?? true,
    linesCount: recipe.lines?.length || 0,
    lines: recipe.lines || [],
  };

  if (recipe.id && recipe.id > 0) {
    list = list.map((r) => (r.id === recipe.id ? newRecipe : r));
  } else {
    list = [newRecipe, ...list];
  }

  localStorage.setItem(STORAGE_RECIPES_KEY, JSON.stringify(list));
  return newRecipe;
};

export const saveQuickItemApi = async (item: QuickItemCreateDto): Promise<ItemLookupDto> => {
  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) return await res.json();
  } catch {}

  const newItem: ItemLookupDto = {
    id: Date.now(),
    itemCode: item.itemCode,
    itemName: item.itemName,
    itemType: item.itemType as any,
    unit: item.unit,
  };

  const stored = localStorage.getItem(STORAGE_ITEMS_KEY);
  let list: ItemLookupDto[] = stored ? JSON.parse(stored) : fallbackItemsList;
  list = [newItem, ...list];
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(list));
  return newItem;
};
