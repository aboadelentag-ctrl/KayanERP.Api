export interface PendingInvoiceLineDto {
  itemId: number;
  itemName: string;
  itemCode: string;
  unit: string;
  remainingQuantity: number;
  unitPrice: number;
}

export interface PendingInvoiceDto {
  id: number;
  orderNumber: string;
  orderDate: string;
  supplierName: string;
  totalAmount: number;
  status: string;
  warehouseId: number;
  lines: PendingInvoiceLineDto[];
}

export interface SupplierOptionDto {
  id: number;
  supplierName: string;
}

export interface WarehouseOptionDto {
  id: number;
  warehouseName: string;
}

export interface MaterialReceiptLookupsDto {
  suppliers: SupplierOptionDto[];
  warehouses: WarehouseOptionDto[];
}

export interface MaterialReceiptItemPostDto {
  itemId: number;
  itemName: string;
  itemCode: string;
  unit: string;
  remainingQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
  qcDecision: string;
  rejectionReason: string;
}

export interface MaterialReceiptPostDto {
  invoiceId: number;
  warehouseId: number;
  coaNumber: string;
  inspectorName: string;
  inspectorCode: string;
  items: MaterialReceiptItemPostDto[];
}

export interface MaterialReceiptResultDto {
  success: boolean;
  message: string;
}

export const fetchMaterialReceiptLookupsApi = async (): Promise<MaterialReceiptLookupsDto> => {
  try {
    const res = await fetch('/api/materialreceipt/lookups');
    if (res.ok) return await res.json();
  } catch {}
  return {
    suppliers: [{ id: 1, supplierName: 'شركة النيل للصناعات الغذائية' }],
    warehouses: [{ id: 1, warehouseName: 'مستودع الخامات الرئيسي' }]
  };
};

export const fetchPendingInvoicesApi = async (supplierId?: number): Promise<PendingInvoiceDto[]> => {
  try {
    let url = '/api/materialreceipt/pending-invoices';
    if (supplierId && supplierId > 0) {
      url = `/api/materialreceipt/pending-invoices?supplierId=${supplierId}`;
    }
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch {}
  return [];
};
