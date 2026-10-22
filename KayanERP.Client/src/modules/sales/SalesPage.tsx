import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchSalesInvoicesApi, saveSalesInvoicesToLocal } from './salesApi';
import type { SalesInvoice } from './salesApi';
import { NewInvoiceModal } from './NewInvoiceModal';
import { ShoppingCart, Plus, Boxes, Receipt, Eye } from 'lucide-react';

export const SalesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchSalesInvoicesApi();
      setInvoices(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveInvoice = (newInv: SalesInvoice) => {
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    saveSalesInvoicesToLocal(updated);

    // تحديث رصيد مديونية العميل ورصيد المجنسات في الـ LocalStorage تلقائياً
    const custData = JSON.parse(localStorage.getItem('kayan_customers_data') || '[]');
    const updatedCust = custData.map((c: any) => {
      if (c.id === newInv.customerId && newInv.paymentType === 'آجل') {
        return { ...c, currentBalance: c.currentBalance + newInv.netTotal };
      }
      return c;
    });
    localStorage.setItem('kayan_customers_data', JSON.stringify(updatedCust));

    // تحديث رصيد مجنسات العميل
    const crateData = JSON.parse(localStorage.getItem('kayan_crate_clients_data') || '[]');
    const updatedCrates = crateData.map((cr: any) => {
      if (cr.id === newInv.customerId) {
        return {
          ...cr,
          crateBalance: cr.crateBalance + newInv.cratesDispatched,
          lastMovementDate: newInv.date,
        };
      }
      return cr;
    });
    localStorage.setItem('kayan_crate_clients_data', JSON.stringify(updatedCrates));
  };

  const columns = useMemo<ColumnDef<SalesInvoice>[]>(
    () => [
      {
        key: 'invoiceNumber',
        header: 'رقم الفاتورة',
        width: '130px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
            {row.invoiceNumber}
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
        key: 'customerName',
        header: 'العميل ومنفذ الصرف',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900">{row.customerName}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">صرفت من: {row.branchName}</div>
          </div>
        ),
      },
      {
        key: 'paymentType',
        header: 'الدفع',
        align: 'center',
        render: (row) => (
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
            row.paymentType === 'نقد'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {row.paymentType}
          </span>
        ),
      },
      {
        key: 'cratesDispatched',
        header: 'المجنسات المصروفة',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200">
            <Boxes className="w-3 h-3" />
            <span>{row.cratesDispatched} قفص</span>
          </div>
        ),
      },
      {
        key: 'netTotal',
        header: 'صافي الفاتورة',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-gray-900 text-sm">
            {row.netTotal.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        render: (row) => (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {row.status}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'معاينة',
        align: 'center',
        width: '80px',
        render: (row) => (
          <button
            onClick={() => alert(`فاتورة ${row.invoiceNumber}\nالعميل: ${row.customerName}\nإجمالي القيمة: ${row.netTotal} ج.م`)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="معاينة الفاتورة"
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  );

  const filterFields: FilterField[] = [
    {
      key: 'paymentType',
      label: 'طريقة الدفع',
      type: 'select',
      options: [
        { label: 'آجل', value: 'آجل' },
        { label: 'نقد', value: 'نقد' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return invoices.filter((item) => {
      const matchSearch =
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branchName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPay = paymentFilter ? item.paymentType === paymentFilter : true;
      return matchSearch && matchPay;
    });
  }, [invoices, searchTerm, paymentFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-indigo-600" />
            <span>فواتير المبيعات وأوامر الصرف</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إصدار أذون تسليم البضائع والحلويات، ومراقبة المديونية وصرف المجنسات
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>تحرير فاتورة بيع جديدة</span>
        </button>
      </div>

      <DataTable<SalesInvoice>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setPaymentFilter(f.paymentType || '')}
        isLoading={isLoading}
        exportFileName="فواتير_المبيعات_كيان"
        enableExport={true}
      />

      <NewInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInvoice}
      />
    </div>
  );
};
