import type React from 'react';

export type ColumnDef<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'right' | 'center' | 'left';
  width?: string;
};

export type FilterOption = {
  label: string;
  value: string | number;
};

export type FilterField = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: FilterOption[];
  placeholder?: string;
};

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  totalRecords: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSearch?: (term: string) => void;
  filters?: FilterField[];
  onFilterChange?: (filters: Record<string, any>) => void;
  isLoading?: boolean;
  exportFileName?: string;
  enableExport?: boolean;
  enableImport?: boolean;
  onImportData?: (importedData: any[]) => void;
};
