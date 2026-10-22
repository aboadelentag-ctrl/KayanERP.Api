import React, { useRef } from 'react';
import type { DataTableProps } from './types';
import { TableFilterBar } from './TableFilterBar';
import { TablePagination } from './TablePagination';
import { exportToExcel, parseExcelFile } from './ExcelUtils';

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  totalRecords,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearch,
  filters,
  onFilterChange,
  isLoading,
  exportFileName = 'تقرير_بيانات',
  enableExport = true,
  enableImport = false,
  onImportData,
}: DataTableProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToExcel(data, columns, exportFileName);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportData) {
      try {
        const parsed = await parseExcelFile(file);
        onImportData(parsed);
      } catch (err) {
        console.error('خطأ في قراءة ملف الإكسل:', err);
      }
    }
  };

  return (
    <div className="w-full">
      {enableImport && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />
      )}

      <TableFilterBar
        onSearch={onSearch}
        filters={filters}
        onFilterChange={onFilterChange}
        onExport={handleExport}
        onImportTrigger={() => fileInputRef.current?.click()}
        enableExport={enableExport}
        enableImport={enableImport}
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`py-3.5 px-4 ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'left'
                        ? 'text-left'
                        : 'text-right'
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>جارٍ تحميل البيانات...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                    لا توجد بيانات مطابقة لخيارات البحث المحددة
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'left'
                            ? 'text-left'
                            : 'text-right'
                        }`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
