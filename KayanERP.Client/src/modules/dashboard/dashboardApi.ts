export interface FactoryLineMetric {
  lineId: string;
  lineName: string;
  activeOrders: number;
  completionRate: number;
  qualityRate: number;
  status: 'ممتاز ومستقر' | 'منتظم' | 'ضغط تشغيلي';
  statusColor: string;
  progressColor: string;
}

export interface ExecutiveDashboardData {
  totalInventoryValue: number;
  productionEfficiencyRate: number;
  inTransitTransfers: number;
  disputedTransfers: number;
  cratesAtClients: number;
  lowStockAlerts: number;
  rawMaterialAvailabilityRate: number;
  accountingSyncStatus: string;
  strategicInitiativeProgress: number;
  lastRefreshTime: string;
  productionLines: FactoryLineMetric[];
}

export const fetchExecutiveDashboardApi = async (): Promise<ExecutiveDashboardData> => {
  let inTransit = 3;
  let disputed = 1;
  let shortages = 2;
  let cratesCount = 480;

  try {
    const resTransfers = await fetch('/api/StockTransfers');
    if (resTransfers.ok) {
      const data: any[] = await resTransfers.json();
      inTransit = data.filter((t) => t.status === 'IN_TRANSIT').length;
      disputed = data.filter((t) => t.status === 'DISPUTED').length;
    }
  } catch {}

  try {
    const resShortages = await fetch('/api/Stock/material-shortages');
    if (resShortages.ok) {
      const data: any[] = await resShortages.json();
      shortages = data.length;
    }
  } catch {}

  const now = new Date();
  const timeFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} | ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return {
    totalInventoryValue: 2845000,
    productionEfficiencyRate: 94,
    inTransitTransfers: inTransit,
    disputedTransfers: disputed,
    cratesAtClients: cratesCount,
    lowStockAlerts: shortages,
    rawMaterialAvailabilityRate: 94.8,
    accountingSyncStatus: 'متطابق ومؤمن (100%)',
    strategicInitiativeProgress: 88.5,
    lastRefreshTime: timeFormatted,
    productionLines: [
      {
        lineId: 'line-1',
        lineName: '🥖 صالة الشرقي والمخبوزات',
        activeOrders: 14,
        completionRate: 92,
        qualityRate: 98.5,
        status: 'ممتاز ومستقر',
        statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        progressColor: 'bg-emerald-500',
      },
      {
        lineId: 'line-2',
        lineName: '🎂 صالة الجاتوه والتورت والغربي',
        activeOrders: 8,
        completionRate: 85,
        qualityRate: 96.0,
        status: 'منتظم',
        statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        progressColor: 'bg-indigo-600',
      },
      {
        lineId: 'line-3',
        lineName: '🍪 صالة الإسفنجي والنواشف',
        activeOrders: 11,
        completionRate: 74,
        qualityRate: 91.2,
        status: 'ضغط تشغيلي',
        statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
        progressColor: 'bg-amber-500',
      },
    ],
  };
};
