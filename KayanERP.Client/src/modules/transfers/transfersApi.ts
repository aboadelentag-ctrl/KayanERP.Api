export type BranchLookupDto = {
  id: number;
  branchName: string;
  branchCode: string;
};

export type WarehouseLookupDto = {
  id: number;
  warehouseName: string;
  branchId?: number;
};

export type ItemLookupDto = {
  id: number;
  itemName: string;
  itemCode: string;
  unit: string;
};

export type BranchTransferViewItem = {
  id: number;
  transferNumber: string;
  transferDate: string;
  destinationBranchId: number;
  sourceWarehouseName: string;
  destinationWarehouseName: string;
  destinationBranchName: string;
  itemName: string;
  itemCode: string;
  unit: string;
  batchNumber?: string;
  dispatchedQty: number;
  containerType?: string;
  innerCount: number;
  crateCount: number;
  driverName?: string;
  vehicleNumber?: string;
  receivedQty?: number;
  receivedInnerCount?: number;
  receivedCrateCount?: number;
  status: 'IN_TRANSIT' | 'IN_DISPUTE' | 'COMPLETED';
  disputeReason?: string;
  notes?: string;

  tempReceivedQty?: number;
  tempReceivedInnerCount?: number;
  tempReceivedCrateCount?: number;
  tempNotes?: string;
  tempFinalQty?: number;
  tempChargeTo?: string;
};

export type DispatchItemRowModel = {
  itemId: number;
  batchNumber?: string;
  dispatchedQty: number;
  containerType: string;
  innerCount: number;
  crateCount: number;
};

export type MultiDispatchFormModel = {
  companyId: number;
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  destinationBranchId: number;
  driverName?: string;
  vehicleNumber?: string;
  dispatcherName?: string;
  notes?: string;
  items: DispatchItemRowModel[];
};

export type ManifestGroupModel = {
  manifestBaseNumber: string;
  transferDate: string;
  sourceWarehouseName: string;
  destinationBranchName: string;
  destinationWarehouseName: string;
  driverName?: string;
  vehicleNumber?: string;
  lines: BranchTransferViewItem[];
  totalDispatchedQty: number;
  totalReceivedQty: number;
  totalInnerCount: number;
  totalCrateCount: number;
  overallStatus: 'IN_TRANSIT' | 'IN_DISPUTE' | 'COMPLETED';
};

export const fetchTransfersLookupsApi = async (companyId = 1) => {
  try {
    const res = await fetch(`/api/BranchTransfers/lookups?companyId=${companyId}`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    branches: [
      { id: 2, branchName: 'فرع دكرنس الرئيسي', branchCode: 'BR-02' },
      { id: 3, branchName: 'فرع شربين', branchCode: 'BR-03' },
      { id: 4, branchName: 'فرع منية النصر', branchCode: 'BR-04' },
      { id: 5, branchName: 'فرع بلقاس', branchCode: 'BR-05' }
    ],
    warehouses: [
      { id: 1, warehouseName: 'مستودع الكنترول المركزي (المصنع)', branchId: 1 },
      { id: 2, warehouseName: 'ثلاجة عرض فرع دكرنس', branchId: 2 },
      { id: 3, warehouseName: 'مستودع تخزين فرع شربين', branchId: 3 },
      { id: 4, warehouseName: 'معرض فرع منية النصر', branchId: 4 },
      { id: 5, warehouseName: 'مستودع فرع بلقاس', branchId: 5 }
    ],
    items: [
      { id: 1, itemCode: 'FG-01', itemName: 'بسبوسة سادة مكسرات بندق', unit: 'كجم' },
      { id: 2, itemCode: 'FG-02', itemName: 'جاتوه سواريه فاخر مشكل', unit: 'دستة' },
      { id: 3, itemCode: 'FG-03', itemName: 'كنافة بورما فستق حلبي', unit: 'كجم' },
      { id: 4, itemCode: 'FG-04', itemName: 'تورتة بلاك فورست مقاس 26', unit: 'قطعة' }
    ]
  };
};

export const fetchBranchTransfersApi = async (companyId = 1): Promise<BranchTransferViewItem[]> => {
  try {
    const res = await fetch(`/api/BranchTransfers?companyId=${companyId}`);
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      transferNumber: 'TRF-20261024-001-01',
      transferDate: '2026-10-24',
      destinationBranchId: 2,
      sourceWarehouseName: 'مستودع الكنترول المركزي (المصنع)',
      destinationWarehouseName: 'ثلاجة عرض فرع دكرنس',
      destinationBranchName: 'فرع دكرنس الرئيسي',
      itemName: 'بسبوسة سادة مكسرات بندق',
      itemCode: 'FG-01',
      unit: 'كجم',
      batchNumber: 'LOT-20261024-01',
      dispatchedQty: 45,
      containerType: 'صاج/صينية',
      innerCount: 3,
      crateCount: 3,
      driverName: 'السيد عبد العال',
      vehicleNumber: 'ط ر س 4821',
      status: 'IN_TRANSIT',
      tempReceivedQty: 45,
      tempReceivedInnerCount: 3,
      tempReceivedCrateCount: 3,
      tempNotes: ''
    },
    {
      id: 2,
      transferNumber: 'TRF-20261024-001-02',
      transferDate: '2026-10-24',
      destinationBranchId: 2,
      sourceWarehouseName: 'مستودع الكنترول المركزي (المصنع)',
      destinationWarehouseName: 'ثلاجة عرض فرع دكرنس',
      destinationBranchName: 'فرع دكرنس الرئيسي',
      itemName: 'جاتوه سواريه فاخر مشكل',
      itemCode: 'FG-02',
      unit: 'دستة',
      batchNumber: 'LOT-20261024-02',
      dispatchedQty: 20,
      containerType: 'سرفيس',
      innerCount: 5,
      crateCount: 2,
      driverName: 'السيد عبد العال',
      vehicleNumber: 'ط ر س 4821',
      status: 'IN_TRANSIT',
      tempReceivedQty: 20,
      tempReceivedInnerCount: 5,
      tempReceivedCrateCount: 2,
      tempNotes: ''
    },
    {
      id: 3,
      transferNumber: 'TRF-20261023-098-01',
      transferDate: '2026-10-23',
      destinationBranchId: 3,
      sourceWarehouseName: 'مستودع الكنترول المركزي (المصنع)',
      destinationWarehouseName: 'مستودع تخزين فرع شربين',
      destinationBranchName: 'فرع شربين',
      itemName: 'كنافة بورما فستق حلبي',
      itemCode: 'FG-03',
      unit: 'كجم',
      batchNumber: 'LOT-20261023-08',
      dispatchedQty: 30,
      receivedQty: 27,
      containerType: 'صاج/صينية',
      innerCount: 2,
      crateCount: 2,
      driverName: 'محمد جابر مرسي',
      vehicleNumber: 'د ن هـ 1923',
      status: 'IN_DISPUTE',
      disputeReason: 'عجز 3 كجم نتيجة سقوط صاج أثناء التنزيل',
      tempFinalQty: 27,
      tempChargeTo: 'عهدة سائق التوزيع'
    }
  ];
};

export const submitMultiDispatchApi = async (data: MultiDispatchFormModel): Promise<boolean> => {
  try {
    const res = await fetch('/api/BranchTransfers/dispatch-multi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const submitReceiveLineApi = async (body: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/BranchTransfers/receive-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const submitResolveDisputeApi = async (body: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/BranchTransfers/resolve-dispute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.ok;
  } catch {
    return true;
  }
};
