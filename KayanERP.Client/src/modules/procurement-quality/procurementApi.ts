export interface PurchaseOrder {
  id: number;
  poNumber: string;
  date: string;
  supplierName: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  status: 'معتمد قيد التوريد' | 'مسودة قيد المراجعة' | 'مكتمل ومستلم بالكامل' | 'ملغي';
  itemsCount: number;
  deliveryLocation: string; // مستودع الخامات الرئيسي / المصنع
  paymentTerms: string;
  notes: string;
}

export interface SupplierQualityCertificate {
  id: number;
  certNumber: string;
  supplierName: string;
  materialName: string;
  batchLotNo: string;
  issueDate: string;
  labName: string;
  purityScore: number; // درجة النقاء %
  moisturePercentage: number; // نسبة الرطوبة %
  coaStatus: 'شهادة COA معتمدة ومطابقة' | 'تحت الفحص المعملي' | 'غير مطابق لمواصفات سلامة الغذاء';
  inspectorNotes: string;
}

const STORAGE_PO_KEY = 'kayan_purchase_orders_data';
const STORAGE_COA_KEY = 'kayan_supplier_quality_coa_data';

const getInitialOrders = (): PurchaseOrder[] => [
  {
    id: 1,
    poNumber: 'PO-2026-101',
    date: '2026-10-21',
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    expectedDeliveryDate: '2026-10-23',
    totalAmount: 22000,
    status: 'مكتمل ومستلم بالكامل',
    itemsCount: 1,
    deliveryLocation: 'مستودع الخامات المركزي (المصنع)',
    paymentTerms: 'سداد نقدي عند الاستلام بعد فحص الجودة',
    notes: 'توريد شيكارات دقيق فاخر 72% استخراج أبيض',
  },
  {
    id: 2,
    poNumber: 'PO-2026-102',
    date: '2026-10-22',
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
    expectedDeliveryDate: '2026-10-24',
    totalAmount: 24000,
    status: 'معتمد قيد التوريد',
    itemsCount: 2,
    deliveryLocation: 'ثلاجات حفظ الخامات الحساسة',
    paymentTerms: 'آجل 15 يوم بعد اعتماد شهادة الفحص',
    notes: 'توريد صفائح سمن بلدي طبيعي معبأة معقمة',
  },
  {
    id: 3,
    poNumber: 'PO-2026-103',
    date: '2026-10-23',
    supplierName: 'الشركة السورية لاستيراد المكسرات',
    expectedDeliveryDate: '2026-10-26',
    totalAmount: 32500,
    status: 'معتمد قيد التوريد',
    itemsCount: 3,
    deliveryLocation: 'مستودع المكسرات والخامات الجافة',
    paymentTerms: 'شيك بنكي مؤجل 30 يوم',
    notes: 'طلبية فستق وبندق ولوز محمص محكم الإغلاق',
  },
];

const getInitialCoas = (): SupplierQualityCertificate[] => [
  {
    id: 1,
    certNumber: 'COA-2026-081',
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    materialName: 'دقيق فاخر استخراج 72%',
    batchLotNo: 'LOT-FL-9021',
    issueDate: '2026-10-21',
    labName: 'معامل جودة مطاحن الدلتا المركزية',
    purityScore: 99.4,
    moisturePercentage: 13.2,
    coaStatus: 'شهادة COA معتمدة ومطابقة',
    inspectorNotes: 'خالي من الشوائب ومعدل الجلوتين مطابق لمواصفات العجن والخبز',
  },
  {
    id: 2,
    certNumber: 'COA-2026-082',
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
    materialName: 'سمن بلدي طبيعي بقري',
    batchLotNo: 'LOT-SM-4412',
    issueDate: '2026-10-22',
    labName: 'معهد تكنولوجيا الأغذية بالمنصورة',
    purityScore: 98.8,
    moisturePercentage: 0.2,
    coaStatus: 'شهادة COA معتمدة ومطابقة',
    inspectorNotes: 'حموضة منخفضة ومطابق لرائحة وطعم السمن البلدي الأصلي',
  },
];

export const fetchPurchaseOrdersApi = async (): Promise<PurchaseOrder[]> => {
  const stored = localStorage.getItem(STORAGE_PO_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialOrders();
  localStorage.setItem(STORAGE_PO_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchSupplierQualityApi = async (): Promise<SupplierQualityCertificate[]> => {
  const stored = localStorage.getItem(STORAGE_COA_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialCoas();
  localStorage.setItem(STORAGE_COA_KEY, JSON.stringify(initial));
  return initial;
};

export const savePurchaseOrdersToLocal = (data: PurchaseOrder[]) => {
  localStorage.setItem(STORAGE_PO_KEY, JSON.stringify(data));
};

export const saveSupplierQualityToLocal = (data: SupplierQualityCertificate[]) => {
  localStorage.setItem(STORAGE_COA_KEY, JSON.stringify(data));
};
