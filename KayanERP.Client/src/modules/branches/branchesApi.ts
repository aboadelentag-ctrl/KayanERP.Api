export interface BranchWarehouse {
  id: number;
  code: string;
  name: string;
  type: 'فرع بيع' | 'مستودع رئيسي' | 'مصنع إنتاج' | 'خط توزيع متنقل';
  manager: string;
  phone: string;
  address: string;
  crateBalance: number; // رصيد المجنسات الموجود داخل الفرع/السيارة
  status: 'active' | 'inactive';
}

const STORAGE_KEY = 'kayan_branches_data';

const getInitialBranchesData = (): BranchWarehouse[] => [
  {
    id: 1,
    code: 'BR-01',
    name: 'المصنع والإدارة المركزية',
    type: 'مصنع إنتاج',
    manager: 'أبو عادل',
    phone: '01000000001',
    address: 'المنطقة الصناعية',
    crateBalance: 450,
    status: 'active',
  },
  {
    id: 2,
    code: 'BR-02',
    name: 'فرع دكرنس الرئيسي',
    type: 'فرع بيع',
    manager: 'أحمد محمود',
    phone: '01022334455',
    address: 'دكرنس - الشارع التجاري',
    crateBalance: 85,
    status: 'active',
  },
  {
    id: 3,
    code: 'BR-03',
    name: 'فرع شربين',
    type: 'فرع بيع',
    manager: 'محمد السعيد',
    phone: '01155667788',
    address: 'شربين - ميدان المحطة',
    crateBalance: 60,
    status: 'active',
  },
  {
    id: 4,
    code: 'BR-04',
    name: 'فرع منية النصر',
    type: 'فرع بيع',
    manager: 'خالد إبراهيم',
    phone: '01233445566',
    address: 'منية النصر - الطريق العام',
    crateBalance: 40,
    status: 'active',
  },
  {
    id: 5,
    code: 'RT-01',
    name: 'سيارة توزيع رقم 1 (خط الزقازيق والسنبلاوين)',
    type: 'خط توزيع متنقل',
    manager: 'السائق حسام',
    phone: '01099887766',
    address: 'متنقل',
    crateBalance: 120,
    status: 'active',
  },
];

export const fetchBranchesApi = async (): Promise<BranchWarehouse[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialBranchesData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveBranchesToLocal = (data: BranchWarehouse[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
