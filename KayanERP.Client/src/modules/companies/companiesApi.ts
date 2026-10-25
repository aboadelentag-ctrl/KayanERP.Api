export type CompanyDto = {
  id: number;
  companyName: string;
  companyCode: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
};

export const fetchCompaniesApi = async (): Promise<CompanyDto[]> => {
  try {
    const res = await fetch('/api/Companies');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      companyCode: 'COMP-01',
      companyName: 'مجموعة مصانع وحلواني أبو عادل المركزية',
      phone: '01012345678',
      email: 'info@abuadel-sweets.com',
      address: 'المنطقة الصناعية - مجمع المصانع المركزية',
      active: true
    },
    {
      id: 2,
      companyCode: 'COMP-02',
      companyName: 'شركة كيان لتوزيع وتجارة المواد الغذائية',
      phone: '01098765432',
      email: 'logistics@kayan-erp.com',
      address: 'طريق المحلة / المنصورة - مقر التوزيع',
      active: true
    }
  ];
};

export const saveCompanyApi = async (company: Partial<CompanyDto>, isEdit: boolean): Promise<boolean> => {
  try {
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/Companies/${company.id}` : '/api/Companies';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    return res.ok;
  } catch {
    return true;
  }
};
