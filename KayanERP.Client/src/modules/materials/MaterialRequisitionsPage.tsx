import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchMaterialRequisitionsApi, saveMaterialRequisitionsToLocal } from './materialsApi';
import type { MaterialRequisition } from './materialsApi';
import { NewRequisitionModal } from './NewRequisitionModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import { ShoppingBag, Plus, CheckCircle2, Clock, Check } from 'lucide-react';

export const MaterialRequisitionsPage: React.FC = () => {
  const [requisitions, setRequisitions] = useState<MaterialRequisition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchMaterialRequisitionsApi();
      setRequisitions(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveRequisition = (newReq: MaterialRequisition) => {
    const updated = [newReq, ...requisitions];
    setRequisitions(updated);
    saveMaterialRequisitionsToLocal(updated);
  };

  const handleApproveRequisition = (id: number) => {
    const updated = requisitions.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: 'معتمد ومنصرف' as const,
          approvedBy: 'أمين مستودع الخامات الرئيسي',
        };
      }
      return r;
    });
    setRequisitions(updated);
    saveMaterialRequisitionsToLocal(updated);
  };

  const columns = useMemo<ColumnDef<MaterialRequisition>[]>(
    () => [
      {
        key: 'requisitionNumber',
        header: 'رقم إذن الصرف',
        width: '135px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
            {row.requisitionNumber}
          </span>
        ),
      },
      {
        key: 'date',
        header: 'التاريخ',
        align: 'center',
        render: (row) => <span className="font-mono text-xs text-gray-500">{row.date}</span>,
      },
      {
        key: 'department',
        header: 'صالة الإنتاج وأمر التشغيل',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900">{row.department}</div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">أمر تشغيل: {row.productionOrderNumber}</div>
          </div>
        ),
      },
      {
        key: 'requestedBy',
        header: 'مقدم الطلب / الاعتماد',
        render: (row) => (
          <div>
            <div className="text-xs font-medium text-gray-800">{row.requestedBy}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">اعتمد: {row.approvedBy}</div>
          </div>
        ),
      },
      {
        key: 'totalCost',
        header: 'إجمالي القيمة',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-gray-900 text-xs">
            {row.totalCost.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        render: (row) => {
          const isApproved = row.status === 'معتمد ومنصرف';
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              isApproved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}>
              {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{row.status}</span>
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'إجراء المستودع',
        align: 'center',
        width: '120px',
        render: (row) => {
          if (row.status === 'معلق للموافقة') {
            return (
              <PermissionGuard permission="Materials.Requisition" showDisabled>
                <button
                  onClick={() => handleApproveRequisition(row.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد الصرف</span>
                </button>
              </PermissionGuard>
            );
          }
          return <span className="text-[11px] text-gray-400 font-semibold">منصرف للمعمل</span>;
        },
      },
    ],
    [requisitions]
  );

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'حالة الإذن',
      type: 'select',
      options: [
        { label: 'معتمد ومنصرف', value: 'معتمد ومنصرف' },
        { label: 'معلق للموافقة', value: 'معلق للموافقة' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return requisitions.filter((item) => {
      const matchSearch =
        item.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productionOrderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [requisitions, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-indigo-600" />
            <span>أذون صرف خامات المعمل (Material Requisitions)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            صرف خامات ومستلزمات الحلويات من مستودع الخامات المركزي إلى صالات التشغيل
          </p>
        </div>

        <PermissionGuard permission="Materials.Requisition" showDisabled>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>تحرير إذن صرف خامات</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<MaterialRequisition>
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
        exportFileName="اذون_صرف_خامات_المعمل"
        enableExport={true}
      />

      <NewRequisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRequisition}
      />
    </div>
  );
};
