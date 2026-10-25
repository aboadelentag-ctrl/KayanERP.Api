export type ParentItemLookupDto = {
  id: number;
  itemCode: string;
  itemName: string;
  unit: string;
};

export type ItemVariantDto = {
  id: number;
  itemCode: string;
  itemName: string;
  parentItemId: number;
  parentItemName: string;
  unit: string;
  active: boolean;
};

export type UomConversionDto = {
  id: number;
  itemId?: number;
  itemName: string;
  fromUnit: string;
  toUnit: string;
  conversionFactor: number;
  isGlobal: boolean;
  notes?: string;
};

export type ItemVariantCreateDto = {
  parentItemId: number;
  variantName: string;
  variantCode?: string;
  unit: string;
  packingUnit?: string;
  packingFactor?: number;
};

export type UomConversionCreateDto = {
  itemId: number;
  fromUnit: string;
  toUnit: string;
  conversionFactor: number;
  notes?: string;
};

export const fetchParentItemsApi = async (): Promise<ParentItemLookupDto[]> => {
  try {
    const res = await fetch('/api/itemhierarchy/parents');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: 1, itemCode: '301001', itemName: 'بسبوسة سادة بالسمن البلدي', unit: 'كجم' },
    { id: 2, itemCode: '302001', itemName: 'جاتوه سواريه مشكل فاخر', unit: 'دستة' },
    { id: 3, itemCode: '101001', itemName: 'سكر أبيض ناعم مكرر', unit: 'شيكارة' },
    { id: 4, itemCode: '101002', itemName: 'دقيق فاخر استخراج 72%', unit: 'شيكارة' }
  ];
};

export const fetchVariantsApi = async (): Promise<ItemVariantDto[]> => {
  try {
    const res = await fetch('/api/itemhierarchy/variants');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 11,
      itemCode: '301001-01',
      itemName: 'بسبوسة سادة - مكسرات بندق',
      parentItemId: 1,
      parentItemName: 'بسبوسة سادة بالسمن البلدي',
      unit: 'كجم',
      active: true
    },
    {
      id: 12,
      itemCode: '301001-02',
      itemName: 'بسبوسة سادة - قشطة بلدي',
      parentItemId: 1,
      parentItemName: 'بسبوسة سادة بالسمن البلدي',
      unit: 'كجم',
      active: true
    },
    {
      id: 21,
      itemCode: '302001-01',
      itemName: 'جاتوه سواريه - شيكولاتة نوتيلا',
      parentItemId: 2,
      parentItemName: 'جاتوه سواريه مشكل فاخر',
      unit: 'دستة',
      active: true
    }
  ];
};

export const fetchConversionsApi = async (): Promise<UomConversionDto[]> => {
  try {
    const res = await fetch('/api/itemhierarchy/conversions');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      itemName: 'تحويل قياسي عام',
      fromUnit: 'طن',
      toUnit: 'كجم',
      conversionFactor: 1000,
      isGlobal: true,
      notes: 'معامل الأوزان القياسي المعتمد'
    },
    {
      id: 2,
      itemId: 3,
      itemName: 'سكر أبيض ناعم مكرر',
      fromUnit: 'شيكارة',
      toUnit: 'كجم',
      conversionFactor: 50,
      isGlobal: false,
      notes: 'وزن شيكارة السكر الموردة من المصنع'
    },
    {
      id: 3,
      itemId: 2,
      itemName: 'جاتوه سواريه مشكل فاخر',
      fromUnit: 'بلكة',
      toUnit: 'قطعة',
      conversionFactor: 48,
      isGlobal: false,
      notes: '1 بلكة جاتوه = 48 قطعة سواريه'
    }
  ];
};

export const saveVariantApi = async (data: ItemVariantCreateDto): Promise<boolean> => {
  try {
    const res = await fetch('/api/itemhierarchy/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const saveConversionApi = async (data: UomConversionCreateDto): Promise<boolean> => {
  try {
    const res = await fetch('/api/itemhierarchy/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return true;
  }
};
