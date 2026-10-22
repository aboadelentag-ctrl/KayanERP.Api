export interface ItemCategoryNode {
  id: number;
  code: string;
  name: string;
  type: 'خامات ومستلزمات' | 'منتج تام جاهز' | 'نصف مصنع وتجهيزات' | 'تعبئة وتغليف';
  parentId?: number;
  level: number;
  itemCount: number;
}

export interface UomConversionRule {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  baseUnit: string;
  alternateUnit: string;
  conversionFactor: number;
  operation: 'ضرب' | 'قسمة';
  notes: string;
}

const CATEGORIES_KEY = 'kayan_item_categories_data';
const UOM_KEY = 'kayan_uom_conversions_data';

const getInitialCategories = (): ItemCategoryNode[] => [
  { id: 1, code: 'CAT-1', name: 'الخامات ومستلزمات الإنتاج', type: 'خامات ومستلزمات', level: 1, itemCount: 18 },
  { id: 2, code: 'CAT-11', name: 'المطاحن والدقيق والسميد', type: 'خامات ومستلزمات', parentId: 1, level: 2, itemCount: 6 },
  { id: 3, code: 'CAT-12', name: 'الزيوت والسمن الطبيعي والنباتي', type: 'خامات ومستلزمات', parentId: 1, level: 2, itemCount: 5 },
  { id: 4, code: 'CAT-13', name: 'المكسرات والحشوات والياميش', type: 'خامات ومستلزمات', parentId: 1, level: 2, itemCount: 7 },
  { id: 5, code: 'CAT-2', name: 'الحلويات الشرقية التامة', type: 'منتج تام جاهز', level: 1, itemCount: 24 },
  { id: 6, code: 'CAT-21', name: 'صواني الكنافات والبسبوسة', type: 'منتج تام جاهز', parentId: 5, level: 2, itemCount: 10 },
  { id: 7, code: 'CAT-22', name: 'البقلاوات والجلاش والمشكلات', type: 'منتج تام جاهز', parentId: 5, level: 2, itemCount: 14 },
  { id: 8, code: 'CAT-3', name: 'الحلويات الغربية والتورت', type: 'منتج تام جاهز', level: 1, itemCount: 16 },
  { id: 9, code: 'CAT-31', name: 'التورت والجاتوهات الفاخرة', type: 'منتج تام جاهز', parentId: 8, level: 2, itemCount: 11 },
  { id: 10, code: 'CAT-32', name: 'الموس والديسباسيتو والكب كيك', type: 'منتج تام جاهز', parentId: 8, level: 2, itemCount: 5 },
  { id: 11, code: 'CAT-4', name: 'مواد التعبئة والعلب والكرتون', type: 'تعبئة وتغليف', level: 1, itemCount: 8 },
];

const getInitialUomConversions = (): UomConversionRule[] => [
  { id: 1, itemId: 101, itemCode: 'MAT-01', itemName: 'دقيق فاخر استخراج 72%', baseUnit: 'كيلو', alternateUnit: 'شيكارة', conversionFactor: 50, operation: 'ضرب', notes: '1 شيكارة دقيق = 50 كجم للمطاحن' },
  { id: 2, itemId: 102, itemCode: 'MAT-02', itemName: 'سمن بلدي بقري طبيعي', baseUnit: 'كيلو', alternateUnit: 'صفيحة معدنية', conversionFactor: 16, operation: 'ضرب', notes: '1 صفيحة سمن صافي = 16 كجم' },
  { id: 3, itemId: 201, itemCode: 'PRD-101', itemName: 'بسبوسة مكسرات لوكس', baseUnit: 'كيلو', alternateUnit: 'صينية مقاس 50', conversionFactor: 3.5, operation: 'ضرب', notes: 'وزن الصينية الواحدة المخبوزة حوالي 3.5 كجم' },
  { id: 4, itemId: 301, itemCode: 'PRD-201', itemName: 'جاتوه سواريه مشكل', baseUnit: 'قطعة', alternateUnit: 'دستة', conversionFactor: 12, operation: 'ضرب', notes: '1 دستة = 12 قطعة جاتوه' },
];

export const fetchItemCategoriesApi = async (): Promise<ItemCategoryNode[]> => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialCategories();
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchUomConversionsApi = async (): Promise<UomConversionRule[]> => {
  const stored = localStorage.getItem(UOM_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialUomConversions();
  localStorage.setItem(UOM_KEY, JSON.stringify(initial));
  return initial;
};

export const saveCategoriesToLocal = (data: ItemCategoryNode[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data));
};

export const saveUomConversionsToLocal = (data: UomConversionRule[]) => {
  localStorage.setItem(UOM_KEY, JSON.stringify(data));
};
