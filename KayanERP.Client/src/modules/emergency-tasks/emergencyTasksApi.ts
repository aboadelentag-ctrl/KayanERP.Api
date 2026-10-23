export interface EmergencyTask {
  id: number;
  taskNumber: string;
  title: string;
  location: string; // المصنع / خط الشرق / سيارة جامبو 01 / فرع دكرنس
  reportedBy: string;
  reportedDate: string;
  reportedTime: string;
  priority: 'حرجة للغاية (توقف إنتاج)' | 'عالية' | 'متوسطة';
  assignedTo: string; // الفني أو مهندس الصيانة
  status: 'مفتوح' | 'قيد المعاينة والإصلاح' | 'تم الإصلاح واختبار التشغيل' | 'مغلق ومعتمد';
  resolutionNotes?: string;
  estimatedDowntimeMinutes: number; // زمن التوقف المقدر بالدقائق
}

const STORAGE_KEY = 'kayan_emergency_tasks';

const getInitialTasks = (): EmergencyTask[] => [
  {
    id: 1,
    taskNumber: 'EMG-2026-011',
    title: 'انخفاض مفاجئ في تبريد كابينة شاحنة التوزيع 01 أثناء تحميل طلبيات الفروع',
    location: 'سيارة جامبو مجهزة بصندوق تبريد (AST-TRK-01)',
    reportedBy: 'سائق خط المنصورة - دكرنس',
    reportedDate: '2026-10-22',
    reportedTime: '08:15 ص',
    priority: 'حرجة للغاية (توقف إنتاج)',
    assignedTo: 'م. حسام الدين (فني التبريد)',
    status: 'تم الإصلاح واختبار التشغيل',
    resolutionNotes: 'إصلاح تسريب بسيط في وصلة الفريون وإعادة ضبط الثرموستات عند -15°C',
    estimatedDowntimeMinutes: 45,
  },
  {
    id: 2,
    taskNumber: 'EMG-2026-012',
    title: 'تذبذب في شعلات ولاعة الغاز الخاصة بالفرن الدوار التركي رقم 1',
    location: 'صالة تصنيع الحلويات الشرقية (المصنع الرئيسي)',
    reportedBy: 'الشيف سمير إبراهيم',
    reportedDate: '2026-10-22',
    reportedTime: '11:30 ص',
    priority: 'عالية',
    assignedTo: 'فني شركة أفران النيل',
    status: 'قيد المعاينة والإصلاح',
    resolutionNotes: 'جاري تنظيف الفواني ومعايرة منظم ضغط الغاز',
    estimatedDowntimeMinutes: 30,
  },
  {
    id: 3,
    taskNumber: 'EMG-2026-013',
    title: 'صوت احتكاك غير طبيعي في سير ناقل عجانة الـ 150 كجم',
    location: 'صالة التحضير والعجن',
    reportedBy: 'أحمد جلال (خباز أفران)',
    reportedDate: '2026-10-22',
    reportedTime: '02:00 م',
    priority: 'متوسطة',
    assignedTo: 'مسؤول الصيانة الميكانيكية الداخلي',
    status: 'مفتوح',
    estimatedDowntimeMinutes: 20,
  },
];

export const fetchEmergencyTasksApi = async (): Promise<EmergencyTask[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = getInitialTasks();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveEmergencyTasksToLocal = (data: EmergencyTask[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
