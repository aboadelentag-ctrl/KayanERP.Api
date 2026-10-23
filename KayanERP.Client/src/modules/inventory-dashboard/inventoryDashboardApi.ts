export interface StockItemStatus {
  id: number;
  itemCode: string;
  itemName: string;
  category: 'خامات أساسية' | 'مكسرات وحشوات' | 'سمن ودهون' | 'مواد تغليف';
  currentStock: number;
  reorderPoint: number; // حد إعادة الطلب
  safetyStock: number;  // رصيد الأمان
  unit: string;
  unitCost: number;     // تكلفة الوحدة
  totalValuation: number; // إجمالي القيمة التقديرية
  stockHealth: 'آمن وفير' | 'وصل لحد الطلب' | 'حرج تحت الأمان';
  activeLotsCount: number;
}

export interface StockCardMovement {
  id: number;
  itemCode: string;
  date: string;
  movementType: 'استلام توريد (وارد)' | 'صرف صالة تشغيل (منصرف)' | 'تسوية جردية';
  referenceNo: string;
  batchLotNo: string;
  quantityIn: number;
  quantityOut: number;
  runningBalance: number;
  unitCost: number;
  notes: string;
}

const STORAGE_ITEMS_KEY = 'kayan_stock_status_items';
const STORAGE_MOVEMENTS_KEY = 'kayan_stock_movements';

const getInitialItems = (): StockItemStatus[] => [
  {
    id: 1,
    itemCode: 'MAT-01',
    itemName: 'دقيق فاخر استخراج 72%',
    category: 'خامات أساسية',
    currentStock: 3200,
    reorderPoint: 2000,
    safetyStock: 1000,
    unit: 'كيلو',
    unitCost: 22,
    totalValuation: 70400,
    stockHealth: 'آمن وفير',
    activeLotsCount: 3,
  },
  {
    id: 2,
    itemCode: 'MAT-02',
    itemName: 'سمن بلدي طبيعي بقري',
    category: 'سمن ودهون',
    currentStock: 220,
    reorderPoint: 400,
    safetyStock: 200,
    unit: 'كيلو',
    unitCost: 240,
    totalValuation: 52800,
    stockHealth: 'وصل لحد الطلب',
    activeLotsCount: 2,
  },
  {
    id: 3,
    itemCode: 'MAT-03',
    itemName: 'فستق حلبي إكسترا مقشر',
    category: 'مكسرات وحشوات',
    currentStock: 45,
    reorderPoint: 80,
    safetyStock: 50,
    unit: 'كيلو',
    unitCost: 650,
    totalValuation: 29250,
    stockHealth: 'حرج تحت الأمان',
    activeLotsCount: 1,
  },
  {
    id: 4,
    itemCode: 'MAT-04',
    itemName: 'سكر أبيض نقي مكرر',
    category: 'خامات أساسية',
    currentStock: 4800,
    reorderPoint: 3000,
    safetyStock: 1500,
    unit: 'كيلو',
    unitCost: 30,
    totalValuation: 144000,
    stockHealth: 'آمن وفير',
    activeLotsCount: 4,
  },
];

const getInitialMovements = (): StockCardMovement[] => [
  {
    id: 1,
    itemCode: 'MAT-02',
    date: '2026-10-23',
    movementType: 'استلام توريد (وارد)',
    referenceNo: 'REC-QC-2026-002',
    batchLotNo: 'LOT-SM-4412',
    quantityIn: 100,
    quantityOut: 0,
    runningBalance: 220,
    unitCost: 240,
    notes: 'استلام شحنة سمن بلدي معتمدة من مزارع الوادي',
  },
  {
    id: 2,
    itemCode: 'MAT-02',
    date: '2026-10-22',
    movementType: 'صرف صالة تشغيل (منصرف)',
    referenceNo: 'MRQ-2026-001',
    batchLotNo: 'LOT-SM-4390',
    quantityIn: 0,
    quantityOut: 50,
    runningBalance: 120,
    unitCost: 240,
    notes: 'صرف لصالة تصنيع البسبوسة الشرقية',
  },
  {
    id: 3,
    itemCode: 'MAT-01',
    date: '2026-10-23',
    movementType: 'استلام توريد (وارد)',
    referenceNo: 'REC-QC-2026-001',
    batchLotNo: 'LOT-FL-9021',
    quantityIn: 1000,
    quantityOut: 0,
    runningBalance: 3200,
    unitCost: 22,
    notes: 'توريد شيكارات دقيق من مطاحن الدلتا',
  },
];

export const fetchStockStatusApi = async (): Promise<StockItemStatus[]> => {
  const stored = localStorage.getItem(STORAGE_ITEMS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  const initial = getInitialItems();
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchStockMovementsApi = async (): Promise<StockCardMovement[]> => {
  const stored = localStorage.getItem(STORAGE_MOVEMENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  const initial = getInitialMovements();
  localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(initial));
  return initial;
};

export const saveStockStatusToLocal = (data: StockItemStatus[]) => {
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(data));
};
