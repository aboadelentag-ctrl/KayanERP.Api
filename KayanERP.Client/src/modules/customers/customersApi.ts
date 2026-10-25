export type CustomerItemDto = {
  id: number;
  companyId?: number;
  customerCode: string;
  customerName: string;
  customerType: 'DIST_DAILY' | 'DIST_VIP' | 'DISTRIBUTOR' | 'WHOLESALE' | 'RETAIL';
  phone?: string;
  email?: string;
  address?: string;
  creditLimit: number;
  paymentTerms?: string;
  taxNumber?: string;
  active: boolean;
  notes?: string;
};

export const fetchCustomersApi = async (): Promise<CustomerItemDto[]> => {
  try {
    const res = await fetch('/api/customers');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      customerCode: 'CUST-001',
      customerName: 'الحاج إبراهيم الدسوقي - حلويات الدسوقي',
      customerType: 'DIST_VIP',
      phone: '01012345678',
      email: 'desouky@example.com',
      address: 'شارع الجيش - المنصورة',
      creditLimit: 75000,
      paymentTerms: 'أسبوعي - كشف حساب',
      active: true,
      notes: 'يفضل استلام أوردر الشرقي مبكراً قبل 8 صباحاً'
    },
    {
      id: 2,
      customerCode: 'CUST-002',
      customerName: 'معلم سامح عبد الله - توزيع دكرنس',
      customerType: 'DIST_DAILY',
      phone: '01098765432',
      address: 'سوق الجملة - دكرنس',
      creditLimit: 25000,
      paymentTerms: 'نقدي يومي',
      active: true,
      notes: 'يطلب يومياً اتصالاً قبل الظهر (بسبوسة وهريسة)'
    },
    {
      id: 3,
      customerCode: 'CUST-003',
      customerName: 'مؤسسة الأمانة لتوزيع الأغذية',
      customerType: 'DISTRIBUTOR',
      phone: '01055544433',
      address: 'طريق المحلة / المنصورة',
      creditLimit: 120000,
      paymentTerms: 'نصف شهري',
      active: true,
      notes: 'منفذ معتمد للكراتين والعبوات المغلفة'
    },
    {
      id: 4,
      customerCode: 'CUST-004',
      customerName: 'حلواني الصباح - فرع شربين',
      customerType: 'WHOLESALE',
      phone: '01077788899',
      address: 'ميدان المحطة - شربين',
      creditLimit: 50000,
      paymentTerms: 'أسبوعي',
      active: true,
      notes: 'سحب مستمر أصناف الجاتوه والتورت'
    }
  ];
};

export const saveCustomerApi = async (customer: Partial<CustomerItemDto>): Promise<boolean> => {
  try {
    const isEdit = Boolean(customer.id && customer.id > 0);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/customers/${customer.id}` : '/api/customers';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const toggleCustomerStatusApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/customers/${id}/toggle-status`, { method: 'PATCH' });
    return res.ok;
  } catch {
    return true;
  }
};

export const deleteCustomerApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
};
