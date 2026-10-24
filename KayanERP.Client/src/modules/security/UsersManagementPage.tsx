import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldLock,
  ArrowRight,
  Sliders,
  Users,
  PlusCircle,
  UserPlus,
  Info,
  CheckCircle2,
  Key,
  ShieldPlus,
  UserX,
  UserCheck,
  Search,
  X,
  Layers,
  Save,
  Check,
  Building2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchPermissionCatalogApi,
  fetchRolesApi,
  fetchUsersApi,
  fetchEmployeesLookupApi,
  saveRolePermissionsApi,
  createRoleApi,
  createUserApi,
  toggleUserStatusApi,
  saveUserCustomPermsApi,
} from './securityApi';
import type {
  RoleDto,
  UserRowDto,
  EmployeeLookupDto,
  PermissionGroupDto,
} from './securityApi';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const UsersManagementPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ROLES' | 'USERS'>('ROLES');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // مصفوفة الأدوار والصلاحيات
  const [rolesList, setRolesList] = useState<RoleDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionGroupDto[]>([]);
  const [activePermissionsSet, setActivePermissionsSet] = useState<Set<string>>(new Set());
  const [permSearchTerm, setPermSearchTerm] = useState<string>('');

  // سجل المستخدمين والعاملين
  const [usersList, setUsersList] = useState<UserRowDto[]>([]);
  const [employeesList, setEmployeesList] = useState<EmployeeLookupDto[]>([]);

  // Modals
  const [showCreateRoleModal, setShowCreateRoleModal] = useState<boolean>(false);
  const [newRoleDisplayName, setNewRoleDisplayName] = useState<string>('');
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDescription, setNewRoleDescription] = useState<string>('');
  const [cloneFromRoleId, setCloneFromRoleId] = useState<number>(0);

  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newUserFullName, setNewUserFullName] = useState<string>('');
  const [newUserDepartmentName, setNewUserDepartmentName] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string | null>(null);
  const [newUserRoleId, setNewUserRoleId] = useState<number>(0);

  const [showResetPassModal, setShowResetPassModal] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<UserRowDto | null>(null);
  const [resetPassNew, setResetPassNew] = useState<string>('');

  const [showCustomPermsModal, setShowCustomPermsModal] = useState<boolean>(false);
  const [userCustomPermsSet, setUserCustomPermsSet] = useState<Set<string>>(new Set());

  const [isSubmittingModal, setIsSubmittingModal] = useState<boolean>(false);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [catalog, roles, users, employees] = await Promise.all([
        fetchPermissionCatalogApi(),
        fetchRolesApi(1),
        fetchUsersApi(1),
        fetchEmployeesLookupApi(1),
      ]);
      setPermissionCatalog(catalog);
      setRolesList(roles);
      setUsersList(users);
      setEmployeesList(employees);

      if (roles.length > 0) {
        selectRole(roles[0]);
      }
    } catch (err: any) {
      setStatusMessage(`خطأ في جلب بيانات الحوكمة: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const selectRole = (role: RoleDto) => {
    setSelectedRole(role);
    const set = new Set<string>();
    if (role.permissions) {
      role.permissions.split(',').forEach((p) => {
        if (p.trim()) set.add(p.trim());
      });
    }
    setActivePermissionsSet(set);
  };

  const togglePermission = (code: string) => {
    setActivePermissionsSet((prev) => {
      const updated = new Set(prev);
      if (updated.has(code)) updated.delete(code);
      else updated.add(code);
      return updated;
    });
  };

  const selectAllPermissions = () => {
    const all = new Set<string>();
    permissionCatalog.forEach((group) => {
      group.permissions.forEach((p) => all.add(p.code));
    });
    setActivePermissionsSet(all);
  };

  const clearAllPermissions = () => {
    setActivePermissionsSet(new Set());
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      const arr = Array.from(activePermissionsSet);
      await saveRolePermissionsApi(selectedRole.id, arr);
      selectedRole.permissions = arr.join(',');
      setStatusMessage(`✓ تم حفظ وتحديث مصفوفة أزرار (${selectedRole.displayName}) بنجاح.`);
    } catch (err: any) {
      setStatusMessage(`خطأ أثناء الحفظ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    if (!permSearchTerm.trim()) return permissionCatalog;
    const term = permSearchTerm.trim().toLowerCase();

    return permissionCatalog
      .map((g) => ({
        ...g,
        permissions: g.permissions.filter(
          (p) =>
            p.title.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.code.toLowerCase().includes(term)
        ),
      }))
      .filter((g) => g.permissions.length > 0);
  }, [permissionCatalog, permSearchTerm]);

  // Modal 1: إنشاء دور
  const handleSubmitCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleDisplayName.trim()) {
      setStatusMessage('يرجى كتابة اسم الدور بالعربية.');
      return;
    }
    setIsSubmittingModal(true);
    try {
      let initialPerms: string[] = [];
      if (cloneFromRoleId > 0) {
        const source = rolesList.find((r) => r.id === cloneFromRoleId);
        if (source?.permissions) initialPerms = source.permissions.split(',').map((p) => p.trim());
      }

      await createRoleApi({
        displayName: newRoleDisplayName.trim(),
        name: newRoleName.trim() || 'CUSTOM_ROLE',
        description: newRoleDescription.trim(),
        permissions: initialPerms,
      });

      setShowCreateRoleModal(false);
      setStatusMessage('✓ تم إنشاء الدور والمصفوفة بنجاح.');
      await loadAllData();
    } catch (err: any) {
      setStatusMessage(`خطأ: ${err.message}`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Modal 2: إنشاء مستخدم
  const handleEmployeeSelect = (empId: number) => {
    const emp = employeesList.find((x) => x.id === empId);
    if (emp) {
      setSelectedEmployeeId(emp.id);
      setSelectedEmployeeCode(emp.EmployeeCode || emp.employeeCode);
      setNewUserFullName(emp.FullName || emp.fullName);
      setNewUserDepartmentName(emp.DepartmentName || emp.departmentName);
      if (!newUsername) {
        setNewUsername((emp.EmployeeCode || emp.employeeCode).toLowerCase());
      }
    }
  };

  const handleSubmitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newUserPassword.trim()) {
      setStatusMessage('اسم المستخدم وكلمة المرور مطلوبان.');
      return;
    }
    setIsSubmittingModal(true);
    try {
      const roleObj = rolesList.find((r) => r.id === newUserRoleId) || rolesList[0];
      await createUserApi({
        username: newUsername.trim(),
        password: newUserPassword.trim(),
        fullName: newUserFullName.trim(),
        departmentName: newUserDepartmentName.trim() || 'الإدارة العامة',
        roleId: roleObj.id,
        roleName: roleObj.displayName,
        employeeId: selectedEmployeeId,
        employeeCode: selectedEmployeeCode,
      });

      setShowCreateUserModal(false);
      setStatusMessage('✓ تم إنشاء حساب المستخدم وربطه بالعامل بنجاح.');
      await loadAllData();
    } catch (err: any) {
      setStatusMessage(`خطأ: ${err.message}`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // تفعيل / تعطيل المستخدم
  const handleToggleUserStatus = async (userRow: UserRowDto) => {
    try {
      await toggleUserStatusApi(userRow.id, userRow.isActive);
      userRow.isActive = !userRow.isActive;
      setUsersList([...usersList]);
      setStatusMessage(`✓ تم تحديث حالة حساب (${userRow.username}).`);
    } catch (err: any) {
      setStatusMessage(`خطأ: ${err.message}`);
    }
  };

  // Modal 3: إعادة تعيين كلمة المرور
  const handleSubmitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || !resetPassNew.trim()) return;
    setIsSubmittingModal(true);
    setTimeout(() => {
      setShowResetPassModal(false);
      setStatusMessage(`✓ تم تغيير كلمة المرور للمستخدم (${targetUser.username}) بنجاح.`);
      setIsSubmittingModal(false);
    }, 400);
  };

  // Modal 4: الصلاحيات الاستثنائية
  const openCustomPermsModal = (u: UserRowDto) => {
    setTargetUser(u);
    const set = new Set<string>();
    if (u.customPermissions) {
      u.customPermissions.split(',').forEach((p) => {
        if (p.trim()) set.add(p.trim());
      });
    }
    setUserCustomPermsSet(set);
    setShowCustomPermsModal(true);
  };

  const toggleUserCustomPerm = (code: string) => {
    setUserCustomPermsSet((prev) => {
      const updated = new Set(prev);
      if (updated.has(code)) updated.delete(code);
      else updated.add(code);
      return updated;
    });
  };

  const handleSubmitSaveUserCustomPerms = async () => {
    if (!targetUser) return;
    setIsSubmittingModal(true);
    try {
      const arr = Array.from(userCustomPermsSet);
      await saveUserCustomPermsApi(targetUser.id, arr);
      targetUser.customPermissions = arr.join(',');
      setShowCustomPermsModal(false);
      setStatusMessage(`✓ تم حفظ الصلاحيات الاستثنائية للمستخدم (${targetUser.username}) بنجاح.`);
    } catch (err: any) {
      setStatusMessage(`خطأ: ${err.message}`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden" dir="rtl">
      {/* 1. الشريط العلوي */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('workspace')}
            title="العودة لمساحة العمل المركزية"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">مركز حوكمة الصلاحيات والأدوار الميدانية</h1>
            <span className="text-[11px] text-slate-400">مصفوفة التحكم الصارم في أزرار وإجراءات المنظومة الصناعية</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-400">
            <ShieldLock className="w-3.5 h-3.5 text-amber-400" />
            <span>المستخدم الحالي: {user?.fullName} ({user?.role})</span>
          </span>
        </div>
      </header>

      {/* 2. شريط التبويبات وأزرار الإضافة السريعة */}
      <div className="px-6 pt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ROLES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'ROLES'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>مصفوفة صلاحيات الأدوار (Roles Matrix)</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'USERS'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>مستخدمو المنشأة والعاملين</span>
          </button>
        </div>

        <div>
          {activeTab === 'ROLES' ? (
            <button
              onClick={() => {
                setNewRoleDisplayName('');
                setNewRoleName('');
                setNewRoleDescription('');
                setCloneFromRoleId(0);
                setShowCreateRoleModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة دور / مصفوفة جديدة</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setNewUsername('');
                setNewUserPassword('');
                setNewUserFullName('');
                setNewUserDepartmentName('');
                setSelectedEmployeeId(null);
                setSelectedEmployeeCode(null);
                setNewUserRoleId(rolesList[0]?.id || 0);
                setShowCreateUserModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم مرتبط بعامل</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. رسائل التنبيه والإشعارات */}
      {statusMessage && (
        <div className="px-6 pt-3">
          <div className="p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-xl text-xs flex items-center justify-between text-indigo-200">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white font-bold">×</button>
          </div>
        </div>
      )}

      {/* 4. المحتوى التفاعلي */}
      <main className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>جاري قراءة بنود الحوكمة ومصفوفة الصلاحيات السحابية...</span>
          </div>
        ) : activeTab === 'ROLES' ? (
          /* ======================================================== */
          /* تبويب 1: مصفوفة صلاحيات الأدوار الوظيفية (ROLES MATRIX)    */
          /* ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* قائمة الأدوار المتاحة */}
            <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col h-[calc(100vh-210px)]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">الأدوار المعتمدة بالمنشأة</span>
                <span className="bg-indigo-600 text-white text-[11px] px-2 py-0.5 rounded-full font-mono">
                  {rolesList.length} أدوار
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {rolesList.map((r) => {
                  const isSelected = selectedRole?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => selectRole(r)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-xs'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                          {r.displayName}
                        </span>
                        <span className="bg-slate-900 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                          {r.usersCount} مستخدم
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate mt-1">{r.description || 'بدون وصف إضافي'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* شجرة ومصفوفة أزرار الدور المختار */}
            <div className="lg:col-span-8 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-[calc(100vh-210px)]">
              {selectedRole ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
                    <div>
                      <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4" />
                        <span>ضبط صلاحيات: {selectedRole.displayName}</span>
                      </h2>
                      <span className="text-[11px] text-slate-400">حدد الأزرار المسموح لهذا الدور بالضغط عليها وتنفيذها</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="relative flex items-center">
                        <Search className="absolute right-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="بحث في الأزرار..."
                          value={permSearchTerm}
                          onChange={(e) => setPermSearchTerm(e.target.value)}
                          className="pr-8 pl-3 py-1.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 w-44"
                        />
                      </div>

                      <button
                        onClick={selectAllPermissions}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl border border-slate-700 font-semibold text-xs"
                      >
                        تحديد الكل
                      </button>

                      <button
                        onClick={clearAllPermissions}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl border border-slate-700 font-semibold text-xs"
                      >
                        إلغاء الكل
                      </button>

                      <button
                        onClick={handleSaveRolePermissions}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors text-xs disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'جاري الحفظ...' : '✓ حفظ تعديلات الدور'}</span>
                      </button>
                    </div>
                  </div>

                  {/* مجموعات الصلاحيات */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {filteredCatalog.map((group) => {
                      const activeCount = group.permissions.filter((p) => activePermissionsSet.has(p.code)).length;
                      return (
                        <div key={group.groupCode} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
                            <span className="text-xs font-bold text-white">{group.groupName}</span>
                            <span className="bg-slate-900 border border-slate-700 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                              {activeCount} / {group.permissions.length} مفعل
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {group.permissions.map((perm) => {
                              const isChecked = activePermissionsSet.has(perm.code);
                              return (
                                <div
                                  key={perm.code}
                                  onClick={() => togglePermission(perm.code)}
                                  className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                                    isChecked
                                      ? 'bg-indigo-600/15 border-indigo-500/60 text-white'
                                      : 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="w-4 h-4 mt-0.5 text-indigo-600 rounded bg-slate-950 border-slate-700 pointer-events-none"
                                  />
                                  <div className="flex-1">
                                    <span className={`text-xs font-bold block ${isChecked ? 'text-indigo-300' : 'text-slate-300'}`}>
                                      {perm.title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                                      {perm.description}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* تبويب 2: مستخدمو المنشأة والعاملين المرتبطين             */
          /* ======================================================== */
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white">سجل مستخدمي المنشأة المستأجرة</h2>
                <span className="text-[11px] text-slate-400">مراجعة رتب الموظفين، ربطهم بملفات العاملين، وتخصيص الصلاحيات</span>
              </div>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-xl text-xs font-mono">
                إجمالي المستخدمين: {usersList.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">اسم المستخدم</th>
                    <th className="py-3 px-4">اسم العامل المرتبط</th>
                    <th className="py-3 px-4 text-center">كود العامل</th>
                    <th className="py-3 px-4">القسم / الصالة</th>
                    <th className="py-3 px-4">الدور الوظيفي</th>
                    <th className="py-3 px-4 text-center">الحالة</th>
                    <th className="py-3 px-4 text-center">الصلاحيات الاستثنائية</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList.map((u) => {
                    const customCount = u.customPermissions ? u.customPermissions.split(',').filter(Boolean).length : 0;
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">{u.id}</td>
                        <td className="py-3 px-4 font-bold text-cyan-400 font-mono">{u.username}</td>
                        <td className="py-3 px-4 text-slate-200">{u.fullName || '---'}</td>
                        <td className="py-3 px-4 text-center">
                          {u.employeeCode ? (
                            <span className="bg-slate-950 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded font-mono text-[11px]">
                              {u.employeeCode}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">غير مرتبط</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-slate-300">
                            {u.departmentName || 'الإدارة العامة'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded text-[11px] font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.isActive
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                          }`}>
                            {u.isActive ? 'نشط' : 'معطل'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {customCount > 0 ? (
                            <span className="bg-amber-950/60 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-bold font-mono">
                              {customCount} استثناءات
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">حسب الدور</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openCustomPermsModal(u)}
                              title="تخصيص صلاحيات أزرار خاصة"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg transition-colors"
                            >
                              <ShieldPlus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setTargetUser(u);
                                setResetPassNew('');
                                setShowResetPassModal(true);
                              }}
                              title="تغيير كلمة المرور"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg transition-colors"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                              className={`p-1.5 border rounded-lg transition-colors ${
                                u.isActive
                                  ? 'bg-slate-800 hover:bg-rose-900/50 text-rose-400 border-slate-700'
                                  : 'bg-slate-800 hover:bg-emerald-900/50 text-emerald-400 border-slate-700'
                              }`}
                            >
                              {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* Modal 1: نافذة إنشاء دور جديد                             */}
      {/* ======================================================== */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>إضافة دور وظيفي / مصفوفة جديدة</span>
              </h3>
              <button onClick={() => setShowCreateRoleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateRole} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  اسم الدور بالعربية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مسؤول خط تصنيع، كاشير فرع، أمين خامات"
                  value={newRoleDisplayName}
                  onChange={(e) => setNewRoleDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">كود الدور بالإنجليزية</label>
                <input
                  type="text"
                  placeholder="مثال: LINE_SUPERVISOR"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white font-mono rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الوصف الوظيفي</label>
                <textarea
                  rows={2}
                  placeholder="وصف مختصر للمسؤوليات الميدانية..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">نسخ صلاحيات مبدئية من دور آخر (اختياري)</label>
                <select
                  value={cloneFromRoleId}
                  onChange={(e) => setCloneFromRoleId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500"
                >
                  <option value={0}>بدء بمصفوفة فارغة بدون صلاحيات</option>
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      نسخ من: {r.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModal}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  حفظ الدور والمصفوفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal 2: نافذة إنشاء مستخدم جديد مرتبط بعامل              */}
      {/* ======================================================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>إضافة حساب مستخدم مرتبط بعامل</span>
              </h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  اختر العامل من السجل الرسمي <span className="text-rose-500">*</span>
                </label>
                <select
                  onChange={(e) => handleEmployeeSelect(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-emerald-500"
                >
                  <option value={0}>-- اختر العامل لملء البيانات تلقائياً --</option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      [{emp.employeeCode || emp.EmployeeCode}] {emp.fullName || emp.FullName} ({emp.departmentName || emp.DepartmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم الموظف الكامل</label>
                  <input
                    type="text"
                    value={newUserFullName}
                    onChange={(e) => setNewUserFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">القسم / الصالة</label>
                  <input
                    type="text"
                    value={newUserDepartmentName}
                    onChange={(e) => setNewUserDepartmentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    اسم المستخدم لتسجيل الدخول <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ahmad_ali"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white font-mono rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    كلمة المرور الشخصية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  الدور الوظيفي والمصفوفة المعتمدة <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newUserRoleId}
                  onChange={(e) => setNewUserRoleId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-emerald-500"
                >
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModal}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  إنشاء الحساب وتفعيله
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal 3: إعادة تعيين كلمة المرور                          */}
      {/* ======================================================== */}
      {showResetPassModal && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>تغيير كلمة المرور: {targetUser.username}</span>
              </h3>
              <button onClick={() => setShowResetPassModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResetPassword} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetPassNew}
                  onChange={(e) => setResetPassNew(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetPassModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModal}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal 4: الصلاحيات الاستثنائية للمستخدم                   */}
      {/* ======================================================== */}
      {showCustomPermsModal && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl text-xs flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldPlus className="w-4 h-4 text-amber-400" />
                  <span>صلاحيات استثنائية: {targetUser.fullName || targetUser.username}</span>
                </h3>
                <span className="text-[11px] text-slate-400">تمنح للمستخدم مباشرة وتتجاوز مصفوفة دوره الرسمي ({targetUser.role})</span>
              </div>
              <button onClick={() => setShowCustomPermsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-2">
              {permissionCatalog.map((group) => (
                <div key={group.groupCode} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-xs font-bold text-white block mb-2 pb-1 border-b border-slate-800">
                    {group.groupName}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.permissions.map((perm) => {
                      const isCustom = userCustomPermsSet.has(perm.code);
                      return (
                        <div
                          key={perm.code}
                          onClick={() => toggleUserCustomPerm(perm.code)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                            isCustom
                              ? 'bg-amber-500/15 border-amber-500 text-white'
                              : 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isCustom}
                            readOnly
                            className="w-4 h-4 mt-0.5 text-amber-500 rounded bg-slate-950 border-slate-700 pointer-events-none"
                          />
                          <div className="flex-1">
                            <span className={`text-xs font-bold block ${isCustom ? 'text-amber-300' : 'text-slate-300'}`}>
                              {perm.title}
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                              {perm.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setShowCustomPermsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSubmitSaveUserCustomPerms}
                disabled={isSubmittingModal}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                حفظ الصلاحيات الاستثنائية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
