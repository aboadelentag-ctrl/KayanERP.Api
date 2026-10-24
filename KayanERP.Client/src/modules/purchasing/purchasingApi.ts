export interface PurchaseOrderLineDto {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number;
  notes?: string;
}

export interface PurchaseOrderDto {
  id: number;
  orderNumber: string;
  orderDate: string;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  status: 'Pending_Procurement' | 'Approved' | 'Partially_Received' | 'Closed' | 'Rejected';
  notes?: string;
  lines: PurchaseOrderLineDto[];
}

export interface PurchaseOrderCreateLineDto {
  itemId: number;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface PurchaseOrderCreateDto {
  supplierId: number;
  warehouseId: number;
  orderDate: string;
  notes?: string;
  lines: PurchaseOrderCreateLineDto[];
}

export interface PoApproveLineDto {
  lineId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface PoApproveDto {
  orderId: number;
  status: string;
  lines: PoApproveLineDto[];
}

export interface SupplierLookupItem {
  id: number;
  supplierCode: string;
  supplierName: string;
}

export interface WarehouseLookupItem {
  id: number;
  warehouseName: string;
}

export interface ItemLookupItem {
  id: number;
  itemCode: string;
  itemName: string;
  categoryName: string;
  unit: string;
  basePrice: number;
}

export interface PurchaseOrderLookupsDto {
  suppliers: SupplierLookupItem[];
  warehouses: WarehouseLookupItem[];
  items: ItemLookupItem[];
}

const STORAGE_PO_KEY = 'kayan_purchase_orders_v2';

export const fallbackPoLookups: PurchaseOrderLookupsDto = {
  suppliers: [
    { id: 1, supplierCode: 'SUP-01', supplierName: 'شركة مطاحن الدلتا والصعيد' },
    { id: 2, supplierCode: 'SUP-02', supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي' },
    { id: 3, supplierCode: 'SUP-03', supplierName: 'الشركة المصرية لتجارة وتكرير السكر' },
    { id: 4, supplierCode: 'SUP-04', supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف' },
    { id: 5, supplierCode: 'SUP-05', supplierName: 'الشركة السورية لاستيراد وتجارة المكسرات' },
  ],
  warehouses: [
    { id: 1, warehouseName: 'مستودع الخامات المركزي (المصنع الرئيسي)' },
    { id: 2, warehouseName: 'مستودع مواد التعبئة والتغليف والكرتون' },
    { id: 3, warehouseName: 'ثلاجة التبريد وحفظ منتجات الألبان والمكسرات' },
  ],
  items: [
    { id: 101, itemCode: 'RAW-FLOUR-72', itemName: 'دقيق فاخر استخراج 72%', categoryName: 'خامات ومواد أولية', unit: 'كجم', basePrice: 18.5 },
    { id: 102, itemCode: 'RAW-GHEE-NAT', itemName: 'سمن بلدي بقري طبيعي', categoryName: 'خامات ومواد أولية', unit: 'صفيحة (16 كجم)', basePrice: 3450.0 },
    { id: 103, itemCode: 'RAW-SUGAR-50', itemName: 'سكر بلوري أبيض نقي', categoryName: 'خامات ومواد أولية', unit: 'شيكارة (50 كجم)', basePrice: 1350.0 },
    { id: 104, itemCode: 'RAW-PISTACHIO', itemName: 'فستق حلبي محمص مفروم', categoryName: 'مكسرات ومستلزمات حشو', unit: 'كجم', basePrice: 680.0 },
    { id: 105, itemCode: 'PKG-BOX-LUX', itemName: 'علب كرتون دوبلكس بصمة ذهبية', categoryName: 'مواد تعبئة وتغليف', unit: 'ألف علبة', basePrice: 4200.0 },
  ],
};

const initialPurchaseOrders: PurchaseOrderDto[] = [
  {
    id: 1,
    orderNumber: 'PO-2026-00101',
    orderDate: '2026-10-24',
    supplierId: 1,
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    warehouseId: 1,
    warehouseName: 'مستودع الخامات المركزي (المصنع الرئيسي)',
    status: 'Pending_Procurement',
    notes: 'توريد شكائر دقيق 72% للوردية القادمة',
    lines: [
      {
        id: 11,
        itemId: 101,
        itemCode: 'RAW-FLOUR-72',
        itemName: 'دقيق فاخر استخراج 72%',
        unit: 'كجم',
        quantity: 25000.0,
        unitPrice: 18.5,
        receivedQuantity: 0,
        notes: 'دقيق ناعم مطابق للمواصفات القياسية',
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'PO-2026-00102',
    orderDate: '2026-10-23',
    supplierId: 2,
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
    warehouseId: 3,
    warehouseName: 'ثلاجة التبريد وحفظ منتجات الألبان والمكسرات',
    status: 'Approved',
    notes: 'معتمد للتسليم المباشر',
    lines: [
      {
        id: 12,
        itemId: 102,
        itemCode: 'RAW-GHEE-NAT',
        itemName: 'سمن بلدي بقري طبيعي',
        unit: 'صفيحة (16 كجم)',
        quantity: 150.0,
        unitPrice: 3450.0,
        receivedQuantity: 0,
        notes: 'صفائح جديدة معقمة محكمة الغلق',
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'PO-2026-00103',
    orderDate: '2026-10-22',
    supplierId: 3,
    supplierName: 'الشركة المصرية لتجارة وتكرير السكر',
    warehouseId: 1,
    warehouseName: 'مستودع الخامات المركزي (المصنع الرئيسي)',
    status: 'Partially_Received',
    notes: 'تم استلام الدفعة الأولى',
    lines: [
      {
        id: 13,
        itemId: 103,
        itemCode: 'RAW-SUGAR-50',
        itemName: 'سكر بلوري أبيض نقي',
        unit: 'شيكارة (50 كجم)',
        quantity: 400.0,
        unitPrice: 1350.0,
        receivedQuantity: 250.0,
        notes: 'تم توريد واستلام 250 شيكارة وجاري استكمال 150',
      },
    ],
  },
  {
    id: 4,
    orderNumber: 'PO-2026-00104',
    orderDate: '2026-10-20',
    supplierId: 4,
    supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف',
    warehouseId: 2,
    warehouseName: 'مستودع مواد التعبئة والتغليف والكرتون',
    status: 'Closed',
    notes: 'مكتمل ومرحل دفترياً ومخزنياً',
    lines: [
      {
        id: 14,
        itemId: 105,
        itemCode: 'PKG-BOX-LUX',
        itemName: 'علب كرتون دوبلكس بصمة ذهبية',
        unit: 'ألف علبة',
        quantity: 10.0,
        unitPrice: 4200.0,
        receivedQuantity: 10.0,
        notes: 'تم الاستلام وإغلاق أمر الشراء',
      },
    ],
  },
];

export const fetchPurchaseOrdersApi = async (): Promise<PurchaseOrderDto[]> => {
  try {
    const res = await fetch('/api/purchaseorders');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_PO_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_PO_KEY, JSON.stringify(initialPurchaseOrders));
  return initialPurchaseOrders;
};

export const fetchPoLookupsApi = async (): Promise<PurchaseOrderLookupsDto> => {
  try {
    const res = await fetch('/api/purchaseorders/lookups');
    if (res.ok) {
      const data = await res.json();
      if (data && data.suppliers && data.suppliers.length > 0) return data;
    }
  } catch {}
  return fallbackPoLookups;
};

export const createPurchaseOrderApi = async (order: PurchaseOrderCreateDto): Promise<PurchaseOrderDto> => {
  try {
    const res = await fetch('/api/purchaseorders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_PO_KEY);
  let list: PurchaseOrderDto[] = stored ? JSON.parse(stored) : initialPurchaseOrders;

  const sup = fallbackPoLookups.suppliers.find((s) => s.id === order.supplierId);
  const wh = fallbackPoLookups.warehouses.find((w) => w.id === order.warehouseId);

  const processedLines: PurchaseOrderLineDto[] = order.lines.map((l, idx) => {
    const item = fallbackPoLookups.items.find((it) => it.id === l.itemId);
    return {
      id: Date.now() + idx,
      itemId: l.itemId,
      itemCode: item?.itemCode || 'RAW-ITEM',
      itemName: item?.itemName || 'خامة مستوردة',
      unit: item?.unit || 'كجم',
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      receivedQuantity: 0,
      notes: l.notes || '',
    };
  });

  const newOrder: PurchaseOrderDto = {
    id: Date.now(),
    orderNumber: `PO-${new Date().getFullYear()}-${String(list.length + 101).padStart(5, '0')}`,
    orderDate: order.orderDate || new Date().toISOString().slice(0, 10),
    supplierId: order.supplierId,
    supplierName: sup?.supplierName || 'مورد عام',
    warehouseId: order.warehouseId,
    warehouseName: wh?.warehouseName || 'المستودع الرئيسي',
    status: 'Pending_Procurement',
    notes: order.notes || '',
    lines: processedLines,
  };

  list = [newOrder, ...list];
  localStorage.setItem(STORAGE_PO_KEY, JSON.stringify(list));
  return newOrder;
};

export const approvePurchaseOrderApi = async (approveData: PoApproveDto): Promise<boolean> => {
  try {
    const res = await fetch('/api/purchaseorders/approve-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approveData),
    });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_PO_KEY);
  if (stored) {
    let list: PurchaseOrderDto[] = JSON.parse(stored);
    list = list.map((o) => {
      if (o.id === approveData.orderId) {
        return {
          ...o,
          status: 'Approved',
          lines: o.lines.map((l) => {
            const approvedLine = approveData.lines.find((al) => al.lineId === l.id || al.itemId === l.itemId);
            if (approvedLine) {
              return {
                ...l,
                quantity: approvedLine.quantity,
                unitPrice: approvedLine.unitPrice,
                notes: approvedLine.notes || l.notes,
              };
            }
            return l;
          }),
        };
      }
      return o;
    });
    localStorage.setItem(STORAGE_PO_KEY, JSON.stringify(list));
  }
  return true;
};
