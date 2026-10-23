import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchMaterialReceiptsApi,
  saveMaterialReceiptsToLocal,
} from './materialReceiptApi';
import type { MaterialReceiptInspection } from './materialReceiptApi';
import { NewReceiptModal } from './NewReceiptModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  CheckSquare,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Thermometer,
  Layers
} from 'lucide-react';

export const MaterialReceiptPage: React.FC = () => {
  const [receipts, setReceipts] = useState<MaterialReceiptInspection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchMaterialReceiptsApi();
      setReceipts(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveReceipt = (newReceipt: MaterialReceiptInspection) => {
    const updated = [newReceipt, ...receipts];
    setReceipts(updated);
    saveMaterialReceiptsToLocal(updated);
  };

  const approvedCount = useMemo(
    () => receipts.filter((r) => r.status === 'معتمد ومستلم بالمخزن').length,
    [receipts]
  );
  const pendingCount = useMemo(
    () => receipts.filter((r) => r.status === 'معلق تحت الفحص').length,
    [receipts]
  );
  const rejectedCount = useMemo(
    () => receipts.filter((r) => r.status === 'مرفوض ومرتجع للمورد').length,
    [receipts]
  );

  const columns = useMemo<ColumnDef<MaterialReceiptInspection>[]>(
    () => [
      {
        key: 'receiptNumber',
        header: 'رقم المحضر',
        width: '145px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            {row.receiptNumber}
          </span>
        ),
      },
      {
        key: 'materialName',
        header: 'الخامة ورقم اللوط',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.materialName}</div>
            <div className="text-[11px] font-mono text-indigo-900 mt-0.5">
              لوط: {row.batchNumber} | أمر شراء: {row.poNumber}
            </div>
          </div>
        ),
      },
      {
        key: 'supplierName',
        header: 'المورد وتاريخ الاستلام',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900 text-xs">{row.supplierName}</div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
              تاريخ: {row.receivedDate} - الصلاحية: {row.expiryDate}
            </div>
          </div>
        ),
      },
      {
        key: 'quantityReceived',
        header: 'الكمية المستلمة',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-gray-900">
            {row.quantityReceived.toLocaleString()} {row.unit}
          </span>
        ),
      },
      {
        key: 'truckTemperatureCelsius',
        header: 'حرارة النقل',
        align: 'center',
        render: (row) => (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            <Thermometer className="w-3.5 h-3.5 text-blue-600" />
            <span>{row.truckTemperatureCelsius}°C</span>
          </span>
        ),
      },
      {
        key: 'status',
        header: 'حالة الاستلام والجودة',
        align: 'center',
        render: (row) => {
          const map: Record<string, { cls: string; icon: React.ReactNode }> = {
            'معتمد ومستلم بالمخزن': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            'معلق تحت الفحص': { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
            'مرفوض ومرتجع للمورد': { cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
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

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'حالة الاستلام',
      type: 'select',
      options: [
        { label: 'معتمد ومستلم بالمخزن', value: 'معتمد ومستلم بالمخزن' },
        { label: 'معلق تحت الفحص', value: 'معلق تحت الفحص' },
        { label: 'مرفوض ومرتجع للمورد', value: 'مرفوض ومرتجع للمورد' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return receipts.filter((item) => {
      const matchSearch =
        item.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية لجودة التوريد */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Layers className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي محاضر الفحص</span>
            <span className="text-base font-bold font-mono text-gray-900">{receipts.length} محاضر استلام</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">خامات مقبولة بالمستودع</span>
            <span className="text-base font-bold font-mono text-emerald-700">{approvedCount} شحنات مطابقة</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">شحنات معلقة بالحجر الفني</span>
            <span className="text-base font-bold font-mono text-amber-700">{pendingCount} تحت الاختبار</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">شحنات مرفوضة لعدم المطابقة</span>
            <span className="text-base font-bold font-mono text-rose-700">{rejectedCount} شحنات مرتجعة</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600" />
            <span>فحص واستلام الخامات (Material Receipt & QC)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            توثيق الفحص المخبري وتتبع اللوطات ودرجات حرارة التوريد قبل قيد الدخول لمستودع الخامات
          </p>
        </div>

        <PermissionGuard permission="Products.Manage" showDisabled>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل محضر فحص واستلام</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<MaterialReceiptInspection>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setStatusFilter(f.status || '')}
        isLoading={isLoading}
        exportFileName="محاضر_فحص_استلام_الخامات"
        enableExport={true}
      />

      <NewReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReceipt}
      />
    </div>
  );
};
