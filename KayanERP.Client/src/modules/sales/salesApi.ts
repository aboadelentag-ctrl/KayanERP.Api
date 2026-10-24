export interface SalesInvoiceLineDto {
  itemId: number;
  itemCode?: string;
  itemName?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface SalesInvoiceViewDto {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  branchId: number;
  branchName: string;
  customerId: number;
  customerName: string;
  itemsCount: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CREDIT';
  warehouseName: string;
  lines: SalesInvoiceLineDto[];
}

export interface CustomerLookupDto {
  id: number;
  customerCode: string;
  customerName: string;
  phone: string;
}

export interface BranchLookupDto {
  id: number;
  branchCode: string;
  branchName: string;
}

export interface SalesWarehouseLookupDto {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  branchId?: number | null;
}

export interface FinishedItemLookupDto {
  id: number;
  itemCode: string;
  itemName: string;
  sellingPrice: number;
  unit: string;
}

export interface SalesLookupsDto {
  customers: CustomerLookupDto[];
  branches: BranchLookupDto[];
  warehouses: SalesWarehouseLookupDto[];
  finishedItems: FinishedItemLookupDto[];
}

const STORAGE_INVOICES_KEY = 'kayan_sales_invoices_v2';
const STORAGE_CUSTOMERS_KEY = 'kayan_customers_lookup_v2';

export const fallbackSalesLookups: SalesLookupsDto = {
  branches: [
    { id: 1, branchCode: 'BR-CENTRAL', branchName: 'المصنع والإدارة المركزية' },
    { id: 2, branchCode: 'BR-DKR', branchName: 'فرع ومعرض دكرنس الرئيسي' },
    { id: 3, branchCode: 'BR-SHR', branchName: 'فرع شربين (السوق القديم)' },
    { id: 4, branchCode: 'BR-MNT', branchName: 'فرع منية النصر التجاري' },
    { id: 5, branchCode: 'BR-MAN', branchName: 'معرض المنصورة - المشاية' },
  ],
  warehouses: [
    { id: 1, warehouseCode: 'WH-CENTRAL', warehouseName: 'مستودع الكنترول وتسليم التام (المصنع)', branchId: 1 },
    { id: 2, warehouseCode: 'WH-DKR-01', warehouseName: 'ثلاجة ومخزن عرض فرع دكرنس', branchId: 2 },
    { id: 3, warehouseCode: 'WH-SHR-01', warehouseName: 'مستودع صالة بيع فرع شربين', branchId: 3 },
    { id: 4, warehouseCode: 'WH-MNT-01', warehouseName: 'مستودع استلام فرع منية النصر', branchId: 4 },
    { id: 5, warehouseCode: 'WH-MAN-01', warehouseName: 'ثلاجة تبريد معرض المشاية - المنصورة', branchId: 5 },
  ],
  customers: [
    { id: 1, customerCode: 'CUST-101', customerName: 'مؤسسة البركة لتوزيع الحلويات (دكرنس)', phone: '01012345678' },
    { id: 2, customerCode: 'CUST-102', customerName: 'معارض التوحيد والنور (شربين)', phone: '01123456789' },
    { id: 3, customerCode: 'CUST-103', customerName: 'سوبر ماركت الفهد (المنصورة)', phone: '01234567890' },
    { id: 4, customerCode: 'CUST-104', customerName: 'منفذ حلويات منية النصر التجاري', phone: '01545678901' },
    { id: 5, customerCode: 'CUST-POS', customerName: 'عميل صالة نقدي (كاشير)', phone: '---' },
  ],
  finishedItems: [
    { id: 201, itemCode: 'FG-BAS-01', itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي', sellingPrice: 195.0, unit: 'كجم' },
    { id: 202, itemCode: 'FG-KNA-02', itemName: 'كنافة أساور نوتيلا وبندق إكسترا', sellingPrice: 220.0, unit: 'كجم' },
    { id: 203, itemCode: 'FG-TRT-03', itemName: 'تورتة شوكولاتة كروكانت ملكي مقاس 26', sellingPrice: 380.0, unit: 'قطعة' },
    { id: 204, itemCode: 'FG-MIX-04', itemName: 'مشكل شرقي لوكس (صواني ضيافة)', sellingPrice: 240.0, unit: 'كجم' },
    { id: 205, itemCode: 'FG-GAT-05', itemName: 'جاتوه سواريه مشكل فاخر', sellingPrice: 180.0, unit: 'دستة' },
  ],
};

const initialSampleInvoices: SalesInvoiceViewDto[] = [
  {
    id: 1001,
    invoiceNumber: 'INV-2026-00101',
    invoiceDate: '2026-10-24 11:30',
    branchId: 2,
    branchName: 'فرع ومعرض دكرنس الرئيسي',
    customerId: 1,
    customerName: 'مؤسسة البركة لتوزيع الحلويات (دكرنس)',
    itemsCount: 2,
    totalAmount: 9750.0,
    paymentMethod: 'CASH',
    warehouseName: 'ثلاجة ومخزن عرض فرع دكرنس',
    lines: [
      { itemId: 201, itemCode: 'FG-BAS-01', itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي', unit: 'كجم', quantity: 30, unitPrice: 195.0, lineTotal: 5850.0 },
      { itemId: 203, itemCode: 'FG-TRT-03', itemName: 'تورتة شوكولاتة كروكانت ملكي مقاس 26', unit: 'قطعة', quantity: 10, unitPrice: 390.0, lineTotal: 3900.0 },
    ],
  },
  {
    id: 1002,
    invoiceNumber: 'INV-2026-00102',
    invoiceDate: '2026-10-24 10:15',
    branchId: 2,
    branchName: 'فرع ومعرض دكرنس الرئيسي',
    customerId: 5,
    customerName: 'عميل صالة نقدي (كاشير)',
    itemsCount: 1,
    totalAmount: 1100.0,
    paymentMethod: 'CASH',
    warehouseName: 'ثلاجة ومخزن عرض فرع دكرنس',
    lines: [
      { itemId: 202, itemCode: 'FG-KNA-02', itemName: 'كنافة أساور نوتيلا وبندق إكسترا', unit: 'كجم', quantity: 5, unitPrice: 220.0, lineTotal: 1100.0 },
    ],
  },
  {
    id: 1003,
    invoiceNumber: 'INV-2026-00103',
    invoiceDate: '2026-10-23 15:45',
    branchId: 3,
    branchName: 'فرع شربين (السوق القديم)',
    customerId: 2,
    customerName: 'معارض التوحيد والنور (شربين)',
    itemsCount: 3,
    totalAmount: 14200.0,
    paymentMethod: 'CREDIT',
    warehouseName: 'مستودع صالة بيع فرع شربين',
    lines: [
      { itemId: 201, itemCode: 'FG-BAS-01', itemName: 'بسبوسة مكسرات لوكس بالسمن البلدي', unit: 'كجم', quantity: 40, unitPrice: 195.0, lineTotal: 7800.0 },
      { itemId: 204, itemCode: 'FG-MIX-04', itemName: 'مشكل شرقي لوكس (صواني ضيافة)', unit: 'كجم', quantity: 20, unitPrice: 240.0, lineTotal: 4800.0 },
      { itemId: 205, itemCode: 'FG-GAT-05', itemName: 'جاتوه سواريه مشكل فاخر', unit: 'دستة', quantity: 8, unitPrice: 200.0, lineTotal: 1600.0 },
    ],
  },
];

export const fetchSalesInvoicesApi = async (): Promise<SalesInvoiceViewDto[]> => {
  try {
    const res = await fetch('/api/Sales/invoices');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_INVOICES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(initialSampleInvoices));
  return initialSampleInvoices;
};

export const fetchSalesLookupsApi = async (): Promise<SalesLookupsDto> => {
  try {
    const res = await fetch('/api/Sales/lookups');
    if (res.ok) {
      const data = await res.json();
      if (data && data.customers && data.customers.length > 0) return data;
    }
  } catch {}

  const storedCust = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
  if (storedCust) {
    try {
      const parsed = JSON.parse(storedCust);
      return { ...fallbackSalesLookups, customers: parsed };
    } catch {}
  }
  return fallbackSalesLookups;
};

export const createSalesInvoiceApi = async (payload: {
  branchId: number;
  warehouseId: number;
  customerId: number;
  paymentMethod: 'CASH' | 'CREDIT';
  invoiceLines: { itemId: number; quantity: number; unitPrice: number }[];
}): Promise<SalesInvoiceViewDto> => {
  try {
    const res = await fetch('/api/Sales/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_INVOICES_KEY);
  let list: SalesInvoiceViewDto[] = stored ? JSON.parse(stored) : initialSampleInvoices;

  const branch = fallbackSalesLookups.branches.find((b) => b.id === payload.branchId) || fallbackSalesLookups.branches[1];
  const wh = fallbackSalesLookups.warehouses.find((w) => w.id === payload.warehouseId) || fallbackSalesLookups.warehouses[1];
  const cust = fallbackSalesLookups.customers.find((c) => c.id === payload.customerId) || fallbackSalesLookups.customers[0];

  const processedLines: SalesInvoiceLineDto[] = payload.invoiceLines.map((l) => {
    const item = fallbackSalesLookups.finishedItems.find((it) => it.id === l.itemId);
    return {
      itemId: l.itemId,
      itemCode: item?.itemCode || 'FG-ITEM',
      itemName: item?.itemName || 'صنف مباع',
      unit: item?.unit || 'كجم',
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      lineTotal: l.quantity * l.unitPrice,
    };
  });

  const total = processedLines.reduce((acc, curr) => acc + (curr.lineTotal || 0), 0);

  const newInvoice: SalesInvoiceViewDto = {
    id: Date.now(),
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(list.length + 101).padStart(5, '0')}`,
    invoiceDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    branchId: payload.branchId,
    branchName: branch.branchName,
    customerId: payload.customerId,
    customerName: cust.customerName,
    itemsCount: processedLines.length,
    totalAmount: total,
    paymentMethod: payload.paymentMethod,
    warehouseName: wh.warehouseName,
    lines: processedLines,
  };

  list = [newInvoice, ...list];
  localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(list));
  return newInvoice;
};

export const saveQuickCustomerApi = async (customer: {
  customerName: string;
  customerCode: string;
  phone: string;
}): Promise<CustomerLookupDto> => {
  const newCust: CustomerLookupDto = {
    id: Date.now(),
    customerName: customer.customerName.trim(),
    customerCode: customer.customerCode,
    phone: customer.phone.trim() || '---',
  };

  const storedCust = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
  let list: CustomerLookupDto[] = storedCust ? JSON.parse(storedCust) : fallbackSalesLookups.customers;
  list = [newCust, ...list];
  localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(list));
  return newCust;
};
