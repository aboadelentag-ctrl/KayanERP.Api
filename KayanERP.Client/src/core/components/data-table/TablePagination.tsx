import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export const TablePagination: React.FC<Props> = ({
  pageIndex,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startItem = totalRecords === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endItem = Math.min(pageIndex * pageSize, totalRecords);

  return (
    <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-white border-t border-gray-100 gap-3 text-sm text-gray-600">
      <div>
        عرض من <span className="font-semibold text-gray-900">{startItem}</span> إلى{' '}
        <span className="font-semibold text-gray-900">{endItem}</span> من إجمالي{' '}
        <span className="font-semibold text-gray-900">{totalRecords}</span> سجل
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span>الصفوف لكل صفحة:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-200 rounded-md py-1 px-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex <= 1}
            className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-medium text-gray-800">
            {pageIndex} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages}
            className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
