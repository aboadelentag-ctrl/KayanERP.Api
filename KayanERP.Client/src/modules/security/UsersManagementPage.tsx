import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  Search,
  Eye,
  Settings,
  Trash2,
  Edit,
  Save,
  Check,
  X,
  Layers,
  ArrowRight,
  Building,
  UserPlus,
  LayoutTemplate,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';

interface Props {
  onNavigate?: (tab: string) => void;
}

export interface ButtonPermission {
  id: string;
  name: string;
  screenName: string;
  module: 'MES' | 'LOGISTICS' | 'SALES' | 'FINANCE' | 'QA' | 'PROCUREMENT' | 'HR' | 'SOS';
}

export interface RoleMatrixItem {
  roleId: string;
  roleName: string;
  description: string;
  usersCount: number;
  permissions: { [permissionId: string]: { view: boolean; execute: boolean } };
}

export interface UserSecurityItem {
  id: number;
  username: string;
  fullName: string;
  workerCode: string;
  department: string;
  roleId: string;
  roleName: string;
  status: 'نشط' | 'معطل';
  customOverridesCount: number;
}

export const UsersManagementPage: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showRoleStudioModal, setShowRoleStudioModal] = useState<boolean>(false);

  // حالة استوديو تصميم الدور والقالب
  const [studioRoleName, setStudioRoleName] = useState('');
  const [studioRoleDesc, setStudioRoleDesc] = useState('');
  const [studioPermissions, setStudioPermissions] = useState<{ [id: string]: { view: boolean; execute: boolean } }>({});
  const [studioModuleFilter, setStudioModuleFilter] = useState<string>('ALL');

  // خريطة شاملة لكافة شاشات وأزرار المنظومة الصناعية
  const systemActions: ButtonPermission[] = [
    // 1. الإنتاج والتشغيل MES
    { id: 'MES_VIEW_HUB', name: 'عرض غرفة عمليات الإنتاج (MES Hub)', screenName: 'غرفة عمليات MES', module: 'MES' },
    { id: 'MES_CREATE_ORDER', name: 'زر (+ إصدار أمر تشغيل جديد)', screenName: 'غرفة عمليات MES', module: 'MES' },
    { id: 'MES_EXECUTE_LOT', name: 'زر (تنفيذ وتقفيل اللوط ورصد الهالك)', screenName: 'غرفة عمليات MES', module: 'MES' },
    { id: 'MES_SHIFT_ATTENDANCE', name: 'تسجيل واعتماد حضور عمال الوردية', screenName: 'إدارة الوردية', module: 'MES' },
    { id: 'MES_COSTING_VIEW', name: 'استعراض تحليل تكلفة الصاج والدفعة', screenName: 'محرك التكاليف', module: 'MES' },
    { id: 'MES_RECIPES_EDIT', name: 'تعديل وحفظ الوصفات المعيارية (BOM)', screenName: 'الوصفات المعيارية', module: 'MES' },

    // 2. المخازن وسلاسل الإمداد
    { id: 'LOG_STOCK_CARD', name: 'عرض كارت الصنف والمسار التراكمي', screenName: 'كارت الصنف', module: 'LOGISTICS' },
    { id: 'LOG_STOCK_EXCEL', name: 'زر (تصدير كشف الحركة Excel)', screenName: 'كارت الصنف', module: 'LOGISTICS' },
    { id: 'LOG_TRANSFER_DISPATCH', name: 'إصدار إذن تحويل وصرف صواني للفروع', screenName: 'تحويلات الفروع', module: 'LOGISTICS' },
    { id: 'LOG_TRANSFER_RECEIVE', name: 'استلام وتحريز بضاعة بالفرع ولجنة النزاع', screenName: 'تحويلات الفروع', module: 'LOGISTICS' },
    { id: 'LOG_CRATES_TRACK', name: 'تتبع حركة ودوران الأسبات والصناديق', screenName: 'حركة الأسبات', module: 'LOGISTICS' },

    // 3. المبيعات والفروع
    { id: 'SALES_INVOICE_CREATE', name: 'زر (+ فاتورة مبيعات جديدة)', screenName: 'فواتير المبيعات', module: 'SALES' },
    { id: 'SALES_INVOICE_PRINT', name: 'زر (طباعة / معاينة الفاتورة)', screenName: 'فواتير المبيعات', module: 'SALES' },
    { id: 'SALES_DISCOUNT_OVERRIDE', name: 'منح خصومات استثنائية للعملاء', screenName: 'فواتير المبيعات', module: 'SALES' },
    { id: 'SALES_BRANCH_LOCK', name: 'تغيير وتثبيت سياق الفرع المعزول', screenName: 'بوابة الفروع', module: 'SALES' },

    // 4. الإدارة المالية
    { id: 'FIN_JOURNAL_POST', name: 'ترحيل قيود اليومية العامة', screenName: 'دفتر اليومية', module: 'FINANCE' },
    { id: 'FIN_TREASURY_VOUCHER', name: 'إصدار سند قبض / صرف نقدي بالخزينة', screenName: 'الخزائن وسندات القبض', module: 'FINANCE' },
    { id: 'FIN_STATEMENTS_VIEW', name: 'استعراض القوائم المالية والأرباح P&L', screenName: 'القوائم الختامية', module: 'FINANCE' },

    // 5. الجودة والـ HACCP
    { id: 'QA_INSPECT_APPROVE', name: 'اعتماد محضر فحص خامات الموردين', screenName: 'فحص الخامات', module: 'QA' },
    { id: 'QA_FORMS_STUDIO', name: 'تصميم قوالب نماذج التفتيش الرقمية', screenName: 'Form Studio', module: 'QA' },

    // 6. المشتريات
    { id: 'PROC_PO_CREATE', name: 'إصدار أوامر الشراء والتعميد للموردين', screenName: 'أوامر الشراء', module: 'PROCUREMENT' },

    // 7. الموارد البشرية
    { id: 'HR_EMPLOYEE_EDIT', name: 'تعديل بيانات العاملين واحتساب المرتبات', screenName: 'شؤون العاملين', module: 'HR' },

    // 8. الطوارئ SOS
    { id: 'SOS_TICKET_CLOSE', name: 'إغلاق بلاغ عطل حرج بالمعدات (SOS)', screenName: 'غرفة الطوارئ', module: 'SOS' }
  ];

  const [roles, setRoles] = useState<RoleMatrixItem[]>([
    {
      roleId: 'ROLE_ADMIN',
      roleName: 'مدير عام المنظومة (صلاحيات كاملة)',
      description: 'تحكم كامل في كافة موديلات وأزرار النظام بدون أي قيود',
      usersCount: 1,
      permissions: Object.fromEntries(systemActions.map(a => [a.id, { view: true, execute: true }]))
    },
    {
      roleId: 'ROLE_CHEF',
      roleName: 'مدير تشغيل وإنتاج المعمل (Chef)',
      description: 'مسؤول غرفة عمليات التصنيع، طلب الخامات، وإصدار وتقفيل أوامر الإنتاج',
      usersCount: 1,
      permissions: {
        'MES_VIEW_HUB': { view: true, execute: true },
        'MES_CREATE_ORDER': { view: true, execute: true },
        'MES_EXECUTE_LOT': { view: true, execute: true },
        'MES_SHIFT_ATTENDANCE': { view: true, execute: true },
        'MES_COSTING_VIEW': { view: true, execute: false },
        'MES_RECIPES_EDIT': { view: true, execute: true },
        'LOG_STOCK_CARD': { view: true, execute: false },
        'LOG_TRANSFER_DISPATCH': { view: true, execute: false }
      }
    },
    {
      roleId: 'ROLE_BRANCH_MGR',
      roleName: 'مشرف فرع ومعرض حلويات',
      description: 'مسؤول نقاط البيع، الفواتير، استلام صواني التام، وتتبع الأسبات',
      usersCount: 2,
      permissions: {
        'SALES_INVOICE_CREATE': { view: true, execute: true },
        'SALES_INVOICE_PRINT': { view: true, execute: true },
        'SALES_DISCOUNT_OVERRIDE': { view: true, execute: false },
        'LOG_TRANSFER_RECEIVE': { view: true, execute: true },
        'LOG_CRATES_TRACK': { view: true, execute: true },
        'LOG_STOCK_CARD': { view: true, execute: false },
        'FIN_TREASURY_VOUCHER': { view: true, execute: true }
      }
    }
  ]);

  const [users, setUsers] = useState<UserSecurityItem[]>([
    {
      id: 1,
      username: 'admin',
      fullName: 'أبو عادل (المدير العام والتنفيذي)',
      workerCode: 'EMP-001',
      department: 'الإدارة العليا والمصنع المركزي',
      roleId: 'ROLE_ADMIN',
      roleName: 'مدير عام المنظومة (صلاحيات كاملة)',
      status: 'نشط',
      customOverridesCount: 0
    },
    {
      id: 2,
      username: 'hossam_chef',
      fullName: 'م. حسام الدين (مدير تشغيل المعمل)',
      workerCode: 'EMP-014',
      department: 'صالة تصنيع الحلويات الشرقية',
      roleId: 'ROLE_CHEF',
      roleName: 'مدير تشغيل وإنتاج المعمل',
      status: 'نشط',
      customOverridesCount: 0
    },
    {
      id: 3,
      username: 'ahmed_dkr',
      fullName: 'أحمد السعيد (مشرف فرع دكرنس)',
      workerCode: 'EMP-022',
      department: 'معرض ومبيعات فرع دكرنس',
      roleId: 'ROLE_BRANCH_MGR',
      roleName: 'مشرف فرع ومعرض حلويات',
      status: 'نشط',
      customOverridesCount: 1
    }
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>('ROLE_ADMIN');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const activeRole = roles.find(r => r.roleId === selectedRoleId) || roles[0];

  // فتح مصمم القوالب لإنشاء قالب دور جديد من الصفر
  const handleOpenStudio = () => {
    setStudioRoleName('');
    setStudioRoleDesc('');
    // تهيئة مصفوفة فارغة
    const initPerms: { [id: string]: { view: boolean; execute: boolean } } = {};
    systemActions.forEach(act => {
      initPerms[act.id] = { view: false, execute: false };
    });
    setStudioPermissions(initPerms);
    setShowRoleStudioModal(true);
  };

  // تبديل أزرار المصمم
  const handleToggleStudioPerm = (actionId: string, type: 'view' | 'execute') => {
    setStudioPermissions(prev => {
      const current = prev[actionId] || { view: false, execute: false };
      const nextVal = !current[type];
      const updated = { ...current, [type]: nextVal };

      if (type === 'view' && !nextVal) {
        updated.execute = false;
      }
      if (type === 'execute' && nextVal) {
        updated.view = true;
      }
      return { ...prev, [actionId]: updated };
    });
  };

  // إجراءات جماعية سريعة داخل مصمم القالب
  const handleBulkSelect = (mode: 'ALL_FULL' | 'ALL_VIEW' | 'CLEAR') => {
    const updated: { [id: string]: { view: boolean; execute: boolean } } = {};
    systemActions.forEach(act => {
      if (mode === 'ALL_FULL') updated[act.id] = { view: true, execute: true };
      else if (mode === 'ALL_VIEW') updated[act.id] = { view: true, execute: false };
      else updated[act.id] = { view: false, execute: false };
    });
    setStudioPermissions(updated);
  };

  // حفظ القالب كدور وظيفي معتمد
  const handleSaveStudioRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioRoleName.trim()) {
      alert('يرجى إدخال مسمى قالب الدور.');
      return;
    }

    const newRoleId = `ROLE_TEMPLATE_${Date.now()}`;
    const newRole: RoleMatrixItem = {
      roleId: newRoleId,
      roleName: studioRoleName.trim(),
      description: studioRoleDesc.trim() || 'قالب دور مخصص ومصمم الشاشات والأزرار',
      usersCount: 0,
      permissions: studioPermissions
    };

    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    setSelectedRoleId(newRoleId);
    setShowRoleStudioModal(false);

    try {
      localStorage.setItem('kayan_roles_matrix', JSON.stringify(updatedRoles));
    } catch (err) {}

    setStatusMessage(`🎯 تم اعتماد وتثبيت قالب الدور [${newRole.roleName}] بكافة شاشاته وأزراره المحددة بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleTogglePermission = (actionId: string, type: 'view' | 'execute') => {
    setRoles(prevRoles =>
      prevRoles.map(r => {
        if (r.roleId !== selectedRoleId) return r;
        const current = r.permissions[actionId] || { view: false, execute: false };
        const updated = { ...current, [type]: !current[type] };
        if (type === 'view' && !updated.view) updated.execute = false;
        if (type === 'execute' && updated.execute) updated.view = true;
        return {
          ...r,
          permissions: { ...r.permissions, [actionId]: updated }
        };
      })
    );
  };

  const handleSaveMatrix = () => {
    try {
      localStorage.setItem('kayan_roles_matrix', JSON.stringify(roles));
      setStatusMessage(`✅ تم حفظ وتطبيق مصفوفة الصلاحيات للدور [${activeRole.roleName}] بنجاح.`);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredActions = systemActions.filter(act => {
    const matchesModule = moduleFilter === 'ALL' || act.module === moduleFilter;
    const matchesSearch = !searchTerm || act.name.toLowerCase().includes(searchTerm.toLowerCase()) || act.screenName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const studioFilteredActions = systemActions.filter(act => {
    return studioModuleFilter === 'ALL' || act.module === studioModuleFilter;
  });

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-slate-900 dark:text-zinc-100 transition-colors" dir="rtl">
      
      {/* الترويسة الرئيسية */}
      <div className="bg-white dark:bg-[#0f1117] border border-slate-300 dark:border-zinc-800 shadow-sm dark:shadow-lg p-5 rounded-2xl mb-6 flex flex-wrap justify-between items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-700 dark:text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-amber-500" />
              <span>إدارة المستخدمين ومصمم قوالب الأدوار الشامل (Role Template Studio)</span>
            </h1>
            <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 px-2.5 py-0.5 rounded-lg text-xs font-black">
              الدور هو صانع القالب والشاشات
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-zinc-400">
            تصميم قوالب الأدوار لكل شاشة وزر بالمنظومة (View / Execute) وحفظها كقوالب تشغيل مستقلة.
          </p>
        </div>

        <div className="flex bg-slate-200 dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-300 dark:border-zinc-800 gap-1.5">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>مستخدمو المنشأة والعاملين</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>مصفوفة صلاحيات الأدوار (Roles Matrix)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-black flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* التبويب الأول: مستخدمو المنشأة */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm flex flex-wrap justify-between items-center gap-3">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-xl font-bold text-xs">
              إجمالي المستخدمين: {users.length}
            </span>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ إضافة مستخدم مرتبط بعامل</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead className="bg-slate-200 dark:bg-[#171a24] text-slate-900 dark:text-zinc-100 border-b border-slate-300 dark:border-zinc-800 font-black">
                  <tr>
                    <th className="py-3 px-3 w-12">#</th>
                    <th className="py-3 px-3">اسم المستخدم</th>
                    <th className="py-3 px-3 text-right">اسم العامل المرتبط</th>
                    <th className="py-3 px-3">كود العامل</th>
                    <th className="py-3 px-3 text-right">القسم / الصالة</th>
                    <th className="py-3 px-3">الدور الوظيفي والقالب</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3">الصلاحيات الاستثنائية</th>
                    <th className="py-3 px-3 w-28">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 font-bold text-slate-900 dark:text-zinc-200">
                  {users.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-black text-indigo-700 dark:text-indigo-400">{u.username}</td>
                      <td className="py-3 px-3 text-right font-black text-slate-950 dark:text-white">{u.fullName}</td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-zinc-300">{u.workerCode}</td>
                      <td className="py-3 px-3 text-right text-slate-700 dark:text-zinc-300">{u.department}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 rounded-lg text-[11px] font-black">
                          {u.roleName}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 rounded-full text-[10px] font-black">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {u.customOverridesCount > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 rounded font-black text-[10px]">
                            {u.customOverridesCount} استثناء خاص
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-zinc-500 text-[11px]">قالب الدور المعتمد</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setSelectedRoleId(u.roleId);
                            setActiveTab('matrix');
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer"
                          title="فحص وتعديل قالب الدور"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* التبويب الثاني: مصفوفة صلاحيات الأدوار واستوديو القوالب */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* قائمة الأدوار والقوالب المصممة */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-300">
                  قوالب الأدوار المعتمدة ({roles.length}):
                </span>
                
                {/* زر فتح مصمم القوالب المتكامل */}
                <button
                  onClick={handleOpenStudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  <span>+ مصمم قالب دور جديد</span>
                </button>
              </div>

              <div className="space-y-2">
                {roles.map(r => (
                  <button
                    key={r.roleId}
                    onClick={() => setSelectedRoleId(r.roleId)}
                    className={`w-full p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      selectedRoleId === r.roleId
                        ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300 shadow-sm ring-1 ring-amber-500/50'
                        : 'bg-slate-50 dark:bg-[#141620] border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <strong className="font-black text-xs block">{r.roleName}</strong>
                      <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-mono">
                        {r.usersCount} مستخدم
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                      {r.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* محرر القالب المباشر للشاشات والأزرار */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                  أنت الآن تخصص قالب شاشات وأزرار الدور:
                </span>
                <h3 className="text-base font-black text-indigo-700 dark:text-amber-400">
                  {activeRole.roleName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="p-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="ALL">كافة القطاعات</option>
                  <option value="MES">الإنتاج والتصنيع (MES)</option>
                  <option value="LOGISTICS">المخازن واللوجستيات</option>
                  <option value="SALES">المبيعات والفروع</option>
                  <option value="FINANCE">الإدارة المالية</option>
                  <option value="QA">الجودة والـ HACCP</option>
                  <option value="PROCUREMENT">المشتريات والموردين</option>
                  <option value="HR">الموارد البشرية</option>
                  <option value="SOS">الطوارئ والـ SOS</option>
                </select>

                <button
                  onClick={handleSaveMatrix}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ تعديلات القالب</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-200 dark:bg-[#171a24] text-slate-900 dark:text-zinc-100 border-b border-slate-300 dark:border-zinc-800 font-black">
                    <tr>
                      <th className="py-3 px-4">الشاشة المستهدفة والزر</th>
                      <th className="py-3 px-3">القطاع</th>
                      <th className="py-3 px-3 text-center w-28">الرؤية بالشاشة (View)</th>
                      <th className="py-3 px-3 text-center w-28">التنفيذ الفعلي (Execute)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 font-bold text-slate-800 dark:text-zinc-200">
                    {filteredActions.map((act) => {
                      const p = activeRole.permissions[act.id] || { view: false, execute: false };
                      return (
                        <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-[10px] text-indigo-600 dark:text-amber-400 block mb-0.5">
                              [شاشة: {act.screenName}]
                            </span>
                            <span className="font-black text-slate-950 dark:text-white block text-sm">
                              {act.name}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded text-[10px] font-mono font-bold">
                              {act.module}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(act.id, 'view')}
                              className={`p-2 rounded-xl border transition-all cursor-pointer mx-auto flex items-center justify-center gap-1.5 ${
                                p.view
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-400'
                              }`}
                            >
                              {p.view ? <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                              <span className="text-[10px] font-black">{p.view ? 'مرئي' : 'مخفي'}</span>
                            </button>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(act.id, 'execute')}
                              disabled={!p.view}
                              className={`p-2 rounded-xl border transition-all mx-auto flex items-center justify-center gap-1.5 ${
                                !p.view
                                  ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-zinc-800'
                                  : (p.execute
                                      ? 'bg-indigo-100 text-indigo-900 border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300 cursor-pointer'
                                      : 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-500/20 dark:text-amber-400 cursor-pointer')
                              }`}
                            >
                              {p.execute ? <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                              <span className="text-[10px] font-black">{p.execute ? 'مفعل' : 'معطل'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* استوديو تصميم قالب الدور الشامل (The Master Role Studio Modal) */}
      {showRoleStudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#11131c] border-2 border-indigo-500/40 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-zinc-100 max-h-[92vh] flex flex-col" dir="rtl">
            
            {/* الترويسة الرئيسية للاستوديو */}
            <div className="p-4 bg-slate-100 dark:bg-[#181b26] border-b border-slate-300 dark:border-zinc-700 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    مصمم قوالب الأدوار الميداني (Role & Screen Template Studio)
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">
                    ابنِ قالباً مخصصاً بالكامل وحدد الشاشات والأزرار المسموحة لمستخدمي هذا الدور
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowRoleStudioModal(false)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudioRole} className="p-6 overflow-y-auto space-y-5 text-xs font-bold flex-1">
              
              {/* بيانات القالب الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-[#161824] p-4 rounded-2xl border border-slate-300 dark:border-zinc-700">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-300 mb-1">
                    مسمى قالب الدور الوظيفي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studioRoleName}
                    onChange={(e) => setStudioRoleName(e.target.value)}
                    placeholder="مثال: مسؤول مبيعات وتوزيع فرع خارجي"
                    className="w-full p-2.5 bg-white dark:bg-[#1f2334] border border-slate-300 dark:border-zinc-600 rounded-xl text-slate-900 dark:text-zinc-100 font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-zinc-300 mb-1">
                    توصيف نطاق عمل القالب
                  </label>
                  <input
                    type="text"
                    value={studioRoleDesc}
                    onChange={(e) => setStudioRoleDesc(e.target.value)}
                    placeholder="مثال: يقتصر على تحرير فواتير المعرض واستلام صواني الحلويات فقط"
                    className="w-full p-2.5 bg-white dark:bg-[#1f2334] border border-slate-300 dark:border-zinc-600 rounded-xl text-slate-900 dark:text-zinc-100 font-medium outline-none"
                  />
                </div>
              </div>

              {/* شريط الإجراءات والفلترة السريعة للقالب */}
              <div className="flex flex-wrap justify-between items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-900 dark:text-indigo-300 font-black">فلترة القطاع:</span>
                  <select
                    value={studioModuleFilter}
                    onChange={(e) => setStudioModuleFilter(e.target.value)}
                    className="p-1.5 bg-white dark:bg-[#1a1d2b] border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="ALL">كافة القطاعات ({systemActions.length} إجراء)</option>
                    <option value="MES">الإنتاج والتشغيل MES</option>
                    <option value="LOGISTICS">المخازن وسلاسل الإمداد</option>
                    <option value="SALES">المبيعات والفروع</option>
                    <option value="FINANCE">الإدارة المالية</option>
                    <option value="QA">الجودة والـ HACCP</option>
                  </select>
                </div>

                {/* أزرار الضبط السريع */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleBulkSelect('ALL_FULL')}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    تفعيل الكل (كامل)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkSelect('ALL_VIEW')}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    رؤية فقط (View Only)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkSelect('CLEAR')}
                    className="px-2.5 py-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    تفريغ القالب
                  </button>
                </div>
              </div>

              {/* جدول شاشات وأزرار القالب المصمم */}
              <div className="border border-slate-300 dark:border-zinc-700 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-200 dark:bg-[#181b26] text-slate-900 dark:text-zinc-100 border-b border-slate-300 dark:border-zinc-700 font-black">
                    <tr>
                      <th className="py-2.5 px-3">الشاشة والزر المرتبط</th>
                      <th className="py-2.5 px-3">القطاع</th>
                      <th className="py-2.5 px-3 text-center w-28">ظهور الشاشة والزر</th>
                      <th className="py-2.5 px-3 text-center w-28">صلاحية التنفيذ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 font-bold text-slate-900 dark:text-zinc-200">
                    {studioFilteredActions.map(act => {
                      const p = studioPermissions[act.id] || { view: false, execute: false };
                      return (
                        <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 block">
                              [{act.screenName}]
                            </span>
                            <span className="font-black text-slate-900 dark:text-white text-xs">
                              {act.name}
                            </span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded text-[10px] font-mono">
                              {act.module}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStudioPerm(act.id, 'view')}
                              className={`p-1.5 rounded-lg border text-center font-bold text-[10px] w-20 mx-auto flex items-center justify-center gap-1 cursor-pointer ${
                                p.view
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-500 border-slate-300 dark:border-zinc-700'
                              }`}
                            >
                              {p.view ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              <span>{p.view ? 'مُفعّل' : 'مخفي'}</span>
                            </button>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStudioPerm(act.id, 'execute')}
                              disabled={!p.view}
                              className={`p-1.5 rounded-lg border text-center font-bold text-[10px] w-20 mx-auto flex items-center justify-center gap-1 ${
                                !p.view
                                  ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-zinc-800'
                                  : (p.execute
                                      ? 'bg-indigo-100 text-indigo-900 border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300 cursor-pointer'
                                      : 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-500/20 dark:text-amber-400 cursor-pointer')
                              }`}
                            >
                              {p.execute ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{p.execute ? 'تنفيذ' : 'معطل'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* أزرار الحفظ والإغلاق */}
              <div className="flex gap-2 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRoleStudioModal(false)}
                  className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 rounded-xl font-bold cursor-pointer transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد وحفظ قالب الدور الجديد</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة مستخدم */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#11131c] border-2 border-slate-400 dark:border-zinc-700 rounded-3xl w-full max-w-xl shadow-2xl p-6 transition-all text-slate-900 dark:text-zinc-100" dir="rtl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">إضافة مستخدم جديد وربطه بقالب الدور</h3>
              <button onClick={() => setShowAddUserModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-500">اختر العامل وقم بربطه بأحد القوالب المعتمدة لتطبيق صلاحياته فوراً.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersManagementPage;
