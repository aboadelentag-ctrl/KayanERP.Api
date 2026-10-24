export interface VendorQcScoreDto {
  supplierId: number;
  supplierName: string;
  totalShipments: number;
  totalReceivedQty: number;
  totalAcceptedQty: number;
  totalRejectedQty: number;
  acceptanceRate: number;
  qualityGrade: 'A' | 'B' | 'C';
  rejectionIncidentsCount: number;
}

export interface QcInspectionHistoryDto {
  movementId: number;
  inspectionDate: string;
  supplierId: number;
  supplierName: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  movementType: 'PURCHASE_RECEIPT' | 'REJECTED';
  quantity: number;
  notes: string;
}

const STORAGE_RATINGS_KEY = 'kayan_vendor_qc_ratings_data';
const STORAGE_HISTORY_KEY = 'kayan_vendor_qc_history_data';

const initialRatings: VendorQcScoreDto[] = [
  {
    supplierId: 1,
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    totalShipments: 12,
    totalReceivedQty: 24000,
    totalAcceptedQty: 23600,
    totalRejectedQty: 400,
    acceptanceRate: 98.3,
    qualityGrade: 'A',
    rejectionIncidentsCount: 1,
  },
  {
    supplierId: 2,
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
    totalShipments: 8,
    totalReceivedQty: 4800,
    totalAcceptedQty: 4800,
    totalRejectedQty: 0,
    acceptanceRate: 100.0,
    qualityGrade: 'A',
    rejectionIncidentsCount: 0,
  },
  {
    supplierId: 3,
    supplierName: 'الشركة السورية لاستيراد المكسرات',
    totalShipments: 6,
    totalReceivedQty: 3200,
    totalAcceptedQty: 2850,
    totalRejectedQty: 350,
    acceptanceRate: 89.1,
    qualityGrade: 'B',
    rejectionIncidentsCount: 2,
  },
  {
    supplierId: 4,
    supplierName: 'شركة سكر الحوامدية ومصانع الدلتا',
    totalShipments: 10,
    totalReceivedQty: 30000,
    totalAcceptedQty: 29800,
    totalRejectedQty: 200,
    acceptanceRate: 99.3,
    qualityGrade: 'A',
    rejectionIncidentsCount: 1,
  },
  {
    supplierId: 5,
    supplierName: 'مؤسسة النور لتوريد الزيوت ومواد التعبئة',
    totalShipments: 5,
    totalReceivedQty: 1500,
    totalAcceptedQty: 1200,
    totalRejectedQty: 300,
    acceptanceRate: 80.0,
    qualityGrade: 'C',
    rejectionIncidentsCount: 3,
  },
];

const initialHistory: QcInspectionHistoryDto[] = [
  {
    movementId: 101,
    inspectionDate: '2026-10-23 09:30',
    supplierId: 1,
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    itemId: 11,
    itemCode: 'RAW-FLOUR-72',
    itemName: 'دقيق فاخر استخراج 72%',
    movementType: 'PURCHASE_RECEIPT',
    quantity: 5000,
    notes: 'تم فحص نسبة الرطوبة والجلوتين ومطابقة شهادة COA برقم LOT-9021 - المفتش: د. مينا',
  },
  {
    movementId: 102,
    inspectionDate: '2026-10-22 11:15',
    supplierId: 2,
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
    itemId: 14,
    itemCode: 'RAW-GHEE-NAT',
    itemName: 'سمن بلدي طبيعي بقري معقم',
    movementType: 'PURCHASE_RECEIPT',
    quantity: 800,
    notes: 'حموضة ورائحة مطابقة للمواصفات القياسية المصرية وخالي من الزيوت النباتية',
  },
  {
    movementId: 103,
    inspectionDate: '2026-10-21 14:00',
    supplierId: 3,
    supplierName: 'الشركة السورية لاستيراد المكسرات',
    itemId: 19,
    itemCode: 'RAW-PIST-01',
    itemName: 'فستق حلبي إكسترا محمص مقشر',
    movementType: 'REJECTED',
    quantity: 350,
    notes: 'تم الرفض لوجود نسبة رطوبة زائدة عن الحدود المسموح بها وخطر التزنخ - تم عمل محضر إعدام/إرجاع',
  },
  {
    movementId: 104,
    inspectionDate: '2026-10-20 10:45',
    supplierId: 4,
    supplierName: 'شركة سكر الحوامدية ومصانع الدلتا',
    itemId: 12,
    itemCode: 'RAW-SUG-CRYS',
    itemName: 'سكر بلوري أبيض نقي معبأ 50 كجم',
    movementType: 'PURCHASE_RECEIPT',
    quantity: 10000,
    notes: 'الشكائر سليمة خالية من التكتل ودرجة الذوبان ممتازة لمعامل شربات الحلويات',
  },
  {
    movementId: 105,
    inspectionDate: '2026-10-18 16:20',
    supplierId: 5,
    supplierName: 'مؤسسة النور لتوريد الزيوت ومواد التعبئة',
    itemId: 30,
    itemCode: 'PKG-BOX-GOLD',
    itemName: 'علب حلويات شرقية لوكس بصمة ذهبية',
    movementType: 'REJECTED',
    quantity: 300,
    notes: 'عيوب في تغليف وتصنيع الكرتون وعدم مطابقة المقاس القياسي لصواني البسبوسة مقاس 50',
  },
];

export const fetchVendorQcRatingsApi = async (fromDate?: string, toDate?: string): Promise<VendorQcScoreDto[]> => {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const res = await fetch(`/api/VendorQc/ratings?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_RATINGS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(initialRatings));
  return initialRatings;
};

export const fetchVendorQcHistoryApi = async (fromDate?: string, toDate?: string): Promise<QcInspectionHistoryDto[]> => {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const res = await fetch(`/api/VendorQc/history?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_HISTORY_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(initialHistory));
  return initialHistory;
};
