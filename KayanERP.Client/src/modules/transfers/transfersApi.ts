export interface TransferItem {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
}

export interface StockTransfer {
  id: number;
  transferNumber: string;
  date: string;
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  cratesLoaded: number;
  driverName: string;
  itemsCount: number;
  status: 'تم الاستلام' | 'قيد النقل والتوزيع' | 'ملغاة';
  items: TransferItem[];
}

const STORAGE_KEY = 'kayan_transfers_data';

const getInitialTransfersData = (): StockTransfer[] => [
  {
    id: 1,
    transferNumber: 'TRF-2026-101',
    date: '2026-10-22',
    fromBranchId: 1,
    fromBranchName: 'المصنع والإدارة المركزية',
    toBranchId: 2,
    toBranchName: 'فرع دكرنس الرئيسي',
    cratesLoaded: 35,
    driverName: 'السائق حسام',
    itemsCount: 3,
    status: 'تم الاستلام',
    items: [
      { productId: 1, productName: 'بسبوسة مكسرات لوكس', unit: 'كيلو', quantity: 20 },
      { productId: 2, productName: 'كنافة أساور نوتيلا', unit: 'كيلو', quantity: 15 },
      { productId: 3, productName: 'تورتة شوكولاتة كروكانت وسط', unit: 'قطعة', quantity: 10 },
    ],
  },
  {
    id: 2,
    transferNumber: 'TRF-2026-102',
    date: '2026-10-22',
    fromBranchId: 1,
    fromBranchName: 'المصنع والإدارة المركزية',
    toBranchId: 5,
    toBranchName: 'سيارة توزيع رقم 1 (خط الزقازيق والسنبلاوين)',
    cratesLoaded: 50,
    driverName: 'السائق حسام',
    itemsCount: 2,
    status: 'قيد النقل والتوزيع',
    items: [
      { productId: 4, productName: 'جاتوه سواريه مشكل (24 ق)', unit: 'طبق', quantity: 25 },
      { productId: 5, productName: 'كعك سادة بالسمن البلدي', unit: 'كيلو', quantity: 30 },
    ],
  },
];

export const fetchTransfersApi = async (): Promise<StockTransfer[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialTransfersData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveTransfersToLocal = (data: StockTransfer[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
