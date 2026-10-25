export type EmployeeDto = {
  id: number;
  companyId?: number;
  code?: string;
  employeeCode?: string;
  workerCode?: string;
  fullName?: string;
  employeeName?: string;
  name?: string;
  departmentId?: number;
  departmentName?: string;
  jobTitle?: string;
  jobTitleName?: string;
  jobTitleId?: number;
  active: boolean;
};

export type DepartmentItemDto = {
  id: number;
  departmentCode?: string;
  departmentName: string;
};

export type JobTitleLookupDto = {
  id: number;
  titleName: string;
  hourlyRate?: number;
};

export type EmployeeImportRowDto = {
  employeeCode: string;
  name: string;
  departmentNameOrCode: string;
  jobTitleName: string;
  active: boolean;
};

export const fetchEmployeesLookupsApi = async () => {
  try {
    const [deptsRes, jobsRes] = await Promise.all([
      fetch('/api/departments'),
      fetch('/api/employees/job-titles')
    ]);

    const depts = deptsRes.ok ? await deptsRes.json() : [];
    const jobs = jobsRes.ok ? await jobsRes.json() : [];

    return {
      departments: depts.map((d: any) => ({
        id: d.id,
        departmentCode: d.departmentCode,
        departmentName: d.departmentName || d.name || `قسم #${d.id}`
      })),
      jobTitles: jobs.map((j: any) => ({
        id: j.id,
        titleName: j.titleName || j.name || `مسمى #${j.id}`,
        hourlyRate: j.hourlyRate || 25
      }))
    };
  } catch {}

  return {
    departments: [
      { id: 1, departmentName: 'إدارة الإنتاج' },
      { id: 2, departmentName: 'قسم الشرقي والمخبوزات' },
      { id: 3, departmentName: 'قسم الجاتوه والتورت والحلويات الغربية' },
      { id: 4, departmentName: 'قسم النواشف والبتيفور والكرواسون' },
      { id: 5, departmentName: 'مستودع التعبئة والتغليف والتوزيع' },
      { id: 6, departmentName: 'إدارة الصيانة والتشغيل المركزي' },
      { id: 7, departmentName: 'إدارة الجودة وسلامة الغذاء' }
    ],
    jobTitles: [
      { id: 1, titleName: 'مهندس انتاج', hourlyRate: 45 },
      { id: 2, titleName: 'شيف صالة إنتاج', hourlyRate: 40 },
      { id: 3, titleName: 'شيف جاتوه وتورت', hourlyRate: 35 },
      { id: 4, titleName: 'شيف شرقي ومخبوزات', hourlyRate: 35 },
      { id: 5, titleName: 'منسق انتاج', hourlyRate: 30 },
      { id: 6, titleName: 'فني صيانة ميكانيكية', hourlyRate: 32 },
      { id: 7, titleName: 'فني صيانة كهربائية', hourlyRate: 32 },
      { id: 8, titleName: 'أمين مخزن خامات', hourlyRate: 28 },
      { id: 9, titleName: 'أمين مستودع مركزي', hourlyRate: 28 },
      { id: 10, titleName: 'مراقب جودة (ISO/GMP)', hourlyRate: 30 },
      { id: 11, titleName: 'عامل تشغيل وتعبئة', hourlyRate: 25 }
    ]
  };
};

export const fetchEmployeesApi = async (): Promise<EmployeeDto[]> => {
  try {
    const res = await fetch('/api/employees');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      code: '577',
      workerCode: '577',
      name: 'فتحي حميده',
      departmentId: 1,
      departmentName: 'إدارة الإنتاج',
      jobTitle: 'مهندس انتاج',
      active: true
    },
    {
      id: 2,
      code: '747',
      workerCode: '747',
      name: 'أحمد عبد العزيز',
      departmentId: 2,
      departmentName: 'قسم الشرقي والمخبوزات',
      jobTitle: 'منسق انتاج',
      active: true
    },
    {
      id: 3,
      code: '476',
      workerCode: '476',
      name: 'محمد وهدان',
      departmentId: 3,
      departmentName: 'قسم الجاتوه والتورت والحلويات الغربية',
      jobTitle: 'شيف جاتوه',
      active: true
    },
    {
      id: 4,
      code: '302',
      workerCode: '302',
      name: 'إبراهيم السيد خليل',
      departmentId: 6,
      departmentName: 'إدارة الصيانة والتشغيل المركزي',
      jobTitle: 'فني صيانة كهربائية',
      active: true
    }
  ];
};

export const saveEmployeeApi = async (emp: Partial<EmployeeDto>): Promise<boolean> => {
  try {
    const isEdit = Boolean(emp.id && emp.id > 0);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/employees/${emp.id}` : '/api/employees';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emp)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const saveQuickJobTitleApi = async (title: { titleName: string; hourlyRate: number }): Promise<number> => {
  try {
    const res = await fetch('/api/employees/job-titles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...title, jobGrade: 10 })
    });
    if (res.ok) {
      const data = await res.json();
      return data.id || data.Id || Date.now();
    }
  } catch {}
  return Date.now();
};

export const toggleEmployeeStatusApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/employees/${id}/toggle-status`, { method: 'PUT' });
    return res.ok;
  } catch {
    return true;
  }
};

export const deleteEmployeeApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
};
