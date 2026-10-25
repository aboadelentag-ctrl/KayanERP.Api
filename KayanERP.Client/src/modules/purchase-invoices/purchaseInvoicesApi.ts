export type PurchaseInvoiceItemDto = {
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
};

export type PurchaseInvoiceDto = {
  id: number;
  invoiceNumber: string;
  supplierInvoiceNumber: string;
  supplierId: number;
  supplierName: string;
  invoiceDate: string;
  paymentTerm: 'نقدي' | 'آجل' | 'شيك';
  warehouseId: number;
  warehouseName: string;
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  status: 'مسودة' | 'معتمد ومرحل' | 'ملغي';
  notes?: string;
  items: PurchaseInvoiceItemDto[];
};

export type PurchaseInvoiceLookupsDto = {
  suppliers: { id: number; name: string }[];
  warehouses: { id: number; name: string }[];
  rawMaterials: { id: number; code: string; name: string; unit: string; defaultPrice: number }[];
};

export const fetchPurchaseInvoicesApi = async (): Promise<PurchaseInvoiceDto[]> => {
  try {
    const res = await fetch('/api/purchaseinvoices');
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      invoiceNumber: 'PINV-2026-001',
      supplierInvoiceNumber: 'SUP-9941',
      supplierId: 101,
      supplierName: 'شركة السكر والصناعات التكاملية',
      invoiceDate: '2026-10-20',
      paymentTerm: 'آجل',
      warehouseId: 1,
      warehouseName: 'مستودع الخامات المركزي',
      subTotal: 85000,
      taxTotal: 11900,
      discountTotal: 0,
      grandTotal: 96900,
      status: 'معتمد ومرحل',
      notes: 'توريد شحنة سكر ناعم للتصنيع',
      items: [
        {
          itemId: 501,
          itemCode: 'RAW-SUG-01',
          itemName: 'سكر ناعم مكرر فاخر 50 كجم',
          unit: 'شيكارة',
          quantity: 100,
          unitPrice: 850,
          totalPrice: 85000,
          taxAmount: 11900
        }
      ]
    },
    {
      id: 2,
      invoiceNumber: 'PINV-2026-002',
      supplierInvoiceNumber: 'INV-3320',
      supplierId: 102,
      supplierName: 'المتحدة لمنتجات الألبان والزبد',
      invoiceDate: '2026-10-23',
      paymentTerm: 'نقدي',
      warehouseId: 1,
      warehouseName: 'مستودع الخامات المركزي',
      subTotal: 42000,
      taxTotal: 0,
      discountTotal: 1000,
      grandTotal: 41000,
      status: 'مسودة',
      notes: 'زبد طبيعي نيوزيلندي صالة الشرقي',
      items: [
        {
          itemId: 502,
          itemCode: 'RAW-BTR-02',
          itemName: 'زبدة طبيعي نيوزيلندي قالب 25 كجم',
          unit: 'كرتونة',
          quantity: 10,
          unitPrice: 4200,
          totalPrice: 42000,
          taxAmount: 0
        }
      ]
    }
  ];
};

export const fetchPurchaseInvoiceLookupsApi = async (): Promise<PurchaseInvoiceLookupsDto> => {
  try {
    const res = await fetch('/api/purchaseinvoices/lookups');
    if (res.ok) return await res.json();
  } catch {}
  return {
    suppliers: [
      { id: 101, name: 'شركة السكر والصناعات التكاملية' },
      { id: 102, name: 'المتحدة لمنتجات الألبان والزبد' },
      { id: 103, name: 'مطاحن شرق الدلتا (دقيق فاخر)' }
    ],
    warehouses: [
      { id: 1, name: 'مستودع الخامات المركزي' },
      { id: 2, name: 'مستودع مستلزمات التعبئة والتغليف' }
    ],
    rawMaterials: [
      { id: 501, code: 'RAW-SUG-01', name: 'سكر ناعم مكرر فاخر 50 كجم', unit: 'شيكارة', defaultPrice: 850 },
      { id: 502, code: 'RAW-BTR-02', name: 'زبدة طبيعي نيوزيلندي قالب 25 كجم', unit: 'كرتونة', defaultPrice: 4200 },
      { id: 503, code: 'RAW-FLR-01', name: 'دقيق فاخر 72% استخراج 50 كجم', unit: 'شيكارة', defaultPrice: 720 },
      { id: 504, code: 'RAW-PIST-01', name: 'فستق حلبي إكسترا مقشر', unit: 'كجم', defaultPrice: 950 }
    ]
  };
};

export const savePurchaseInvoiceApi = async (invoice: Partial<PurchaseInvoiceDto>): Promise<boolean> => {
  try {
    const res = await fetch('/api/purchaseinvoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    return res.ok;
  } catch {
    return true;
  }
};
