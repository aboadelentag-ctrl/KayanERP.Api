export interface SupplierPriceDto {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierCode?: string;
  itemId: number;
  itemCode?: string;
  itemName: string;
  unit: string;
  price: number;
  currency: string;
  leadTimeDays: number;
  deliveryDays: number;
  effectiveDate: string;
  isPreferred: boolean;
  notes?: string | null;
}

export interface SupplierLookupItem {
  id: number;
  supplierName: string;
}

export interface ItemLookupItem {
  id: number;
  itemName: string;
  unit: string;
}

export interface PriceImportRowDto {
  supplierName: string;
  itemName: string;
  price: number;
  deliveryDays: number;
  effectiveDate: string;
  isPreferred: boolean;
  notes: string;
}

const STORAGE_PRICES_KEY = 'kayan_supplier_prices_data';

export const fallbackSuppliersLookup: SupplierLookupItem[] = [
  { id: 1, supplierName: 'شركة مطاحن الدلتا والصعيد' },
  { id: 2, supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي' },
  { id: 3, supplierName: 'الشركة السورية لاستيراد وتجارة المكسرات' },
  { id: 4, supplierName: 'شركة الدلتا للسكر ومصانع الحوامدية' },
  { id: 5, supplierName: 'مؤسسة النور لتوريد الكرتون ومواد التعبئة' },
];

export const fallbackItemsLookup: ItemLookupItem[] = [
  { id: 101, itemName: 'دقيق فاخر استخراج 72%', unit: 'كجم' },
  { id: 102, itemName: 'سمن بلدي بقري طبيعي', unit: 'صفيحة (16 كجم)' },
  { id: 103, itemName: 'فستق حلبي محمص مفروم', unit: 'كجم' },
  { id: 104, itemName: 'سكر بلوري أبيض نقي', unit: 'شيكارة (50 كجم)' },
  { id: 105, itemName: 'سميد بسبوسة خشن', unit: 'كجم' },
  { id: 106, itemName: 'كرتون حلويات بصمة ذهبية', unit: 'ألف علبة' },
];

const initialPrices: SupplierPriceDto[] = [
  {
    id: 1,
    supplierId: 1,
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    supplierCode: 'SUP-01',
    itemId: 101,
    itemCode: 'RAW-FLOUR-72',
    itemName: 'دقيق فاخر استخراج 72%',
    unit: 'كجم',
    price: 18.5,
    currency: 'EGP',
    leadTimeDays: 2,
    deliveryDays: 2,
    effectiveDate: '2026-09-25',
    isPreferred: true,
    notes: 'شامل النقل والتوصيل حتى مخزن مصنع أبو عادل المركزي',
  },
  {
    id: 2,
    supplierId: 2,
    supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
    supplierCode: 'SUP-02',
    itemId: 102,
    itemCode: 'RAW-GHEE-NAT',
    itemName: 'سمن بلدي بقري طبيعي',
    unit: 'صفيحة (16 كجم)',
    price: 3450.0,
    currency: 'EGP',
    leadTimeDays: 1,
    deliveryDays: 1,
    effectiveDate: '2026-10-01',
    isPreferred: true,
    notes: 'صفائح محكمة الغلق مطابقة لمعايير توكيد الجودة HACCP',
  },
  {
    id: 3,
    supplierId: 3,
    supplierName: 'الشركة السورية لاستيراد وتجارة المكسرات',
    supplierCode: 'SUP-03',
    itemId: 103,
    itemCode: 'RAW-PISTACHIO',
    itemName: 'فستق حلبي محمص مفروم',
    unit: 'كجم',
    price: 680.0,
    currency: 'EGP',
    leadTimeDays: 3,
    deliveryDays: 3,
    effectiveDate: '2026-10-10',
    isPreferred: true,
    notes: 'فستق حلبي إكسترا درجة أولى لصواني البسبوسة والقشطة',
  },
  {
    id: 4,
    supplierId: 4,
    supplierName: 'شركة الدلتا للسكر ومصانع الحوامدية',
    supplierCode: 'SUP-04',
    itemId: 104,
    itemCode: 'RAW-SUGAR-50',
    itemName: 'سكر بلوري أبيض نقي',
    unit: 'شيكارة (50 كجم)',
    price: 1350.0,
    currency: 'EGP',
    leadTimeDays: 2,
    deliveryDays: 2,
    effectiveDate: '2026-10-05',
    isPreferred: true,
    notes: 'سعر تسليم أرض المصنع بالمنصورة',
  },
  {
    id: 5,
    supplierId: 1,
    supplierName: 'شركة مطاحن الدلتا والصعيد',
    supplierCode: 'SUP-01',
    itemId: 105,
    itemCode: 'RAW-SEMOLINA',
    itemName: 'سميد بسبوسة خشن',
    unit: 'كجم',
    price: 21.0,
    currency: 'EGP',
    leadTimeDays: 2,
    deliveryDays: 2,
    effectiveDate: '2026-09-28',
    isPreferred: false,
    notes: 'عرض توريد بديل لصواني الرواني والبسبوسة',
  },
];

export const fetchSupplierPricesApi = async (): Promise<SupplierPriceDto[]> => {
  try {
    const res = await fetch('/api/SupplierPrices');
    if (res.ok) {
      const data: any[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((p) => ({
          id: p.id ?? p.Id ?? 0,
          supplierId: p.supplierId ?? p.SupplierId ?? 0,
          supplierName: p.supplierName ?? p.SupplierName ?? '',
          supplierCode: p.supplierCode ?? p.SupplierCode ?? '',
          itemId: p.itemId ?? p.ItemId ?? 0,
          itemCode: p.itemCode ?? p.ItemCode ?? '',
          itemName: p.itemName ?? p.ItemName ?? '',
          unit: p.unit ?? p.Unit ?? 'كجم',
          price: p.price ?? p.Price ?? 0,
          currency: p.currency ?? p.Currency ?? 'EGP',
          leadTimeDays: p.leadTimeDays ?? p.LeadTimeDays ?? p.deliveryDays ?? 1,
          deliveryDays: p.deliveryDays ?? p.DeliveryDays ?? p.leadTimeDays ?? 1,
          effectiveDate: p.effectiveDate ?? p.EffectiveDate ?? new Date().toISOString().slice(0, 10),
          isPreferred: p.isPreferred ?? p.IsPreferred ?? false,
          notes: p.notes ?? p.Notes ?? '',
        }));
      }
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_PRICES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem(STORAGE_PRICES_KEY, JSON.stringify(initialPrices));
  return initialPrices;
};

export const fetchSuppliersLookupApi = async (): Promise<SupplierLookupItem[]> => {
  try {
    const res = await fetch('/api/suppliers');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id ?? s.Id,
          supplierName: s.supplierName ?? s.SupplierName ?? s.name ?? s.Name,
        }));
      }
    }
  } catch {}
  return fallbackSuppliersLookup;
};

export const fetchItemsLookupApi = async (): Promise<ItemLookupItem[]> => {
  try {
    const res = await fetch('/api/items');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((i: any) => ({
          id: i.id ?? i.Id,
          itemName: i.itemName ?? i.ItemName ?? i.name ?? i.Name,
          unit: i.unit ?? i.Unit ?? 'كجم',
        }));
      }
    }
  } catch {}
  return fallbackItemsLookup;
};

export const saveSupplierPriceApi = async (
  payload: {
    supplierId: number;
    itemId: number;
    price: number;
    deliveryDays: number;
    effectiveDate: string;
    isPreferred: boolean;
    notes?: string;
  },
  editId = 0
): Promise<SupplierPriceDto> => {
  try {
    const url = editId > 0 ? `/api/SupplierPrices/${editId}` : '/api/SupplierPrices';
    const method = editId > 0 ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        currency: 'EGP',
        leadTimeDays: payload.deliveryDays,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {}

  const stored = localStorage.getItem(STORAGE_PRICES_KEY);
  let list: SupplierPriceDto[] = stored ? JSON.parse(stored) : initialPrices;

  const sup = fallbackSuppliersLookup.find((s) => s.id === payload.supplierId);
  const itm = fallbackItemsLookup.find((i) => i.id === payload.itemId);

  if (editId > 0) {
    list = list.map((p) =>
      p.id === editId
        ? {
            ...p,
            supplierId: payload.supplierId,
            supplierName: sup ? sup.supplierName : p.supplierName,
            itemId: payload.itemId,
            itemName: itm ? itm.itemName : p.itemName,
            unit: itm ? itm.unit : p.unit,
            price: payload.price,
            leadTimeDays: payload.deliveryDays,
            deliveryDays: payload.deliveryDays,
            effectiveDate: payload.effectiveDate,
            isPreferred: payload.isPreferred,
            notes: payload.notes || '',
          }
        : p
    );
  } else {
    const newPrice: SupplierPriceDto = {
      id: Date.now(),
      supplierId: payload.supplierId,
      supplierName: sup ? sup.supplierName : 'مورد محدد',
      itemId: payload.itemId,
      itemName: itm ? itm.itemName : 'خامة محددة',
      unit: itm ? itm.unit : 'كجم',
      price: payload.price,
      currency: 'EGP',
      leadTimeDays: payload.deliveryDays,
      deliveryDays: payload.deliveryDays,
      effectiveDate: payload.effectiveDate,
      isPreferred: payload.isPreferred,
      notes: payload.notes || '',
    };
    list = [newPrice, ...list];
  }

  localStorage.setItem(STORAGE_PRICES_KEY, JSON.stringify(list));
  return list[0];
};

export const deleteSupplierPriceApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/SupplierPrices/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch {}

  const stored = localStorage.getItem(STORAGE_PRICES_KEY);
  if (stored) {
    let list: SupplierPriceDto[] = JSON.parse(stored);
    list = list.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_PRICES_KEY, JSON.stringify(list));
  }
  return true;
};
