export interface CustomerLookup {
  id: number;
  customerName: string;
  customerCode: string;
  creditLimit: number;
}

export interface ItemLookup {
  id: number;
  itemCode: string;
  itemName: string;
  price: number;
  unit: string;
}

export interface WarehouseLookup {
  id: number;
  branchId: number;
  warehouseName: string;
  warehouseCode: string;
}

export interface SalesLookupsResponse {
  customers: CustomerLookup[];
  items: ItemLookup[];
  warehouses: WarehouseLookup[];
}
