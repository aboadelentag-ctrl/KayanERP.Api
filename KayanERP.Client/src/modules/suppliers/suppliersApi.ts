export interface SupplierViewDto {
  id: number;
  supplierCode: string;
  supplierName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  paymentTerms?: string | null;
  active: boolean;
  notes?: string | null;
}

export interface SupplierCreateUpdateDto {
  supplierCode?: string;
  supplierName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  paymentTerms?: string | null;
  active: boolean;
  notes?: string | null;
}

const STORAGE_SUPPLIERS_KEY = 'kayan_suppliers_data';

// دالة توحيد الحقول القادمة من الـ API أياً كانت صياغتها (C# Entity / DTO)
const normalizeSupplier = (item: any): SupplierViewDto => {
  return {
    id: item.id ?? item.Id ?? 0,
    supplierCode: item.supplierCode ?? item.SupplierCode ?? item.code ?? item.Code ?? `SUP-${item.id ?? item.Id ?? '001'}`,
    supplierName: item.supplierName ?? item.SupplierName ?? item.name ?? item.Name ?? 'مورد غير مسمى',
    phone: item.phone ?? item.Phone ?? '',
    email: item.email ?? item.Email ?? '',
    address: item.address ?? item.Address ?? '',
    taxNumber: item.taxNumber ?? item.TaxNumber ?? item.taxCardNumber ?? item.TaxCardNumber ?? '',
    paymentTerms: item.paymentTerms ?? item.PaymentTerms ?? 'نقدي',
    active: item.active ?? item.Active ?? item.isActive ?? item.IsActive ?? true,
    notes: item.notes ?? item.Notes ?? '',
  };
};

const fallbackSuppliers: SupplierViewDto[] = [
  {
    id: 1,
    supplierCode: 'SUP-001',
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    phone: '01012345678',
    email: 'delta_mills@domain.eg',
    address: 'المنطقة الصناعية - المحلة الكبرى',
    taxNumber: '100-294-812',
    paymentTerms: 'آجل 30 يوم',
    active: true,
    notes: 'مورد الدقيق الفاخر 72% وسميد البسبوسة السايب والمعبأ',
  },
  {
    id: 2,
    supplierCode: 'SUP-002',
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن الطبيعي',
    phone: '01198765432',
    email: 'elwadi_ghee@domain.eg',
    address: 'طريق جمصة الدولي - الدقهلية',
    taxNumber: '201-998-341',
    paymentTerms: 'نقدي',
    active: true,
    notes: 'توريد صفائح السمن البلدي البقري والجاموسي وقشطة الحلويات',
  },
  {
    id: 3,
    supplierCode: 'SUP-003',
    supplierName: 'الشركة السورية لاستيراد وتجارة المكسرات',
    phone: '01234567890',
    email: 'syrian_nuts@domain.com',
    address: 'شارع الجيش - المنصورة',
    taxNumber: '315-442-109',
    paymentTerms: 'آجل 15 يوم',
    active: true,
    notes: 'فستق حلبي مفروم ومقشر، بندق محمص، ولوز شرائح إكسترا',
  },
  {
    id: 4,
    supplierCode: 'SUP-004',
    supplierName: 'شركة الدلتا للسكر ومصانع الحوامدية',
    phone: '01055566677',
    email: 'sugar_delta@domain.eg',
    address: 'مدينة المنصورة - الحوامدية',
    taxNumber: '440-128-990',
    paymentTerms: 'آجل 60 يوم',
    active: true,
    notes: 'سكر بلوري أبيض نقي معبأ شكائر 50 كجم وخامات الجلوكوز',
  },
];

export const fetchSuppliersApi = async (activeFilter = ''): Promise<SupplierViewDto[]> => {
  try {
    const url = activeFilter ? `/api/suppliers?active=${activeFilter}` : '/api/suppliers';
    const res = await fetch(url);
    if (res.ok) {
      const rawData = await res.json();
      if (Array.isArray(rawData) && rawData.length > 0) {
        let list = rawData.map(normalizeSupplier);
        if (activeFilter === 'true') list = list.filter((s) => s.active);
        if (activeFilter === 'false') list = list.filter((s) => !s.active);
        return list;
      }
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_SUPPLIERS_KEY);
  let list: SupplierViewDto[] = fallbackSuppliers;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.map(normalizeSupplier);
      }
    } catch {}
  } else {
    localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(fallbackSuppliers));
  }

  if (activeFilter === 'true') return list.filter((s) => s.active);
  if (activeFilter === 'false') return list.filter((s) => !s.active);
  return list;
};

export const saveSupplierApi = async (
  supplier: SupplierCreateUpdateDto,
  editingId = 0
): Promise<SupplierViewDto> => {
  try {
    const url = editingId > 0 ? `/api/suppliers/${editingId}` : '/api/suppliers';
    const method = editingId > 0 ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...supplier,
        name: supplier.supplierName,
        code: supplier.supplierCode,
        isActive: supplier.active,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return normalizeSupplier(data);
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_SUPPLIERS_KEY);
  let list: SupplierViewDto[] = stored ? JSON.parse(stored) : fallbackSuppliers;

  if (editingId > 0) {
    list = list.map((s) =>
      s.id === editingId
        ? {
            ...s,
            supplierCode: supplier.supplierCode || s.supplierCode,
            supplierName: supplier.supplierName,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            taxNumber: supplier.taxNumber,
            paymentTerms: supplier.paymentTerms,
            active: supplier.active,
            notes: supplier.notes,
          }
        : s
    );
  } else {
    const newId = Date.now();
    const newSupplier: SupplierViewDto = {
      id: newId,
      supplierCode: supplier.supplierCode?.trim() || `SUP-${String(list.length + 1).padStart(3, '0')}`,
      supplierName: supplier.supplierName,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      taxNumber: supplier.taxNumber,
      paymentTerms: supplier.paymentTerms || 'نقدي',
      active: supplier.active,
      notes: supplier.notes,
    };
    list = [newSupplier, ...list];
  }

  localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(list));
  return list[0];
};

export const toggleSupplierStatusApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/suppliers/${id}/toggle-status`, { method: 'PUT' });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_SUPPLIERS_KEY);
  if (stored) {
    let list: SupplierViewDto[] = JSON.parse(stored);
    list = list.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(list));
  }
  return true;
};

export const deleteSupplierApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_SUPPLIERS_KEY);
  if (stored) {
    let list: SupplierViewDto[] = JSON.parse(stored);
    list = list.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(list));
  }
  return true;
};
