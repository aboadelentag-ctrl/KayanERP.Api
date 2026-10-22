import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchAssetsApi,
  saveAssetsToLocal,
  fetchMaintenanceApi,
  saveMaintenanceToLocal,
} from './assetsApi';
import type { FixedAsset, MaintenanceRecord } from './assetsApi';
import { AssetModal } from './AssetModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  Wrench,
  Plus,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assets' | 'maintenance'>('assets');
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [astData, mntData] = await Promise.all([
        fetchAssetsApi(),
        fetchMaintenanceApi(),
      ]);
      setAssets(astData);
      setMaintenanceRecords(mntData);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveAsset = (item: FixedAsset) => {
    let updated: FixedAsset[];
    if (assets.some((a) => a.id === item.id)) {
      updated = assets.map((a) => (a.id === item.id ? item : a));
    } else {
      updated = [item, ...assets];
    }
    setAssets(updated);
    saveAssetsToLocal(updated);
  };

  const totalCapitalCost = useMemo(() => assets.reduce((s, a) => s + a.purchaseCost, 0), [assets]);
  const totalBookValue = useMemo(() => assets.reduce((s, a) => s + a.currentBookValue, 0), [assets]);

  const columns = useMemo<ColumnDef<FixedAsset>[]>(
    () => [
      {
        key: 'code',
        header: 'كود الأصل',
        width: '130px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
            {row.code}
          </span>
        ),
      },
      {
        key: 'name',
        header: 'المعدة والخط والموقع',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900 text-xs">{row.name}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{row.category} - {row.branchName}</div>
          </div>
        ),
      },
      {
        key: 'purchaseCost',
        header: 'تكلفة الشراء',
        align: 'center',
        render: (row) => (
          <span className="font-mono text-gray-700 text-xs">
            {row.purchaseCost.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'currentBookValue',
        header: 'القيمة الدفترية الحالية',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-emerald-700 text-xs">
            {row.currentBookValue.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'status',
        header: 'الحالة الفنية',
        align: 'center',
        render: (row) => {
          const map: Record<string, { cls: string; icon: React.ReactNode }> = {
            'يعمل بكفاءة': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            'تحت الصيانة الوقائية': { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
            'معطل / إصلاح طارئ': { cls: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
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
      {
        key: 'nextMaintenanceDate',
        header: 'موعد الصيانة القادم',
        align: 'center',
        render: (row) => <span className="font-mono text-xs text-indigo-900">{row.nextMaintenanceDate}</span>,
      },
    ],
    []
  );

  const filterFields: FilterField[] = [
    {
      key: 'category',
      label: 'تصنيف المعدات',
      type: 'select',
      options: [
        { label: 'أفران وخطوط خبز', value: 'أفران وخطوط خبز' },
        { label: 'عجانات ومعدات تحضير', value: 'عجانات ومعدات تحضير' },
        { label: 'ثلاجات وتبريد مركزي', value: 'ثلاجات وتبريد مركزي' },
        { label: 'أسطول سيارات وشاحنات التوزيع', value: 'أسطول سيارات وشاحنات التوزيع' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return assets.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter ? item.category === categoryFilter : true;
      return matchSearch && matchCat;
    });
  }, [assets, searchTerm, categoryFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات المالية والتشغيلية للأصول */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-500 block">إجمالي القيمة الرأسمالية للأصول</span>
          <span className="text-lg font-bold font-mono text-indigo-950 mt-1 block">
            {totalCapitalCost.toLocaleString()} ج.م
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-500 block">صافي القيمة الدفترية الحالية</span>
          <span className="text-lg font-bold font-mono text-emerald-700 mt-1 block">
            {totalBookValue.toLocaleString()} ج.م
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-500 block">خطوط ومعدات المعمل المسجلة</span>
          <span className="text-lg font-bold font-mono text-gray-900 mt-1 block">
            {assets.length} أصول تشغيلية
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-500 block">معدات تحت الفحص والصيانة</span>
          <span className="text-lg font-bold font-mono text-amber-600 mt-1 block">
            {assets.filter((a) => a.status !== 'يعمل بكفاءة').length} معدات
          </span>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-indigo-600" />
            <span>إدارة الأصول الثابتة وصيانة خطوط المعمل (Fixed Assets & Maintenance)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            متابعة معدات وأفران تصنيع الحلويات، وسيارات الشحن المبردة، واحتساب الإهلاك الدفتري
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'assets' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              قائمة الأصول والمعدات
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'maintenance' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              سجلات الصيانة الدورية
            </button>
          </div>

          <PermissionGuard permission="Products.Manage" showDisabled>
            <button
              type="button"
              onClick={() => {
                setEditingAsset(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أصل رأسمالي</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {activeTab === 'assets' && (
        <DataTable<FixedAsset>
          columns={columns}
          data={paginatedData}
          totalRecords={filteredData.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onSearch={setSearchTerm}
          filters={filterFields}
          onFilterChange={(f) => setCategoryFilter(f.category || '')}
          isLoading={isLoading}
          exportFileName="سجل_الاصول_الثابتة_والمعدات"
          enableExport={true}
        />
      )}

      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden animate-fadeIn">
          <div className="bg-slate-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-700">
            <span>سجل وتذاكر الصيانة الدورية والطارئة للمعدات (Maintenance Logs)</span>
            <span className="text-gray-400 font-normal">{maintenanceRecords.length} تذاكر مسجلة</span>
          </div>

          <div className="divide-y divide-gray-100">
            {maintenanceRecords.map((m) => (
              <div key={m.id} className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs hover:bg-slate-50/75">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{m.assetName} ({m.assetCode})</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{m.description} - القائم بالإصلاح: {m.technicianName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="font-mono text-gray-500">{m.date}</span>
                  <span className="font-mono font-bold text-indigo-900">{m.cost.toLocaleString()} ج.م</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        initialData={editingAsset}
      />
    </div>
  );
};
