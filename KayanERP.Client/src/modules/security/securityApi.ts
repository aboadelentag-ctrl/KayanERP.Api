export interface RoleDto {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  permissions: string;
  active: boolean;
  usersCount: number;
}

export interface UserRowDto {
  id: number;
  username: string;
  fullName?: string;
  employeeId?: number | null;
  employeeCode?: string | null;
  role: string;
  roleId?: number | null;
  departmentName?: string;
  isActive: boolean;
  customPermissions?: string;
}

export interface EmployeeLookupDto {
  id: number;
  employeeCode: string;
  fullName: string;
  departmentName: string;
}

export interface PermissionItemDto {
  code: string;
  title: string;
  description: string;
}

export interface PermissionGroupDto {
  groupCode: string;
  groupName: string;
  permissions: PermissionItemDto[];
}

const STORAGE_ROLES_KEY = 'kayan_roles_data';
const STORAGE_USERS_KEY = 'kayan_users_data';

// فهرس الصلاحيات المعياري الشامل لكافة شاشات وأزرار المنظومة الصناعية
export const defaultPermissionCatalog: PermissionGroupDto[] = [
  {
    groupCode: 'MES',
    groupName: '🏭 العمليات الصناعية والتشغيل (MES)',
    permissions: [
      { code: 'Production.View', title: 'عرض شاشة أوامر الإنتاج', description: 'الاطلاع على حالة الدفعات ونسب الإنجاز' },
      { code: 'Production.Create', title: 'إصدار أمر إنتاج وتشغيل', description: 'إنشاء دفعة خبز أو تصنيع جديدة بالمعمل' },
      { code: 'Production.Close', title: 'إغلاق أمر الإنتاج وحساب التكلفة', description: 'اعتماد تسليم التام وحساب الهادر الفعلي' },
      { code: 'BOM.View', title: 'عرض وصفات التصنيع (BOM)', description: 'الاطلاع على مقادير خلط الصواني والحلويات' },
      { code: 'BOM.Edit', title: 'تعديل وحفظ الوصفات المعيارية', description: 'تغيير نسب الخامات ودرجات تسوية الأفران' },
      { code: 'Materials.Requisition', title: 'طلب وصرف خامات الصالة', description: 'إرسال طلب سحب خامات من المستودع المركزي' },
    ],
  },
  {
    groupCode: 'SCM',
    groupName: '📦 المخازن وسلاسل الإمداد اللوجستية',
    permissions: [
      { code: 'Stock.View', title: 'عرض كارت الصنف والأرصدة اللحظية', description: 'متابعة كميات الخامات والمنتج التام' },
      { code: 'Stock.Adjust', title: 'تسوية الجرد المخزني وعجز الخامات', description: 'إثبات هادر التخزين وفروق الأوزان' },
      { code: 'Receiving.GMP', title: 'فحص واستلام الخامات الموردة', description: 'إجراء الفحص الفني وإثبات رطوبة الدقيق ونقاء السمن' },
      { code: 'Transfers.Create', title: 'إنشاء أذون تحويل بين الفروع', description: 'شحن صواني ومنتجات تامة لمنافذ البيع' },
      { code: 'Transfers.Dispute', title: 'فض منازعات العجز والكسر في النقل', description: 'اعتماد محاضر التلف أثناء الشحن' },
      { code: 'Crates.Track', title: 'حوكمة وحركة الصواني والأسبات', description: 'متابعة أمانات وفوارغ الفروع' },
    ],
  },
  {
    groupCode: 'SALES',
    groupName: '🧾 المبيعات ونقاط البيع والفروع',
    permissions: [
      { code: 'Sales.Create', title: 'إصدار فواتير المبيعات اليومية', description: 'تسجيل مبيعات المعارض والعملاء' },
      { code: 'Sales.Discount', title: 'منح خصومات استثنائية للعميل', description: 'تجاوز حدود الخصم المسموحة للكاشير' },
      { code: 'Sales.CreditLimit', title: 'تجاوز السقف الائتماني للعميل', description: 'البيع الآجل لعميل تخطى حد المديونية' },
      { code: 'Customers.Manage', title: 'إدارة وتعديل بيانات العملاء والتجار', description: 'إضافة عملاء جدد وضبط فئات الأسعار' },
      { code: 'POS.CloseShift', title: 'إقفال وردية الكاشير (Z-Report)', description: 'مطابقة النقدية الفعلية بعجز وزيادة الدرج' },
    ],
  },
  {
    groupCode: 'FINANCE',
    groupName: '💵 الإدارة المالية والمحاسبة العامة',
    permissions: [
      { code: 'Accounts.View', title: 'الاطلاع على شجرة الحسابات', description: 'عرض دليل المركز المالي والأرصدة' },
      { code: 'Journal.Post', title: 'ترحيل قيود اليومية العامة', description: 'اعتماد القيود المزدوجة الآلية واليدوية' },
      { code: 'Treasury.Vouchers', title: 'إصدار سندات القبض والصرف', description: 'التحصيل والسداد النقدي من الخزائن' },
      { code: 'Expenses.Approve', title: 'اعتماد مصروفات الغاز والتشغيل', description: 'صرف فواتير الطاقة والوقود للمصنع' },
      { code: 'Reports.Financial', title: 'استخراج القوائم المالية والأرباح', description: 'عرض قائمة الدخل والميزانية العمومية' },
    ],
  },
  {
    groupCode: 'PROCUREMENT',
    groupName: '🛡️ المشتريات ومراقبة الجودة (COA)',
    permissions: [
      { code: 'PO.Create', title: 'إصدار أوامر الشراء للموردين', description: 'توليد أمر توريد خامات وفق حد الطلب' },
      { code: 'VendorQC.Rate', title: 'تقييم جودة وتصنيف الموردين', description: 'اعتماد نسب القبول والرفض وشهادات COA' },
      { code: 'Purchasing.Invoices', title: 'إثبات فواتير الشراء والتسعير', description: 'ترحيل استحقاقات الموردين في الحسابات' },
    ],
  },
  {
    groupCode: 'ADMIN',
    groupName: '🔐 إدارة المنظومة وأمن الصلاحيات (RBAC)',
    permissions: [
      { code: 'Security.Roles', title: 'إدارة وتعديل مصفوفة الأدوار', description: 'تغيير صلاحيات الأزرار لكافة الرتب' },
      { code: 'Security.Users', title: 'إنشاء وتعديل حسابات المستخدمين', description: 'توليد كلمات المرور وربطها بالعاملين' },
      { code: 'Security.CustomPerms', title: 'منح صلاحيات استثنائية للأفراد', description: 'إعطاء استثناءات تتجاوز الدور الوظيفي' },
      { code: 'Print.Center', title: 'الوصول لمركز المطبوعات والفواتير', description: 'طباعة وتصدير مستندات PDF المعتمدة' },
    ],
  },
];

const initialRoles: RoleDto[] = [
  {
    id: 1,
    name: 'ADMIN',
    displayName: 'مدير عام المنظومة (صلاحيات كاملة)',
    description: 'تحكم كامل في كافة موديولات وأزرار النظام بدون أي قيود',
    permissions: defaultPermissionCatalog.flatMap((g) => g.permissions.map((p) => p.code)).join(','),
    active: true,
    usersCount: 1,
  },
  {
    id: 2,
    name: 'PRODUCTION_MANAGER',
    displayName: 'مدير تشغيل وإنتاج المعمل',
    description: 'مسؤول غرفة عمليات التصنيع، الوصفات، صرف الخامات، وهادر الورديات',
    permissions: 'Production.View,Production.Create,Production.Close,BOM.View,BOM.Edit,Materials.Requisition,Stock.View',
    active: true,
    usersCount: 1,
  },
  {
    id: 3,
    name: 'BRANCH_SUPERVISOR',
    displayName: 'مشرف فرع ومعرض حلويات',
    description: 'مسؤول نقاط البيع، الفواتير، استلام صواني التام، وتتبع الأسبات',
    permissions: 'Sales.Create,Sales.Discount,Customers.Manage,POS.CloseShift,Transfers.Create,Crates.Track,Stock.View',
    active: true,
    usersCount: 2,
  },
  {
    id: 4,
    name: 'CHIEF_ACCOUNTANT',
    displayName: 'محاسب عام ومسؤول خزائن',
    description: 'إدارة قيود اليومية، سندات القبض والصرف، فواتير الشراء، ومصروفات الغاز',
    permissions: 'Accounts.View,Journal.Post,Treasury.Vouchers,Expenses.Approve,Reports.Financial,Purchasing.Invoices,Stock.View',
    active: true,
    usersCount: 1,
  },
  {
    id: 5,
    name: 'QC_INSPECTOR',
    displayName: 'مفتش جودة الخامات وسلامة الغذاء (HACCP)',
    description: 'فحص استلام شحنات الدقيق والسمن وتقييم شهادات COA للموردين',
    permissions: 'Receiving.GMP,VendorQC.Rate,Stock.View',
    active: true,
    usersCount: 1,
  },
];

const initialUsers: UserRowDto[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'أبو عادل (المدير العام والتنفيذي)',
    employeeId: 101,
    employeeCode: 'EMP-001',
    role: 'مدير عام المنظومة (صلاحيات كاملة)',
    roleId: 1,
    departmentName: 'الإدارة العليا والمصنع المركزي',
    isActive: true,
    customPermissions: '',
  },
  {
    id: 2,
    username: 'hossam_chef',
    fullName: 'م. حسام الدين (مدير تشغيل المعمل)',
    employeeId: 102,
    employeeCode: 'EMP-014',
    role: 'مدير تشغيل وإنتاج المعمل',
    roleId: 2,
    departmentName: 'صالة تصنيع الحلويات الشرقية',
    isActive: true,
    customPermissions: '',
  },
  {
    id: 3,
    username: 'ahmed_dkr',
    fullName: 'أحمد السعيد (مشرف فرع دكرنس)',
    employeeId: 103,
    employeeCode: 'EMP-022',
    role: 'مشرف فرع ومعرض حلويات',
    roleId: 3,
    departmentName: 'معرض ومبيعات فرع دكرنس',
    isActive: true,
    customPermissions: 'Sales.CreditLimit',
  },
  {
    id: 4,
    username: 'mina_qc',
    fullName: 'د. مينا مجدي (مسؤول الجودة والمعمل)',
    employeeId: 104,
    employeeCode: 'EMP-031',
    role: 'مفتش جودة الخامات وسلامة الغذاء (HACCP)',
    roleId: 5,
    departmentName: 'معمل الرقابة وفحص الجودة',
    isActive: true,
    customPermissions: '',
  },
];

export const initialEmployeesLookup: EmployeeLookupDto[] = [
  { id: 101, employeeCode: 'EMP-001', fullName: 'أبو عادل', departmentName: 'الإدارة العليا' },
  { id: 102, employeeCode: 'EMP-014', fullName: 'م. حسام الدين', departmentName: 'صالة تصنيع الحلويات الشرقية' },
  { id: 103, employeeCode: 'EMP-022', fullName: 'أحمد السعيد', departmentName: 'معرض ومبيعات فرع دكرنس' },
  { id: 104, employeeCode: 'EMP-031', fullName: 'د. مينا مجدي', departmentName: 'معمل فحص الجودة' },
  { id: 105, employeeCode: 'EMP-045', fullName: 'محمود عبد الرازق', departmentName: 'الإدارة المالية والحسابات' },
];

export const fetchPermissionCatalogApi = async (): Promise<PermissionGroupDto[]> => {
  try {
    const res = await fetch('/api/roles/catalog');
    if (res.ok) return await res.json();
  } catch {}
  return defaultPermissionCatalog;
};

export const fetchRolesApi = async (companyId = 1): Promise<RoleDto[]> => {
  try {
    const res = await fetch(`/api/roles/company/${companyId}`);
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_ROLES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(initialRoles));
  return initialRoles;
};

export const fetchUsersApi = async (companyId = 1): Promise<UserRowDto[]> => {
  try {
    const res = await fetch(`/api/roles/users/${companyId}`);
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_USERS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initialUsers));
  return initialUsers;
};

export const fetchEmployeesLookupApi = async (companyId = 1): Promise<EmployeeLookupDto[]> => {
  try {
    const res = await fetch(`/api/roles/employees/${companyId}`);
    if (res.ok) return await res.json();
  } catch {}
  return initialEmployeesLookup;
};

export const saveRolePermissionsApi = async (roleId: number, permissions: string[]): Promise<boolean> => {
  try {
    const res = await fetch(`/api/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_ROLES_KEY);
  let list: RoleDto[] = stored ? JSON.parse(stored) : initialRoles;
  list = list.map((r) => (r.id === roleId ? { ...r, permissions: permissions.join(',') } : r));
  localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(list));
  return true;
};

export const createRoleApi = async (newRole: {
  displayName: string;
  name: string;
  description: string;
  permissions: string[];
}): Promise<RoleDto> => {
  try {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRole),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_ROLES_KEY);
  const list: RoleDto[] = stored ? JSON.parse(stored) : initialRoles;
  const created: RoleDto = {
    id: Date.now(),
    name: newRole.name || 'CUSTOM_ROLE',
    displayName: newRole.displayName,
    description: newRole.description,
    permissions: newRole.permissions.join(','),
    active: true,
    usersCount: 0,
  };
  list.push(created);
  localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(list));
  return created;
};

export const createUserApi = async (payload: {
  username: string;
  password?: string;
  fullName: string;
  departmentName: string;
  roleId: number;
  roleName: string;
  employeeId?: number | null;
  employeeCode?: string | null;
}): Promise<UserRowDto> => {
  try {
    const res = await fetch('/api/roles/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch {}

  const stored = localStorage.getItem(STORAGE_USERS_KEY);
  const list: UserRowDto[] = stored ? JSON.parse(stored) : initialUsers;
  const created: UserRowDto = {
    id: Date.now(),
    username: payload.username,
    fullName: payload.fullName,
    employeeId: payload.employeeId,
    employeeCode: payload.employeeCode,
    role: payload.roleName,
    roleId: payload.roleId,
    departmentName: payload.departmentName,
    isActive: true,
    customPermissions: '',
  };
  list.unshift(created);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
  return created;
};

export const toggleUserStatusApi = async (userId: number, currentStatus: boolean): Promise<boolean> => {
  try {
    const res = await fetch(`/api/roles/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_USERS_KEY);
  if (stored) {
    let list: UserRowDto[] = JSON.parse(stored);
    list = list.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u));
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
  }
  return true;
};

export const saveUserCustomPermsApi = async (userId: number, permissions: string[]): Promise<boolean> => {
  try {
    const res = await fetch(`/api/roles/users/${userId}/custom-permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_USERS_KEY);
  if (stored) {
    let list: UserRowDto[] = JSON.parse(stored);
    list = list.map((u) => (u.id === userId ? { ...u, customPermissions: permissions.join(',') } : u));
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
  }
  return true;
};
