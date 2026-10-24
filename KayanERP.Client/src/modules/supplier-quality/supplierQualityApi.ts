export interface SupplierQualityViewModel {
  id: number;
  reportNumber: string;
  inspectionDate: string;
  itemName: string;
  batchNumber: string;
  complianceScore: number;
  result: string;
  inspectedByName: string;
  notes?: string | null;
}

export interface SupplierLookupDto {
  id: number;
  supplierName: string;
}

const STORAGE_QUALITY_KEY = 'kayan_supplier_quality_data';

const initialEvaluations: SupplierQualityViewModel[] = [
  {
    id: 1,
    reportNumber: 'QA-00101',
    inspectionDate: '2026-10-24 10:15',
    itemName: 'دقيق فاخر استخراج 72%',
    batchNumber: 'COA-2026-FL-90',
    complianceScore: 98,
    result: 'مطابق للمواصفات - ممتاز',
    inspectedByName: 'د. مينا مجدي (مسؤول المعمل)',
    notes: '[المورد: شركة مطاحن الدلتا والصعيد] | نسبة الرطوبة 12.1%، الجلوتين 28.5%، خالي من الشوائب ومطابق للمواصفة القياسية.',
  },
  {
    id: 2,
    reportNumber: 'QA-00102',
    inspectionDate: '2026-10-23 14:30',
    itemName: 'سمن بلدي طبيعي جاموسي نقي',
    batchNumber: 'COA-2026-GH-14',
    complianceScore: 96,
    result: 'مطابق للمواصفات - ممتاز',
    inspectedByName: 'د. مينا مجدي (مسؤول المعمل)',
    notes: '[المورد: مزارع الوادي لمنتجات الألبان] | درجة الحموضة 0.35%، اللون والرائحة ممتازة، مطابق لمعايير الحلويات الشرقية.',
  },
  {
    id: 3,
    reportNumber: 'QA-00103',
    inspectionDate: '2026-10-22 11:00',
    itemName: 'فستق حلبي مفروم خشن',
    batchNumber: 'COA-2026-NUT-33',
    complianceScore: 78,
    result: 'مقبول بشروط',
    inspectedByName: 'أحمد حمدي (مفتش استلام)',
    notes: '[المورد: الشركة السورية لتجارة المكسرات] | ارتفاع طفيف في نسبة الرطوبة (7.8%)، يُشترط استهلاكه فوراً في صالة الشرقي خلال 48 ساعة مع التحميص المباشر.',
  },
  {
    id: 4,
    reportNumber: 'QA-00104',
    inspectionDate: '2026-10-21 09:45',
    itemName: 'علب كرتون دوبلكس بصمة ذهبية',
    batchNumber: 'COA-2026-BOX-08',
    complianceScore: 45,
    result: 'مرفوض - غير صالح',
    inspectedByName: 'أحمد حمدي (مفتش استلام)',
    notes: '[المورد: الأهرام للكرتون ومواد التعبئة] | عدم جفاف أحبار الطباعة ووجود انحناء في جوانب العلب - تم عمل محضر إرجاع فوري للمورد.',
  },
];

export const fetchQualityEvaluationsApi = async (): Promise<SupplierQualityViewModel[]> => {
  try {
    const res = await fetch('/api/Quality');
    if (res.ok) {
      const data: any[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((q) => ({
          id: q.id ?? q.Id ?? 0,
          reportNumber: q.orderNumber ?? q.OrderNumber ?? `QA-${String(q.id ?? q.Id ?? '00001').padStart(5, '0')}`,
          inspectionDate: q.inspectionDate ?? q.InspectionDate ?? new Date().toISOString().slice(0, 16).replace('T', ' '),
          itemName: q.itemName ?? q.ItemName ?? 'خامة غير محددة',
          batchNumber: q.orderNumber ?? q.OrderNumber ?? '',
          complianceScore: q.qualityScore ?? q.QualityScore ?? 90,
          result: q.result ?? q.Result ?? 'مطابق للمواصفات - ممتاز',
          inspectedByName: q.inspectorName ?? q.InspectorName ?? 'مفتش الجودة',
          notes: q.notes ?? q.Notes ?? '',
        }));
      }
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_QUALITY_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_QUALITY_KEY, JSON.stringify(initialEvaluations));
  return initialEvaluations;
};

export const saveQualityEvaluationApi = async (evalData: {
  itemName: string;
  batchNumber: string;
  complianceScore: number;
  result: string;
  inspectedByName: string;
  notes?: string;
  supplierName?: string;
}): Promise<SupplierQualityViewModel> => {
  const fullNotes = evalData.supplierName
    ? `[المورد: ${evalData.supplierName}] | ${evalData.notes || ''}`
    : evalData.notes || '';

  const newReportNumber = `QA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

  const newRecord: SupplierQualityViewModel = {
    id: Date.now(),
    reportNumber: newReportNumber,
    inspectionDate: nowStr,
    itemName: evalData.itemName.trim(),
    batchNumber: evalData.batchNumber.trim() || newReportNumber,
    complianceScore: evalData.complianceScore,
    result: evalData.result,
    inspectedByName: evalData.inspectedByName,
    notes: fullNotes,
  };

  try {
    const payload = {
      itemName: newRecord.itemName,
      orderNumber: newRecord.batchNumber,
      qualityScore: newRecord.complianceScore,
      result: newRecord.result,
      inspectorName: newRecord.inspectedByName,
      notes: newRecord.notes,
      inspectionDate: new Date().toISOString(),
    };
    const res = await fetch('/api/Quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      newRecord.id = data.id ?? data.Id ?? newRecord.id;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_QUALITY_KEY);
  const list: SupplierQualityViewModel[] = stored ? JSON.parse(stored) : initialEvaluations;
  list.unshift(newRecord);
  localStorage.setItem(STORAGE_QUALITY_KEY, JSON.stringify(list));
  return newRecord;
};
