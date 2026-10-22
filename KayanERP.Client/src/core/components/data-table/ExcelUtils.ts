import * as XLSX from 'xlsx';
import type { ColumnDef } from './types';

export const exportToExcel = <T>(
  data: T[],
  columns: ColumnDef<T>[],
  fileName: string = 'export'
) => {
  if (!data || !data.length) return;

  const formattedData = data.map((row: any) => {
    const formattedRow: Record<string, any> = {};
    columns.forEach((col) => {
      formattedRow[col.header] =
        row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '';
    });
    return formattedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  worksheet['!views'] = [{ rightToLeft: true }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'البيانات');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${fileName}_${dateStr}.xlsx`);
};

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
