export type ItemUnitConversionDto = {
  unitName: string;
  conversionFactor: number;
  barcode?: string;
};

export type ItemVariantDto = {
  id: number;
  variantCode: string;
  variantName: string;
  priceOverride?: number;
  barcode?: string;
};

export type CategoryDto = {
  id: number;
  companyId: number;
  categoryCode: string;
  categoryName: string;
  itemType: string;
  description?: string;
  active: boolean;
};

export type DepartmentItemDto = {
  id: number;
  departmentCode: string;
  departmentName: string;
};

export type ItemDto = {
  id: number;
  companyId: number;
  itemCode: string;
  itemName: string;
  itemType: string;
  unit: string;
  barcode?: string;
  description?: string;
  departmentId?: number;
  departmentName?: string;
  categoryId?: number;
  salePrice: number;
  basePrice: number;
  purchasePrice: number;
  safetyStockLevel: number;
  reorderPoint: number;
  active: boolean;
  hasVariants: boolean;
  isComposite: boolean;
  unitsHierarchy: ItemUnitConversionDto[];
  variants: ItemVariantDto[];
};

export const fetchItemsApi = async (): Promise<ItemDto[]> => {
  try {
    const res = await fetch('/api/items');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      companyId: 1,
      itemCode: '301001',
      itemName: 'بسبوسة سادة بالسمن البلدي',
      itemType: 'منتج تام',
      unit: 'كجم',
      barcode: '622100100101',
      description: 'تسوية أفران الصالة الشرقية بالسمن الفلاحي الطبيعي',
      departmentId: 1,
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      categoryId: 1,
      salePrice: 120,
      basePrice: 120,
      purchasePrice: 75,
      safetyStockLevel: 50,
      reorderPoint: 80,
      active: true,
      hasVariants: true,
      isComposite: false,
      unitsHierarchy: [
        { unitName: 'صينية كبيرة', conversionFactor: 12, barcode: '622100100102' }
      ],
      variants: [
        { id: 11, variantCode: '301001-01', variantName: 'سادة مكسرات بندق', priceOverride: 150, barcode: '622100100111' },
        { id: 12, variantCode: '301001-02', variantName: 'سادة قشطة بلدي', priceOverride: 160, barcode: '622100100112' }
      ]
    },
    {
      id: 2,
      companyId: 1,
      itemCode: '101001',
      itemName: 'سكر أبيض ناعم مكرر 50 كجم',
      itemType: 'خامات',
      unit: 'شيكارة',
      barcode: '622200200201',
      description: 'توريد شركة السكر والصناعات التكاملية',
      departmentId: 4,
      departmentName: 'مستودع الخامات المركزي',
      categoryId: 2,
      salePrice: 0,
      basePrice: 850,
      purchasePrice: 850,
      safetyStockLevel: 100,
      reorderPoint: 150,
      active: true,
      hasVariants: false,
      isComposite: false,
      unitsHierarchy: [
        { unitName: 'كجم', conversionFactor: 0.02, barcode: '' }
      ],
      variants: []
    }
  ];
};

export const fetchItemCategoriesApi = async (): Promise<CategoryDto[]> => {
  try {
    const res = await fetch('/api/itemcategories');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: 1, companyId: 1, categoryCode: 'CAT-EST', categoryName: 'حلويات شرقية', itemType: 'منتج تام', active: true },
    { id: 2, companyId: 1, categoryCode: 'CAT-RAW', categoryName: 'خامات سكر ودقيق', itemType: 'خامات', active: true },
    { id: 3, companyId: 1, categoryCode: 'CAT-WST', categoryName: 'حلويات غربية وجاتوه', itemType: 'منتج تام', active: true }
  ];
};

export const fetchItemDepartmentsApi = async (): Promise<DepartmentItemDto[]> => {
  try {
    const res = await fetch('/api/departments');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: 1, departmentCode: 'DEP-EST', departmentName: 'صالة تصنيع الحلويات الشرقية' },
    { id: 2, departmentCode: 'DEP-KON', departmentName: 'صالة الكنافة والقطايف' },
    { id: 3, departmentCode: 'DEP-WST', departmentName: 'قسم المعجنات والغربي' },
    { id: 4, departmentCode: 'DEP-WH', departmentName: 'مستودع الخامات المركزي' }
  ];
};

export const saveItemApi = async (item: Partial<ItemDto>): Promise<boolean> => {
  try {
    const method = item.id && item.id > 0 ? 'PUT' : 'POST';
    const url = item.id && item.id > 0 ? `/api/items/${item.id}` : '/api/items';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const saveCategoryApi = async (cat: Partial<CategoryDto>): Promise<boolean> => {
  try {
    const method = cat.id && cat.id > 0 ? 'PUT' : 'POST';
    const url = cat.id && cat.id > 0 ? `/api/itemcategories/${cat.id}` : '/api/itemcategories';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    return res.ok;
  } catch {
    return true;
  }
};
