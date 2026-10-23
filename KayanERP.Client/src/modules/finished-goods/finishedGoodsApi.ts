export interface FinishedGoodItem {
  id: number;
  code: string;
  name: string;
  category: 'حلويات شرقية' | 'حلويات غربية وتورت' | 'نواشف ومخبوزات';
  unit: string;
  retailPrice: number;
  shelfLifeDays: number;
  imageUrl: string;
  description: string;
}

export interface FinishedGoodsTransferRecord {
  id: number;
  transferNumber: string;
  date: string;
  productionBatchNo: string;
  itemName: string;
  itemCode: string;
  fromSection: string;
  toDestination: string;
  quantityTransferred: number;
  unit: string;
  crateCount: number;
  status: 'تم التسليم والمعاينة' | 'قيد النقل والتسليم' | 'مرتجع تالف';
  chefName: string;
  receiverName: string;
}

const STORAGE_CATALOG_KEY = 'kayan_finished_goods_catalog';
const STORAGE_TRANSFERS_KEY = 'kayan_finished_goods_transfers';

const getInitialCatalog = (): FinishedGoodItem[] => [
  {
    id: 1,
    code: 'PRD-101',
    name: 'بسبوسة مكسرات لوكس سمن بلدي',
    category: 'حلويات شرقية',
    unit: 'صينية مقاس 50',
    retailPrice: 420,
    shelfLifeDays: 4,
    imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=400&q=80',
    description: 'بسبوسة مرملة بالسمن البلدي الطبيعي محشوة باللوز والبندق المقشر',
  },
  {
    id: 2,
    code: 'PRD-102',
    name: 'كنافة أساور نوتيلا وبندق',
    category: 'حلويات شرقية',
    unit: 'كيلو',
    retailPrice: 280,
    shelfLifeDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80',
    description: 'أساور كنافة مقرمشة مغطاة بشوكولاتة النوتيلا الغنية مع البندق المحمص',
  },
  {
    id: 3,
    code: 'PRD-201',
    name: 'تورتة شوكولاتة كروكانت مقاس 26',
    category: 'حلويات غربية وتورت',
    unit: 'قطعة (تورتة)',
    retailPrice: 380,
    shelfLifeDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
    description: 'كيك سبونج شوكولاتة غني مع طبقات موس الكروكانت وصوص الجناش الفاخر',
  },
  {
    id: 4,
    code: 'PRD-202',
    name: 'جاتوه سواريه مشكل فاخر',
    category: 'حلويات غربية وتورت',
    unit: 'دستة (12 قطعة)',
    retailPrice: 240,
    shelfLifeDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=400&q=80',
    description: 'تشكيلة من الجاتوه السواريه (ميلفي، شوكولاتة، فراولة، وموس فواكه)',
  },
];

const getInitialTransfers = (): FinishedGoodsTransferRecord[] => [
  {
    id: 1,
    transferNumber: 'TRN-FG-2026-001',
    date: '2026-10-23',
    productionBatchNo: 'BATCH-2026-092',
    itemName: 'بسبوسة مكسرات لوكس سمن بلدي',
    itemCode: 'PRD-101',
    fromSection: 'صالة تصنيع الحلويات الشرقية',
    toDestination: 'المعرض الرئيسي (صالة العرض)',
    quantityTransferred: 25,
    unit: 'صينية مقاس 50',
    crateCount: 25,
    status: 'تم التسليم والمعاينة',
    chefName: 'الشيف سمير إبراهيم',
    receiverName: 'مشرف المعرض الرئيسي',
  },
  {
    id: 2,
    transferNumber: 'TRN-FG-2026-002',
    date: '2026-10-23',
    productionBatchNo: 'BATCH-2026-093',
    itemName: 'تورتة شوكولاتة كروكانت مقاس 26',
    itemCode: 'PRD-201',
    fromSection: 'صالة الحلويات الغربية والتورت',
    toDestination: 'سيارة التوزيع 01 (خط دكرنس)',
    quantityTransferred: 15,
    unit: 'قطعة (تورتة)',
    crateCount: 15,
    status: 'قيد النقل والتسليم',
    chefName: 'الشيف شادي فكري',
    receiverName: 'سائق شاحنة التوزيع',
  },
];

export const fetchFinishedGoodsCatalogApi = async (): Promise<FinishedGoodItem[]> => {
  const stored = localStorage.getItem(STORAGE_CATALOG_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialCatalog();
  localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchFinishedGoodsTransfersApi = async (): Promise<FinishedGoodsTransferRecord[]> => {
  const stored = localStorage.getItem(STORAGE_TRANSFERS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialTransfers();
  localStorage.setItem(STORAGE_TRANSFERS_KEY, JSON.stringify(initial));
  return initial;
};

export const saveFinishedGoodsTransfersToLocal = (data: FinishedGoodsTransferRecord[]) => {
  localStorage.setItem(STORAGE_TRANSFERS_KEY, JSON.stringify(data));
};
