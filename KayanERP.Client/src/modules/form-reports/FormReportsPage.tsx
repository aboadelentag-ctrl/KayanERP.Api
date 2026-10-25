import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Printer,
  Calendar,
  Building2,
  Layers,
  X,
  PieChart
} from 'lucide-react';

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
  answers: { [key: string]: string };
}

export const FormReportsPage: React.FC = () => {
  const formsList = [
    { id: 1, formName: 'استمارة تفتيش ورقابة الجودة اليومية (GMP/HACCP)', formCode: 'HACCP_DAILY_01' },
    { id: 2, formName: 'محضر فحص استلام خامات الدقيق والسمن (FRM QC-01)', formCode: 'FRM QC-01' }
  ];

  const departmentsList = [
    'صالة تصنيع الحلويات الشرقية',
    'صالة الجاتوه والتورت والغربي',
    'مستودع الخامات المركزي (المصنع)',
    'فرع دكرنس (المعرض)'
  ];

  const [selectedFormId, setSelectedFormId] = useState<number>(2);
  const [filterFromDate, setFilterFromDate] = useState('2026-09-25');
  const [filterToDate, setFilterToDate] = useState('2026-10-25');
  const [filterDepartment, setFilterDepartment] = useState('');

  const [submissionsLog] = useState<FormSubmissionSummaryDto[]>([
    {
      id: 901,
      submittedByName: 'أحمد السعدي (مشرف صالة)',
      submittedAt: '2026-10-24 16:30',
      department: 'صالة تصنيع الحلويات الشرقية',
      itemOrName: 'بسبوسة مكسرات لوتس سمن بلدي',
      quantity: '4 صواني (معيار 50)',
      reasonOrAction: 'زيادة احمرار قاع الصواني بسبب تذبذب لهب الفرن الدوار رقم 1',
      hasImage: true,
      hasVideo: false,
      hasAudio: false,
      status: 'معتمد ومطابق',
      answers: { 'القسم': 'صالة تصنيع الحلويات الشرقية', 'الصنف': 'بسبوسة مكسرات', 'الإجراء': 'تم ضبط شعلات الغاز وتعديل درجة الحرارة' }
    },
    {
      id: 782,
      submittedByName: 'د. مينا عادل',
      submittedAt: '2026-10-24 04:14',
      department: 'صالة الجاتوه والتورت والغربي',
      itemOrName: 'تورتة شوكولاتة كروكانت مقاس 26',
      quantity: '2 قطعة',
      reasonOrAction: 'هبوط دقيقة الجناش أثناء النقل السريع لثلاجة التبريد المركزية',
      hasImage: true,
      hasVideo: false,
      hasAudio: true,
      status: 'معتمد ومطابق',
      answers: { 'القسم': 'صالة الجاتوه والتورت والغربي', 'الصنف': 'تورتة شوكولاتة', 'الإجراء': 'تم تدريب العمال على حمل الصواني' }
    },
    {
      id: 691,
      submittedByName: 'أحمد فؤاد',
      submittedAt: '2026-10-23 20:10',
      department: 'مستودع الخامات المركزي (المصنع)',
      itemOrName: 'دقيق فاخر استخراج 72%',
      quantity: '10 شكائر (500 كجم)',
      reasonOrAction: 'فحص دوري لمطابقة الرطوبة والغلوتين - نتيجة ممتازة مطابق للمواصفات',
      hasImage: false,
      hasVideo: false,
      hasAudio: false,
      status: 'معتمد ومطابق',
      answers: { 'القسم': 'مستودع الخامات المركزي', 'الصنف': 'دقيق فاخر 72%', 'الإجراء': 'مطابق ومقبول بالكامل' }
    },
    {
      id: 591,
      submittedByName: 'محمود عبد الرازق',
      submittedAt: '2026-10-22 22:00',
      department: 'فرع دكرنس (المعرض)',
      itemOrName: 'كنافة أساور نوتيلا وفستق',
      quantity: '1.5 كيلو',
      reasonOrAction: 'كسر بسيط في أطراف العلبة أثناء تفريغ سيارة النقل المبرد',
      hasImage: true,
      hasVideo: false,
      hasAudio: false,
      status: 'معتمد ومطابق',
      answers: { 'القسم': 'فرع دكرنس', 'الصنف': 'كنافة أساور', 'الإجراء': 'تسجيل هدر نقل وتأكيد سلامة باقي الشحنة' }
    }
  ]);

  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionSummaryDto | null>(null);

  const filteredSubmissions = useMemo(() => {
    return submissionsLog.filter(s => {
      if (filterDepartment && s.department !== filterDepartment) return false;
      return true;
    });
  }, [submissionsLog, filterDepartment]);

  const printReport = () => {
    window.print();
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* Header الشاشة */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-indigo-500" />
              <span>لوحة المؤشرات والتقارير الرقابية الشاملة (BI & KPIs)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              تحليل معدلات المطابقة ونسب الهوالك
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            تحليل معدلات المطابقة، نسب الهوالك بالأقسام، وفحص وثائق ومحاضر التشغيل.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ طباعة التقرير الرسمي / PDF</span>
          </button>
        </div>
      </div>

      {/* 1. شريط الفلاتر والتحكم الحي */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-gray-400 font-bold mb-1">اختر النموذج المطلوب تحليله *</label>
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-indigo-500 rounded-xl font-bold"
          >
            {formsList.map(f => (
              <option key={f.id} value={f.id}>{f.formName} ({f.formCode})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-400 font-bold mb-1">من تاريخ</label>
          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-gray-400 font-bold mb-1">إلى تاريخ</label>
          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono text-xs"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-gray-400 font-bold mb-1">القسم / الصالة (بيانات حية)</label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-bold"
          >
            <option value="">-- كافة الأقسام والصالات --</option>
            {departmentsList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {}}
          className="px-5 py-2 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm"
        >
          🔍 تشغيل الاستعلام
        </button>
      </div>

      {/* 2. بطاقات مؤشرات الأداء التنفيذية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-sm">
          <span className="text-xs opacity-80 block">إجمالي المحاضر المعتمدة</span>
          <h3 className="text-3xl font-black font-mono mt-1">38</h3>
        </div>

        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-sm">
          <span className="text-xs opacity-80 block">معدل المطابقة العام (Compliance Rate)</span>
          <h3 className="text-3xl font-black font-mono mt-1">94.2%</h3>
        </div>

        <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-sm">
          <span className="text-xs opacity-80 block">حالات عدم المطابقة المرصودة</span>
          <h3 className="text-3xl font-black font-mono mt-1">3</h3>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm border border-zinc-800">
          <span className="text-xs text-gray-400 block">إجمالي الكميات / الهالك المسجل</span>
          <h3 className="text-3xl font-black font-mono text-amber-400 mt-1">142.5 <span className="text-sm font-normal text-gray-400">صينية/كجم</span></h3>
        </div>
      </div>

      {/* 3. التوزيع التحليلي حسب صالات وأقسام المصنع */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 text-xs">
        <h6 className="font-bold text-gray-900 dark:text-zinc-100 mb-3">🏢 التوزيع التحليلي حسب صالات وأقسام المصنع:</h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex justify-between font-bold mb-1">
              <span>صالة تصنيع الحلويات الشرقية</span>
              <span className="font-mono text-indigo-600">18 محضر (47.4%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '47.4%' }}></div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex justify-between font-bold mb-1">
              <span>صالة الجاتوه والتورت والغربي</span>
              <span className="font-mono text-indigo-600">12 محضر (31.6%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '31.6%' }}></div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex justify-between font-bold mb-1">
              <span>صالة الإسفنجي والنواشف والمخبوزات</span>
              <span className="font-mono text-indigo-600">8 محضر (21%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '21%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. جدول المحاضر التفصيلي */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
          <span className="font-bold">📋 سجل الاستجابات والمحاضر الموثقة ({filteredSubmissions.length} سجل)</span>
          <span className="bg-indigo-600 px-2 py-0.5 rounded text-[10px]">النموذج: محضر فحص استلام خامات الدقيق والسمن (HACCP)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b">
              <tr>
                <th className="py-3 px-3 w-16">م</th>
                <th className="py-3 px-3 text-right">القسم / الصالة</th>
                <th className="py-3 px-3 text-right">الصنف / المحرر</th>
                <th className="py-3 px-3">الكمية</th>
                <th className="py-3 px-3 text-right">المسبب / الملاحظة</th>
                <th className="py-3 px-3">المرفقات</th>
                <th className="py-3 px-3">تاريخ التوثيق</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 print:hidden">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredSubmissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">#{sub.id}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">{sub.department}</td>
                  <td className="py-3 px-3 text-right text-gray-600 dark:text-zinc-300">
                    <span className="block font-bold">{sub.itemOrName}</span>
                    <small className="text-gray-400">{sub.submittedByName}</small>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-500">{sub.quantity}</td>
                  <td className="py-3 px-3 text-right text-gray-500 max-w-xs truncate">{sub.reasonOrAction}</td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center gap-1">
                      {sub.hasImage && <span title="مرفق صورة">📷</span>}
                      {sub.hasVideo && <span title="مرفق فيديو">🎥</span>}
                      {sub.hasAudio && <span title="مرفق صوت">🎙️</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-400">{sub.submittedAt}</td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold text-[10px]">
                      ✓ {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 print:hidden">
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-[11px]"
                    >
                      🔍 معاينة كاملة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال المعاينة الكاملة للمحضر والمرفقات */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold">معاينة تفاصيل المحضر رقم #{selectedSubmission.id}</h4>
              <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border grid grid-cols-2 gap-2">
                <div><strong>المحرر:</strong> {selectedSubmission.submittedByName}</div>
                <div><strong>التاريخ:</strong> {selectedSubmission.submittedAt}</div>
                <div><strong>القسم:</strong> {selectedSubmission.department}</div>
                <div><strong>الصنف:</strong> {selectedSubmission.itemOrName}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border space-y-2">
                <span className="font-bold block border-b pb-1 text-gray-700 dark:text-zinc-300">كافة الحقول والملاحظات:</span>
                {Object.entries(selectedSubmission.answers).map(([k, v], idx) => (
                  <div key={idx} className="flex justify-between border-b border-gray-100 dark:border-zinc-800 py-1">
                    <span className="text-gray-400">{k}:</span>
                    <strong className="text-gray-900 dark:text-zinc-100">{v}</strong>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-5 py-1.5 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
