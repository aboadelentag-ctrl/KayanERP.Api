import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef } from '../../core/components/data-table';
import { fetchCrateClientsApi, saveCrateClientsToLocal } from './cratesApi';
import type { CrateClient } from './cratesApi';
import { CrateMovementModal } from './CrateMovementModal';
import { Boxes, ArrowLeftRight, Clock } from 'lucide-react';

export const CratesPage: React.FC = () => {
  const [records, setRecords] = useState<CrateClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [selectedClient, setSelectedClient] = useState<CrateClient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchCrateClientsApi();
      setRecords(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleMovement = (clientId: number, type: 'in' | 'out', qty: number) => {
    const updated = records.map((c) => {
      if (c.id === clientId) {
        const newBalance = type === 'out' ? c.crateBalance + qty : Math.max(0, c.crateBalance - qty);
        return {
          ...c,
          crateBalance: newBalance,
          lastMovementDate: new Date().toISOString().slice(0, 10),
        };
      }
      return c;
    });
    setRecords(updated);
    saveCrateClientsToLocal(updated);
  };

  const columns = useMemo<ColumnDef<CrateClient>[]>(
    () => [
      {
        key: 'id',
        header: '#',
        width: '60px',
        align: 'center',
        render: (row) => <span className="font-mono text-xs text-gray-400">{row.id}</span>,
      },
      {
        key: 'name',
        header: 'اسم العميل / المستلم',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-400 font-mono">{row.phone || '-'}</div>
          </div>
        ),
      },
      {
        key: 'crateBalance',
        header: 'رصيد المجنسات طرفه',
        align: 'center',
        render: (row) => {
          const isHigh = row.crateBalance > 50;
          return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Boxes className="w-3.5 h-3.5" />
              <span>{row.crateBalance} قفص</span>
            </div>
          );
        },
      },
      {
        key: 'lastMovementDate',
        header: 'تاريخ آخر حركة',
        align: 'center',
        render: (row) => (
          <span className="text-xs text-gray-500 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{row.lastMovementDate || 'لا يوجد'}</span>
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'تسجيل حركة',
        align: 'center',
        width: '140px',
        render: (row) => (
          <button
            onClick={() => {
              setSelectedClient(row);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>صرف / استرجاع</span>
          </button>
        ),
      },
    ],
    [records]
  );

  const filteredData = useMemo(() => {
    return records.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.includes(searchTerm))
    );
  }, [records, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  const totalCratesInMarket = useMemo(() => {
    return records.reduce((sum, r) => sum + (r.crateBalance || 0), 0);
  }, [records]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* الترويسة وبطاقة الرصيد الإجمالي */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Boxes className="w-7 h-7 text-indigo-600" />
            <span>محفظة وعهد المجنسات والبراني</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            متابعة الصادر والوارد من الأقفاص الفارغة والمليئة لمنع فقدان الأصول
          </p>
        </div>

        <div className="bg-white border border-indigo-100 rounded-xl px-5 py-3 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">إجمالي المجنسات في السوق</span>
            <span className="text-lg font-bold text-indigo-700 font-mono">{totalCratesInMarket} قفص</span>
          </div>
        </div>
      </div>

      <DataTable<CrateClient>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        isLoading={isLoading}
        exportFileName="ارصدة_المجنسات_والبراني"
        enableExport={true}
      />

      <CrateMovementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSaveMovement={handleMovement}
      />
    </div>
  );
};
