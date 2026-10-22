export interface RequisitionItem {
  id: number;
  materialName: string;
  requestedQty: number;
  approvedQty: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface MaterialRequisition {
  id: number;
  requisitionNumber: string;
  date: string;
  productionOrderNumber: string;
  department: string;
  requestedBy: string;
  approvedBy: string;
  itemsCount: number;
  totalCost: number;
  status: 'معتمد ومنصرف' | 'معلق للموافقة' | 'مرفوض';
  items: RequisitionItem[];
}

const STORAGE_KEY = 'kayan_material_requisitions';

const getInitialRequisitions = (): MaterialRequisition[] => [
  {
    id: 1,
    requisitionNumber: 'REQ-2026-041',
    date: '2026-10-22',
    productionOrderNumber: 'PRD-ORD-2026-081',
    department: 'صالة تصنيع الحلويات الشرقية',
    requestedBy: 'الشيف سمير إبراهيم',
    approvedBy: 'م. إبراهيم (مدير التشغيل)',
    itemsCount: 4,
    totalCost: 2283,
    status: 'معتمد ومنصرف',
    items: [
      { id: 1, materialName: 'سميد بسبوسة فاخر', requestedQty: 12.24, approvedQty: 12.24, unit: 'كيلو', unitCost: 28, totalCost: 343 },
      { id: 2, materialName: 'سمن بلدي بقري طبيعي', requestedQty: 5.05, approvedQty: 5.05, unit: 'كيلو', unitCost: 240, totalCost: 1212 },
      { id: 3, materialName: 'سكر نقي أبيض', requestedQty: 6, approvedQty: 6, unit: 'كيلو', unitCost: 32, totalCost: 192 },
      { id: 4, materialName: 'بندق ولوز محمص', requestedQty: 2.06, approvedQty: 2.06, unit: 'كيلو', unitCost: 260, totalCost: 536 },
    ],
  },
  {
    id: 2,
    requisitionNumber: 'REQ-2026-042',
    date: '2026-10-22',
    productionOrderNumber: 'PRD-ORD-2026-082',
    department: 'صالة الكنافة والقطايف',
    requestedBy: 'الشيف نبيل محمود',
    approvedBy: 'قيد الاعتماد',
    itemsCount: 3,
    totalCost: 4935,
    status: 'معلق للموافقة',
    items: [
      { id: 1, materialName: 'كنافة شعر طازجة', requestedQty: 24, approvedQty: 0, unit: 'كيلو', unitCost: 35, totalCost: 840 },
      { id: 2, materialName: 'سمن بلدي صافي', requestedQty: 10.5, approvedQty: 0, unit: 'كيلو', unitCost: 240, totalCost: 2520 },
      { id: 3, materialName: 'شوكولاتة نوتيلا', requestedQty: 10.5, approvedQty: 0, unit: 'كيلو', unitCost: 150, totalCost: 1575 },
    ],
  },
];

export const fetchMaterialRequisitionsApi = async (): Promise<MaterialRequisition[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialRequisitions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveMaterialRequisitionsToLocal = (data: MaterialRequisition[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
