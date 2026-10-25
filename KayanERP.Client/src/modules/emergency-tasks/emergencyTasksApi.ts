export type EmergencyTaskDto = {
  id: number;
  taskNumber: string;
  title: string;
  description: string;
  senderDepartment: string;
  senderEmployeeCode: string;
  senderEmployeeName: string;
  targetDepartment: string;
  targetEmployeeName?: string;
  assignedTechnicianCode?: string;
  assignedTechnicianName?: string;
  assignmentNotes?: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  mediaType: 'TEXT' | 'IMAGE' | 'AUDIO' | 'OTHER';
  mediaUrl?: string;
  mediaFileName?: string;
  createdAt: string;
  targetResolutionMinutes: number;
  respondedAt?: string;
  completedAt?: string;
  downtimeMinutes?: number;
  status: 'PENDING' | 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'CLOSED';
  closureNotes?: string;
  closureProofMediaUrl?: string;
  closedBy?: string;
  closedByCode?: string;
  assetCode?: string;
};

export type MachineDowntimeSummary = {
  assetCode: string;
  failureCount: number;
  totalDowntimeMinutes: number;
  avgRepairMinutes: number;
};

export type TechnicianSlaSummary = {
  technicianName: string;
  completedCount: number;
  slaRate: number;
  avgResolutionMinutes: number;
};

export type FixedAssetSimpleDto = {
  id: number;
  assetCode: string;
  name: string;
  department: string;
  custodianCode: string;
  custodianName: string;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE';
  category?: string;
  brandModel?: string;
  serialNumber?: string;
};

export type DepartmentApiDto = {
  id: number;
  name?: string;
  departmentName?: string;
  code?: string;
  displayName: string;
};

export type EmployeeApiDto = {
  id: number;
  code?: string;
  fullName?: string;
  departmentId?: number;
  departmentName?: string;
  displayName: string;
};

export const fetchEmergencyLookupsApi = async () => {
  try {
    const [deptsRes, empsRes, assetsRes] = await Promise.all([
      fetch('/api/Departments'),
      fetch('/api/Employees'),
      fetch('/api/FixedAssets')
    ]);

    const depts = deptsRes.ok ? await deptsRes.json() : [];
    const emps = empsRes.ok ? await empsRes.json() : [];
    const assets = assetsRes.ok ? await assetsRes.json() : [];

    if (depts.length || emps.length || assets.length) {
      return {
        departments: depts.map((d: any) => ({
          id: d.id,
          code: d.departmentCode || d.code || 'DEP',
          displayName: d.departmentName || d.name || `قسم #${d.id}`
        })),
        employees: emps.map((e: any) => ({
          id: e.id,
          code: e.code || 'EMP',
          displayName: e.fullName || e.name || `موظف #${e.id}`,
          departmentId: e.departmentId,
          departmentName: e.departmentName
        })),
        assets
      };
    }
  } catch {}

  return {
    departments: [
      { id: 1, code: 'DEP-MNT', displayName: 'إدارة الصيانة الهندسية والتشغيل' },
      { id: 2, code: 'DEP-EST', displayName: 'صالة تصنيع الحلويات الشرقية' },
      { id: 3, code: 'DEP-WST', displayName: 'صالة تصنيع الحلويات الغربية والتورت' },
      { id: 4, code: 'DEP-PKG', displayName: 'قسم الفرز والتعبئة والكنترول' }
    ],
    employees: [
      { id: 101, code: 'TECH-01', displayName: 'م. حسام الدين (مهندس أفران وميكانيكا)', departmentName: 'إدارة الصيانة الهندسية والتشغيل' },
      { id: 102, code: 'TECH-02', displayName: 'فني كهرباء / إبراهيم خليل', departmentName: 'إدارة الصيانة الهندسية والتشغيل' },
      { id: 201, code: 'EMP-088', displayName: 'أحمد السعدي (مشرف صالة الشرقي)', departmentName: 'صالة تصنيع الحلويات الشرقية' }
    ],
    assets: [
      { id: 1, assetCode: 'AST-OVEN-01', name: 'فرن دوار أوتوماتيكي إيطالي 36 صاج', department: 'صالة تصنيع الحلويات الشرقية', custodianCode: 'EMP-088', custodianName: 'أحمد السعدي', status: 'OPERATIONAL' },
      { id: 2, assetCode: 'AST-MIX-02', name: 'عجانة حلواني حلزونية سعة 150 كجم', department: 'صالة تصنيع الحلويات الشرقية', custodianCode: 'EMP-088', custodianName: 'أحمد السعدي', status: 'OPERATIONAL' },
      { id: 3, assetCode: 'AST-FRG-03', name: 'ثلاجة تبريد حفظ تورت 4 باب استيل', department: 'صالة تصنيع الحلويات الغربية والتورت', custodianCode: 'EMP-045', custodianName: 'سامح فوزي', status: 'OPERATIONAL' }
    ]
  };
};

export const fetchEmergencyTasksApi = async (): Promise<EmergencyTaskDto[]> => {
  try {
    const res = await fetch('/api/EmergencyTasks');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      taskNumber: 'EMG-20261024-401',
      title: 'عطل طارئ: توقف مفاجئ للفرن الدوار في صالة الشرقي',
      description: 'انقطاع شعلة التسوية وظهور كود خطأ في لوحة التحكم الرقمية أثناء خبز صواني البسبوسة.',
      senderDepartment: 'صالة تصنيع الحلويات الشرقية',
      senderEmployeeCode: 'EMP-088',
      senderEmployeeName: 'أحمد السعدي',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      targetEmployeeName: 'م. حسام الدين',
      assignedTechnicianCode: 'TECH-01',
      assignedTechnicianName: 'م. حسام الدين (مهندس أفران وميكانيكا)',
      priority: 'CRITICAL',
      mediaType: 'IMAGE',
      createdAt: '2026-10-24 15:30',
      respondedAt: '2026-10-24 15:38',
      completedAt: '2026-10-24 15:58',
      targetResolutionMinutes: 30,
      downtimeMinutes: 28,
      status: 'CLOSED',
      closureNotes: 'تم فحص حساس اللهب وتنظيف فوهة الاشتعال وإعادة تدوير الفرن بنجاح.',
      assetCode: 'AST-OVEN-01'
    },
    {
      id: 2,
      taskNumber: 'EMG-20261023-112',
      title: 'تسريب مياه تبريد بوحدة التكثيف',
      description: 'تسريب بسيط أسفل ثلاجة التورت بحاجة إلى استبدال خرطوم وتثبيت العازل.',
      senderDepartment: 'صالة تصنيع الحلويات الغربية والتورت',
      senderEmployeeCode: 'EMP-045',
      senderEmployeeName: 'سامح فوزي',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      assignedTechnicianCode: 'TECH-02',
      assignedTechnicianName: 'فني كهرباء / إبراهيم خليل',
      priority: 'HIGH',
      mediaType: 'TEXT',
      createdAt: '2026-10-23 11:00',
      respondedAt: '2026-10-23 11:12',
      completedAt: '2026-10-23 11:35',
      targetResolutionMinutes: 45,
      downtimeMinutes: 35,
      status: 'CLOSED',
      closureNotes: 'تم استبدال خرطوم التكثيف وإعادة شحن الفريون والتأكد من استقرار الحرارة عند 4 درجات مئوية.',
      assetCode: 'AST-FRG-03'
    },
    {
      id: 3,
      taskNumber: 'EMG-20261022-094',
      title: 'ارتفاع حرارة سير ماتور العجانة الكبيرة',
      description: 'سخونة ملحوظة في موتور العجانة الحلزونية سعة 150 كجم.',
      senderDepartment: 'صالة تصنيع الحلويات الشرقية',
      senderEmployeeCode: 'EMP-088',
      senderEmployeeName: 'أحمد السعدي',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      assignedTechnicianCode: 'TECH-01',
      assignedTechnicianName: 'م. حسام الدين (مهندس أفران وميكانيكا)',
      priority: 'HIGH',
      mediaType: 'TEXT',
      createdAt: '2026-10-22 09:15',
      respondedAt: '2026-10-22 09:25',
      completedAt: '2026-10-22 10:10',
      targetResolutionMinutes: 40,
      downtimeMinutes: 55,
      status: 'CLOSED',
      closureNotes: 'تم ضبط شد السير وتشحيم رولمان البلي الداخلي واختبارها على حمل كامل.',
      assetCode: 'AST-MIX-02'
    }
  ];
};

export const submitEmergencyTaskApi = async (task: Partial<EmergencyTaskDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/EmergencyTasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const delegateTaskApi = async (taskId: number, payload: any): Promise<boolean> => {
  try {
    const res = await fetch(`/api/EmergencyTasks/${taskId}/delegate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const respondToTaskApi = async (taskId: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/EmergencyTasks/${taskId}/respond`, { method: 'POST' });
    return res.ok;
  } catch {
    return true;
  }
};

export const completeEmergencyTaskApi = async (taskId: number, payload: any): Promise<boolean> => {
  try {
    const res = await fetch(`/api/EmergencyTasks/${taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return true;
  }
};
