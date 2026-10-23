import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef } from '../../core/components/data-table';
import {
  fetchFinishedGoodsCatalogApi,
  fetchFinishedGoodsTransfersApi,
  saveFinishedGoodsTransfersToLocal,
} from './finishedGoodsApi';
import type { FinishedGoodItem, FinishedGoodsTransferRecord } from './finishedGoodsApi';
import { NewTransferModal } from './NewTransferModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  Cake,
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

export const FinishedGoodsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transfers' | 'catalog'>('transfers');
  const [catalog, setCatalog] = useState<FinishedGoodItem[]>([]);
  const [transfers, setTransfers] = useState<FinishedGoodsTransferRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [catData, trnData] = await Promise.all([
        fetchFinishedGoodsCatalogApi(),
        fetchFinishedGoodsTransfersApi(),
      ]);
      setCatalog(catData);
      setTransfers(trnData);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveTransfer = (newRecord: FinishedGoodsTransferRecord) => {
    const updated = [newRecord, ...transfers];
    setTransfers(updated);
    saveFinishedGoodsTransfersToLocal(updated);
  };

  const totalDeliveredQty = useMemo(
    () => transfers.reduce((s, t) => s + t.quantityTransferred, 0),
    [transfers]
  );
  const totalCrates = useMemo(
    () => transfers.reduce((s, t) => s + t.crateCount, 0),
    [transfers]
  );

  const columns = useMemo<ColumnDef<FinishedGoodsTransferRecord>[]>(
    () => [
      {
        key: 'transferNumber',
        header: 'رقم الإذن',
        width: '145px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            {row.transferNumber}
          </span>
        ),
      },
      {
        key: 'itemName',
        header: 'صنف الحلوى والتشغيلة',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.itemName}</div>
            <div className="text-[11px] font-mono text-indigo-900 mt-0.5">
              تشغيلة: {row.productionBatchNo} ({row.itemCode})
            </div>
          </div>
        ),
      },
      {
        key: 'fromSection',
        header: 'مسار التسليم',
        render: (row) => (
          <div className="text-xs">
            <span className="text-gray-500 block">من: {row.fromSection}</span>
            <span className="font-semibold text-emerald-800 block mt-0.5">إلى: {row.toDestination}</span>
          </div>
        ),
      },
      {
        key: 'quantityTransferred',
        header: 'الكمية المسلمة',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-gray-900">
            {row.quantityTransferred} {row.unit}
          </span>
        ),
      },
      {
        key: 'crateCount',
        header: 'الصواني / الأسبات',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
            {row.crateCount} صينية/سبت
          </span>
        ),
      },
      {
        key: 'status',
        header: 'حالة التسليم',
        align: 'center',
        render: (row) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{row.status}</span>
          </span>
        ),
      },
    ],
    []
  );

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return transfers.slice(start, start + pageSize);
  }, [transfers, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Truck className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي أذون التسليم</span>
            <span className="text-base font-bold font-mono text-gray-900">{transfers.length} أذون تسليم</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي الحلويات المسلمة</span>
            <span className="text-base font-bold font-mono text-emerald-700">{totalDeliveredQty} وحدة تامة</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Layers className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">صواني وأسبات محولة</span>
            <span className="text-base font-bold font-mono text-amber-700">{totalCrates} صينية</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><Cake className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">أصناف الكتالوج المعتمدة</span>
            <span className="text-base font-bold font-mono text-rose-700">{catalog.length} أصناف جاهزة</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cake className="w-7 h-7 text-indigo-600" />
            <span>تسليم المنتج التام والكتالوج المصور (Finished Goods)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            أذون تسليم صواني وتورت الحلويات من الصالات للمعارض، والكتالوج المصور للأصناف الجاهزة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'transfers' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              أذون تسليم المعارض والفروع
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'catalog' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              الكتالوج المصور للمنتجات 🎂
            </button>
          </div>

          {activeTab === 'transfers' && (
            <PermissionGuard permission="Production.Create" showDisabled>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إذن تسليم منتج تام</span>
              </button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {activeTab === 'transfers' && (
        <DataTable<FinishedGoodsTransferRecord>
          columns={columns}
          data={paginatedData}
          totalRecords={transfers.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
          exportFileName="اذون_تسليم_المنتج_التام"
          enableExport={true}
        />
      )}

      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-fadeIn">
          {catalog.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                    {item.code}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block">سعر الوحدة ({item.unit})</span>
                  <span className="font-mono font-bold text-base text-emerald-700">{item.retailPrice} ج.م</span>
                </div>
                <div className="text-left text-[10px] text-gray-400">
                  <span>الصلاحية: </span>
                  <b className="text-gray-700 font-mono">{item.shelfLifeDays} أيام</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransfer}
      />
    </div>
  );
};
