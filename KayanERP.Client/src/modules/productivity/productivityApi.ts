export type WorkerProductivityDto = {
  id: number;
  workerCode: string;
  workerName: string;
  department: string;
  shift: 'صباحي' | 'مسائي' | 'ليلي';
  targetOutput: number;
  actualOutput: number;
  unit: string;
  wasteQuantity: number;
  efficiencyPercentage: number;
  bonusAmount: number;
  penaltyAmount: number;
  date: string;
  notes?: string;
};

export type ProductivityLookupsDto = {
  departments: string[];
  shifts: string[];
  workers: { code: string; name: string; department: string }[];
};

export const fetchProductivityLogsApi = async (): Promise<WorkerProductivityDto[]> => {
  try {
    const res = await fetch('/api/Productivity');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      workerCode: 'EMP-014',
      workerName: 'محمود عبد الرازق',
      department: 'صالة تصنيع الحلويات الشرقية',
      shift: 'صباحي',
      targetOutput: 120,
      actualOutput: 135,
      unit: 'طشت / صينية',
      wasteQuantity: 1.5,
      efficiencyPercentage: 112.5,
      bonusAmount: 150,
      penaltyAmount: 0,
      date: '2026-10-24',
      notes: 'تجاوز المعيار القياسي لتسوية البسبوسة مع صفر هدر'
    },
    {
      id: 2,
      workerCode: 'EMP-022',
      workerName: 'سامح إبراهيم',
      department: 'صالة الكنافة والقطايف',
      shift: 'صباحي',
      targetOutput: 80,
      actualOutput: 72,
      unit: 'كجم بورما',
      wasteQuantity: 4.0,
      efficiencyPercentage: 90.0,
      bonusAmount: 0,
      penaltyAmount: 40,
      date: '2026-10-24',
      notes: 'توقف مؤقت بخط البرم الآلي'
    },
    {
      id: 3,
      workerCode: 'EMP-031',
      workerName: 'علي عثمان',
      department: 'قسم المعجنات والغربي',
      shift: 'مسائي',
      targetOutput: 100,
      actualOutput: 105,
      unit: 'دستة جاتوه',
      wasteQuantity: 0.8,
      efficiencyPercentage: 105.0,
      bonusAmount: 80,
      penaltyAmount: 0,
      date: '2026-10-23',
      notes: 'التزام تام بأوزان ومعايير الـ BOM'
    }
  ];
};

export const fetchProductivityLookupsApi = async (): Promise<ProductivityLookupsDto> => {
  try {
    const res = await fetch('/api/Productivity/lookups');
    if (res.ok) return await res.json();
  } catch {}
  return {
    departments: ['صالة تصنيع الحلويات الشرقية', 'صالة الكنافة والقطايف', 'قسم المعجنات والغربي', 'مستودع التعبئة والتغليف'],
    shifts: ['صباحي', 'مسائي', 'ليلي'],
    workers: [
      { code: 'EMP-014', name: 'محمود عبد الرازق', department: 'صالة تصنيع الحلويات الشرقية' },
      { code: 'EMP-022', name: 'سامح إبراهيم', department: 'صالة الكنافة والقطايف' },
      { code: 'EMP-031', name: 'علي عثمان', department: 'قسم المعجنات والغربي' },
      { code: 'EMP-045', name: 'إبراهيم الشريف', department: 'صالة تصنيع الحلويات الشرقية' }
    ]
  };
};

export const saveProductivityRecordApi = async (data: Partial<WorkerProductivityDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/Productivity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return true;
  }
};
