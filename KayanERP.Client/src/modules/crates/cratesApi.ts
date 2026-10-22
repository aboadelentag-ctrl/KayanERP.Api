export interface CrateClient {
  id: number;
  name: string;
  crateBalance: number;
  phone?: string;
  lastMovementDate?: string;
}

const STORAGE_KEY = 'kayan_crate_clients_data';

const getInitialCratesData = (): CrateClient[] => [
  { id: 1, name: 'سوبر ماركت الفهد (فرع المعادي)', crateBalance: 45, phone: '01012345678', lastMovementDate: '2026-10-21' },
  { id: 2, name: 'شركة حلواني الشام (فرع النزهة)', crateBalance: 120, phone: '01198765432', lastMovementDate: '2026-10-22' },
  { id: 3, name: 'عميل وليد (اختبار)', crateBalance: 8, phone: '01200000000', lastMovementDate: '2026-10-18' },
  { id: 4, name: 'سيارة توزيع رقم 1 (السائق حسام)', crateBalance: 65, phone: '01055555555', lastMovementDate: '2026-10-22' },
];

export const fetchCrateClientsApi = async (): Promise<CrateClient[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // تجاهل أخطاء التحليل
    }
  }
  const initial = getInitialCratesData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveCrateClientsToLocal = (data: CrateClient[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
