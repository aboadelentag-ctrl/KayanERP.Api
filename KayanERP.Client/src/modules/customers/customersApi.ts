export interface Customer {
  id: number;
  code: string;
  name: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'suspended' | 'blocked';
  branchId?: number;
}

const STORAGE_KEY = 'kayan_customers_data';

const getInitialFallbackData = (): Customer[] => [
  { id: 1, code: 'CUST-001', name: 'سوبر ماركت الفهد (فرع المعادي)', phone: '01012345678', creditLimit: 50000, currentBalance: 12500, status: 'active' },
  { id: 2, code: 'CUST-002', name: 'شركة حلواني الشام (فرع النزهة)', phone: '01198765432', creditLimit: 100000, currentBalance: 87000, status: 'active' },
  { id: 3, code: 'CUST-003', name: 'عميل نقدي', phone: '-', creditLimit: 0, currentBalance: 0, status: 'active' },
  { id: 4, code: 'CUST-004', name: 'عميل نقدي - منفذ البيع المباشر', phone: '-', creditLimit: 0, currentBalance: 0, status: 'active' }
];

export const fetchCustomersApi = async (): Promise<Customer[]> => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('https://localhost:7273/api/Customers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('تعذر جلب البيانات من السيرفر');
    return await response.json();
  } catch {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // في حال حدوث خطأ أثناء القراءة
      }
    }
    const initial = getInitialFallbackData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
};

export const saveCustomersToLocal = (customers: Customer[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};
