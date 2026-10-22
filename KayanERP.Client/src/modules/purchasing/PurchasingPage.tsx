import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchPurchaseInvoicesApi,
  savePurchaseInvoicesToLocal,
  fetchSuppliersApi,
  saveSuppliersToLocal,
} from './purchasingApi';
import type { PurchaseInvoice, Supplier } from './purchasingApi';
import { NewPurchaseInvoiceModal } from './NewPurchaseInvoiceModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import { ShoppingCart, Plus, Users, Truck, CheckCircle2 } from 'lucide-react';

export const PurchasingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [invData, supData] = await Promise.all([
        fetchPurchaseInvoicesApi(),
        fetchSuppliersApi(),
      ]);
      setInvoices(invData);
      setSuppliers(supData);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveInvoice = (newInv: PurchaseInvoice) => {
    const updatedInvoices = [newInv, ...invoices];
    setInvoices(updatedInvoices);
    savePurchaseInvoicesToLocal(updatedInvoices);

    // 1. تحديث رصيد مستحقات المورد
    const updatedSuppliers = suppliers.map((s) => {
      if (s.id === newInv.supplierId) {
        return { ...s, currentBalance: s.currentBalance + newInv.remainingAmount };
      }
      return s;
    });
    setSuppliers(updatedSuppliers);
    saveSuppliersToLocal(updatedSuppliers);

    // 2. ترحيل قيد يومية تلقائي متوازن في دفتر اليومية العام
    const journalEntries = JSON.parse(localStorage.getItem('kayan_journal_entries') || '[]');
    const newJournalEntry = {
      id: Date.now(),
      entryNumber: `JRN-PUR-${Math.floor(100 + Math.random() * 900)}`,
      date: newInv.date,
      referenceType: 'قيد تسوية يدوي' as const,
      referenceNumber: newInv.invoiceNumber,
      description: `إثبات فاتورة مشتريات خامات - ${newInv.supplierName}`,
      totalDebit: newInv.netTotal,
      totalCredit: newInv.netTotal,
      status: 'مرحل للأستاذ العام' as const,
      createdBy: 'النظام الآلي (Auto-Post)',
      lines: [
        {
          id: Date.now() + 1,
          accountId: 7,
          accountCode: '1105',
          accountName: 'مخزون الخامات ومستلزمات الإنتاج',
          debit: newInv.netTotal,
          credit: 0,
          description: `توريد خامات فاتورة ${newInv.invoiceNumber}`,
        },
        {
          id: Date.now() + 2,
          accountId: 14,
          accountCode: '2101',
          accountName: 'حسابات الموردين (ذمم دائنة)',
          debit: 0,
          credit: newInv.netTotal,
          description: `استحقاق مورد: ${newInv.supplierName}`,
        },
      ],
    };
    localStorage.setItem('kayan_journal_entries', JSON.stringify([newJournalEntry, ...journalEntries]));
  };

  const columns = useMemo<ColumnDef<PurchaseInvoice>[]>(
    () => [
      {
        key: 'invoiceNumber',
        header: 'رقم الفاتورة',
        width: '135px',
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
        key: 'supplierName',
        header: 'المورد وحالة التوريد',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900 text-xs">{row.supplierName}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">عدد الأصناف: {row.itemsCount} خامات</div>
          </div>
        ),
      },
      {
        key: 'paymentType',
        header: 'السداد',
        align: 'center',
        render: (row) => (
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
            row.paymentType === 'نقدي'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {row.paymentType}
          </span>
        ),
      },
      {
        key: 'netTotal',
        header: 'صافي الفاتورة',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-gray-900 text-xs">
            {row.netTotal.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'remainingAmount',
        header: 'المتبقي (آجل)',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-rose-700">
            {row.remainingAmount > 0 ? `${row.remainingAmount.toLocaleString()} ج.م` : 'خالص'}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        render: (row) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{row.status}</span>
          </span>
        ),
      },
    ],
    []
  );

  const filterFields: FilterField[] = [
    {
      key: 'paymentType',
      label: 'نوع السداد',
      type: 'select',
      options: [
        { label: 'آجل', value: 'آجل' },
        { label: 'نقدي', value: 'نقدي' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return invoices.filter((item) => {
      const matchSearch =
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
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
      {/* بطاقات مؤشرات الموردين السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">الموردين المعتمدين</span>
            <span className="text-base font-bold text-gray-900">{suppliers.length} موردين</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><ShoppingCart className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">فواتير التوريد</span>
            <span className="text-base font-bold text-gray-900">{invoices.length} فواتير</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Truck className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">مشتريات الخامات اليوم</span>
            <span className="text-base font-bold text-gray-900">55,500 ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي الذمم الدائنة</span>
            <span className="text-base font-bold text-rose-700">103,500 ج.م</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-indigo-600" />
            <span>فواتير مشتريات وتوريد الخامات (Purchasing & Inward Stock)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إثبات استلام خامات المعمل من الموردين، وإصدار القيود الآلية في دفتر اليومية
          </p>
        </div>

        <PermissionGuard permission="Sales.Create" showDisabled>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>تحرير فاتورة شراء وتوريد</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<PurchaseInvoice>
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
        exportFileName="فواتير_مشتريات_الخامات"
        enableExport={true}
      />

      <NewPurchaseInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInvoice}
        suppliers={suppliers}
      />
    </div>
  );
};
