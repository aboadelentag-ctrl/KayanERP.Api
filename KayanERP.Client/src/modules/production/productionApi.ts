export interface RequiredMaterial {
  ingredientName: string;
  requiredQuantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface ProductionOrder {
  id: number;
  orderNumber: string;
  date: string;
  recipeId: number;
  recipeCode: string;
  productName: string;
  plannedQuantity: number;
  producedQuantity: number;
  unit: string;
  shift: 'وردية صباحية' | 'وردية مسائية' | 'وردية ليلية';
  assignedChef: string;
  status: 'مجدول' | 'قيد التجهيز والخبز' | 'جاهز لفحص الجودة' | 'مكتمل ومرحل للتوزيع' | 'ملغى';
  estimatedCost: number;
  actualCost: number;
  requiredMaterials: RequiredMaterial[];
}

const STORAGE_KEY = 'kayan_production_orders';

const getInitialProductionData = (): ProductionOrder[] => [
  {
    id: 1,
    orderNumber: 'PRD-ORD-2026-081',
    date: '2026-10-22',
    recipeId: 1,
    recipeCode: 'RCP-101',
    productName: 'بسبوسة مكسرات لوكس',
    plannedQuantity: 100,
    producedQuantity: 100,
    unit: 'كيلو',
    shift: 'وردية صباحية',
    assignedChef: 'الشيف سمير إبراهيم',
    status: 'مكتمل ومرحل للتوزيع',
    estimatedCost: 6200,
    actualCost: 6200,
    requiredMaterials: [
      { ingredientName: 'سميد فاخر', requiredQuantity: 50, unit: 'كيلو', unitCost: 28, totalCost: 1400 },
      { ingredientName: 'سمن بلدي بقري', requiredQuantity: 20, unit: 'كيلو', unitCost: 240, totalCost: 4800 },
    ],
  },
  {
    id: 2,
    orderNumber: 'PRD-ORD-2026-082',
    date: '2026-10-22',
    recipeId: 2,
    recipeCode: 'RCP-102',
    productName: 'كنافة أساور نوتيلا',
    plannedQuantity: 45,
    producedQuantity: 0,
    unit: 'كيلو',
    shift: 'وردية مسائية',
    assignedChef: 'الشيف نبيل محمود',
    status: 'قيد التجهيز والخبز',
    estimatedCost: 4950,
    actualCost: 0,
    requiredMaterials: [
      { ingredientName: 'كنافة شعر طازجة', requiredQuantity: 24, unit: 'كيلو', unitCost: 35, totalCost: 840 },
      { ingredientName: 'سمن بلدي صافي', requiredQuantity: 10.5, unit: 'كيلو', unitCost: 240, totalCost: 2520 },
      { ingredientName: 'شوكولاتة نوتيلا', requiredQuantity: 10.5, unit: 'كيلو', unitCost: 150, totalCost: 1575 },
    ],
  },
  {
    id: 3,
    orderNumber: 'PRD-ORD-2026-083',
    date: '2026-10-22',
    recipeId: 3,
    recipeCode: 'RCP-201',
    productName: 'تورتة شوكولاتة كروكانت وسط',
    plannedQuantity: 20,
    producedQuantity: 0,
    unit: 'قطعة',
    shift: 'وردية صباحية',
    assignedChef: 'الشيف شادي فكري',
    status: 'مجدول',
    estimatedCost: 2800,
    actualCost: 0,
    requiredMaterials: [
      { ingredientName: 'دقيق سبونج', requiredQuantity: 10, unit: 'كيلو', unitCost: 45, totalCost: 450 },
      { ingredientName: 'بيض طازج', requiredQuantity: 60, unit: 'قطعة', unitCost: 5.5, totalCost: 330 },
      { ingredientName: 'موس شوكولاتة خام', requiredQuantity: 6, unit: 'كيلو', unitCost: 220, totalCost: 1320 },
      { ingredientName: 'مكسرات كروكانت', requiredQuantity: 3, unit: 'كيلو', unitCost: 230, totalCost: 690 },
    ],
  },
];

export const fetchProductionOrdersApi = async (): Promise<ProductionOrder[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialProductionData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveProductionOrdersToLocal = (data: ProductionOrder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
