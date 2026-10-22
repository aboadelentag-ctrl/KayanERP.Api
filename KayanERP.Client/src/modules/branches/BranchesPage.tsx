import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchBranchesApi, saveBranchesToLocal } from './branchesApi';
import type { BranchWarehouse } from './branchesApi';
import { BranchModal } from './BranchModal';
import { Warehouse, Plus, Edit3, Trash2, MapPin, Truck, Factory, Store, Boxes } from 'lucide-react';

export const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<BranchWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchWarehouse | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchBranchesApi();
      setBranches(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveBranch = (item: BranchWarehouse) => {
    let updated: BranchWarehouse[];
    if (item.id) {
      updated = branches.map((b) => (b.id === item.id ? item : b));
    } else {
      const newItem: BranchWarehouse = { ...item, id: Date.now() };
      updated = [newItem, ...branches];
    }
    setBranches(updated);
    saveBranchesToLocal(updated);
  };

  const handleDeleteBranch = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفرع أو الموقع؟')) {
      const updated = branches.filter((b) => b.id !== id);
      setBranches(updated);
      saveBranchesToLocal(updated);
    }
  };

  const columns = useMemo<ColumnDef<BranchWarehouse>[]>(
    () => [
      {
        key: 'code',
        header: 'كود الموقع',
        width: '110px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
            {row.code}
          </span>
        ),
      },
      {
        key: 'name',
        header: 'اسم الفرع / المنشأة',
        render: (row) => {
          const typeIcons: Record<string, React.ReactNode> = {
            'فرع بيع': <Store className="w-4 h-4 text-emerald-600" />,
            'مستودع رئيسي': <Warehouse className="w-4 h-4 text-blue-600" />,
            'مصنع إنتاج': <Factory className="w-4 h-4 text-amber-600" />,
            'خط توزيع متنقل': <Truck className="w-4 h-4 text-purple-600" />,
          };
          return (
            <div>
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                {typeIcons[row.type]}
                <span>{row.name}</span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{row.address}</span>
              </div>
            </div>
          );
        },
      },
      {
        key: 'type',
        header: 'التصنيف التشغيلي',
        align: 'center',
        render: (row) => {
          const typeClasses: Record<string, string> = {
            'فرع بيع': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'مستودع رئيسي': 'bg-blue-50 text-blue-700 border-blue-200',
            'مصنع إنتاج': 'bg-amber-50 text-amber-700 border-amber-200',
            'خط توزيع متنقل': 'bg-purple-50 text-purple-700 border-purple-200',
          };
          return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${typeClasses[row.type] || 'bg-gray-50 text-gray-700'}`}>
              {row.type}
            </span>
          );
        },
      },
      {
        key: 'manager',
        header: 'المسؤول / المشرف',
        render: (row) => (
          <div>
            <div className="font-medium text-gray-800 text-xs">{row.manager}</div>
            <div className="font-mono text-gray-400 text-[11px]">{row.phone}</div>
          </div>
        ),
      },
      {
        key: 'crateBalance',
        header: 'رصيد المجنسات بالفرع',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Boxes className="w-3.5 h-3.5" />
            <span>{row.crateBalance} قفص</span>
          </div>
        ),
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
                setEditingBranch(row);
                setIsModalOpen(true);
              }}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
              title="تعديل الفرع"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteBranch(row.id)}
              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
              title="حذف الفرع"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [branches]
  );

  const filterFields: FilterField[] = [
    {
      key: 'type',
      label: 'نوع الموقع',
      type: 'select',
      options: [
        { label: 'فرع بيع', value: 'فرع بيع' },
        { label: 'مستودع رئيسي', value: 'مستودع رئيسي' },
        { label: 'مصنع إنتاج', value: 'مصنع إنتاج' },
        { label: 'خط توزيع متنقل', value: 'خط توزيع متنقل' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return branches.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter ? item.type === typeFilter : true;
      return matchSearch && matchType;
    });
  }, [branches, searchTerm, typeFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Warehouse className="w-7 h-7 text-indigo-600" />
            <span>إدارة الفروع والمستودعات وسيارات التوزيع</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            هيكلة منافذ البيع، مصانع المعالجة، خطوط التوزيع، وأرصدة العهد الميدانية
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBranch(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فرع / موقع جديد</span>
        </button>
      </div>

      <DataTable<BranchWarehouse>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setTypeFilter(f.type || '')}
        isLoading={isLoading}
        exportFileName="الفروع_والمستودعات"
        enableExport={true}
      />

      <BranchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        onSave={handleSaveBranch}
        initialData={editingBranch}
      />
    </div>
  );
};
