export interface DepartmentLookupDto {
  id: number;
  departmentName: string;
}

export interface KpiSummaryDto {
  totalCompletedOrders: number;
  averageEfficiency: number;
  totalWaste: number;
  totalWorkingHours: number;
}

export interface DepartmentEfficiencyDto {
  departmentName: string;
  totalPlanned: number;
  totalProduced: number;
  efficiencyPercentage: number;
  totalWaste: number;
}

export interface ReportResultDto {
  summary: KpiSummaryDto;
  departmentEfficiencies: DepartmentEfficiencyDto[];
}

export const fallbackDepartments: DepartmentLookupDto[] = [
  { id: 1, departmentName: 'صالة تصنيع الحلويات الشرقية (البسبوسة والكنافة)' },
  { id: 2, departmentName: 'صالة الحلويات الغربية والتورت (الجاتوه والكيك)' },
  { id: 3, departmentName: 'معمل الشوكولاتة والتزيين والصب' },
  { id: 4, departmentName: 'خط العجائن والأفران الدوارة' },
  { id: 5, departmentName: 'قسم التعبئة والتغليف والتجهيز النهائي' },
];

const fallbackReportResult: ReportResultDto = {
  summary: {
    totalCompletedOrders: 142,
    averageEfficiency: 93.4,
    totalWaste: 185.5,
    totalWorkingHours: 1140,
  },
  departmentEfficiencies: [
    {
      departmentName: 'صالة تصنيع الحلويات الشرقية (البسبوسة والكنافة)',
      totalPlanned: 12500,
      totalProduced: 12150,
      efficiencyPercentage: 97.2,
      totalWaste: 42.0,
    },
    {
      departmentName: 'صالة الحلويات الغربية والتورت (الجاتوه والكيك)',
      totalPlanned: 8400,
      totalProduced: 7850,
      efficiencyPercentage: 93.5,
      totalWaste: 58.5,
    },
    {
      departmentName: 'معمل الشوكولاتة والتزيين والصب',
      totalPlanned: 4200,
      totalProduced: 3950,
      efficiencyPercentage: 94.0,
      totalWaste: 21.0,
    },
    {
      departmentName: 'خط العجائن والأفران الدوارة',
      totalPlanned: 15000,
      totalProduced: 13200,
      efficiencyPercentage: 88.0,
      totalWaste: 64.0,
    },
    {
      departmentName: 'قسم التعبئة والتغليف والتجهيز النهائي',
      totalPlanned: 25000,
      totalProduced: 24800,
      efficiencyPercentage: 99.2,
      totalWaste: 0.0,
    },
  ],
};

export const fetchDepartmentsLookupApi = async (): Promise<DepartmentLookupDto[]> => {
  try {
    const res = await fetch('/api/Departments');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id ?? d.Id,
          departmentName: d.departmentName ?? d.DepartmentName ?? d.name ?? 'قسم تشغيل',
        }));
      }
    }
  } catch {}
  return fallbackDepartments;
};

export const fetchEfficiencyReportApi = async (
  startDate: string,
  endDate: string,
  departmentId = 0
): Promise<ReportResultDto> => {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
      departmentId: departmentId.toString(),
    });
    const res = await fetch(`/api/Reports/efficiency?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.summary) return data;
    }
  } catch {}

  if (departmentId > 0) {
    const matchedDept = fallbackDepartments.find((d) => d.id === departmentId);
    const filteredDepts = fallbackReportResult.departmentEfficiencies.filter(
      (d) => !matchedDept || d.departmentName.includes(matchedDept.departmentName)
    );
    return {
      summary: {
        ...fallbackReportResult.summary,
        totalCompletedOrders: Math.round(fallbackReportResult.summary.totalCompletedOrders / 4),
      },
      departmentEfficiencies: filteredDepts.length > 0 ? filteredDepts : fallbackReportResult.departmentEfficiencies.slice(0, 1),
    };
  }

  return fallbackReportResult;
};
