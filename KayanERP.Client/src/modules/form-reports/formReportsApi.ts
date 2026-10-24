export interface DynamicFormDto {
  id: number;
  formName: string;
  formCode: string;
  isActive: boolean;
}

export interface DepartmentStatItem {
  departmentName: string;
  count: number;
  percentage: number;
}

export interface TopViolationItem {
  itemKey: string;
  count: number;
}

export interface FormSubmissionSummaryDto {
  id: number;
  submittedByName: string;
  submittedAt: string;
  department: string;
  itemOrName: string;
  quantity: string;
  reasonOrAction: string;
  hasImage: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  status: string;
  answersJson: string;
}

export interface FormReportDashboardDto {
  formId: number;
  formName: string;
  formCode: string;
  totalSubmissions: number;
  complianceRate: number;
  totalViolations: number;
  totalQuantity: number;
  departmentStats: DepartmentStatItem[];
  topViolations: TopViolationItem[];
  submissionsLog: FormSubmissionSummaryDto[];
}

export const initialFormsList: DynamicFormDto[] = [
  { id: 1, formName: 'محضر فحص استلام خامات الدقيق والسمن (HACCP)', formCode: 'FRM-QC-01', isActive: true },
  { id: 2, formName: 'تقرير هالك ورديات وتلف صواني الحلويات الشرقية', formCode: 'FRM-DMG-02', isActive: true },
  { id: 3, formName: 'قائمة تدقيق نظافة وتعقيم غرف التبريد والتورت', formCode: 'FRM-CLN-03', isActive: true },
  { id: 4, formName: 'محضر إرجاع وكسر بضاعة سيارات توزيع الفروع', formCode: 'FRM-TRN-04', isActive: true },
];

export const initialDepartmentsList: string[] = [
  'صالة تصنيع الحلويات الشرقية',
  'صالة الجاتوه والتورت والغربي',
  'صالة الإسفنجي والنواشف والمخبوزات',
  'مستودع الخامات المركزي (المصنع)',
  'مستودع التبريد للمنتج التام',
  'فرع دكرنس (المعرض)',
  'فرع شربين',
  'فرع منية النصر',
];

export const fetchActiveFormsApi = async (): Promise<DynamicFormDto[]> => {
  try {
    const res = await fetch('/api/DynamicForms');
    if (res.ok) {
      const data: DynamicFormDto[] = await res.json();
      return data.filter((f) => f.isActive);
    }
  } catch {}
  return initialFormsList;
};

export const fetchDepartmentsLookupApi = async (): Promise<string[]> => {
  try {
    const res = await fetch('/api/FormImport/erp-lookups/departments');
    if (res.ok) return await res.json();
  } catch {}
  return initialDepartmentsList;
};

export const fetchFormReportDashboardApi = async (
  formId: number,
  fromDate?: string,
  toDate?: string,
  department?: string
): Promise<FormReportDashboardDto> => {
  try {
    const params = new URLSearchParams({ formId: formId.toString() });
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (department) params.append('department', department);

    const res = await fetch(`/api/FormReports/dashboard?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch {}

  // Fallback محلي تفاعلي غني بالبيانات
  const selectedForm = initialFormsList.find((f) => f.id === formId) || initialFormsList[0];

  return {
    formId: selectedForm.id,
    formName: selectedForm.formName,
    formCode: selectedForm.formCode,
    totalSubmissions: 38,
    complianceRate: 94.2,
    totalViolations: 3,
    totalQuantity: 142.5,
    departmentStats: [
      { departmentName: 'صالة تصنيع الحلويات الشرقية', count: 18, percentage: 47.4 },
      { departmentName: 'صالة الجاتوه والتورت والغربي', count: 12, percentage: 31.6 },
      { departmentName: 'صالة الإسفنجي والنواشف والمخبوزات', count: 8, percentage: 21.0 },
    ],
    topViolations: [
      { itemKey: 'ارتفاع رطوبة العجين', count: 2 },
      { itemKey: 'خلل مؤشر حرارة فرن التسوية', count: 1 },
    ],
    submissionsLog: [
      {
        id: 901,
        submittedByName: 'شيف سمير إبراهيم (رئيس قسم الشرقي)',
        submittedAt: '2026-10-24 10:30',
        department: 'صالة تصنيع الحلويات الشرقية',
        itemOrName: 'بسبوسة مكسرات لوكس سمن بلدي',
        quantity: '4 صواني (مقاس 50)',
        reasonOrAction: 'زيادة احمرار قاع الصواني بسبب تذبذب لهب الفرن الدوار رقم 1',
        hasImage: true,
        hasVideo: false,
        hasAudio: true,
        status: 'معتمد ومحقق',
        answersJson: JSON.stringify({
          'اسم الصنف المفحوص': 'بسبوسة مكسرات لوكس',
          'رقم الفرن المستخدم': 'فرن دوار رقم 1 (إيطالي)',
          'درجة حرارة التسوية المسجلة': '210° مئوية',
          'الكمية التالفة الفعلية': '4 صواني مقاس 50',
          'الإجراء التصحيحي المتخذ': 'ضبط منظم الغاز وتوجيه الصواني للتقطيع كتجزيء عينات',
          'report_attachment_audio': 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
        }),
      },
      {
        id: 902,
        submittedByName: 'شيف شادي فكري (مسؤول قسم الغربي)',
        submittedAt: '2026-10-24 09:15',
        department: 'صالة الجاتوه والتورت والغربي',
        itemOrName: 'تورتة شوكولاتة كروكانت مقاس 26',
        quantity: '2 قطعة',
        reasonOrAction: 'هبوط طبقة الجناش أثناء النقل السريع لثلاجة التبريد المركزية',
        hasImage: true,
        hasVideo: true,
        hasAudio: false,
        status: 'معتمد ومحقق',
        answersJson: JSON.stringify({
          'اسم الصنف': 'تورتة شوكولاتة كروكانت',
          'درجة حرارة ثلاجة التبريد': '4° مئوية',
          'السبب المباشر': 'اهتزاز ترولي النقل السريع',
          'الإجراء المتخذ': 'تحويلها لصالح قطع كاسات السواريه والكب كيك',
        }),
      },
      {
        id: 903,
        submittedByName: 'د. مينا مجدي (فاحص الجودة والمعمل)',
        submittedAt: '2026-10-23 16:40',
        department: 'مستودع الخامات المركزي (المصنع)',
        itemOrName: 'دقيق فاخر استخراج 72%',
        quantity: '10 شكائر (500 كجم)',
        reasonOrAction: 'فحص دوري لمطابقة الرطوبة والجلوتين - نتيجة ممتازة مطابق للمواصفات',
        hasImage: true,
        hasVideo: false,
        hasAudio: false,
        status: 'معتمد ومحقق',
        answersJson: JSON.stringify({
          'رقم تشغيلة المورد (LOT)': 'LOT-FLOUR-2026-90',
          'نسبة الرطوبة المقاسة': '12.4%',
          'نسبة الجلوتين الرطب': '28%',
          'القرار النهائي': 'إفراج واستلام كامل للشحنة',
        }),
      },
      {
        id: 904,
        submittedByName: 'مشرف استلام فرع دكرنس',
        submittedAt: '2026-10-23 12:00',
        department: 'فرع دكرنس (المعرض)',
        itemOrName: 'كنافة أساور نوتيلا وبندق',
        quantity: '1.5 كيلو',
        reasonOrAction: 'كسر بسيط في أطراف العلبة أثناء تفريغ سيارة النقل المبرد',
        hasImage: false,
        hasVideo: false,
        hasAudio: false,
        status: 'معتمد ومحقق',
        answersJson: JSON.stringify({
          'رقم سيارة التوزيع': 'نقل دقهلية 4912',
          'رقم إذن التحويل': 'TRN-FG-2026-001',
          'الإجراء': 'خصم الكسر وإثباته بمحضر استلام رسمي',
        }),
      },
    ],
  };
};
