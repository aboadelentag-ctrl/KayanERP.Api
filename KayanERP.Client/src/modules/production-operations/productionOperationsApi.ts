export interface ProductionOrderDto {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  departmentId: number;
  departmentName: string;
  warehouseName: string;
  status: string;
  details: OrderDetailDto[];
}

export interface OrderDetailDto {
  detailId: number;
  itemName: string;
  plannedQuantity: number;
  producedQuantity: number;
  unit: string;
  batchNumber?: string;
  status: string;
}

export interface DepartmentDto {
  id: number;
  departmentName: string;
}

export interface WarehouseDto {
  id: number;
  warehouseName: string;
}

export interface ItemDto {
  id: number;
  itemCode: string;
  itemName: string;
  unit: string;
  departmentId?: number;
}

export interface EmployeeDto {
  id: number;
  employeeCode: string;
  name: string;
  departmentId?: number;
  departmentName: string;
  jobTitle: string;
}

export interface LookupsResponseDto {
  departments: DepartmentDto[];
  warehouses: WarehouseDto[];
  items: ItemDto[];
  employees: EmployeeDto[];
}

export interface OrderExecutionFullDto {
  id: number;
  orderNumber: string;
  items: ExecutionItemDetailDto[];
}

export interface ExecutionItemDetailDto {
  detailId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  plannedQuantity: number;
  producedQuantity: number;
  normalScrapQuantity: number;
  abnormalScrapQuantity: number;
  scrapReason: string;
  batchNumber: string;
  status: string;
  materials: ExecutionMaterialItemDto[];
}

export interface ExecutionMaterialItemDto {
  componentItemId: number;
  componentCode: string;
  componentName: string;
  unit: string;
  requiredQuantity: number;
  actualConsumedQuantity: number;
}

export interface ShiftCrewMemberDto {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentId?: number;
  departmentName: string;
  jobTitleName: string;
  attendanceStatus: string;
  hoursWorked: number;
}

export interface DepartmentKpiResultDto {
  departmentName: string;
  totalHours: number;
  totalProduced: number;
  productivityPerHour: number;
  estimatedWaste: number;
}

export interface DetailedAttendanceLogDto {
  id: number;
  logDate: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  hoursWorked: number;
  producedQuantity: number;
  productivityPerHour: number;
  notes: string;
}

export interface EmployeeDossierDto {
  employeeName: string;
  employeeCode: string;
  department: string;
  totalOrdersExecuted: number;
  totalQuantityProduced: number;
  totalWorkingHours: number;
  productionPerHour: number;
  evaluation: string;
}

export const fetchProductionLookupsApi = async (): Promise<LookupsResponseDto> => {
  try {
    const res = await fetch('/api/productionoperations/lookups');
    if (res.ok) return await res.json();
  } catch {}
  return {
    departments: [
      { id: 100, departmentName: 'صالة تصنيع الحلويات الشرقية' },
      { id: 101, departmentName: 'صالة الكنافة والقطايف' }
    ],
    warehouses: [
      { id: 1, warehouseName: 'مستودع خامات الصالة الرئيسي' }
    ],
    items: [
      { id: 1, itemCode: 'ITM-001', itemName: 'سكر أبيض ناعم', unit: 'كجم', departmentId: 100 },
      { id: 2, itemCode: 'ITM-002', itemName: 'سميد فاخر', unit: 'كجم', departmentId: 100 }
    ],
    employees: [
      { id: 1, employeeCode: 'EMP-01', name: 'الشيف سمير إبراهيم', departmentId: 100, departmentName: 'صالة الشرقي', jobTitle: 'شيف أول' }
    ]
  };
};

export const fetchActiveOrdersApi = async (): Promise<ProductionOrderDto[]> => {
  try {
    const res = await fetch('/api/productionoperations/active-orders');
    if (res.ok) return await res.json();
  } catch {}
  return [];
};
