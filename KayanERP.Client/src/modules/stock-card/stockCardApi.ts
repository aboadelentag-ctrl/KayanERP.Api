export interface StockCardItemLookup {
  id: number;
  itemCode: string;
  itemName: string;
  categoryName: string;
  unit: string;
}

export interface StockCardWarehouseLookup {
  id: number;
  warehouseName: string;
  branchName?: string;
}

export interface StockCardMovementLine {
  id: number;
  movementDate: string;
  movementType: string;
  movementTypeLabel?: string;
  warehouseName: string;
  branchName?: string;
  batchNumber?: string;
  expiryDate?: string;
  inQuantity: number;
  outQuantity: number;
  balanceAfter: number;
  notes?: string;
}

export interface StockCardReportDto {
  itemId: number;
  itemCode: string;
  itemName: string;
  categoryName: string;
  unit: string;
  openingBalance: number;
  totalInbound: number;
  totalOutbound: number;
  closingBalance: number;
  lines: StockCardMovementLine[];
}

export interface StockCardLookupsResponse {
  items: StockCardItemLookup[];
  warehouses: StockCardWarehouseLookup[];
}

export const fallbackStockLookups: StockCardLookupsResponse = {
  items: [
    { id: 201, itemCode: 'RAW-FLOUR-72', itemName: 'دقيق فاخر استخراج 72%', categoryName: 'خامات ومواد أولية', unit: 'كجم' },
    { id: 202, itemCode: 'RAW-GHEE-NAT', itemName: 'سمن بلدي بقري طبيعي', categoryName: 'خامات ومواد أولية', unit: 'صفيحة (16 كجم)' },
    { id: 203, itemCode: 'RAW-PISTACHIO', itemName: 'فستق حلبي محمص مفروم', categoryName: 'مكسرات ومستلزمات حشو', unit: 'كجم' },
    { id: 204, itemCode: 'RAW-SUGAR-50', itemName: 'سكر بلوري أبيض نقي', categoryName: 'خامات ومواد أولية', unit: 'شيكارة (50 كجم)' },
    { id: 205, itemCode: 'FG-BAS-01', itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي', categoryName: 'منتج تام (شرقي)', unit: 'كجم' },
  ],
  warehouses: [
    { id: 1, warehouseName: 'مستودع الخامات المركزي (المصنع)', branchName: 'المصنع الرئيسي' },
    { id: 2, warehouseName: 'صالة تصنيع الحلويات الشرقية', branchName: 'صالة المعمل' },
    { id: 3, warehouseName: 'مستودع الكنترول وتسليم التام', branchName: 'المصنع الرئيسي' },
    { id: 11, warehouseName: 'ثلاجة ومخزن عرض فرع دكرنس', branchName: 'فرع دكرنس' },
    { id: 12, warehouseName: 'مستودع صالة بيع فرع شربين', branchName: 'فرع شربين' },
  ],
};

const initialSampleReport: Record<number, StockCardReportDto> = {
  201: {
    itemId: 201,
    itemCode: 'RAW-FLOUR-72',
    itemName: 'دقيق فاخر استخراج 72%',
    categoryName: 'خامات ومواد أولية',
    unit: 'كجم',
    openingBalance: 12000.0,
    totalInbound: 25000.0,
    totalOutbound: 18450.0,
    closingBalance: 18550.0,
    lines: [
      {
        id: 1,
        movementDate: '2026-10-20 09:15',
        movementType: 'PURCHASE_RECEIPT',
        warehouseName: 'مستودع الخامات المركزي (المصنع)',
        branchName: 'المصنع الرئيسي',
        batchNumber: 'LOT-2026-FL-90',
        expiryDate: '2027-04-20',
        inQuantity: 25000.0,
        outQuantity: 0,
        balanceAfter: 37000.0,
        notes: 'إذن توريد رقم PO-2026-14 من شركة مطاحن الدلتا معتمد بشهادة فحص COA',
      },
      {
        id: 2,
        movementDate: '2026-10-21 11:30',
        movementType: 'QC_SAMPLE',
        warehouseName: 'مستودع الخامات المركزي (المصنع)',
        branchName: 'معمل الجودة',
        batchNumber: 'LOT-2026-FL-90',
        expiryDate: '2027-04-20',
        inQuantity: 0,
        outQuantity: 50.0,
        balanceAfter: 36950.0,
        notes: 'سحب عينات الفحص المعملي للرطوبة ونقاء الجلوتين',
      },
      {
        id: 3,
        movementDate: '2026-10-22 08:00',
        movementType: 'PRODUCTION_ISSUE',
        warehouseName: 'صالة تصنيع الحلويات الشرقية',
        branchName: 'المصنع',
        batchNumber: 'LOT-2026-FL-90',
        expiryDate: '2027-04-20',
        inQuantity: 0,
        outQuantity: 12400.0,
        balanceAfter: 24550.0,
        notes: 'صرف خامات بناءً على أمر تشغيل رقم MO-2026-88 لوردية خبز البسبوسة والكنافة',
      },
      {
        id: 4,
        movementDate: '2026-10-23 14:00',
        movementType: 'PRODUCTION_ISSUE',
        warehouseName: 'صالة تصنيع الحلويات الشرقية',
        branchName: 'المصنع',
        batchNumber: 'LOT-2026-FL-90',
        expiryDate: '2027-04-20',
        inQuantity: 0,
        outQuantity: 6000.0,
        balanceAfter: 18550.0,
        notes: 'صرف استكمال خامات وردية المساء لصواني الرواني والمشبك',
      },
    ],
  },
  205: {
    itemId: 205,
    itemCode: 'FG-BAS-01',
    itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي',
    categoryName: 'منتج تام (شرقي)',
    unit: 'كجم',
    openingBalance: 0,
    totalInbound: 240.0,
    totalOutbound: 195.0,
    closingBalance: 45.0,
    lines: [
      {
        id: 11,
        movementDate: '2026-10-24 07:30',
        movementType: 'PRODUCTION_RECEIPT',
        warehouseName: 'مستودع الكنترول وتسليم التام',
        branchName: 'المصنع الرئيسي',
        batchNumber: 'LOT-2026-10-B1',
        expiryDate: '2026-10-27',
        inQuantity: 240.0,
        outQuantity: 0,
        balanceAfter: 240.0,
        notes: 'استلام صواني تام من صالة الشرقي معتمدة ومسواة بالأفران الدوارة',
      },
      {
        id: 12,
        movementDate: '2026-10-24 09:00',
        movementType: 'FG_TRANSFER_OUT',
        warehouseName: 'ثلاجة ومخزن عرض فرع دكرنس',
        branchName: 'فرع دكرنس',
        batchNumber: 'LOT-2026-10-B1',
        expiryDate: '2026-10-27',
        inQuantity: 0,
        outQuantity: 150.0,
        balanceAfter: 90.0,
        notes: 'شحن إمداد سيارة توزيع دكرنس بإذن تحويل رقم TRF-2026-001',
      },
      {
        id: 13,
        movementDate: '2026-10-24 10:15',
        movementType: 'FG_TRANSFER_OUT',
        warehouseName: 'مستودع صالة بيع فرع شربين',
        branchName: 'فرع شربين',
        batchNumber: 'LOT-2026-10-B1',
        expiryDate: '2026-10-27',
        inQuantity: 0,
        outQuantity: 45.0,
        balanceAfter: 45.0,
        notes: 'شحن صواني معرض شربين بإذن تحويل رقم TRF-2026-002',
      },
    ],
  },
};

export const fetchStockLookupsApi = async (): Promise<StockCardLookupsResponse> => {
  try {
    const res = await fetch('/api/stockcard/lookups');
    if (res.ok) {
      const data = await res.json();
      if (data && data.items && data.items.length > 0) return data;
    }
  } catch {}
  return fallbackStockLookups;
};

export const fetchStockCardLedgerApi = async (
  itemId: number,
  warehouseId = 0,
  fromDate?: string,
  toDate?: string
): Promise<StockCardReportDto> => {
  try {
    const params = new URLSearchParams({ itemId: itemId.toString() });
    if (warehouseId > 0) params.append('warehouseId', warehouseId.toString());
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const res = await fetch(`/api/stockcard/ledger?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch {}

  if (initialSampleReport[itemId]) {
    return initialSampleReport[itemId];
  }

  const itm = fallbackStockLookups.items.find((i) => i.id === itemId) || fallbackStockLookups.items[0];
  return {
    itemId: itm.id,
    itemCode: itm.itemCode,
    itemName: itm.itemName,
    categoryName: itm.categoryName,
    unit: itm.unit,
    openingBalance: 1000.0,
    totalInbound: 2500.0,
    totalOutbound: 1200.0,
    closingBalance: 2300.0,
    lines: [
      {
        id: Date.now(),
        movementDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
        movementType: 'PURCHASE_RECEIPT',
        warehouseName: 'مستودع الخامات المركزي (المصنع)',
        branchName: 'المصنع الرئيسي',
        batchNumber: `LOT-${new Date().getFullYear()}-01`,
        expiryDate: '2027-01-01',
        inQuantity: 2500.0,
        outQuantity: 0,
        balanceAfter: 3500.0,
        notes: 'إذن استلام وتوريد خامات معتمد',
      },
    ],
  };
};
