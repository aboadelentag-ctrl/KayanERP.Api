export interface FixedAsset {
  id: number;
  code: string;
  name: string;
  category: 'أفران وخطوط خبز' | 'عجانات ومعدات تحضير' | 'ثلاجات وتبريد مركزي' | 'أسطول سيارات وشاحنات التوزيع';
  branchId: number;
  branchName: string;
  purchaseDate: string;
  purchaseCost: number;
  depreciationRate: number; // نسبة الإهلاك السنوي %
  accumulatedDepreciation: number; // مجمع الإهلاك
  currentBookValue: number; // صافي القيمة الدفترية الحالية
  status: 'يعمل بكفاءة' | 'تحت الصيانة الوقائية' | 'معطل / إصلاح طارئ';
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
}

export interface MaintenanceRecord {
  id: number;
  assetId: number;
  assetCode: string;
  assetName: string;
  date: string;
  maintenanceType: 'صيانة وقائية دورية' | 'إصلاح طارئ وعمرة' | 'معايرة وفحص جودة';
  cost: number;
  technicianName: string;
  description: string;
  status: 'تمت الصيانة بنجاح' | 'قيد التنفيذ';
}

const ASSETS_KEY = 'kayan_fixed_assets_data';
const MAINTENANCE_KEY = 'kayan_maintenance_records';

const getInitialAssets = (): FixedAsset[] => [
  {
    id: 1,
    code: 'AST-OVN-01',
    name: 'فرن دوار تركي 2 عربة (صالة الشرقي)',
    category: 'أفران وخطوط خبز',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    purchaseDate: '2024-03-15',
    purchaseCost: 185000,
    depreciationRate: 10,
    accumulatedDepreciation: 37000,
    currentBookValue: 148000,
    status: 'يعمل بكفاءة',
    lastMaintenanceDate: '2026-09-10',
    nextMaintenanceDate: '2026-11-10',
  },
  {
    id: 2,
    code: 'AST-MXR-01',
    name: 'عجانة حلواني حلزونية سعة 150 كجم',
    category: 'عجانات ومعدات تحضير',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    purchaseDate: '2024-05-20',
    purchaseCost: 95000,
    depreciationRate: 12,
    accumulatedDepreciation: 22800,
    currentBookValue: 72200,
    status: 'يعمل بكفاءة',
    lastMaintenanceDate: '2026-10-01',
    nextMaintenanceDate: '2026-12-01',
  },
  {
    id: 3,
    code: 'AST-REF-02',
    name: 'غرفة تجميد وحفظ خامات مركزية (-18°C)',
    category: 'ثلاجات وتبريد مركزي',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    purchaseDate: '2023-11-10',
    purchaseCost: 240000,
    depreciationRate: 8,
    accumulatedDepreciation: 57600,
    currentBookValue: 182400,
    status: 'تحت الصيانة الوقائية',
    lastMaintenanceDate: '2026-10-20',
    nextMaintenanceDate: '2026-11-20',
  },
  {
    id: 4,
    code: 'AST-TRK-01',
    name: 'سيارة جامبو مجهزة بصندوق تبريد (خط المنصورة - دكرنس)',
    category: 'أسطول سيارات وشاحنات التوزيع',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    purchaseDate: '2025-01-15',
    purchaseCost: 520000,
    depreciationRate: 15,
    accumulatedDepreciation: 78000,
    currentBookValue: 442000,
    status: 'يعمل بكفاءة',
    lastMaintenanceDate: '2026-09-25',
    nextMaintenanceDate: '2026-11-25',
  },
];

const getInitialMaintenance = (): MaintenanceRecord[] => [
  {
    id: 1,
    assetId: 3,
    assetCode: 'AST-REF-02',
    assetName: 'غرفة تجميد وحفظ خامات مركزية (-18°C)',
    date: '2026-10-20',
    maintenanceType: 'صيانة وقائية دورية',
    cost: 4200,
    technicianName: 'م. حسام الدين (فني تبريد وتكييف)',
    description: 'شحن غاز فريون وتغيير فلاتر كمبروسر التبريد',
    status: 'تمت الصيانة بنجاح',
  },
  {
    id: 2,
    assetId: 1,
    assetCode: 'AST-OVN-01',
    assetName: 'فرن دوار تركي 2 عربة (صالة الشرقي)',
    date: '2026-09-10',
    maintenanceType: 'معايرة وفحص جودة',
    cost: 1800,
    technicianName: 'فني شركة أفران النيل',
    description: 'معايرة حساسات الحرارة وضبط ضغط ولاعات الغاز',
    status: 'تمت الصيانة بنجاح',
  },
];

export const fetchAssetsApi = async (): Promise<FixedAsset[]> => {
  const stored = localStorage.getItem(ASSETS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialAssets();
  localStorage.setItem(ASSETS_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchMaintenanceApi = async (): Promise<MaintenanceRecord[]> => {
  const stored = localStorage.getItem(MAINTENANCE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialMaintenance();
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveAssetsToLocal = (data: FixedAsset[]) => {
  localStorage.setItem(ASSETS_KEY, JSON.stringify(data));
};

export const saveMaintenanceToLocal = (data: MaintenanceRecord[]) => {
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(data));
};
