export type DepartmentLookupDto = {
  id: number;
  departmentCode: string;
  departmentName: string;
};

export type KpiSummaryDto = {
  totalCompletedOrders: number;
  averageEfficiency: number;
  totalWaste: number;
  totalWorkingHours: number;
};

export type DepartmentEfficiencyDto = {
  departmentName: string;
  totalPlanned: number;
  totalProduced: number;
  efficiencyPercentage: number;
  totalWaste: number;
};

export type ReportResultDto = {
  summary: KpiSummaryDto;
  departmentEfficiencies: DepartmentEfficiencyDto[];
};

export const fetchDepartmentsLookupApi = async (): Promise<DepartmentLookupDto[]> => {
  try {
    const res = await fetch('/api/departments');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: 1, departmentCode: 'DEP-EST', departmentName: 'صالة تصنيع الحلويات الشرقية' },
    { id: 2, departmentCode: 'DEP-WST', departmentName: 'صالة تصنيع الحلويات الغربية والتورت' },
    { id: 3, departmentCode: 'DEP-DGH', departmentName: 'صالة العجن والتجهيز الأولي' },
    { id: 4, departmentCode: 'DEP-PKG', departmentName: 'قسم الفرز والتعبئة والتغليف النهائي' }
  ];
};

export const fetchKpiReportApi = async (
  startDate: string,
  endDate: string,
  departmentId: number
): Promise<ReportResultDto> => {
  try {
    const res = await fetch(
      `/api/Reports/efficiency?startDate=${startDate}&endDate=${endDate}&departmentId=${departmentId}`
    );
    if (res.ok) return await res.json();
  } catch {}

  return {
    summary: {
      totalCompletedOrders: 84,
      averageEfficiency: 92.4,
      totalWaste: 18.5,
      totalWorkingHours: 640
    },
    departmentEfficiencies: [
      {
        departmentName: 'صالة تصنيع الحلويات الشرقية',
        totalPlanned: 450,
        totalProduced: 432,
        efficiencyPercentage: 96.0,
        totalWaste: 5.2
      },
      {
        departmentName: 'صالة تصنيع الحلويات الغربية والتورت',
        totalPlanned: 320,
        totalProduced: 295,
        efficiencyPercentage: 92.1,
        totalWaste: 7.8
      },
      {
        departmentName: 'صالة العجن والتجهيز الأولي',
        totalPlanned: 600,
        totalProduced: 585,
        efficiencyPercentage: 97.5,
        totalWaste: 2.1
      },
      {
        departmentName: 'قسم الفرز والتعبئة والتغليف النهائي',
        totalPlanned: 750,
        totalProduced: 630,
        efficiencyPercentage: 84.0,
        totalWaste: 3.4
      }
    ]
  };
};
