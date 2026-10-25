export type ItemCategoryDto = {
  id: number;
  companyId: number;
  categoryName: string;
  categoryCode: string;
  itemType: string;
  description?: string;
  active: boolean;
};

export type CompanyDropdownDto = {
  id: number;
  companyName: string;
};

export const fetchItemCategoriesApi = async (): Promise<ItemCategoryDto[]> => {
  try {
    const res = await fetch('/api/ItemCategories');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      companyId: 1,
      categoryCode: 'CAT-EST',
      categoryName: 'حلويات شرقية فاخرة',
      itemType: 'منتج تام',
      description: 'أصناف البسبوسة، الكنافة، البقلاوة، وعش البلبل',
      active: true
    },
    {
      id: 2,
      companyId: 1,
      categoryCode: 'CAT-WST',
      categoryName: 'حلويات غربية وجاتوه وتورت',
      itemType: 'منتج تام',
      description: 'تورت المناسبات، الجاتوه السواريه، والموس الفرنسي',
      active: true
    },
    {
      id: 3,
      companyId: 1,
      categoryCode: 'CAT-RAW-SUG',
      categoryName: 'خامات ومستلزمات السكر والدقيق',
      itemType: 'خامات',
      description: 'دقيق فاخر استخراج 72%، سكر ناعم، وعسل جلوكوز',
      active: true
    },
    {
      id: 4,
      companyId: 1,
      categoryCode: 'CAT-PKG',
      categoryName: 'مواد ومستلزمات التعبئة والتغليف',
      itemType: 'مواد تعبئة وتغليف',
      description: 'علب كرتون فاخرة، أطباق فويل، وسلوفان تسليم',
      active: true
    },
    {
      id: 5,
      companyId: 1,
      categoryCode: 'CAT-CRT',
      categoryName: 'حاويات وأوعية التداول الدائرية',
      itemType: 'أصول / حاويات تداول',
      description: 'أسبات بلاستيك زرقاء وصواني ألومنيوم مخرمة',
      active: true
    }
  ];
};

export const fetchCompaniesLookupApi = async (): Promise<CompanyDropdownDto[]> => {
  try {
    const res = await fetch('/api/Companies');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: 1, companyName: 'مجموعة كيان لصناعة الحلويات (المصنع المركزي)' },
    { id: 2, companyName: 'شركة أبو عادل لتجارة وتوزيع المواد الغذائية' }
  ];
};

export const saveItemCategoryApi = async (cat: Partial<ItemCategoryDto>, isEdit: boolean): Promise<boolean> => {
  try {
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/ItemCategories/${cat.id}` : '/api/ItemCategories';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const toggleCategoryStatusApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/ItemCategories/${id}/toggle-status`, { method: 'PATCH' });
    return res.ok;
  } catch {
    return true;
  }
};
