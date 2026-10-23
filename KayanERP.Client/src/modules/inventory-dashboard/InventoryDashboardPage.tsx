import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchStockStatusApi,
  saveStockStatusToLocal,
} from './inventoryDashboardApi';
import type { StockItemStatus } from './inventoryDashboardApi';
import { StockCardModal } from './StockCardModal';
import {
  Grid2X2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  Boxes
} from 'lucide-react';

export const InventoryDashboardPage: React.FC = () => {
  const [items, setItems] = useState<StockItemStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [healthFilter, setHealthFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedItem, setSelectedItem] = useState<StockItemStatus | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchStockStatusApi();
      setItems(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const totalValuation = useMemo(() => items.reduce((s, i) => s + i.totalValuation, 0), [items]);
  const safeCount = useMemo(() => items.filter((i) => i.stockHealth === 'آمن وفير').length, [items]);
  const reorderCount = useMemo(() => items.filter((i) => i.stockHealth === 'وصل لحد الطلب').length, [items]);
  const criticalCount = useMemo(() => items.filter((i) => i.stockHealth === 'حرج تحت الأمان').length, [items]);

  const columns = useMemo<ColumnDef<StockItemStatus>[]>(
    () => [
      {
        key: 'itemCode',
        header: 'كود الخامة',
        width: '120px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            {row.itemCode}
          </span>
        ),
      },
      {
        key: 'itemName',
        header: 'اسم الخامة والتصنيف',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.itemName}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{row.category}</div>
          </div>
        ),
      },
      {
        key: 'currentStock',
        header: 'الرصيد اللحظي',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-sm text-gray-900">
            {row.currentStock.toLocaleString()} {row.unit}
          </span>
        ),
      },
      {
        key: 'reorderPoint',
        header: 'حد الطلب / الأمان',
        align: 'center',
        render: (row) => (
          <div className="font-mono text-xs">
            <span className="text-amber-700 font-semibold">{row.reorderPoint}</span>
            <span className="text-gray-300 mx-1">/</span>
            <span className="text-rose-700 font-semibold">{row.safetyStock}</span>
          </div>
        ),
      },
      {
        key: 'totalValuation',
        header: 'تقييم المخزون (ج.م)',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-indigo-900">
            {row.totalValuation.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'stockHealth',
        header: 'الحالة المخزنية',
        align: 'center',
        render: (row) => {
          const map: Record<string, { cls: string; icon: React.ReactNode }> = {
            'آمن وفير': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            'وصل لحد الطلب': { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
            'حرج تحت الأمان': { cls: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          };
          const b = map[row.stockHealth] || { cls: 'bg-gray-50 text-gray-700 border-gray-200', icon: null };
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${b.cls}`}>
              {b.icon}
              <span>{row.stockHealth}</span>
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'كارت الصنف',
        align: 'center',
        width: '120px',
        render: (row) => (
          <button
            onClick={() => setSelectedItem(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>عرض اللوطات</span>
          </button>
        ),
      },
    ],
    []
  );

  const filterFields: FilterField[] = [
    {
      key: 'stockHealth',
      label: 'الحالة المخزنية',
      type: 'select',
      options: [
        { label: 'آمن وفير', value: 'آمن وفير' },
        { label: 'وصل لحد الطلب', value: 'وصل لحد الطلب' },
        { label: 'حرج تحت الأمان', value: 'حرج تحت الأمان' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchHealth = healthFilter ? item.stockHealth === healthFilter : true;
      return matchSearch && matchHealth;
    });
  }, [items, searchTerm, healthFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية للمخزون والتقييم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Boxes className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي تقييم مخزون الخامات</span>
            <span className="text-base font-bold font-mono text-indigo-950">{totalValuation.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">خامات برصيد آمن وفير</span>
            <span className="text-base font-bold font-mono text-emerald-700">{safeCount} أصناف</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">أصناف قاربت حد إعادة الطلب</span>
            <span className="text-base font-bold font-mono text-amber-700">{reorderCount} أصناف للطلب</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">خامات حرجة تحت رصيد الأمان</span>
            <span className="text-base font-bold font-mono text-rose-700">{criticalCount} أصناف حرجة</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Grid2X2 className="w-7 h-7 text-indigo-600" />
            <span>لوحة مؤشرات المخزون وكارت الصنف (Inventory Dashboard)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            متابعة حدود إعادة الطلب ورصيد الأمان للخامات الحساسة، وتقييم القيمة المالية للمخزون
          </p>
        </div>
      </div>

      <DataTable<StockItemStatus>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setHealthFilter(f.stockHealth || '')}
        isLoading={isLoading}
        exportFileName="ارصدة_ومؤشرات_المخزون_كيان"
        enableExport={true}
      />

      <StockCardModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
};
