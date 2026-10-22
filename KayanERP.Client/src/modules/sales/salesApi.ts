export interface InvoiceItem {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesInvoice {
  id: number;
  invoiceNumber: string;
  date: string;
  customerId: number;
  customerName: string;
  branchId: number;
  branchName: string;
  paymentType: 'نقد' | 'آجل';
  itemsCount: number;
  subTotal: number;
  discount: number;
  netTotal: number;
  cratesDispatched: number;
  status: 'معتمدة ومسلمة' | 'معلقة للتحميل' | 'ملغاة';
  items: InvoiceItem[];
}

const STORAGE_KEY = 'kayan_sales_invoices';

const getInitialInvoicesData = (): SalesInvoice[] => [
  {
    id: 1,
    invoiceNumber: 'INV-2026-001',
    date: '2026-10-22',
    customerId: 1,
    customerName: 'سوبر ماركت الفهد (فرع المعادي)',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    paymentType: 'آجل',
    itemsCount: 2,
    subTotal: 3375,
    discount: 0,
    netTotal: 3375,
    cratesDispatched: 12,
    status: 'معتمدة ومسلمة',
    items: [
      { productId: 1, productName: 'بسبوسة مكسرات لوكس', unit: 'كيلو', quantity: 15, unitPrice: 125, total: 1875 },
      { productId: 2, productName: 'كنافة أساور نوتيلا', unit: 'كيلو', quantity: 10, unitPrice: 150, total: 1500 },
    ],
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-002',
    date: '2026-10-22',
    customerId: 2,
    customerName: 'شركة حلواني الشام (فرع النزهة)',
    branchId: 5,
    branchName: 'سيارة توزيع رقم 1 (خط الزقازيق والسنبلاوين)',
    paymentType: 'آجل',
    itemsCount: 2,
    subTotal: 5800,
    discount: 200,
    netTotal: 5600,
    cratesDispatched: 20,
    status: 'معتمدة ومسلمة',
    items: [
      { productId: 3, productName: 'تورتة شوكولاتة كروكانت وسط', unit: 'قطعة', quantity: 20, unitPrice: 200, total: 4000 },
      { productId: 4, productName: 'جاتوه سواريه مشكل (24 ق)', unit: 'طبق', quantity: 8, unitPrice: 220, total: 1760 },
    ],
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-003',
    date: '2026-10-22',
    customerId: 3,
    customerName: 'عميل نقدي - منفذ البيع المباشر',
    branchId: 2,
    branchName: 'فرع دكرنس الرئيسي',
    paymentType: 'نقد',
    itemsCount: 1,
    subTotal: 450,
    discount: 0,
    netTotal: 450,
    cratesDispatched: 0,
    status: 'معتمدة ومسلمة',
    items: [
      { productId: 1, productName: 'بسبوسة مكسرات لوكس', unit: 'كيلو', quantity: 3, unitPrice: 150, total: 450 },
    ],
  },
];

export const fetchSalesInvoicesApi = async (): Promise<SalesInvoice[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialInvoicesData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveSalesInvoicesToLocal = (data: SalesInvoice[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
