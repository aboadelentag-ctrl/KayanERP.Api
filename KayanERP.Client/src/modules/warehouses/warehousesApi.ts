export interface WarehouseDto {
  id: number;
  branchId: number;
  branchName?: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: 'خامات' | 'منتج تام' | 'معرض' | 'صالة تشغيل' | 'تالف وهوالك';
  parentWarehouseId?: number | null;
  parentWarehouseName?: string | null;
  description?: string;
  active: boolean;
}

export interface BranchLookupDto {
  id: number;
  branchCode: string;
  branchName: string;
}

const STORAGE_WAREHOUSES_KEY = 'kayan_warehouses_data';
const STORAGE_BRANCHES_LOOKUP_KEY = 'kayan_branches_lookup_data';

const initialBranches: BranchLookupDto[] = [
  { id: 1, branchCode: 'MAIN', branchName: 'الفرع الرئيسي - المصنع' },
  { id: 2, branchCode: 'DKR', branchName: 'فرع دكرنس' },
  { id: 3, branchCode: 'SHR', branchName: 'فرع شربين' },
  { id: 4, branchCode: 'MNT', branchName: 'فرع منية النصر' },
];

const initialWarehouses: WarehouseDto[] = [
  {
    id: 1,
    branchId: 1,
    branchName: 'الفرع الرئيسي - المصنع',
    warehouseCode: 'WH-RAW-01',
    warehouseName: 'مستودع الخامات المركزي (المصنع)',
    warehouseType: 'خامات',
    parentWarehouseId: null,
    parentWarehouseName: null,
    description: 'المستودع الرئيسي لاستلام الدقيق والسكر والزيوت والمكسرات',
    active: true,
  },
  {
    id: 2,
    branchId: 1,
    branchName: 'الفرع الرئيسي - المصنع',
    warehouseCode: 'WH-PRD-01',
    warehouseName: 'مستودع التبريد للمنتج التام',
    warehouseType: 'منتج تام',
    parentWarehouseId: 1,
    parentWarehouseName: 'مستودع الخامات المركزي (المصنع)',
    description: 'غرف التبريد لحفظ صواني البسبوسة والكنافة والتورت قبل الشحن',
    active: true,
  },
  {
    id: 3,
    branchId: 1,
    branchName: 'الفرع الرئيسي - المصنع',
    warehouseCode: 'WH-LINE-01',
    warehouseName: 'مستودع صالة الشرقي (وسيط التشغيل)',
    warehouseType: 'صالة تشغيل',
    parentWarehouseId: 1,
    parentWarehouseName: 'مستودع الخامات المركزي (المصنع)',
    description: 'صالة تصنيع الحلويات الشرقية لحفظ خامات الوردية الجارية',
    active: true,
  },
  {
    id: 4,
    branchId: 2,
    branchName: 'فرع دكرنس',
    warehouseCode: 'WH-DKR-SHOW',
    warehouseName: 'مستودع معرض دكرنس',
    warehouseType: 'معرض',
    parentWarehouseId: null,
    parentWarehouseName: null,
    description: 'ثلاجات العرض وصالة بيع الحلويات لفرع دكرنس',
    active: true,
  },
  {
    id: 5,
    branchId: 1,
    branchName: 'الفرع الرئيسي - المصنع',
    warehouseCode: 'WH-DMG-01',
    warehouseName: 'مستودع المرتجعات والهوالك',
    warehouseType: 'تالف وهوالك',
    parentWarehouseId: 1,
    parentWarehouseName: 'مستودع الخامات المركزي (المصنع)',
    description: 'حصر أواني وكسر الحلويات المرتجعة لفحص أسباب التلف',
    active: true,
  },
];

export const fetchBranchesLookupApi = async (): Promise<BranchLookupDto[]> => {
  try {
    const res = await fetch('/api/warehouses/branches');
    if (res.ok) return await res.json();
  } catch {}
  
  const stored = localStorage.getItem(STORAGE_BRANCHES_LOOKUP_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_BRANCHES_LOOKUP_KEY, JSON.stringify(initialBranches));
  return initialBranches;
};

export const fetchWarehousesApi = async (branchId = 0): Promise<WarehouseDto[]> => {
  try {
    const url = branchId > 0 ? `/api/warehouses?branchId=${branchId}` : '/api/warehouses';
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_WAREHOUSES_KEY);
  let list: WarehouseDto[] = initialWarehouses;
  if (stored) {
    try { list = JSON.parse(stored); } catch {}
  } else {
    localStorage.setItem(STORAGE_WAREHOUSES_KEY, JSON.stringify(initialWarehouses));
  }

  if (branchId > 0) {
    return list.filter((w) => w.branchId === branchId);
  }
  return list;
};

export const saveWarehouseApi = async (warehouse: WarehouseDto): Promise<WarehouseDto> => {
  try {
    const method = warehouse.id > 0 ? 'PUT' : 'POST';
    const url = warehouse.id > 0 ? `/api/warehouses/${warehouse.id}` : '/api/warehouses';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(warehouse),
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback محلي
  const stored = localStorage.getItem(STORAGE_WAREHOUSES_KEY);
  let list: WarehouseDto[] = stored ? JSON.parse(stored) : initialWarehouses;

  if (warehouse.id > 0) {
    list = list.map((w) => (w.id === warehouse.id ? warehouse : w));
  } else {
    warehouse.id = Date.now();
    list = [warehouse, ...list];
  }
  localStorage.setItem(STORAGE_WAREHOUSES_KEY, JSON.stringify(list));
  return warehouse;
};

export const deleteWarehouseApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_WAREHOUSES_KEY);
  if (stored) {
    let list: WarehouseDto[] = JSON.parse(stored);
    list = list.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_WAREHOUSES_KEY, JSON.stringify(list));
  }
  return true;
};
