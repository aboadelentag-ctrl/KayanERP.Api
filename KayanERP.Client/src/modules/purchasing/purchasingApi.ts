export interface Supplier {
  id: number;
  code: string;
  name: string;
  phone: string;
  category: 'خامات ومستلزمات حلويات' | 'تعبئة وتغليف وكرتون' | 'صيانة ومعدات';
  currentBalance: number; // رصيد مستحقات المورد
  city: string;
}

export interface PurchaseInvoiceItem {
  id: number;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  date: string;
  supplierId: number;
  supplierName: string;
  paymentType: 'آجل' | 'نقدي';
  itemsCount: number;
  subTotal: number;
  discount: number;
  netTotal: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'معتمدة ومستلمة' | 'معلقة للفحص' | 'ملغاة';
  items: PurchaseInvoiceItem[];
}

const SUPPLIERS_KEY = 'kayan_suppliers_data';
const INVOICES_KEY = 'kayan_purchase_invoices';

const getInitialSuppliers = (): Supplier[] => [
  { id: 1, code: 'SUP-01', name: 'شركة مطاحن الدلتا والصعيد', phone: '01012345678', category: 'خامات ومستلزمات حلويات', currentBalance: 45000, city: 'المنصورة' },
  { id: 2, code: 'SUP-02', name: 'مزارع الوادي لمنتجات الألبان والسمن البلدي', phone: '01198765432', category: 'خامات ومستلزمات حلويات', currentBalance: 38000, city: 'الشرقية' },
  { id: 3, code: 'SUP-03', name: 'الشركة المصرية لتجارة وتكرير السكر', phone: '01234567890', category: 'خامات ومستلزمات حلويات', currentBalance: 12000, city: 'دمياط' },
  { id: 4, code: 'SUP-04', name: 'الأهرام للكرتون ومواد التعبئة والتغليف', phone: '01055566677', category: 'تعبئة وتغليف وكرتون', currentBalance: 8500, city: 'العاشر من رمضان' },
];

const getInitialInvoices = (): PurchaseInvoice[] => [
  {
    id: 1,
    invoiceNumber: 'PUR-2026-101',
    date: '2026-10-22',
    supplierId: 1,
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    paymentType: 'آجل',
    itemsCount: 2,
    subTotal: 32000,
    discount: 500,
    netTotal: 31500,
    paidAmount: 10000,
    remainingAmount: 21500,
    status: 'معتمدة ومستلمة',
    items: [
      { id: 1, materialName: 'دقيق فاخر استخراج 72%', quantity: 1000, unit: 'كيلو', unitPrice: 22, total: 22000 },
      { id: 2, materialName: 'سميد بسبوسة ممتاز', quantity: 400, unit: 'كيلو', unitPrice: 25, total: 10000 },
    ],
  },
  {
    id: 2,
    invoiceNumber: 'PUR-2026-102',
    date: '2026-10-22',
    supplierId: 2,
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
    paymentType: 'آجل',
    itemsCount: 1,
    subTotal: 24000,
    discount: 0,
    netTotal: 24000,
    paidAmount: 0,
    remainingAmount: 24000,
    status: 'معتمدة ومستلمة',
    items: [
      { id: 3, materialName: 'سمن بلدي بقري طبيعي', quantity: 100, unit: 'كيلو', unitPrice: 240, total: 24000 },
    ],
  },
];

export const fetchSuppliersApi = async (): Promise<Supplier[]> => {
  const stored = localStorage.getItem(SUPPLIERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  const initial = getInitialSuppliers();
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchPurchaseInvoicesApi = async (): Promise<PurchaseInvoice[]> => {
  const stored = localStorage.getItem(INVOICES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  const initial = getInitialInvoices();
  localStorage.setItem(INVOICES_KEY, JSON.stringify(initial));
  return initial;
};

export const savePurchaseInvoicesToLocal = (data: PurchaseInvoice[]) => {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(data));
};

export const saveSuppliersToLocal = (data: Supplier[]) => {
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(data));
};
