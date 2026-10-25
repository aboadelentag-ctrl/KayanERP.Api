export type DepartmentDto = {
  id: number;
  departmentName: string;
};

export type ShiftLookupDto = {
  id: number;
  shiftName: string;
};

export type ProductionOrderDto = {
  id: number;
  orderNumber: string;
  departmentId: number;
  departmentName: string;
  shiftName: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
  status: 'مخطط' | 'قيد التشغيل' | 'مكتمل' | 'ملغي';
  supervisorName: string;
  startTime: string;
  endTime?: string;
  standardBatchCost: number;
  actualBatchCost: number;
};

export type ProductionOperationsLookupsDto = {
  departments: DepartmentDto[];
  shifts: ShiftLookupDto[];
};

export const fetchProductionOrdersApi = async (): Promise<ProductionOrderDto[]> => {
  try {
    const res = await fetch('/api/ProductionOrders');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      orderNumber: 'PRD-ORD-2026-001',
      departmentId: 1,
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      shiftName: 'الوردية الصباحية',
      productName: 'بسبوسة سادة بالسمن البلدي',
      plannedQuantity: 150,
      actualQuantity: 145,
      unit: 'كجم',
      status: 'قيد التشغيل',
      supervisorName: 'الشيف سمير إبراهيم',
      startTime: '2026-10-24 07:00',
      standardBatchCost: 84,
      actualBatchCost: 86.5
    },
    {
      id: 2,
      orderNumber: 'PRD-ORD-2026-002',
      departmentId: 2,
      departmentName: 'صالة الكنافة والقطايف',
      shiftName: 'الوردية الصباحية',
      productName: 'كنافة بورما فستق حلبي',
      plannedQuantity: 80,
      actualQuantity: 80,
      unit: 'كجم',
      status: 'مكتمل',
      supervisorName: 'الشيف نبيل محمود',
      startTime: '2026-10-24 06:30',
      endTime: '2026-10-24 13:00',
      standardBatchCost: 312,
      actualBatchCost: 310
    }
  ];
};

export const fetchProductionLookupsApi = async (): Promise<ProductionOperationsLookupsDto> => {
  try {
    const res = await fetch('/api/ProductionOrders/lookups');
    if (res.ok) return await res.json();
  } catch {}
  return {
    departments: [
      { id: 1, departmentName: 'صالة تصنيع الحلويات الشرقية' },
      { id: 2, departmentName: 'صالة الكنافة والقطايف' },
      { id: 3, departmentName: 'قسم المعجنات والغربي' }
    ],
    shifts: [
      { id: 1, shiftName: 'الوردية الصباحية' },
      { id: 2, shiftName: 'الوردية المسائية' },
      { id: 3, shiftName: 'الوردية الليلية' }
    ]
  };
};

export const saveProductionOrderApi = async (order: Partial<ProductionOrderDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/ProductionOrders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return res.ok;
  } catch {
    return true;
  }
};
