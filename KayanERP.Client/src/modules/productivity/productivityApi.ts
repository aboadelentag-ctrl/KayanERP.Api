export interface WorkerProductivityDto {
  id?: number;
  department: string;
  workerName: string;
  itemName: string;
  targetPerHour: number;
  actualPerHour: number;
}

export interface ProductivitySummaryDto {
  totalTarget: number;
  totalActual: number;
  averageEfficiency: number;
}

const STORAGE_PRODUCTIVITY_KEY = 'kayan_productivity_data';

export const initialWorkersData: WorkerProductivityDto[] = [
  // قسم الشرقي
  { id: 1, department: 'الشرقي', workerName: 'أحمد محمود', itemName: 'بسبوسة سادة بالسمن البلدي', targetPerHour: 50, actualPerHour: 48 },
  { id: 2, department: 'الشرقي', workerName: 'سيد مصطفى', itemName: 'كنافة بالكريمة والقشطة', targetPerHour: 40, actualPerHour: 42 },
  { id: 3, department: 'الشرقي', workerName: 'محمود حسن', itemName: 'بقلاوة مكسرات مشكلة', targetPerHour: 30, actualPerHour: 22 },
  { id: 4, department: 'الشرقي', workerName: 'إبراهيم عطية', itemName: 'رواني وجلاش محشي', targetPerHour: 45, actualPerHour: 46 },

  // قسم المخبوزات
  { id: 5, department: 'المخبوزات', workerName: 'إبراهيم علي', itemName: 'باتيه بالجبنة الرومي', targetPerHour: 100, actualPerHour: 100 },
  { id: 6, department: 'المخبوزات', workerName: 'مصطفى كامل', itemName: 'كرواسون زبدة فرنساوي', targetPerHour: 80, actualPerHour: 65 },
  { id: 7, department: 'المخبوزات', workerName: 'علي جابر', itemName: 'دنش فواكه ومربى', targetPerHour: 50, actualPerHour: 30 },
  { id: 8, department: 'المخبوزات', workerName: 'سمير خليل', itemName: 'قرص طرية بالعجوة والسمسم', targetPerHour: 120, actualPerHour: 115 },

  // قسم الجاتوه والتورت
  { id: 9, department: 'الجاتوه', workerName: 'شيف طارق عبد الرحيم', itemName: 'جاتوه شيكولاتة سواريه', targetPerHour: 60, actualPerHour: 65 },
  { id: 10, department: 'الجاتوه', workerName: 'شيف وائل فتحي', itemName: 'تورت فواكه ملكي مقاس 26', targetPerHour: 15, actualPerHour: 14 },
  { id: 11, department: 'الجاتوه', workerName: 'علاء النجار', itemName: 'تورت شوكولاتة كروكانت', targetPerHour: 18, actualPerHour: 19 },

  // قسم الإسفنجي والنواشف
  { id: 12, department: 'الإسفنجي', workerName: 'شيف صابر الدسوقي', itemName: 'بلكات اسبونج فانيليا 40*60', targetPerHour: 20, actualPerHour: 22 },
  { id: 13, department: 'الإسفنجي', workerName: 'محمد شعبان', itemName: 'بسكويت زبدة فاخر ونواشف', targetPerHour: 80, actualPerHour: 72 },
  { id: 14, department: 'الإسفنجي', workerName: 'فتحي رجب', itemName: 'بيتي فور لوكس وكوكيز', targetPerHour: 50, actualPerHour: 44 },
];

export const fetchProductivityDataApi = async (department = 'الشرقي'): Promise<WorkerProductivityDto[]> => {
  try {
    const res = await fetch(`/api/productivity?dept=${encodeURIComponent(department)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_PRODUCTIVITY_KEY);
  let list: WorkerProductivityDto[] = initialWorkersData;
  if (stored) {
    try { list = JSON.parse(stored); } catch {}
  } else {
    localStorage.setItem(STORAGE_PRODUCTIVITY_KEY, JSON.stringify(initialWorkersData));
  }

  return list.filter((w) => w.department === department);
};

export const saveWorkerProductivityApi = async (worker: WorkerProductivityDto): Promise<WorkerProductivityDto> => {
  const stored = localStorage.getItem(STORAGE_PRODUCTIVITY_KEY);
  let list: WorkerProductivityDto[] = stored ? JSON.parse(stored) : initialWorkersData;
  const newRecord = { ...worker, id: Date.now() };
  list.unshift(newRecord);
  localStorage.setItem(STORAGE_PRODUCTIVITY_KEY, JSON.stringify(list));
  return newRecord;
};
