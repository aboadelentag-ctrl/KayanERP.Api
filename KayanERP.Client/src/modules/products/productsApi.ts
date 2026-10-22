export interface Product {
  id: number;
  code: string;
  name: string;
  category: 'حلويات شرقية' | 'حلويات غربية' | 'نواشف ومخبوزات' | 'خامات ومستلزمات';
  unit: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  currentStock: number;
  minStockLevel: number;
  status: 'active' | 'inactive';
}

const STORAGE_KEY = 'kayan_products_data';

const getInitialProductsData = (): Product[] => [
  {
    id: 1,
    code: 'PRD-101',
    name: 'بسبوسة مكسرات لوكس',
    category: 'حلويات شرقية',
    unit: 'كيلو',
    costPrice: 90,
    wholesalePrice: 125,
    retailPrice: 150,
    currentStock: 45,
    minStockLevel: 10,
    status: 'active',
  },
  {
    id: 2,
    code: 'PRD-102',
    name: 'كنافة أساور نوتيلا',
    category: 'حلويات شرقية',
    unit: 'كيلو',
    costPrice: 110,
    wholesalePrice: 150,
    retailPrice: 180,
    currentStock: 8,
    minStockLevel: 15,
    status: 'active',
  },
  {
    id: 3,
    code: 'PRD-201',
    name: 'تورتة شوكولاتة كروكانت وسط',
    category: 'حلويات غربية',
    unit: 'قطعة',
    costPrice: 140,
    wholesalePrice: 200,
    retailPrice: 240,
    currentStock: 22,
    minStockLevel: 5,
    status: 'active',
  },
  {
    id: 4,
    code: 'PRD-202',
    name: 'جاتوه سواريه مشكل (24 ق)',
    category: 'حلويات غربية',
    unit: 'طبق',
    costPrice: 160,
    wholesalePrice: 220,
    retailPrice: 260,
    currentStock: 14,
    minStockLevel: 6,
    status: 'active',
  },
  {
    id: 5,
    code: 'PRD-301',
    name: 'كعك سادة بالسمن البلدي',
    category: 'نواشف ومخبوزات',
    unit: 'كيلو',
    costPrice: 100,
    wholesalePrice: 140,
    retailPrice: 170,
    currentStock: 3,
    minStockLevel: 12,
    status: 'active',
  },
];

export const fetchProductsApi = async (): Promise<Product[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialProductsData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveProductsToLocal = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};
