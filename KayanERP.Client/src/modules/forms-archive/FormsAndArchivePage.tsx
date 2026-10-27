import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ClipboardList,
  FileSpreadsheet,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  Check,
  X
} from 'lucide-react';

interface FormsAndArchivePageProps {
  onNavigate?: (tab: string) => void;
}

export interface InspectionRecordDto {
  id: number;
  reportCode: string;
  templateName: string;
  departmentName: string;
  inspectorName: string;
  inspectionDate: string;
  complianceRate: number;
  status: 'APPROVED' | 'CORRECTIVE_ACTION';
}

export const FormsAndArchivePage: React.FC<FormsAndArchivePageProps> = ({ onNavigate }) => {
  const [records, setRecords] = useState<InspectionRecordDto[]>([
    {
      id: 1,
      reportCode: 'SUB-2026-001',
      templateName: 'قائمة التحقق من درجات حرارة غرف التجميد والتبريد',
      departmentName: 'غرف التبريد والتجميد المركزي',
      inspectorName: 'د. مينا عادل (مفتش الجودة والسلامة)',
      inspectionDate: '2026-10-23',
      complianceRate: 100,
      status: 'APPROVED'
    },
    {
      id: 2,
      reportCode: 'SUB-2026-002',
      templateName: 'محضر تفتيش النظافة والتعقيم الشخصي للشيفات وصالات الحلويات',
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      inspectorName: 'د. مينا عادل (مفتش الجودة والسلامة)',
      inspectionDate: '2026-10-23',
      complianceRate: 94,
      status: 'CORRECTIVE_ACTION'
    },
    {
      id: 3,
      reportCode: 'SUB-2026-003',
      templateName: 'سجل معايرة درجات حرارة الأفران الدوارة ومداخن الغاز',
      departmentName: 'صالة الأفران والمخبوزات الآلية',
      inspectorName: 'أحمد فؤاد (مسؤول الصيانة الفنية)',
      inspectionDate: '2026-10-22',
      complianceRate: 98,
      status: 'APPROVED'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'CORRECTIVE_ACTION'>('ALL');

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.reportCode.toLowerCase().includes(term) ||
        r.templateName.toLowerCase().includes(term) ||
        r.departmentName.toLowerCase().includes(term) ||
        r.inspectorName.toLowerCase().includes(term)
      );
    });
  }, [records, statusFilter, searchTerm]);

  const exportToExcel = () => {
    let csv = 'كود_المحضر,نموذج_الفحص,القسم_الصالة,المسؤول,تاريخ_الفحص,نسبة_الامتثال,الحالة\n';
    filteredRecords.forEach(r => {
      const st = r.status === 'APPROVED' ? 'معتمد ومطابق' : 'يحتاج إجراء تصحيحي';
      csv += `"${r.reportCode}","${r.templateName}","${r.departmentName}","${r.inspectorName}","${r.inspectionDate}",${r.complianceRate}%,"${st}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجلات_فحص_الجودة_HACCP_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* البطاقات العليا الإحصائية بالثيم الليلي الفاحم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي محاضر الفحص المسجلة</span>
          <h4 className="text-2xl font-black text-amber-400 font-mono mt-1">{records.length} محاضر معتمدة</h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">متوسط الامتثال لسلامة الغذاء (HACCP)</span>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">97% (ممتاز)</h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">ملاحظات تحت الإجراء التصحيحي</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">1 إجراءات جارية</h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">قوالب ونماذج الفحص الجاهزة</span>
          <h4 className="text-2xl font-black text-rose-400 font-mono mt-1">3 قوالب معتمدة</h4>
        </div>
      </div>

      {/* ترويسة الشاشة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <span>منظومة النماذج الرقمية وأرشيف الفحوصات (HACCP & Archive)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              توكيد الجودة وسلامة الغذاء
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            سجلات الفحص الميداني الرقمي، التفتيش على درجات التبريد والنظافة، وأرشيف السجلات التاريخية.
          </p>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onNavigate && onNavigate('dynamic-forms')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ تعبئة محضر فحص ميداني</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('form-viewer')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <ClipboardList className="w-4 h-4" />
            <span>مصمم قوالب النماذج (Checklists)</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="bg-white dark:bg-[#0f1117] p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 flex justify-between items-center text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم المحضر، اسم النموذج، الصالة، أو المفتش..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}
          >
            الكل ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}
          >
            معتمد ومطابق
          </button>
          <button
            onClick={() => setStatusFilter('CORRECTIVE_ACTION')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${statusFilter === 'CORRECTIVE_ACTION' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}
          >
            إجراء تصحيحي
          </button>
        </div>
      </div>

      {/* جدول سجلات الفحص الميداني وأرشيف الهاسب */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">كود المحضر</th>
                <th className="py-3 px-3 text-right">نموذج الفحص والقسم</th>
                <th className="py-3 px-3 text-right">مسؤول الفحص</th>
                <th className="py-3 px-3">تاريخ الفحص</th>
                <th className="py-3 px-3">درجة الامتثال</th>
                <th className="py-3 px-3">حالة الاعتماد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{r.reportCode}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-zinc-100 block">{r.templateName}</span>
                    <small className="text-zinc-500">الصالة: {r.departmentName}</small>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400">{r.inspectorName}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{r.inspectionDate}</td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      r.complianceRate >= 95 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {r.complianceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {r.status === 'APPROVED' ? 'معتمد ومطابق ✓' : 'يحتاج إجراء تصحيحي ⏳'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormsAndArchivePage;


