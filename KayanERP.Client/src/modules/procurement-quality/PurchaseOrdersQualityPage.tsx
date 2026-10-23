import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchPurchaseOrdersApi,
  savePurchaseOrdersToLocal,
  fetchSupplierQualityApi,
} from './procurementApi';
import type { PurchaseOrder, SupplierQualityCertificate } from './procurementApi';
import { NewPurchaseOrderModal } from './NewPurchaseOrderModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  ShoppingCart,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  BadgeCheck,
  Building2
} from 'lucide-react';

export const PurchaseOrdersQualityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'coa'>('orders');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [coas, setCoas] = useState<SupplierQualityCertificate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [poData, coaData] = await Promise.all([
        fetchPurchaseOrdersApi(),
        fetchSupplierQualityApi(),
      ]);
      setOrders(poData);
      setCoas(coaData);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveOrder = (newOrder: PurchaseOrder) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    savePurchaseOrdersToLocal(updated);
  };

  const totalPoValue = useMemo(() => orders.reduce((s, o) => s + o.totalAmount, 0), [orders]);
  const activeOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'معتمد قيد التوريد').length,
    [orders]
  );
  const completedOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'مكتمل ومستلم بالكامل').length,
    [orders]
  );

  const columnsOrders = useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      {
        key: 'poNumber',
        header: 'رقم أمر الشراء',
        width: '145px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            {row.poNumber}
          </span>
        ),
      },
      {
        key: 'supplierName',
        header: 'المورد والبيان',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.supplierName}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{row.notes}</div>
          </div>
        ),
      },
      {
        key: 'date',
        header: 'تاريخ الإصدار',
        align: 'center',
        render: (row) => <span className="font-mono text-xs text-gray-500">{row.date}</span>,
      },
      {
        key: 'expectedDeliveryDate',
        header: 'التوريد المتوقع',
        align: 'center',
        render: (row) => <span className="font-mono text-xs text-indigo-900 font-semibold">{row.expectedDeliveryDate}</span>,
      },
      {
        key: 'totalAmount',
        header: 'إجمالي القيمة',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-emerald-700">
            {row.totalAmount.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'status',
        header: 'حالة الأمر',
        align: 'center',
        render: (row) => {
          const isDone = row.status === 'مكتمل ومستلم بالكامل';
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              isDone
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{row.status}</span>
            </span>
          );
        },
      },
    ],
    []
  );

  const paginatedOrders = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><ShoppingCart className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي تعاقدات أوامر الشراء</span>
            <span className="text-base font-bold font-mono text-indigo-950">{totalPoValue.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">أوامر معتمدة قيد التوريد</span>
            <span className="text-base font-bold font-mono text-amber-700">{activeOrdersCount} أوامر جارية</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">شحنات اكتمل استلامها</span>
            <span className="text-base font-bold font-mono text-emerald-700">{completedOrdersCount} أوامر مسلمة</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><BadgeCheck className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">شهادات COA المعتمدة</span>
            <span className="text-base font-bold font-mono text-rose-700">{coas.length} شهادات مطابقة</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-indigo-600" />
            <span>أوامر الشراء وتقييم جودة الموردين (Purchase Orders & COA)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            دورة إصدار أوامر الشراء المعتمدة، وتوثيق شهادات التحليل المخبري لمطابقة خامات الحلويات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              أوامر الشراء (PO) 🛒
            </button>
            <button
              onClick={() => setActiveTab('coa')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'coa' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              شهادات التحليل وجودة الموردين (COA) 🛡
            </button>
          </div>

          {activeTab === 'orders' && (
            <PermissionGuard permission="Products.Manage" showDisabled>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إصدار أمر شراء (PO)</span>
              </button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {activeTab === 'orders' && (
        <DataTable<PurchaseOrder>
          columns={columnsOrders}
          data={paginatedOrders}
          totalRecords={orders.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
          exportFileName="اوامر_الشراء_المعتمدة_كيان"
          enableExport={true}
        />
      )}

      {activeTab === 'coa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {coas.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{c.materialName}</h3>
                      <span className="text-[11px] font-mono text-indigo-700">{c.certNumber}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {c.coaStatus}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">المورد المعتمد:</span>
                    <span className="font-semibold text-gray-900">{c.supplierName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">رقم التشغيلة / اللوط:</span>
                    <span className="font-mono font-bold text-indigo-900">{c.batchLotNo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">جهة الفحص والمعمل:</span>
                    <span className="text-gray-900">{c.labName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">نسبة النقاء والجلوتين:</span>
                    <span className="font-mono font-bold text-emerald-700">{c.purityScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">نسبة الرطوبة:</span>
                    <span className="font-mono font-bold text-blue-700">{c.moisturePercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>ملاحظات المعمل: </span>
                <b className="text-gray-800">{c.inspectorNotes}</b>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewPurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrder}
      />
    </div>
  );
};
