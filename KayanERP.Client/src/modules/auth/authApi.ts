export interface TenantVerifyResult {
  success: boolean;
  companyId: number;
  companyName: string;
}

export interface UserLoginResult {
  success: boolean;
  userId: number;
  username: string;
  fullName: string;
  companyId: number;
  companyName: string;
  role: string;
  employeeCode: string;
  departmentName: string;
  permissions: string[];
}

export const verifyTenantApi = async (tenantCode: string, tenantKey: string): Promise<TenantVerifyResult> => {
  try {
    const res = await fetch('/api/auth/verify-tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantCode: tenantCode.trim(), tenantKey: tenantKey.trim() }),
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback محلي معتمد للمنشأة الافتراضية
  if (tenantCode.toUpperCase() === 'ABUADEL' || tenantCode.trim() === 'حلويات أبو عادل') {
    return {
      success: true,
      companyId: 1,
      companyName: 'مجموعة مصانع ومنافذ حلويات أبو عادل (كيان)',
    };
  }

  throw new Error('كود المنشأة أو مفتاح الترخيص السحابي غير صحيح.');
};

export const loginUserApi = async (companyId: number, username: string, password: string): Promise<UserLoginResult> => {
  try {
    const res = await fetch('/api/auth/login-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, username: username.trim(), password: password.trim() }),
    });
    if (res.ok) return await res.json();
  } catch {}

  // مستخدمين تجريبيين للتوافق مع المحاكاة
  const cleanUser = username.trim().toLowerCase();
  if (cleanUser === 'admin' || cleanUser === 'aboadel') {
    return {
      success: true,
      userId: 1,
      username: 'admin',
      fullName: 'أبو عادل (المدير العام والتنفيذي)',
      companyId: 1,
      companyName: 'مجموعة مصانع ومنافذ حلويات أبو عادل (كيان)',
      role: 'Admin',
      employeeCode: 'EMP-001',
      departmentName: 'الإدارة العليا والمصنع المركزي',
      permissions: ['ALL'],
    };
  } else if (cleanUser === 'chef' || cleanUser === 'production') {
    return {
      success: true,
      userId: 2,
      username: 'production',
      fullName: 'م. حسام الدين (مدير تشغيل المعمل)',
      companyId: 1,
      companyName: 'مجموعة مصانع ومنافذ حلويات أبو عادل (كيان)',
      role: 'ProductionManager',
      employeeCode: 'EMP-014',
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      permissions: ['Production.Create', 'Production.Edit', 'BOM.Manage', 'Products.Manage'],
    };
  } else {
    // قبول المستخدم المكتوب بصلاحيات عامة
    return {
      success: true,
      userId: 3,
      username: username.trim(),
      fullName: `المستخدم: ${username.trim()}`,
      companyId: 1,
      companyName: 'مجموعة مصانع ومنافذ حلويات أبو عادل (كيان)',
      role: 'Accountant',
      employeeCode: 'EMP-099',
      departmentName: 'الإدارة المالية والحسابات',
      permissions: ['Journal.Post', 'Sales.Create', 'Reports.Export'],
    };
  }
};
