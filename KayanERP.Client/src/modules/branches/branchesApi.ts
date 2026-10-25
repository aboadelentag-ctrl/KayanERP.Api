export type BranchDto = {
  id: number;
  branchCode: string;
  branchName: string;
  address: string;
  phone: string;
  managerName: string;
  isActive: boolean;
};

export const fetchBranchesApi = async (): Promise<BranchDto[]> => {
  try {
    const res = await fetch('/api/Branches');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      branchCode: 'BR-01',
      branchName: 'المصنع والإدارة المركزية',
      address: 'المنطقة الصناعية - مجمع الحلويات المركزي',
      phone: '01012345671',
      managerName: 'أبو عادل (المدير العام)',
      isActive: true
    },
    {
      id: 2,
      branchCode: 'BR-02',
      branchName: 'فرع دكرنس الرئيسي',
      address: 'شارع البحر الأعظم - دكرنس',
      phone: '01098765432',
      managerName: 'أ. سامح عبد الفتاح',
      isActive: true
    },
    {
      id: 3,
      branchCode: 'BR-03',
      branchName: 'فرع شربين',
      address: 'ميدان المحطة - شربين',
      phone: '01055544433',
      managerName: 'أ. محمود فوزي',
      isActive: true
    },
    {
      id: 4,
      branchCode: 'BR-04',
      branchName: 'فرع منية النصر',
      address: 'شارع الجمهورية - منية النصر',
      phone: '01077788899',
      managerName: 'أ. إبراهيم متولي',
      isActive: true
    },
    {
      id: 5,
      branchCode: 'BR-05',
      branchName: 'فرع بلقاس',
      address: 'شارع مجلس المدينة - بلقاس',
      phone: '01033322211',
      managerName: 'أ. أحمد السيد',
      isActive: true
    }
  ];
};

export const saveBranchApi = async (branch: Partial<BranchDto>): Promise<boolean> => {
  try {
    const isEdit = Boolean(branch.id && branch.id > 0);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/Branches/${branch.id}` : '/api/Branches';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branch)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const toggleBranchStatusApi = async (branch: BranchDto): Promise<boolean> => {
  try {
    const res = await fetch(`/api/Branches/${branch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...branch, isActive: !branch.isActive })
    });
    return res.ok;
  } catch {
    return true;
  }
};
