export interface BranchTransferViewItem {
  id: number;
  transferNumber: string;
  transferDate: string;
  sourceWarehouseName: string;
  destinationWarehouseName: string;
  destinationBranchName: string;
  destinationBranchId: number;
  destinationWarehouseId: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  unit: string;
  batchNumber: string;
  dispatchedQty: number;
  dispatchedCount: number;
  driverName?: string | null;
  vehicleNumber?: string | null;
  receivedQty?: number | null;
  receivedCount?: number | null;
  status: 'IN_TRANSIT' | 'RECEIVED' | 'IN_DISPUTE';
  disputeReason?: string | null;

  // حقول وسيطة للإجراءات الميدانية
  tempReceivedQty: number;
  tempReceivedCount: number;
  tempNotes: string;
  tempFinalQty: number;
  tempChargeTo: string;
}

export interface BranchLookupDto {
  id: number;
  branchName: string;
  branchCode: string;
}

export interface WarehouseLookupDto {
  id: number;
  warehouseName: string;
  branchId?: number | null;
}

export interface FinishedItemLookupDto {
  id: number;
  itemName: string;
  itemCode: string;
  unit: string;
}

export interface DispatchPayload {
  companyId: number;
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  destinationBranchId: number;
  itemId: number;
  batchNumber?: string;
  dispatchedQty: number;
  dispatchedCount: number;
  driverName?: string;
  vehicleNumber?: string;
  dispatcherName?: string;
  notes?: string;
}

const STORAGE_TRANSFERS_KEY = 'kayan_stock_transfers_v2';

export const fallbackBranches: BranchLookupDto[] = [
  { id: 1, branchName: 'فرع ومعرض دكرنس الرئيسي', branchCode: 'BR-DKR' },
  { id: 2, branchName: 'فرع شربين (السوق القديم)', branchCode: 'BR-SHR' },
  { id: 3, branchName: 'فرع منية النصر التجاري', branchCode: 'BR-MNT' },
  { id: 4, branchName: 'معرض المنصورة - المشاية', branchCode: 'BR-MAN' },
  { id: 5, branchName: 'فرع بلقاس', branchCode: 'BR-BLQ' },
];

export const fallbackWarehouses: WarehouseLookupDto[] = [
  { id: 1, warehouseName: 'مستودع الكنترول وتسليم التام (المصنع الرئيسي)', branchId: null },
  { id: 11, warehouseName: 'ثلاجة ومخزن عرض فرع دكرنس', branchId: 1 },
  { id: 12, warehouseName: 'مستودع صالة بيع فرع شربين', branchId: 2 },
  { id: 13, warehouseName: 'مستودع استلام فرع منية النصر', branchId: 3 },
  { id: 14, warehouseName: 'ثلاجة تبريد معرض المشاية - المنصورة', branchId: 4 },
  { id: 15, warehouseName: 'مستودع عرض وتخزين فرع بلقاس', branchId: 5 },
];

export const fallbackFinishedItems: FinishedItemLookupDto[] = [
  { id: 201, itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي', itemCode: 'FG-BAS-01', unit: 'كجم' },
  { id: 202, itemName: 'كنافة أساور نوتيلا وبندق إكسترا', itemCode: 'FG-KNA-02', unit: 'كجم' },
  { id: 203, itemName: 'تورتة شوكولاتة كروكانت ملكي مقاس 26', itemCode: 'FG-TRT-03', unit: 'قطعة' },
  { id: 204, itemName: 'مشكل شرقي لوكس (صواني ضيافة)', itemCode: 'FG-MIX-04', unit: 'كجم' },
  { id: 205, itemName: 'جاتوه سواريه مشكل فاخر', itemCode: 'FG-GAT-05', unit: 'دستة' },
];

const initialTransfers: BranchTransferViewItem[] = [
  {
    id: 1,
    transferNumber: 'TRF-2026-001',
    transferDate: '2026-10-24',
    sourceWarehouseName: 'مستودع الكنترول وتسليم التام (المصنع الرئيسي)',
    destinationWarehouseName: 'ثلاجة ومخزن عرض فرع دكرنس',
    destinationBranchName: 'فرع ومعرض دكرنس الرئيسي',
    destinationBranchId: 1,
    destinationWarehouseId: 11,
    itemId: 201,
    itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي',
    itemCode: 'FG-BAS-01',
    unit: 'كجم',
    batchNumber: 'LOT-2026-10-B1',
    dispatchedQty: 45.0,
    dispatchedCount: 15,
    driverName: 'رمضان عبد العليم',
    vehicleNumber: 'د ق ن 4912',
    receivedQty: null,
    receivedCount: null,
    status: 'IN_TRANSIT',
    disputeReason: null,
    tempReceivedQty: 45.0,
    tempReceivedCount: 15,
    tempNotes: '',
    tempFinalQty: 45.0,
    tempChargeTo: 'عهدة سائق التوزيع',
  },
  {
    id: 2,
    transferNumber: 'TRF-2026-002',
    transferDate: '2026-10-24',
    sourceWarehouseName: 'مستودع الكنترول وتسليم التام (المصنع الرئيسي)',
    destinationWarehouseName: 'مستودع صالة بيع فرع شربين',
    destinationBranchName: 'فرع شربين (السوق القديم)',
    destinationBranchId: 2,
    destinationWarehouseId: 12,
    itemId: 203,
    itemName: 'تورتة شوكولاتة كروكانت ملكي مقاس 26',
    itemCode: 'FG-TRT-03',
    unit: 'قطعة',
    batchNumber: 'LOT-2026-10-T8',
    dispatchedQty: 12.0,
    dispatchedCount: 12,
    driverName: 'صابر المنسي',
    vehicleNumber: 'ط ر س 2190',
    receivedQty: 10.0,
    receivedCount: 10,
    status: 'IN_DISPUTE',
    disputeReason: 'عجز قطعتين وتلف تورتة أثناء النقل المفاجئ',
    tempReceivedQty: 10.0,
    tempReceivedCount: 10,
    tempNotes: 'تم إثبات العجز بحضور السائق',
    tempFinalQty: 10.0,
    tempChargeTo: 'هدر وكسر أثناء النقل',
  },
  {
    id: 3,
    transferNumber: 'TRF-2026-003',
    transferDate: '2026-10-23',
    sourceWarehouseName: 'مستودع الكنترول وتسليم التام (المصنع الرئيسي)',
    destinationWarehouseName: 'ثلاجة تبريد معرض المشاية - المنصورة',
    destinationBranchName: 'معرض المنصورة - المشاية',
    destinationBranchId: 4,
    destinationWarehouseId: 14,
    itemId: 202,
    itemName: 'كنافة أساور نوتيلا وبندق إكسترا',
    itemCode: 'FG-KNA-02',
    unit: 'كجم',
    batchNumber: 'LOT-2026-10-K4',
    dispatchedQty: 30.0,
    dispatchedCount: 10,
    driverName: 'رمضان عبد العليم',
    vehicleNumber: 'د ق ن 4912',
    receivedQty: 30.0,
    receivedCount: 10,
    status: 'RECEIVED',
    disputeReason: null,
    tempReceivedQty: 30.0,
    tempReceivedCount: 10,
    tempNotes: 'استلام مطابق تماماً',
    tempFinalQty: 30.0,
    tempChargeTo: 'عهدة سائق التوزيع',
  },
];

export const fetchTransfersApi = async (companyId = 1): Promise<BranchTransferViewItem[]> => {
  try {
    const res = await fetch(`/api/BranchTransfers?companyId=${companyId}`);
    if (res.ok) {
      const data: any[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((t) => ({
          ...t,
          tempReceivedQty: t.receivedQty ?? t.dispatchedQty ?? 0,
          tempReceivedCount: t.receivedCount ?? t.dispatchedCount ?? 0,
          tempFinalQty: t.receivedQty ?? t.dispatchedQty ?? 0,
          tempChargeTo: 'عهدة سائق التوزيع',
          tempNotes: '',
        }));
      }
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_TRANSFERS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_TRANSFERS_KEY, JSON.stringify(initialTransfers));
  return initialTransfers;
};

export const fetchLookupsApi = async (companyId = 1) => {
  try {
    const res = await fetch(`/api/BranchTransfers/lookups?companyId=${companyId}`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    branches: fallbackBranches,
    warehouses: fallbackWarehouses,
    items: fallbackFinishedItems,
  };
};

export const dispatchTransferApi = async (payload: DispatchPayload): Promise<BranchTransferViewItem> => {
  try {
    const res = await fetch('/api/BranchTransfers/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_TRANSFERS_KEY);
  let list: BranchTransferViewItem[] = stored ? JSON.parse(stored) : initialTransfers;

  const branch = fallbackBranches.find((b) => b.id === payload.destinationBranchId);
  const wh = fallbackWarehouses.find((w) => w.id === payload.destinationWarehouseId);
  const itm = fallbackFinishedItems.find((i) => i.id === payload.itemId);

  const newTransfer: BranchTransferViewItem = {
    id: Date.now(),
    transferNumber: `TRF-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`,
    transferDate: new Date().toISOString().slice(0, 10),
    sourceWarehouseName: 'مستودع الكنترول وتسليم التام (المصنع الرئيسي)',
    destinationWarehouseName: wh ? wh.warehouseName : 'مستودع الفرع',
    destinationBranchName: branch ? branch.branchName : 'الفرع المستهدف',
    destinationBranchId: payload.destinationBranchId,
    destinationWarehouseId: payload.destinationWarehouseId,
    itemId: payload.itemId,
    itemName: itm ? itm.itemName : 'منتج تام',
    itemCode: itm ? itm.itemCode : 'FG-001',
    unit: itm ? itm.unit : 'كجم',
    batchNumber: payload.batchNumber || `LOT-${new Date().getFullYear()}-01`,
    dispatchedQty: payload.dispatchedQty,
    dispatchedCount: payload.dispatchedCount,
    driverName: payload.driverName || 'سائق الكنترول',
    vehicleNumber: payload.vehicleNumber || 'سيارة التوزيع 1',
    receivedQty: null,
    receivedCount: null,
    status: 'IN_TRANSIT',
    disputeReason: null,
    tempReceivedQty: payload.dispatchedQty,
    tempReceivedCount: payload.dispatchedCount,
    tempNotes: payload.notes || '',
    tempFinalQty: payload.dispatchedQty,
    tempChargeTo: 'عهدة سائق التوزيع',
  };

  list = [newTransfer, ...list];
  localStorage.setItem(STORAGE_TRANSFERS_KEY, JSON.stringify(list));
  return newTransfer;
};

export const receiveTransferApi = async (body: {
  transferId: number;
  receivedQty: number;
  receivedCount: number;
  receiverName: string;
  notes?: string;
}): Promise<boolean> => {
  try {
    const res = await fetch('/api/BranchTransfers/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_TRANSFERS_KEY);
  if (stored) {
    let list: BranchTransferViewItem[] = JSON.parse(stored);
    list = list.map((t) => {
      if (t.id === body.transferId) {
        const isDisputed = body.receivedQty < t.dispatchedQty || body.receivedCount < t.dispatchedCount;
        return {
          ...t,
          receivedQty: body.receivedQty,
          receivedCount: body.receivedCount,
          status: isDisputed ? 'IN_DISPUTE' : 'RECEIVED',
          disputeReason: isDisputed
            ? `عجز استلام: تم شحن (${t.dispatchedQty}) واستلام (${body.receivedQty}) بفارق (${(t.dispatchedQty - body.receivedQty).toFixed(1)} ${t.unit})`
            : null,
          tempFinalQty: body.receivedQty,
        };
      }
      return t;
    });
    localStorage.setItem(STORAGE_TRANSFERS_KEY, JSON.stringify(list));
  }
  return true;
};

export const resolveDisputeApi = async (body: {
  transferId: number;
  finalAcceptedQty: number;
  chargeTo: string;
  resolvedBy: string;
  notes?: string;
}): Promise<boolean> => {
  try {
    const res = await fetch('/api/BranchTransfers/resolve-dispute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_TRANSFERS_KEY);
  if (stored) {
    let list: BranchTransferViewItem[] = JSON.parse(stored);
    list = list.map((t) => {
      if (t.id === body.transferId) {
        return {
          ...t,
          receivedQty: body.finalAcceptedQty,
          status: 'RECEIVED',
          disputeReason: `تم فض النزاع: تحميل المسؤولية على [${body.chargeTo}]`,
        };
      }
      return t;
    });
    localStorage.setItem(STORAGE_TRANSFERS_KEY, JSON.stringify(list));
  }
  return true;
};
