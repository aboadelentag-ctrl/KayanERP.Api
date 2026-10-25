export type ActiveBranchDto = {
  id: number;
  nameAr: string;
  nameEn?: string;
  code: string;
  themeClass?: string;
};

export const fetchBranchesPortalApi = async (): Promise<ActiveBranchDto[]> => {
  try {
    const res = await fetch('/api/v1/Branches/operations-summary');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: 1, code: 'BRANCH1', nameAr: 'المصنع والإدارة المركزية' },
    { id: 2, code: 'BRANCH2', nameAr: 'فرع دكرنس الرئيسي' },
    { id: 3, code: 'BRANCH3', nameAr: 'فرع منية النصر' },
    { id: 4, code: 'BRANCH4', nameAr: 'فرع شربين' },
    { id: 5, code: 'BRANCH5', nameAr: 'فرع بلقاس' },
    { id: 6, code: 'BRANCH6', nameAr: 'فرع ديمشلت' },
    { id: 7, code: 'BRANCH7', nameAr: 'فرع المنصورة' },
    { id: 8, code: 'BRANCH8', nameAr: 'فرع الزقازيق' },
    { id: 9, code: 'BRANCH9', nameAr: 'فرع السنبلاوين' },
    { id: 10, code: 'BRANCH10', nameAr: 'منفذ سوق الجملة' },
    { id: 11, code: 'BRANCH11', nameAr: 'أسطول التوزيع واللوجستيات' },
    { id: 12, code: 'BRANCH12', nameAr: 'معمل التصنيع والحلويات' }
  ];
};
