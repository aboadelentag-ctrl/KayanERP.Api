export interface RecipeIngredient {
  id: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  wastePercentage: number; // نسبة الهادر والفقد الطبيعي أثناء الخبز/التشغيل
}

export interface Recipe {
  id: number;
  code: string;
  name: string; // اسم الصنف التام
  category: 'حلويات شرقية' | 'حلويات غربية' | 'نواشف ومخبوزات';
  batchYield: number; // حجم الطبخة أو العجنة الناتجة
  yieldUnit: string; // كيلو / صينية / قطعة
  totalBatchCost: number; // إجمالي تكلفة خامات التشغيلة
  costPerUnit: number; // تكلفة الكيلو أو القطعة الناتجة
  status: 'معتمدة' | 'مسودة' | 'قيد الاختبار والتطوير';
  notes: string;
  ingredients: RecipeIngredient[];
}

const STORAGE_KEY = 'kayan_recipes_data';

const getInitialRecipesData = (): Recipe[] => [
  {
    id: 1,
    code: 'RCP-101',
    name: 'بسبوسة مكسرات لوكس',
    category: 'حلويات شرقية',
    batchYield: 25,
    yieldUnit: 'كيلو',
    totalBatchCost: 2250,
    costPerUnit: 90,
    status: 'معتمدة',
    notes: 'صينية مقاس كبير - خبز على نار هادئة 170 درجة',
    ingredients: [
      { id: 1, ingredientName: 'سميد بسبوسة فاخر', quantity: 12, unit: 'كيلو', costPerUnit: 28, totalCost: 336, wastePercentage: 2 },
      { id: 2, ingredientName: 'سمن بلدي بقري طبيعي', quantity: 5, unit: 'كيلو', costPerUnit: 240, totalCost: 1200, wastePercentage: 1 },
      { id: 3, ingredientName: 'سكر نقي أبيض', quantity: 6, unit: 'كيلو', costPerUnit: 32, totalCost: 192, wastePercentage: 0 },
      { id: 4, ingredientName: 'بندق ولوز محمص', quantity: 2, unit: 'كيلو', costPerUnit: 260, totalCost: 520, wastePercentage: 3 },
    ],
  },
  {
    id: 2,
    code: 'RCP-102',
    name: 'كنافة أساور نوتيلا',
    category: 'حلويات شرقية',
    batchYield: 15,
    yieldUnit: 'كيلو',
    totalBatchCost: 1650,
    costPerUnit: 110,
    status: 'معتمدة',
    notes: 'حشو كريمي بعد التبريد التام',
    ingredients: [
      { id: 1, ingredientName: 'كنافة شعر طازجة', quantity: 8, unit: 'كيلو', costPerUnit: 35, totalCost: 280, wastePercentage: 5 },
      { id: 2, ingredientName: 'سمن بلدي صافي', quantity: 3.5, unit: 'كيلو', costPerUnit: 240, totalCost: 840, wastePercentage: 2 },
      { id: 3, ingredientName: 'شوكولاتة بندق نوتيلا', quantity: 3.5, unit: 'كيلو', costPerUnit: 150, totalCost: 525, wastePercentage: 1 },
    ],
  },
  {
    id: 3,
    code: 'RCP-201',
    name: 'تورتة شوكولاتة كروكانت وسط',
    category: 'حلويات غربية',
    batchYield: 10,
    yieldUnit: 'قطعة',
    totalBatchCost: 1400,
    costPerUnit: 140,
    status: 'معتمدة',
    notes: 'إسفنج شوكولاتة مع موس بلجيكي',
    ingredients: [
      { id: 1, ingredientName: 'دقيق سبونج شوكولاتة', quantity: 5, unit: 'كيلو', costPerUnit: 45, totalCost: 225, wastePercentage: 2 },
      { id: 2, ingredientName: 'بيض طازج', quantity: 30, unit: 'قطعة', costPerUnit: 5.5, totalCost: 165, wastePercentage: 3 },
      { id: 3, ingredientName: 'موس شوكولاتة خام', quantity: 3, unit: 'كيلو', costPerUnit: 220, totalCost: 660, wastePercentage: 2 },
      { id: 4, ingredientName: 'مكسرات كروكانت مكرملة', quantity: 1.5, unit: 'كيلو', costPerUnit: 230, totalCost: 345, wastePercentage: 1 },
    ],
  },
];

export const fetchRecipesApi = async (): Promise<Recipe[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialRecipesData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveRecipesToLocal = (data: Recipe[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
