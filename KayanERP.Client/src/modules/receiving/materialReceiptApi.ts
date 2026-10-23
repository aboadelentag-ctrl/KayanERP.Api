export interface MaterialReceiptInspection {
  id: number;
  receiptNumber: string;
  poNumber: string; // رقم أمر الشراء المرتبط
  supplierName: string;
  materialName: string;
  batchNumber: string; // رقم اللوط / التشغيلة
  receivedDate: string;
  expiryDate: string;
  quantityReceived: number;
  unit: string;
  truckTemperatureCelsius: number; // درجة حرارة كابينة النقل
  packagingCondition: 'سليم ومحكم الإغلاق' | 'تالف جزئياً' | 'غير مطابق';
  labTestResult: 'مطابق للمواصفات القياسية' | 'تحت الفحص المعملي' | 'مرفوض ملوث / غير مطابق';
  inspectorName: string; // مسؤول توكيد الجودة (QC Inspector)
  status: 'معتمد ومستلم بالمخزن' | 'معلق تحت الفحص' | 'مرفوض ومرتجع للمورد';
  notes: string;
}

const STORAGE_KEY = 'kayan_material_receipts';

const getInitialReceipts = (): MaterialReceiptInspection[] => [
  {
    id: 1,
    receiptNumber: 'REC-QC-2026-001',
    poNumber: 'PO-2026-101',
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    materialName: 'دقيق فاخر استخراج 72%',
    batchNumber: 'LOT-FL-9021',
    receivedDate: '2026-10-23',
    expiryDate: '2027-04-20',
    quantityReceived: 1000,
    unit: 'كيلو',
    truckTemperatureCelsius: 22,
    packagingCondition: 'سليم ومحكم الإغلاق',
    labTestResult: 'مطابق للمواصفات القياسية',
    inspectorName: 'د. مينا عادل (مسؤول جودة الأغذية)',
    status: 'معتمد ومستلم بالمخزن',
    notes: 'فحص الرطوبة ونسبة الجلوتين مطابق لمعايير تصنيع الحلويات',
  },
  {
    id: 2,
    receiptNumber: 'REC-QC-2026-002',
    poNumber: 'PO-2026-102',
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
    materialName: 'سمن بلدي بقري طبيعي',
    batchNumber: 'LOT-SM-4412',
    receivedDate: '2026-10-22',
    expiryDate: '2027-10-22',
    quantityReceived: 100,
    unit: 'كيلو',
    truckTemperatureCelsius: 6,
    packagingCondition: 'سليم ومحكم الإغلاق',
    labTestResult: 'مطابق للمواصفات القياسية',
    inspectorName: 'د. مينا عادل (مسؤول جودة الأغذية)',
    status: 'معتمد ومستلم بالمخزن',
    notes: 'تم قياس الحموضة والتأكد من خلوه من الزيوت المهدرجة',
  },
  {
    id: 3,
    receiptNumber: 'REC-QC-2026-003',
    poNumber: 'PO-2026-105',
    supplierName: 'الشركة السورية لاستيراد المكسرات',
    materialName: 'فستق حلبي محمص نمرة 1',
    batchNumber: 'LOT-PST-103',
    receivedDate: '2026-10-23',
    expiryDate: '2027-08-15',
    quantityReceived: 50,
    unit: 'كيلو',
    truckTemperatureCelsius: 24,
    packagingCondition: 'سليم ومحكم الإغلاق',
    labTestResult: 'تحت الفحص المعملي',
    inspectorName: 'أحمد فؤاد (فني استلام)',
    status: 'معلق تحت الفحص',
    notes: 'جاري فحص عينات الأفلاتوكسين والتأكد من جفاف الحبات',
  },
];

export const fetchMaterialReceiptsApi = async (): Promise<MaterialReceiptInspection[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  const initial = getInitialReceipts();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveMaterialReceiptsToLocal = (data: MaterialReceiptInspection[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
