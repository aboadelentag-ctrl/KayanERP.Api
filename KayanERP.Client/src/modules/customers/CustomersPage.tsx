import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchCustomersApi, saveCustomersToLocal } from './customersApi';
import type { Customer } from './customersApi';
import { CustomerModal } from './CustomerModal';
import { Users, UserPlus, Edit3, Trash2 } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // حالات فتح النافذة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchCustomersApi();
      setCustomers(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // إضافة أو تعديل عميل
  const handleSaveCustomer = (customerData: Customer) => {
    let updatedList: Customer[];
    if (customerData.id) {
      // تعديل
      updatedList = customers.map((c) => (c.id === customerData.id ? customerData : c));
    } else {
      // إضافة جديد
      const newCustomer: Customer = {
        ...customerData,
        id: Date.now(),
      };
      updatedList = [newCustomer, ...customers];
    }
    setCustomers(updatedList);
    saveCustomersToLocal(updatedList);
  };

  // حذف عميل
  const handleDeleteCustomer = (id: number) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العميل؟')) {
      const updatedList = customers.filter((c) => c.id !== id);
      setCustomers(updatedList);
      saveCustomersToLocal(updatedList);
    }
  };

  // استيراد بيانات جماعية من إكسل
  const handleImportExcel = (importedData: any[]) => {
    if (!importedData || !importedData.length) return;
    const mapped: Customer[] = importedData.map((row, idx) => ({
      id: Date.now() + idx,
      code: row['كود العميل'] || `CUST-${100 + idx}`,
      name: row['اسم العميل / المنشأة'] || row['الاسم'] || 'عميل مستورد',
      phone: String(row['رقم الهاتف'] || '-'),
      creditLimit: Number(row['حد الائتمان']) || 0,
      currentBalance: Number(row['الرصيد الحالي المستحق']) || 0,
      status: 'active',
    }));
    const merged = [...mapped, ...customers];
    setCustomers(merged);
    saveCustomersToLocal(merged);
    alert(`تم استيراد ${mapped.length} عميل بنجاح`);
  };

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        key: 'code',
        header: 'كود العميل',
        width: '120px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md text-xs">
            {row.code}
          </span>
        ),
      },
      {
        key: 'name',
        header: 'اسم العميل / المنشأة',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-400 font-mono">{row.phone}</div>
          </div>
        ),
      },
      {
        key: 'creditLimit',
        header: 'حد الائتمان',
        align: 'center',
        render: (row) => (
          <span className="font-semibold text-gray-800">
            {row.creditLimit.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'currentBalance',
        header: 'الرصيد الحالي المستحق',
        align: 'center',
        render: (row) => (
          <span className={`font-bold ${row.currentBalance > row.creditLimit && row.creditLimit > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {row.currentBalance.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'creditUsage',
        header: 'مؤشر استخدام الائتمان',
        width: '180px',
        render: (row) => {
          if (row.creditLimit === 0) {
            return <span className="text-xs text-gray-400">عميل نقدي</span>;
          }
          const ratio = Math.min(Math.round((row.currentBalance / row.creditLimit) * 100), 100);
          const isDanger = ratio >= 90;
          return (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span className={isDanger ? 'font-bold text-rose-600' : 'text-gray-500'}>{ratio}%</span>
                <span className="text-gray-400">{row.creditLimit.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isDanger ? 'bg-rose-500' : ratio > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        render: (row) => {
          const map: Record<string, { label: string; cls: string }> = {
            active: { label: 'نشط', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            suspended: { label: 'موقوف مؤقتاً', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
            blocked: { label: 'محظور', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
          };
          const badge = map[row.status] || { label: row.status, cls: 'bg-gray-50 text-gray-600 border-gray-200' };
          return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        align: 'center',
        width: '100px',
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => {
                setEditingCustomer(row);
                setIsModalOpen(true);
              }}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="تعديل العميل"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCustomer(row.id)}
              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="حذف العميل"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [customers]
  );

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'حالة العميل',
      type: 'select',
      options: [
        { label: 'نشط', value: 'active' },
        { label: 'موقوف مؤقتاً', value: 'suspended' },
        { label: 'محظور', value: 'blocked' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return customers.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm);
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>إدارة العملاء وحدود الائتمان</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            متابعة أرصدة العملاء وسقوف التسهيلات ومنع تجاوز المديونيات
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-colors text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      <DataTable<Customer>
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
        exportFileName="دليل_عملاء_كيان"
        enableExport={true}
        enableImport={true}
        onImportData={handleImportExcel}
      />

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        initialData={editingCustomer}
      />
    </div>
  );
};
