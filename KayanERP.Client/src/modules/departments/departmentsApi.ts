export type DepartmentItemDto = {
  id: number;
  companyId?: number;
  parentDepartmentId?: number | null;
  departmentCode: string;
  departmentName: string;
  description?: string;
  active: boolean;
};

export type DepartmentImportRowDto = {
  departmentCode: string;
  departmentName: string;
  parentCode?: string;
  description?: string;
  active: boolean;
};

export const fetchDepartmentsApi = async (): Promise<DepartmentItemDto[]> => {
  try {
    const res = await fetch('/api/departments');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      companyId: 1,
      parentDepartmentId: null,
      departmentCode: '100',
      departmentName: 'الإدارة العليا وإدارة العمليات',
      description: 'الإدارة المركزية لمجموعة مصانع أبو عادل',
      active: true
    },
    {
      id: 2,
      companyId: 1,
      parentDepartmentId: 1,
      departmentCode: '200',
      departmentName: 'إدارة شؤون الإنتاج والتصنيع',
      description: 'إشراف مباشر على صالات الحلويات والمعامل',
      active: true
    },
    {
      id: 3,
      companyId: 1,
      parentDepartmentId: 2,
      departmentCode: '301',
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      description: 'صالة أفران وخبز الكنافة والبسبوسة والبقلاوة',
      active: true
    },
    {
      id: 4,
      companyId: 1,
      parentDepartmentId: 2,
      departmentCode: '302',
      departmentName: 'صالة تصنيع الحلويات الغربية والتورت',
      description: 'معمل تورت المناسبات والجاتوه والموس الفرنسي',
      active: true
    },
    {
      id: 5,
      companyId: 1,
      parentDepartmentId: 2,
      departmentCode: '303',
      departmentName: 'صالة العجن والتجهيز الأولي',
      description: 'تجهيز خلطات العجين والشراب وعسل الجلوكوز',
      active: true
    },
    {
      id: 6,
      companyId: 1,
      parentDepartmentId: 1,
      departmentCode: '400',
      departmentName: 'قسم الفرز والتعبئة والكنترول النهائي',
      description: 'تعبئة الصاجات والأسبتة والتسليم لسائقين التوزيع',
      active: true
    }
  ];
};

export const saveDepartmentApi = async (dept: Partial<DepartmentItemDto>): Promise<boolean> => {
  try {
    const isEdit = Boolean(dept.id && dept.id > 0);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/departments/${dept.id}` : '/api/departments';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const toggleDepartmentStatusApi = async (dept: DepartmentItemDto): Promise<boolean> => {
  try {
    const res = await fetch(`/api/departments/${dept.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dept, active: !dept.active })
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const deleteDepartmentApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
};
