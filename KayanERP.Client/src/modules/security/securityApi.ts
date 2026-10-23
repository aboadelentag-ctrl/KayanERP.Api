import type { UserRole, Permission } from '../../core/auth/types';

export interface SystemUser {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  branchName: string;
  email: string;
  phone: string;
  status: 'نشط' | 'معطل مؤقتاً';
  customPermissions: Permission[];
}

export interface PermissionDefinition {
  key: Permission;
  label: string;
  category: 'إنتاج وتشغيل' | 'مخازن ولوجستيات' | 'مالية ومحاسبة' | 'إدارة وجودة';
  description: string;
}

const STORAGE_USERS_KEY = 'kayan_system_users_data';

export const ALL_PERMISSIONS_LIST: PermissionDefinition[] = [
  { key: 'Production.Create', label: 'بدء أوامر الإنتاج والطبخات', category: 'إنتاج وتشغيل', description: 'صلاحية فتح تشغيلة جديدة وإدخال معايير التصنيع' },
  { key: 'Production.Edit', label: 'تعديل أوامر ومراحل التشغيل', category: 'إنتاج وتشغيل', description: 'تعديل خطوات العجن، الخبز، والتزيين' },
  { key: 'BOM.Manage', label: 'إدارة وتعديل وصفات التصنيع (BOM)', category: 'إنتاج وتشغيل', description: 'تعديل نسب الخامات القياسية للحلويات' },
  { key: 'Products.Manage', label: 'إدارة وتكويد الأصناف والخامات', category: 'مخازن ولوجستيات', description: 'إضافة خامات وأصناف جديدة وتحديد أوزانها' },
  { key: 'Crates.Manage', label: 'حوكمة الأسبات والصواني وحركتها', category: 'مخازن ولوجستيات', description: 'تسجيل دخول وخروج الأسبات وتتبع التوالف' },
  { key: 'Journal.Post', label: 'اعتماد وترحيل القيود وسندات الخزينة', category: 'مالية ومحاسبة', description: 'ترحيل السندات اليومية لدفتر الأستاذ العام' },
  { key: 'Sales.Create', label: 'إصدار فواتير المبيعات وصرف الفروع', category: 'مالية ومحاسبة', description: 'تحرير فواتير المعارض والعملاء' },
  { key: 'Branches.Manage', label: 'إدارة الفروع والمستودعات الإقليمية', category: 'إدارة وجودة', description: 'تعديل أرصدة ونطاقات الفروع والربط المركزي' },
  { key: 'Reports.Export', label: 'تصدير التقارير والقوائم المالية (Excel/PDF)', category: 'إدارة وجودة', description: 'تصدير الميزانيات وقوائم الدخل' },
];

const getInitialUsers = (): SystemUser[] => [
  {
    id: 1,
    username: 'admin',
    fullName: 'أبو عادل (المدير العام والتنفيذي)',
    role: 'Admin',
    branchName: 'المصنع والإدارة المركزية',
    email: 'ceo@kayan-sweets.com',
    phone: '01001122334',
    status: 'نشط',
    customPermissions: ALL_PERMISSIONS_LIST.map((p) => p.key),
  },
  {
    id: 2,
    username: 'prod_manager',
    fullName: 'م. حسام الدين (مدير تشغيل المعمل)',
    role: 'ProductionManager',
    branchName: 'المصنع الرئيسي',
    email: 'production@kayan-sweets.com',
    phone: '01004455667',
    status: 'نشط',
    customPermissions: [
      'Production.Create',
      'Production.Edit',
      'BOM.Manage',
      'Products.Manage',
      'Crates.Manage',
      'Reports.Export',
    ],
  },
  {
    id: 3,
    username: 'accountant',
    fullName: 'خالد ممدوح (رئيس الحسابات العامة)',
    role: 'Accountant',
    branchName: 'المصنع والإدارة المركزية',
    email: 'finance@kayan-sweets.com',
    phone: '01007788990',
    status: 'نشط',
    customPermissions: ['Journal.Post', 'Sales.Create', 'Reports.Export'],
  },
  {
    id: 4,
    username: 'branch_dekernes',
    fullName: 'مشرف فرع دكرنس الميداني',
    role: 'BranchManager',
    branchName: 'فرع دكرنس',
    email: 'dekernes@kayan-sweets.com',
    phone: '01009988776',
    status: 'نشط',
    customPermissions: ['Sales.Create', 'Crates.Manage', 'Reports.Export'],
  },
];

export const fetchSystemUsersApi = async (): Promise<SystemUser[]> => {
  const stored = localStorage.getItem(STORAGE_USERS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialUsers();
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
  return initial;
};

export const saveSystemUsersToLocal = (data: SystemUser[]) => {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(data));
};
