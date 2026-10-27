// معرفات الشاشات الرئيسية لمنظومة كيان الصناعي (SaaS Modules)
export type ScreenId = 
  | 'mes_production'        // صالة الإنتاج وأوامر التشغيل
  | 'scale_custody'        // الميزان المركزي والكنترول
  | 'inventory_matrix'     // كروت الصنف ومستودعات المواد الخام والتام
  | 'branch_dispatch'      // توزيع الفروع وتتبع اللوجستيات والصواني
  | 'branches_management'  // إدارة الفروع ومنافذ البيع (إضافة / تعديل الفروع)
  | 'accounting_ledger'    // القيود واليومية المحاسبية الآلية
  | 'rbac_studio';         // استوديو حوكمة الصلاحيات والمستخدمين

// أنواع المنشآت المتاحة في نظام SaaS
export type BranchType = 'FACTORY' | 'SHOWROOM' | 'CENTRAL_WAREHOUSE' | 'OUTLET';

// كيان الفرع الديناميكي (Dynamic SaaS Branch Entity)
export interface Branch {
  id: string;               // معرف فريد مثل BR-101
  code: string;             // كود الفرع المختصر
  name: string;             // اسم المنشأة أو الفرع
  type: BranchType;         // تصنيف الفرع
  isProductionHub: boolean; // هل الفرع يحتوي على صالة إنتاج وMES؟
  isActive: boolean;
}

// بيانات المستأجر / المشترك في نظام الـ SaaS
export interface TenantInfo {
  tenantId: string;
  organizationName: string; // اسم المؤسسة الحالي ديناميكياً
  brandSubTitle?: string;
  logoUrl?: string;
}

// إعدادات عناصر شريط التنقل
export interface NavItemConfig {
  id: ScreenId;
  label: string;
  badge?: string;
  iconName: 'Factory' | 'Scale' | 'Boxes' | 'Truck' | 'Building2' | 'BookOpen' | 'ShieldLock';
  requiredPermission: string;
}

// هيكل جلسة المستخدم الحالية في الـ SaaS
export interface UserSession {
  userId: string;
  name: string;
  role: string;
  tenant: TenantInfo;
  currentBranchId: string;  // معرف الفرع النشط الذي يعمل عليه المستخدم حالياً
  currentBranchName: string;
  shift: 'صباحي' | 'مسائي';
  permissions: {
    canView: ScreenId[];     // الشاشات المصرح له بالدخول إليها
    canExecute: string[];    // العمليات الفعلية (اعتماد وزن، ترحيل قيد، فتح لوط...)
  };
}