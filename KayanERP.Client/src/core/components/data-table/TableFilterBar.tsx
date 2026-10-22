import React, { useState, useEffect } from 'react';
import { Search, Download, Upload } from 'lucide-react';
import type { FilterField } from './types';

interface Props {
  onSearch?: (term: string) => void;
  filters?: FilterField[];
  onFilterChange?: (filters: Record<string, any>) => void;
  onExport?: () => void;
  onImportTrigger?: () => void;
  enableExport?: boolean;
  enableImport?: boolean;
}

export const TableFilterBar: React.FC<Props> = ({
  onSearch,
  filters = [],
  onFilterChange,
  onExport,
  onImportTrigger,
  enableExport,
  enableImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleFilterSelect = (key: string, value: any) => {
    const updated = { ...filterValues, [key]: value };
    setFilterValues(updated);
    if (onFilterChange) onFilterChange(updated);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {onSearch && (
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
            <input
              type="text"
              placeholder="بحث سريع في السجلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        )}

        {filters.map((f) => (
          <div key={f.key} className="min-w-[160px]">
            {f.type === 'select' ? (
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                onChange={(e) => handleFilterSelect(f.key, e.target.value)}
                defaultValue=""
              >
                <option value="">{f.label} (الكل)</option>
                {f.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type}
                placeholder={f.placeholder || f.label}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                onChange={(e) => handleFilterSelect(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {enableImport && (
          <button
            type="button"
            onClick={onImportTrigger}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد Excel</span>
          </button>
        )}

        {enableExport && (
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
        )}
      </div>
    </div>
  );
};
