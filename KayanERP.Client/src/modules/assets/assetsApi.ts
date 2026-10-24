export interface AssetHistoryEvent {
  date: string;
  eventType: string;
  description: string;
  performedByCode: string;
  performedByName: string;
  costImpact: string;
}

export interface FixedAssetModel {
  id: number;
  assetCode: string;
  name: string;
  department: string;
  category?: string;
  brandModel?: string;
  serialNumber?: string;
  custodianCode: string;
  custodianName: string;
  installationDate: string;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE';
  activeSOSTaskNumber?: string | null;
  historyLogs: AssetHistoryEvent[];
}

export interface CirculatingContainerModel {
  id: number;
  containerName: string;
  specification: string;
  totalFactoryQuantity: number;
  inProductionFloorQuantity: number;
  inPackagingWarehouseQuantity: number;
  withDriversAndBranchesQuantity: number;
  disputedQuantity: number;
  damagedQuantity: number;
}

export interface CrateHandoverMovementModel {
  id: number;
  movementNumber: string;
  createdAt: string;
  movementType: 'DISPATCH_BRANCH' | 'RETURN_FACTORY';
  containerName: string;
  dispatchedQuantity: number;
  sourceLocation: string;
  dispatchedByCode: string;
  dispatchedByName: string;
  destinationLocation: string;
  status: 'PENDING_RECEIPT' | 'COMPLETED' | 'DISPUTED' | 'RESOLVED';
  receivedQuantity: number;
  shortageQuantity: number;
  damagedCount: number;
  receivedByCode?: string | null;
  receivedByName?: string | null;
  receiveNotes?: string | null;
}

export interface DepartmentApiDto {
  id: number;
  departmentName?: string;
  name?: string;
  displayName: string;
}

export interface EmployeeQuickDto {
  id: number;
  code?: string;
  fullName?: string;
  name?: string;
  displayCode: string;
  displayName: string;
}

export interface DispatchCrateDto {
  movementType: 'DISPATCH_BRANCH' | 'RETURN_FACTORY';
  containerName: string;
  dispatchedQuantity: number;
  sourceLocation: string;
  destinationLocation: string;
  notes?: string;
  dispatchedByCode?: string;
  dispatchedByName?: string;
}

export interface ReceiveCrateDto {
  actualReceivedQuantity: number;
  damagedCount: number;
  receiveNotes?: string;
  receivedByCode?: string;
  receivedByName?: string;
}

export interface SettleDisputeDto {
  arbitrationDecision: string;
  arbitrationText: string;
  financialPenalty: number;
  arbitratedByCode?: string;
  arbitratedByName?: string;
}

const STORAGE_FIXED_ASSETS_KEY = 'kayan_fixed_assets_v2';
const STORAGE_CRATES_INV_KEY = 'kayan_crates_inventory_v2';
const STORAGE_CRATES_MOV_KEY = 'kayan_crates_movements_v2';

export const fallbackDepartmentsList: DepartmentApiDto[] = [
  { id: 100, departmentName: 'قسم الشرقي والمخبوزات', displayName: 'قسم الشرقي والمخبوزات' },
  { id: 200, departmentName: 'قسم الجاتوه والتورت والحلويات الغربية', displayName: 'قسم الجاتوه والتورت والحلويات الغربية' },
  { id: 300, departmentName: 'معمل الشوكولاتة والتزيين والصب', displayName: 'معمل الشوكولاتة والتزيين والصب' },
  { id: 400, departmentName: 'مستودع التعبئة والتغليف والتوزيع', displayName: 'مستودع التعبئة والتغليف والتوزيع' },
  { id: 500, departmentName: 'إدارة الصيانة والتشغيل المركزي', displayName: 'إدارة الصيانة والتشغيل المركزي' },
];

export const fallbackEmployeesList: EmployeeQuickDto[] = [
  { id: 1, code: 'EMP-001', fullName: 'أحمد محمود (شيف صالة الشرقي)', displayCode: 'EMP-001', displayName: 'أحمد محمود (شيف صالة الشرقي)' },
  { id: 2, code: 'EMP-002', fullName: 'طارق عبدالرحيم (شيف الجاتوه)', displayCode: 'EMP-002', displayName: 'طارق عبدالرحيم (شيف الجاتوه)' },
  { id: 3, code: 'EMP-003', fullName: 'رمضان عبدالعليم (مسؤول الحركة والتوزيع)', displayCode: 'EMP-003', displayName: 'رمضان عبدالعليم (مسؤول الحركة والتوزيع)' },
  { id: 4, code: 'EMP-004', fullName: 'م. إبراهيم الجندي (مدير الصيانة المركزية)', displayCode: 'EMP-004', displayName: 'م. إبراهيم الجندي (مدير الصيانة المركزية)' },
];

export const initialFixedAssets: FixedAssetModel[] = [
  {
    id: 1,
    assetCode: 'AST-OVEN-01',
    name: 'فرن دوار إيطالي 18 صاج توربو',
    department: 'قسم الشرقي والمخبوزات',
    category: 'أفران وتسوية',
    brandModel: 'Polin Rotary Rack 18',
    serialNumber: 'POL-2024-8841',
    custodianCode: 'EMP-001',
    custodianName: 'أحمد محمود',
    installationDate: '2024-05-10',
    status: 'OPERATIONAL',
    activeSOSTaskNumber: null,
    historyLogs: [
      { date: '2026-08-15', eventType: 'صيانة دورية', description: 'تغيير سيور المروحة وفحص حساسات الحرارة', performedByCode: 'EMP-004', performedByName: 'م. إبراهيم الجندي', costImpact: '1,200 ج.م' },
    ],
  },
  {
    id: 2,
    assetCode: 'AST-MIX-02',
    name: 'عجانة حلواني حلزونية سعة 120 لتر',
    department: 'قسم الشرقي والمخبوزات',
    category: 'عجانات ومضارب',
    brandModel: 'Sveba Dahlen Spiral-120',
    serialNumber: 'SVE-2023-9912',
    custodianCode: 'EMP-001',
    custodianName: 'أحمد محمود',
    installationDate: '2023-11-20',
    status: 'UNDER_MAINTENANCE',
    activeSOSTaskNumber: 'EMG-20261024-701',
    historyLogs: [
      { date: '2026-10-24', eventType: 'عطل طارئ', description: 'صوت احتكاك غير طبيعي في التروس الرئيسية', performedByCode: 'EMP-001', performedByName: 'أحمد محمود', costImpact: 'قيد التقدير' },
    ],
  },
  {
    id: 3,
    assetCode: 'AST-FRG-03',
    name: 'غرفة تجميد وصدمات سريعة (Blast Freezer)',
    department: 'قسم الجاتوه والتورت والحلويات الغربية',
    category: 'ثلاجات وتبريد',
    brandModel: 'Friulinox B-Freezer 40',
    serialNumber: 'FRI-2025-1102',
    custodianCode: 'EMP-002',
    custodianName: 'طارق عبدالرحيم',
    installationDate: '2025-02-15',
    status: 'OPERATIONAL',
    activeSOSTaskNumber: null,
    historyLogs: [],
  },
  {
    id: 4,
    assetCode: 'AST-PKG-04',
    name: 'ماكينة تغليف شرنك وسيلر حراري أوتوماتيك',
    department: 'مستودع التعبئة والتغليف والتوزيع',
    category: 'تغليف وتعبئة',
    brandModel: 'Smipack FP560A',
    serialNumber: 'SMI-2024-3420',
    custodianCode: 'EMP-003',
    custodianName: 'رمضان عبدالعليم',
    installationDate: '2024-09-01',
    status: 'OUT_OF_SERVICE',
    activeSOSTaskNumber: 'EMG-20261020-312',
    historyLogs: [
      { date: '2026-10-20', eventType: 'عطل حرج', description: 'تلف وحدة التحكم الإلكترونية وسخانات القص', performedByCode: 'EMP-004', performedByName: 'م. إبراهيم الجندي', costImpact: '5,800 ج.م' },
    ],
  },
];

export const initialCirculatingContainers: CirculatingContainerModel[] = [
  {
    id: 1,
    containerName: 'سبت بلاستيك قياسي مضلع للحلويات',
    specification: 'أبعاد 60×40×15 سم - بلاستيك غذائي بولي إيثيلين عالي الكثافة HDPE',
    totalFactoryQuantity: 1800,
    inProductionFloorQuantity: 420,
    inPackagingWarehouseQuantity: 650,
    withDriversAndBranchesQuantity: 680,
    disputedQuantity: 35,
    damagedQuantity: 15,
  },
  {
    id: 2,
    containerName: 'صاج ألومنيوم شرقي مخبوزات 40*60',
    specification: 'سمك 1.8 مم حافة 2 سم مدموغ كود أبو عادل المصنعي',
    totalFactoryQuantity: 2400,
    inProductionFloorQuantity: 1100,
    inPackagingWarehouseQuantity: 850,
    withDriversAndBranchesQuantity: 420,
    disputedQuantity: 20,
    damagedQuantity: 10,
  },
  {
    id: 3,
    containerName: 'قواعد وتريهات خشبية لنقل التورت',
    specification: 'تريهات تبطين خشب زان مقاسات متعددة للأفراح والمناسبات',
    totalFactoryQuantity: 350,
    inProductionFloorQuantity: 80,
    inPackagingWarehouseQuantity: 120,
    withDriversAndBranchesQuantity: 140,
    disputedQuantity: 8,
    damagedQuantity: 2,
  },
];

export const initialCrateMovements: CrateHandoverMovementModel[] = [
  {
    id: 1,
    movementNumber: 'CRATE-MOV-2026-001',
    createdAt: '2026-10-24 09:30',
    movementType: 'DISPATCH_BRANCH',
    containerName: 'سبت بلاستيك قياسي مضلع للحلويات',
    dispatchedQuantity: 50,
    sourceLocation: 'مستودع التعبئة المركزي بالمصنع',
    dispatchedByCode: 'EMP-003',
    dispatchedByName: 'رمضان عبدالعليم',
    destinationLocation: 'فرع ومعرض دكرنس الرئيسي',
    status: 'PENDING_RECEIPT',
    receivedQuantity: 0,
    shortageQuantity: 0,
    damagedCount: 0,
    receivedByCode: null,
    receivedByName: null,
    receiveNotes: null,
  },
  {
    id: 2,
    movementNumber: 'CRATE-MOV-2026-002',
    createdAt: '2026-10-23 16:15',
    movementType: 'DISPATCH_BRANCH',
    containerName: 'صاج ألومنيوم شرقي مخبوزات 40*60',
    dispatchedQuantity: 60,
    sourceLocation: 'صالة تصنيع الشرقي',
    dispatchedByCode: 'EMP-001',
    dispatchedByName: 'أحمد محمود',
    destinationLocation: 'فرع شربين (السوق القديم)',
    status: 'DISPUTED',
    receivedQuantity: 55,
    shortageQuantity: 3,
    damagedCount: 2,
    receivedByCode: 'EMP-012',
    receivedByName: 'محمود سلامة (مشرف شربين)',
    receiveNotes: 'عجز 3 صيجان وكسر صاجين أثناء التفريغ السريع',
  },
  {
    id: 3,
    movementNumber: 'CRATE-MOV-2026-003',
    createdAt: '2026-10-23 11:00',
    movementType: 'RETURN_FACTORY',
    containerName: 'سبت بلاستيك قياسي مضلع للحلويات',
    dispatchedQuantity: 80,
    sourceLocation: 'معرض المنصورة - المشاية',
    dispatchedByCode: 'EMP-015',
    dispatchedByName: 'ياسر القاضي',
    destinationLocation: 'مستودع التعبئة المركزي بالمصنع',
    status: 'COMPLETED',
    receivedQuantity: 80,
    shortageQuantity: 0,
    damagedCount: 0,
    receivedByCode: 'EMP-003',
    receivedByName: 'رمضان عبدالعليم',
    receiveNotes: 'استلام مطابق ونظيف بالكامل ✓',
  },
];

export const fetchFixedAssetsApi = async (): Promise<FixedAssetModel[]> => {
  try {
    const res = await fetch('/api/FixedAssets');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_FIXED_ASSETS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_FIXED_ASSETS_KEY, JSON.stringify(initialFixedAssets));
  return initialFixedAssets;
};

export const fetchCirculatingInventoryApi = async (): Promise<CirculatingContainerModel[]> => {
  try {
    const res = await fetch('/api/Crates/inventory');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_CRATES_INV_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_CRATES_INV_KEY, JSON.stringify(initialCirculatingContainers));
  return initialCirculatingContainers;
};

export const fetchCrateMovementsApi = async (statusFilter = ''): Promise<CrateHandoverMovementModel[]> => {
  try {
    const url = statusFilter ? `/api/Crates/movements?status=${statusFilter}` : '/api/Crates/movements';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_CRATES_MOV_KEY);
  let list: CrateHandoverMovementModel[] = initialCrateMovements;
  if (stored) {
    try { list = JSON.parse(stored); } catch {}
  } else {
    localStorage.setItem(STORAGE_CRATES_MOV_KEY, JSON.stringify(initialCrateMovements));
  }

  if (statusFilter) {
    return list.filter((m) => m.status === statusFilter);
  }
  return list;
};

export const saveFixedAssetApi = async (asset: Partial<FixedAssetModel>): Promise<FixedAssetModel> => {
  try {
    const url = asset.id && asset.id > 0 ? `/api/FixedAssets/${asset.id}` : '/api/FixedAssets';
    const method = asset.id && asset.id > 0 ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_FIXED_ASSETS_KEY);
  let list: FixedAssetModel[] = stored ? JSON.parse(stored) : initialFixedAssets;

  let savedAsset: FixedAssetModel;
  if (asset.id && asset.id > 0) {
    list = list.map((a) => {
      if (a.id === asset.id) {
        savedAsset = { ...a, ...asset } as FixedAssetModel;
        return savedAsset;
      }
      return a;
    });
  } else {
    savedAsset = {
      id: Date.now(),
      assetCode: asset.assetCode || `AST-${Date.now().toString().slice(-4)}`,
      name: asset.name || 'ماكينة جديدة',
      department: asset.department || 'قسم الشرقي والمخبوزات',
      category: asset.category || 'أفران وتسوية',
      brandModel: asset.brandModel || '---',
      serialNumber: asset.serialNumber || '---',
      custodianCode: asset.custodianCode || 'EMP-001',
      custodianName: asset.custodianName || 'أحمد محمود',
      installationDate: new Date().toISOString().slice(0, 10),
      status: asset.status || 'OPERATIONAL',
      activeSOSTaskNumber: null,
      historyLogs: [],
    };
    list = [savedAsset, ...list];
  }

  localStorage.setItem(STORAGE_FIXED_ASSETS_KEY, JSON.stringify(list));
  return savedAsset!;
};

export const dispatchCrateApi = async (payload: DispatchCrateDto): Promise<CrateHandoverMovementModel> => {
  try {
    const res = await fetch('/api/Crates/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_CRATES_MOV_KEY);
  let list: CrateHandoverMovementModel[] = stored ? JSON.parse(stored) : initialCrateMovements;

  const newMovement: CrateHandoverMovementModel = {
    id: Date.now(),
    movementNumber: `CRATE-MOV-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    movementType: payload.movementType,
    containerName: payload.containerName,
    dispatchedQuantity: payload.dispatchedQuantity,
    sourceLocation: payload.sourceLocation,
    dispatchedByCode: payload.dispatchedByCode || 'EMP-003',
    dispatchedByName: payload.dispatchedByName || 'رمضان عبدالعليم',
    destinationLocation: payload.destinationLocation,
    status: 'PENDING_RECEIPT',
    receivedQuantity: 0,
    shortageQuantity: 0,
    damagedCount: 0,
  };

  list = [newMovement, ...list];
  localStorage.setItem(STORAGE_CRATES_MOV_KEY, JSON.stringify(list));
  return newMovement;
};

export const receiveCrateApi = async (
  movementId: number,
  payload: ReceiveCrateDto
): Promise<boolean> => {
  try {
    const res = await fetch(`/api/Crates/movements/${movementId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_CRATES_MOV_KEY);
  if (stored) {
    let list: CrateHandoverMovementModel[] = JSON.parse(stored);
    list = list.map((m) => {
      if (m.id === movementId) {
        const shortage = m.dispatchedQuantity - payload.actualReceivedQuantity;
        const isDisputed = shortage > 0 || payload.damagedCount > 0;
        return {
          ...m,
          receivedQuantity: payload.actualReceivedQuantity,
          shortageQuantity: Math.max(0, shortage),
          damagedCount: payload.damagedCount,
          receivedByCode: payload.receivedByCode,
          receivedByName: payload.receivedByName,
          receiveNotes: payload.receiveNotes,
          status: isDisputed ? 'DISPUTED' : 'COMPLETED',
        };
      }
      return m;
    });
    localStorage.setItem(STORAGE_CRATES_MOV_KEY, JSON.stringify(list));
  }
  return true;
};

export const settleDisputeApi = async (
  movementId: number,
  payload: SettleDisputeDto
): Promise<boolean> => {
  try {
    const res = await fetch(`/api/Crates/movements/${movementId}/settle-dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_CRATES_MOV_KEY);
  if (stored) {
    let list: CrateHandoverMovementModel[] = JSON.parse(stored);
    list = list.map((m) => {
      if (m.id === movementId) {
        return {
          ...m,
          status: 'RESOLVED',
          receiveNotes: `${m.receiveNotes || ''} | قرار التحكيم: ${payload.arbitrationDecision} - غرامة ${payload.financialPenalty} ج.م`,
        };
      }
      return m;
    });
    localStorage.setItem(STORAGE_CRATES_MOV_KEY, JSON.stringify(list));
  }
  return true;
};

export const triggerEmergencySOSApi = async (asset: FixedAssetModel, title: string, desc: string, senderName: string, senderCode: string) => {
  const taskNumber = `EMG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
  try {
    await fetch('/api/EmergencyTasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskNumber,
        title,
        description: desc,
        senderDepartment: asset.department,
        senderEmployeeCode: senderCode,
        senderEmployeeName: senderName,
        targetDepartment: 'إدارة الصيانة والتشغيل المركزي',
        priority: 'CRITICAL',
        targetResolutionMinutes: 30,
        status: 'PENDING',
        assetCode: asset.assetCode,
      }),
    });
  } catch {}

  await saveFixedAssetApi({
    ...asset,
    status: 'UNDER_MAINTENANCE',
    activeSOSTaskNumber: taskNumber,
    historyLogs: [
      {
        date: new Date().toISOString().slice(0, 10),
        eventType: 'عطل طارئ SOS',
        description: `${title}: ${desc}`,
        performedByCode: senderCode,
        performedByName: senderName,
        costImpact: 'قيد الإصلاح',
      },
      ...asset.historyLogs,
    ],
  });

  return taskNumber;
};
