import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchProductionOrdersApi, saveProductionOrdersToLocal } from './productionApi';
import type { ProductionOrder } from './productionApi';
import { NewProductionOrderModal } from './NewProductionOrderModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import { Factory, Plus, CheckCircle2, Flame, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export const ProductionHubPage: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchProductionOrdersApi();
      setOrders(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveOrder = (newOrder: ProductionOrder) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveProductionOrdersToLocal(updated);
  };

  // ترقية مرحلة التشغيل في المعمل
  const handleAdvanceStatus = (id: number) => {
    const updated = orders.map((o) => {
      if (o.id === id) {
        if (o.status === 'مجدول') {
          return { ...o, status: 'قيد التجهيز والخبز' as const };
        }
        if (o.status === 'قيد التجهيز والخبز') {
          return { ...o, status: 'جاهز لفحص الجودة' as const, producedQuantity: o.plannedQuantity };
        }
        if (o.status === 'جاهز لفحص الجودة') {
          // ترصيد الصنف التام في مخزن المنتجات التامة تلقائياً
          const prodData = JSON.parse(localStorage.getItem('kayan_products_data') || '[]');
          const updatedProds = prodData.map((p: any) => {
            if (p.name === o.productName) {
              return { ...p, currentStock: p.currentStock + o.producedQuantity };
            }
            return p;
          });
          localStorage.setItem('kayan_products_data', JSON.stringify(updatedProds));

          return { ...o, status: 'مكتمل ومرحل للتوزيع' as const, actualCost: o.estimatedCost };
        }
      }
      return o;
    });
    setOrders(updated);
    saveProductionOrdersToLocal(updated);
  };

  const columns = useMemo<ColumnDef<ProductionOrder>[]>(
    () => [
      {
        key: 'orderNumber',
        header: 'رقم التشغيلة',
        width: '135px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
            {row.orderNumber}
          </span>
        ),
      },
      {
        key: 'productName',
        header: 'الصنف المستهدف والكمية',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900">{row.productName}</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">
              مخطط: <b>{row.plannedQuantity} {row.unit}</b>
              {row.producedQuantity > 0 && <span className="text-emerald-700 mr-2">| تم إنتاج: {row.producedQuantity}</span>}
            </div>
          </div>
        ),
      },
      {
        key: 'shift',
        header: 'الوردية والمسؤول',
        render: (row) => (
          <div>
            <div className="font-medium text-gray-800 text-xs">{row.assignedChef}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{row.shift}</div>
          </div>
        ),
      },
      {
        key: 'estimatedCost',
        header: 'تكلفة الخامات',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-gray-800 text-xs">
            {row.estimatedCost.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'status',
        header: 'المرحلة الحالية',
        align: 'center',
        render: (row) => {
          const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
            'مجدول': { label: 'مجدول', cls: 'bg-slate-50 text-slate-700 border-slate-200', icon: <Clock className="w-3.5 h-3.5" /> },
            'قيد التجهيز والخبز': { label: 'قيد التجهيز والخبز', cls: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse', icon: <Flame className="w-3.5 h-3.5" /> },
            'جاهز لفحص الجودة': { label: 'فحص الجودة (QC)', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Sparkles className="w-3.5 h-3.5" /> },
            'مكتمل ومرحل للتوزيع': { label: 'مكتمل ومرحل للتوزيع', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            'ملغى': { label: 'ملغى', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          };
          const badge = map[row.status] || { label: row.status, cls: 'bg-gray-50 text-gray-700 border-gray-200', icon: null };
          return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.cls}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'إجراءات المعمل',
        align: 'center',
        width: '140px',
        render: (row) => {
          if (row.status === 'مكتمل ومرحل للتوزيع') {
            return <span className="text-[11px] text-gray-400 font-semibold">تم الترحيل للمخزن</span>;
          }

          let nextActionText = 'بدء الخبز والتشغيل';
          if (row.status === 'قيد التجهيز والخبز') nextActionText = 'إتمام الخبز (فحص QC)';
          if (row.status === 'جاهز لفحص الجودة') nextActionText = 'اعتماد وترحيل للمخزن';

          return (
            <PermissionGuard permission="Production.Create" showDisabled>
              <button
                onClick={() => handleAdvanceStatus(row.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <span>{nextActionText}</span>
              </button>
            </PermissionGuard>
          );
        },
      },
    ],
    [orders]
  );

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'مرحلة التشغيلة',
      type: 'select',
      options: [
        { label: 'قيد التجهيز والخبز', value: 'قيد التجهيز والخبز' },
        { label: 'جاهز لفحص الجودة', value: 'جاهز لفحص الجودة' },
        { label: 'مكتمل ومرحل للتوزيع', value: 'مكتمل ومرحل للتوزيع' },
        { label: 'مجدول', value: 'مجدول' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return orders.filter((item) => {
      const matchSearch =
        item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedChef.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="w-7 h-7 text-indigo-600" />
            <span>مركز عمليات التشغيل وأوامر الإنتاج (Production Hub)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة خطوط إنتاج المصنع والمعمل، ومراقبة سحب الخامات، وترحيل الحلويات التامة للمستودع
          </p>
        </div>

        <PermissionGuard permission="Production.Create" showDisabled>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار أمر إنتاج معمل</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<ProductionOrder>
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
        exportFileName="اوامر_تشغيل_المعمل_كيان"
        enableExport={true}
      />

      <NewProductionOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrder}
      />
    </div>
  );
};
