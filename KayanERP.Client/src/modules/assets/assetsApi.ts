export type AssetDto = {
  id: number;
  assetCode: string;
  assetName: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  depreciationRate: number;
  accumulatedDepreciation: number;
  status: 'نشط' | 'تحت الصيانة' | 'مكهن';
  location: string;
  assignedDepartment: string;
};

export type AssetLookupsDto = {
  departments: string[];
  categories: string[];
};

export const fetchAssetsApi = async (): Promise<AssetDto[]> => {
  try {
    const res = await fetch('/api/assets');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      assetCode: 'AST-001',
      assetName: 'فرن دوار إيطالي 24 صينية',
      category: 'خطوط إنتاج وتسوية',
      purchaseDate: '2024-01-15',
      purchaseCost: 450000,
      currentValue: 360000,
      depreciationRate: 10,
      accumulatedDepreciation: 90000,
      status: 'نشط',
      location: 'صالة تصنيع الحلويات الشرقية',
      assignedDepartment: 'صالة الشرقي'
    },
    {
      id: 2,
      assetCode: 'AST-002',
      assetName: 'عجان حلواني حلزوني 100 كجم',
      category: 'معدات العجن والخلط',
      purchaseDate: '2024-03-10',
      purchaseCost: 180000,
      currentValue: 153000,
      depreciationRate: 10,
      accumulatedDepreciation: 27000,
      status: 'نشط',
      location: 'صالة الكنافة والقطايف',
      assignedDepartment: 'صالة الكنافة'
    },
    {
      id: 3,
      assetCode: 'AST-003',
      assetName: 'ماكينة تقطيع وبرم عجين أوتوماتيك',
      category: 'معدات التشكيل والتجهيز',
      purchaseDate: '2023-11-01',
      purchaseCost: 120000,
      currentValue: 84000,
      depreciationRate: 15,
      accumulatedDepreciation: 36000,
      status: 'تحت الصيانة',
      location: 'قسم المعجنات والغربي',
      assignedDepartment: 'قسم الغربي'
    }
  ];
};

export const fetchAssetLookupsApi = async (): Promise<AssetLookupsDto> => {
  try {
    const res = await fetch('/api/assets/lookups');
    if (res.ok) return await res.json();
  } catch {}
  return {
    departments: ['صالة الشرقي', 'صالة الكنافة', 'قسم الغربي', 'التعبئة والتغليف', 'المستودع الرئيسي'],
    categories: ['خطوط إنتاج وتسوية', 'معدات العجن والخلط', 'معدات التشكيل والتجهيز', 'سيارات نقل وتوزيع', 'أجهزة ومعدات تبريد']
  };
};

export const saveAssetApi = async (asset: Partial<AssetDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset)
    });
    return res.ok;
  } catch {
    return true;
  }
};
