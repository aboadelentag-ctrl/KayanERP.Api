export interface AccountItem {
  id: number;
  accountCode: string;
  accountName: string;
  category: 'أصول' | 'خصوم والتزامات' | 'حقوق ملكية' | 'إيرادات' | 'مصروفات وتكاليف';
  nature: 'مدين' | 'دائن'; // الطبيعة المحاسبية
  level: number; // مستوى الحساب (1: رئيسي، 2: وسيط، 3: تحليلي يقبل الترحيل)
  parentCode?: string;
  currentBalance: number;
  isPosting: boolean; // هل يقبل قيود مباشرة أم حساب تجميعي
  status: 'active' | 'inactive';
}

const STORAGE_KEY = 'kayan_chart_of_accounts';

const getInitialAccounts = (): AccountItem[] => [
  // 1- الأصول
  { id: 1, accountCode: '1', accountName: 'الأصول', category: 'أصول', nature: 'مدين', level: 1, currentBalance: 485000, isPosting: false, status: 'active' },
  { id: 2, accountCode: '11', accountName: 'الأصول المتداولة', category: 'أصول', nature: 'مدين', level: 2, parentCode: '1', currentBalance: 325000, isPosting: false, status: 'active' },
  { id: 3, accountCode: '1101', accountName: 'خزينة المركز الرئيسي والمصنع', category: 'أصول', nature: 'مدين', level: 3, parentCode: '11', currentBalance: 85000, isPosting: true, status: 'active' },
  { id: 4, accountCode: '1102', accountName: 'خزينة فرع دكرنس', category: 'أصول', nature: 'مدين', level: 3, parentCode: '11', currentBalance: 32000, isPosting: true, status: 'active' },
  { id: 5, accountCode: '1103', accountName: 'حسابات البنوك الجارية', category: 'أصول', nature: 'مدين', level: 3, parentCode: '11', currentBalance: 120000, isPosting: true, status: 'active' },
  { id: 6, accountCode: '1104', accountName: 'أرصدة العملاء والمدينون', category: 'أصول', nature: 'مدين', level: 3, parentCode: '11', currentBalance: 48000, isPosting: true, status: 'active' },
  { id: 7, accountCode: '1105', accountName: 'مخزون الخامات ومستلزمات الإنتاج', category: 'أصول', nature: 'مدين', level: 3, parentCode: '11', currentBalance: 28000, isPosting: true, status: 'active' },
  { id: 8, accountCode: '1106', accountName: 'مخزون المنتج التام الجاهز للبيع', category: 'أصول', nature: 'مدين', level: 3, parentCode: '11', currentBalance: 12000, isPosting: true, status: 'active' },
  { id: 9, accountCode: '12', accountName: 'الأصول الثابتة ومعدات التشغيل', category: 'أصول', nature: 'مدين', level: 2, parentCode: '1', currentBalance: 160000, isPosting: false, status: 'active' },
  { id: 10, accountCode: '1201', accountName: 'أفران ومعدات المعمل والحلواني', category: 'أصول', nature: 'مدين', level: 3, parentCode: '12', currentBalance: 110000, isPosting: true, status: 'active' },
  { id: 11, accountCode: '1202', accountName: 'سيارات التوزيع الميداني', category: 'أصول', nature: 'مدين', level: 3, parentCode: '12', currentBalance: 50000, isPosting: true, status: 'active' },

  // 2- الخصوم
  { id: 12, accountCode: '2', accountName: 'الالتزامات والخصوم', category: 'خصوم والتزامات', nature: 'دائن', level: 1, currentBalance: 145000, isPosting: false, status: 'active' },
  { id: 13, accountCode: '21', accountName: 'الخصوم المتداولة', category: 'خصوم والتزامات', nature: 'دائن', level: 2, parentCode: '2', currentBalance: 145000, isPosting: false, status: 'active' },
  { id: 14, accountCode: '2101', accountName: 'حسابات الموردين (ذمم دائنة)', category: 'خصوم والتزامات', nature: 'دائن', level: 3, parentCode: '21', currentBalance: 95000, isPosting: true, status: 'active' },
  { id: 15, accountCode: '2102', accountName: 'تأمين عهد مجنسات وبراني محصلة', category: 'خصوم والتزامات', nature: 'دائن', level: 3, parentCode: '21', currentBalance: 50000, isPosting: true, status: 'active' },

  // 3- حقوق الملكية
  { id: 16, accountCode: '3', accountName: 'حقوق الملكية ورأس المال', category: 'حقوق ملكية', nature: 'دائن', level: 1, currentBalance: 250000, isPosting: false, status: 'active' },
  { id: 17, accountCode: '3101', accountName: 'رأس مال الشركاء', category: 'حقوق ملكية', nature: 'دائن', level: 2, parentCode: '3', currentBalance: 250000, isPosting: true, status: 'active' },

  // 4- الإيرادات
  { id: 18, accountCode: '4', accountName: 'الإيرادات والمبيعات', category: 'إيرادات', nature: 'دائن', level: 1, currentBalance: 195000, isPosting: false, status: 'active' },
  { id: 19, accountCode: '4101', accountName: 'مبيعات حلويات شرقية', category: 'إيرادات', nature: 'دائن', level: 2, parentCode: '4', currentBalance: 110000, isPosting: true, status: 'active' },
  { id: 20, accountCode: '4102', accountName: 'مبيعات حلويات غربية وتورت', category: 'إيرادات', nature: 'دائن', level: 2, parentCode: '4', currentBalance: 65000, isPosting: true, status: 'active' },
  { id: 21, accountCode: '4103', accountName: 'مبيعات خطوط توزيع وسيارات الجملة', category: 'إيرادات', nature: 'دائن', level: 2, parentCode: '4', currentBalance: 20000, isPosting: true, status: 'active' },

  // 5- المصروفات
  { id: 22, accountCode: '5', accountName: 'التكاليف والمصروفات', category: 'مصروفات وتكاليف', nature: 'مدين', level: 1, currentBalance: 105000, isPosting: false, status: 'active' },
  { id: 23, accountCode: '5101', accountName: 'تكلفة الخامات المستهلكة بالتشغيل', category: 'مصروفات وتكاليف', nature: 'مدين', level: 2, parentCode: '5', currentBalance: 65000, isPosting: true, status: 'active' },
  { id: 24, accountCode: '5102', accountName: 'أجور ومرتبات عمال التشغيل والشيفات', category: 'مصروفات وتكاليف', nature: 'مدين', level: 2, parentCode: '5', currentBalance: 28000, isPosting: true, status: 'active' },
  { id: 25, accountCode: '5103', accountName: 'استهلاك غاز وكهرباء المعمل', category: 'مصروفات وتكاليف', nature: 'مدين', level: 2, parentCode: '5', currentBalance: 12000, isPosting: true, status: 'active' },
];

export const fetchAccountsApi = async (): Promise<AccountItem[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial = getInitialAccounts();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveAccountsToLocal = (data: AccountItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
