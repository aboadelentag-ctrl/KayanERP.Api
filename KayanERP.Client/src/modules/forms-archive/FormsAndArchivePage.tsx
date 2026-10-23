import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef } from '../../core/components/data-table';
import {
  fetchFormTemplatesApi,
  saveFormTemplatesToLocal,
  fetchFormSubmissionsApi,
  saveFormSubmissionsToLocal,
} from './formsArchiveApi';
import type { InspectionFormTemplate, FormSubmissionRecord } from './formsArchiveApi';
import { NewSubmissionModal } from './NewSubmissionModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  ClipboardCheck,
  Archive,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

export const FormsAndArchivePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'templates'>('submissions');
  const [templates, setTemplates] = useState<InspectionFormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [tmplData, subData] = await Promise.all([
        fetchFormTemplatesApi(),
        fetchFormSubmissionsApi(),
      ]);
      setTemplates(tmplData);
      setSubmissions(subData);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveSubmission = (newRecord: FormSubmissionRecord) => {
    const updated = [newRecord, ...submissions];
    setSubmissions(updated);
    saveFormSubmissionsToLocal(updated);
  };

  const avgCompliance = useMemo(() => {
    if (submissions.length === 0) return 100;
    return Math.round(submissions.reduce((s, r) => s + r.complianceScore, 0) / submissions.length);
  }, [submissions]);

  const approvedCount = useMemo(
    () => submissions.filter((s) => s.status === 'معتمد ومطابق').length,
    [submissions]
  );
  const correctiveCount = useMemo(
    () => submissions.filter((s) => s.status === 'يحتاج إجراء تصحيحي').length,
    [submissions]
  );

  const columnsSubmissions = useMemo<ColumnDef<FormSubmissionRecord>[]>(
    () => [
      {
        key: 'submissionCode',
        header: 'كود المحضر',
        width: '135px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            {row.submissionCode}
          </span>
        ),
      },
      {
        key: 'templateTitle',
        header: 'نموذج الفحص والقسم',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.templateTitle}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">الصالة: {row.departmentName}</div>
          </div>
        ),
      },
      {
        key: 'inspectorName',
        header: 'مسؤول الفحص',
        render: (row) => (
          <span className="text-xs font-semibold text-gray-800">{row.inspectorName}</span>
        ),
      },
      {
        key: 'submissionDate',
        header: 'تاريخ الفحص',
        align: 'center',
        render: (row) => <span className="font-mono text-xs text-gray-500">{row.submissionDate}</span>,
      },
      {
        key: 'complianceScore',
        header: 'درجة الامتثال',
        align: 'center',
        render: (row) => (
          <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
            row.complianceScore >= 95
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {row.complianceScore}%
          </span>
        ),
      },
      {
        key: 'status',
        header: 'حالة الاعتماد',
        align: 'center',
        render: (row) => {
          const map: Record<string, { cls: string; icon: React.ReactNode }> = {
            'معتمد ومطابق': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            'يحتاج إجراء تصحيحي': { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
            'مرفوض كلياً': { cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          };
          const b = map[row.status] || { cls: 'bg-gray-50 text-gray-700 border-gray-200', icon: null };
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${b.cls}`}>
              {b.icon}
              <span>{row.status}</span>
            </span>
          );
        },
      },
    ],
    []
  );

  const paginatedSubmissions = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return submissions.slice(start, start + pageSize);
  }, [submissions, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><ClipboardCheck className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي محاضر الفحص المسجلة</span>
            <span className="text-base font-bold font-mono text-gray-900">{submissions.length} محاضر معتمدة</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">متوسط الامتثال لسلامة الغذاء</span>
            <span className="text-base font-bold font-mono text-emerald-700">{avgCompliance}% (HACCP)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">ملاحظات تحت الإجراء التصحيحي</span>
            <span className="text-base font-bold font-mono text-amber-700">{correctiveCount} إجراءات جارية</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><Archive className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">قوالب ونماذج الفحص الجاهزة</span>
            <span className="text-base font-bold font-mono text-rose-700">{templates.length} قوالب معتمدة</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-indigo-600" />
            <span>منظومة النماذج الرقمية وأرشيف الفحوصات (HACCP & Archive)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            سجلات الفحص الميداني الرقمي، التفتيش على درجات التبريد والنظافة، وأرشيف السجلات التاريخية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'submissions' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              أرشيف سجلات الفحص المعتمدة 🗄️
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              مصمم قوالب النماذج (Checklists) 📋
            </button>
          </div>

          {activeTab === 'submissions' && (
            <PermissionGuard permission="Products.Manage" showDisabled>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>تعبئة محضر فحص ميداني</span>
              </button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {activeTab === 'submissions' && (
        <DataTable<FormSubmissionRecord>
          columns={columnsSubmissions}
          data={paginatedSubmissions}
          totalRecords={submissions.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
          exportFileName="ارشيف_سجلات_فحص_الجودة"
          enableExport={true}
        />
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {t.templateCode}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {t.status}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-gray-900 text-sm">{t.title}</h3>
                  <span className="text-[11px] text-gray-400 block mt-1">تصنيف: {t.category}</span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>الجهة المستهدفة:</span>
                    <span className="font-semibold text-gray-900">{t.targetDepartment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>دورية التفتيش:</span>
                    <span className="font-semibold text-indigo-900">{t.frequency}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono">{t.fieldsCount} بنود تحقق</span>
                <span className="text-indigo-600 font-bold">جاهز للتعبئة الميدانية</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubmission}
        templates={templates}
      />
    </div>
  );
};
