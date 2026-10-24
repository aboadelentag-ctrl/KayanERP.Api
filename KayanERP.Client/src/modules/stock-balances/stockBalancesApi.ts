export interface StockBalanceViewDto {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  categoryName: string;
  warehouseId: number;
  warehouseName: string;
  branchId?: number | null;
  branchName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unit: string;
  reorderLevel: number;
  status: 'متوفر' | 'حد الطلب' | 'حرج (تحت حد الأمان)' | 'نفد الرصيد';
}

export interface StockKpiSummaryDto {
  totalItemsCount: number;
  totalAvailableQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  estimatedStock: number;
}

export interface BranchLookupItem {
  id: number;
  branchCode: string;
  branchName: string;
}

export interface WarehouseLookupItem {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  branchId?: number | null;
}

const STORAGE_BALANCES_KEY = 'kayan_stock_balances_data';

export const fallbackBranchesList: BranchLookupItem[] = [
  { id: 1, branchCode: 'BR-CENTRAL', branchName: 'المصنع والإدارة المركزية' },
  { id: 2, branchCode: 'BR-DKR', branchName: 'فرع ومعرض دكرنس الرئيسي' },
  { id: 3, branchCode: 'BR-SHR', branchName: 'فرع شربين (السوق القديم)' },
  { id: 4, branchCode: 'BR-MNT', branchName: 'فرع منية النصر التجاري' },
  { id: 5, branchCode: 'BR-MAN', branchName: 'معرض المنصورة - المشاية' },
];

export const fallbackWarehousesList: WarehouseLookupItem[] = [
  { id: 1, warehouseCode: 'WH-RAW-01', warehouseName: 'مستودع الخامات المركزي (المصنع)', branchId: 1 },
  { id: 2, warehouseCode: 'WH-FG-02', warehouseName: 'مستودع الكنترول وتسليم التام', branchId: 1 },
  { id: 3, warehouseCode: 'WH-DKR-01', warehouseName: 'ثلاجة ومخزن عرض فرع دكرنس', branchId: 2 },
  { id: 4, warehouseCode: 'WH-SHR-01', warehouseName: 'مستودع صالة بيع فرع شربين', branchId: 3 },
  { id: 5, warehouseCode: 'WH-MNT-01', warehouseName: 'مستودع استلام فرع منية النصر', branchId: 4 },
];

const initialStockBalances: StockBalanceViewDto[] = [
  {
    id: 1,
    itemId: 201,
    itemCode: 'RAW-FLOUR-72',
    itemName: 'دقيق فاخر استخراج 72%',
    categoryName: 'خامات ومواد أولية',
    warehouseId: 1,
    warehouseName: 'مستودع الخامات المركزي (المصنع)',
    branchId: 1,
    branchName: 'المصنع الرئيسي',
    quantity: 18550.0,
    reservedQuantity: 3000.0,
    availableQuantity: 15550.0,
    unit: 'كجم',
    reorderLevel: 5000,
    status: 'متوفر',
  },
  {
    id: 2,
    itemId: 202,
    itemCode: 'RAW-GHEE-NAT',
    itemName: 'سمن بلدي بقري طبيعي',
    categoryName: 'خامات ومواد أولية',
    warehouseId: 1,
    warehouseName: 'مستودع الخامات المركزي (المصنع)',
    branchId: 1,
    branchName: 'المصنع الرئيسي',
    quantity: 420.0,
    reservedQuantity: 50.0,
    availableQuantity: 370.0,
    unit: 'صفيحة (16 كجم)',
    reorderLevel: 100,
    status: 'متوفر',
  },
  {
    id: 3,
    itemId: 203,
    itemCode: 'RAW-PISTACHIO',
    itemName: 'فستق حلبي محمص مفروم',
    categoryName: 'مكسرات ومستلزمات حشو',
    warehouseId: 1,
    warehouseName: 'مستودع الخامات المركزي (المصنع)',
    branchId: 1,
    branchName: 'المصنع الرئيسي',
    quantity: 65.0,
    reservedQuantity: 40.0,
    availableQuantity: 25.0,
    unit: 'كجم',
    reorderLevel: 50,
    status: 'حد الطلب',
  },
  {
    id: 4,
    itemId: 204,
    itemCode: 'RAW-SUGAR-50',
    itemName: 'سكر بلوري أبيض نقي',
    categoryName: 'خامات ومواد أولية',
    warehouseId: 1,
    warehouseName: 'مستودع الخامات المركزي (المصنع)',
    branchId: 1,
    branchName: 'المصنع الرئيسي',
    quantity: 850.0,
    reservedQuantity: 100.0,
    availableQuantity: 750.0,
    unit: 'شيكارة (50 كجم)',
    reorderLevel: 200,
    status: 'متوفر',
  },
  {
    id: 5,
    itemId: 205,
    itemCode: 'FG-BAS-01',
    itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي',
    categoryName: 'منتج تام (شرقي)',
    warehouseId: 2,
    warehouseName: 'مستودع الكنترول وتسليم التام',
    branchId: 1,
    branchName: 'المصنع الرئيسي',
    quantity: 120.0,
    reservedQuantity: 45.0,
    availableQuantity: 75.0,
    unit: 'كجم',
    reorderLevel: 30,
    status: 'متوفر',
  },
  {
    id: 6,
    itemId: 205,
    itemCode: 'FG-BAS-01',
    itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي',
    categoryName: 'منتج تام (شرقي)',
    warehouseId: 3,
    warehouseName: 'ثلاجة ومخزن عرض فرع دكرنس',
    branchId: 2,
    branchName: 'فرع ومعرض دكرنس الرئيسي',
    quantity: 8.0,
    reservedQuantity: 0.0,
    availableQuantity: 8.0,
    unit: 'كجم',
    reorderLevel: 15,
    status: 'حرج (تحت حد الأمان)',
  },
  {
    id: 7,
    itemId: 206,
    itemCode: 'FG-TRT-03',
    itemName: 'تورتة شوكولاتة كروكانت ملكي مقاس 26',
    categoryName: 'حلويات غربية وتورت',
    warehouseId: 4,
    warehouseName: 'مستودع صالة بيع فرع شربين',
    branchId: 3,
    branchName: 'فرع شربين (السوق القديم)',
    quantity: 0.0,
    reservedQuantity: 0.0,
    availableQuantity: 0.0,
    unit: 'قطعة',
    reorderLevel: 5,
    status: 'نفد الرصيد',
  },
];

export const fetchStockBalancesApi = async (
  branchId = 0,
  warehouseId = 0,
  lowStockOnly = false
): Promise<{ balances: StockBalanceViewDto[]; kpis: StockKpiSummaryDto }> => {
  try {
    const params = new URLSearchParams();
    if (branchId > 0) params.append('branchId', branchId.toString());
    if (warehouseId > 0) params.append('warehouseId', warehouseId.toString());
    if (lowStockOnly) params.append('lowStockOnly', 'true');

    const [resBal, resKpis] = await Promise.all([
      fetch(`/api/stockbalances?${params.toString()}`),
      fetch(`/api/stockbalances/kpis?${params.toString()}`),
    ]);

    if (resBal.ok && resKpis.ok) {
      const balancesData = await resBal.json();
      const kpisData = await resKpis.json();
      if (Array.isArray(balancesData)) {
        return { balances: balancesData, kpis: kpisData };
      }
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_BALANCES_KEY);
  let list: StockBalanceViewDto[] = initialStockBalances;
  if (stored) {
    try { list = JSON.parse(stored); } catch {}
  } else {
    localStorage.setItem(STORAGE_BALANCES_KEY, JSON.stringify(initialStockBalances));
  }

  let filtered = [...list];
  if (branchId > 0) {
    filtered = filtered.filter((b) => b.branchId === branchId);
  }
  if (warehouseId > 0) {
    filtered = filtered.filter((b) => b.warehouseId === warehouseId);
  }
  if (lowStockOnly) {
    filtered = filtered.filter((b) => b.status === 'حد الطلب' || b.status === 'حرج (تحت حد الأمان)' || b.status === 'نفد الرصيد');
  }

  const totalItems = new Set(filtered.map((b) => b.itemId)).size;
  const totalQty = filtered.reduce((acc, curr) => acc + curr.availableQuantity, 0);
  const lowStock = filtered.filter((b) => b.status === 'حد الطلب' || b.status === 'حرج (تحت حد الأمان)').length;
  const outOfStock = filtered.filter((b) => b.status === 'نفد الرصيد').length;

  return {
    balances: filtered,
    kpis: {
      totalItemsCount: totalItems,
      totalAvailableQuantity: totalQty,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      estimatedStock: 2845000.0,
    },
  };
};

export const fetchStockLookupsApi = async () => {
  let branches = fallbackBranchesList;
  let warehouses = fallbackWarehousesList;

  try {
    const resSales = await fetch('/api/sales/lookups');
    if (resSales.ok) {
      const sData = await resSales.json();
      if (sData.branches && sData.branches.length > 0) {
        branches = sData.branches;
      }
    }
  } catch {}

  try {
    const resWh = await fetch('/api/warehouses');
    if (resWh.ok) {
      const whData = await resWh.json();
      if (Array.isArray(whData) && whData.length > 0) {
        warehouses = whData;
      }
    }
  } catch {}

  return { branches, warehouses };
};
