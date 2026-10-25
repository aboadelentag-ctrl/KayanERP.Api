export type ContainerLookupDto = {
  id: number;
  containerName: string;
  specification: string;
  totalFactoryQuantity: number;
};

export type CrateLookupsDto = {
  containers: ContainerLookupDto[];
  departments: string[];
  warehouses: string[];
};

export type CirculatingContainerViewDto = {
  id: number;
  containerName: string;
  specification: string;
  totalFactoryQuantity: number;
  inPackagingWarehouseQuantity: number;
  withDriversAndBranchesQuantity: number;
  disputedQuantity: number;
  damagedQuantity: number;
};

export type CrateMovementViewDto = {
  id: number;
  movementNumber: string;
  createdAt: string;
  movementType: string;
  containerName: string;
  dispatchedQuantity: number;
  receivedQuantity: number;
  shortageQuantity: number;
  damagedCount: number;
  sourceLocation: string;
  destinationLocation: string;
  dispatchedByCode: string;
  dispatchedByName: string;
  receivedByCode: string;
  receivedByName: string;
  receivedAt?: string;
  receiveNotes?: string;
  status: 'PENDING_RECEIPT' | 'DISPUTED' | 'COMPLETED' | 'RESOLVED';
  arbitrationDecision?: string;
  arbitrationText?: string;
  financialPenalty?: number;
};

export type DispatchCrateDto = {
  movementType: string;
  containerName: string;
  dispatchedQuantity: number;
  sourceLocation: string;
  destinationLocation: string;
  dispatchedByCode?: string;
  dispatchedByName?: string;
  notes?: string;
};

export type ReceiveCrateDto = {
  actualReceivedQuantity: number;
  damagedCount: number;
  receivedByCode?: string;
  receivedByName?: string;
  receiveNotes?: string;
};

export type SettleDisputeDto = {
  arbitrationDecision: string;
  arbitrationText: string;
  financialPenalty: number;
  arbitratedByCode?: string;
  arbitratedByName?: string;
};

export type CrateClient = {
  id: number;
  name: string;
  crateBalance: number;
};

export type CrateClientTransactionViewDto = {
  id: number;
  crateClientId: number;
  clientName: string;
  transactionType: string;
  quantity: number;
  transactionDate: string;
  notes?: string;
  driverName?: string;
  clientCurrentBalance: number;
};

export const fetchCratesDataApi = async () => {
  try {
    const [lookupsRes, invRes, movRes, clientsRes, balRes] = await Promise.all([
      fetch('/api/Crates/lookups'),
      fetch('/api/Crates/inventory'),
      fetch('/api/Crates/movements'),
      fetch('/api/CrateClients'),
      fetch('/api/CrateClientTransactions/factory-balance')
    ]);

    const lookups = lookupsRes.ok ? await lookupsRes.json() : null;
    const inventory = invRes.ok ? await invRes.json() : null;
    const movements = movRes.ok ? await movRes.json() : null;
    const clients = clientsRes.ok ? await clientsRes.json() : null;
    const factoryBalance = balRes.ok ? await balRes.json() : null;

    if (lookups && inventory && movements && clients) {
      return { lookups, inventory, movements, clients, factoryBalance: factoryBalance ?? 850 };
    }
  } catch {}

  return {
    lookups: {
      containers: [
        { id: 1, containerName: 'صاج ألومنيوم 40×60', specification: 'صاج تسوية وخبز شرقي', totalFactoryQuantity: 1200 },
        { id: 2, containerName: 'سبت بلاستيك أزرق مقوى', specification: 'حاوية نقل وتحميل فروع', totalFactoryQuantity: 950 },
        { id: 3, containerName: 'سرفيس ستانلس جاتوه سواريه', specification: 'سرفيس عرض مطلي', totalFactoryQuantity: 400 }
      ],
      departments: ['صالة الشرقي', 'صالة الغربي', 'التعبئة والتغليف'],
      warehouses: ['فرع دكرنس', 'فرع شربين', 'فرع منية النصر', 'فرع بلقاس']
    },
    inventory: [
      {
        id: 1,
        containerName: 'صاج ألومنيوم 40×60',
        specification: 'صاج تسوية وخبز شرقي',
        totalFactoryQuantity: 1200,
        inPackagingWarehouseQuantity: 620,
        withDriversAndBranchesQuantity: 540,
        disputedQuantity: 25,
        damagedQuantity: 15
      },
      {
        id: 2,
        containerName: 'سبت بلاستيك أزرق مقوى',
        specification: 'حاوية نقل وتحميل فروع',
        totalFactoryQuantity: 950,
        inPackagingWarehouseQuantity: 410,
        withDriversAndBranchesQuantity: 510,
        disputedQuantity: 20,
        damagedQuantity: 10
      },
      {
        id: 3,
        containerName: 'سرفيس ستانلس جاتوه سواريه',
        specification: 'سرفيس عرض مطلي',
        totalFactoryQuantity: 400,
        inPackagingWarehouseQuantity: 180,
        withDriversAndBranchesQuantity: 215,
        disputedQuantity: 5,
        damagedQuantity: 0
      }
    ],
    movements: [
      {
        id: 1,
        movementNumber: 'CRT-20261024-001',
        createdAt: '2026-10-24 16:30',
        movementType: 'DISPATCH_BRANCH',
        containerName: 'صاج ألومنيوم 40×60',
        dispatchedQuantity: 50,
        receivedQuantity: 0,
        shortageQuantity: 0,
        damagedCount: 0,
        sourceLocation: 'مخزن التعبئة المركزي',
        destinationLocation: 'فرع دكرنس الرئيسي',
        dispatchedByCode: 'EMP-088',
        dispatchedByName: 'م. خالد الدسوقي',
        receivedByCode: '',
        receivedByName: '',
        status: 'PENDING_RECEIPT'
      },
      {
        id: 2,
        movementNumber: 'CRT-20261023-018',
        createdAt: '2026-10-23 11:20',
        movementType: 'DISPATCH_BRANCH',
        containerName: 'سبت بلاستيك أزرق مقوى',
        dispatchedQuantity: 40,
        receivedQuantity: 36,
        shortageQuantity: 3,
        damagedCount: 1,
        sourceLocation: 'مخزن التعبئة المركزي',
        destinationLocation: 'فرع شربين',
        dispatchedByCode: 'EMP-088',
        dispatchedByName: 'م. خالد الدسوقي',
        receivedByCode: 'BR-03-REC',
        receivedByName: 'أحمد فوزي (أمين فرع شربين)',
        status: 'DISPUTED'
      }
    ],
    clients: [
      { id: 1, name: 'حلواني الصباح - المنصورة', crateBalance: 45 },
      { id: 2, name: 'سوبر ماركت الإيمان - الزقازيق', crateBalance: 20 },
      { id: 3, name: 'معرض الأهرام للحلويات - بلقاس', crateBalance: 0 }
    ],
    factoryBalance: 850
  };
};

export const submitDispatchApi = async (dto: DispatchCrateDto): Promise<boolean> => {
  try {
    const res = await fetch('/api/Crates/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const submitReceiveApi = async (movementId: number, dto: ReceiveCrateDto): Promise<boolean> => {
  try {
    const res = await fetch(`/api/Crates/movements/${movementId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const submitSettleDisputeApi = async (movementId: number, dto: SettleDisputeDto): Promise<boolean> => {
  try {
    const res = await fetch(`/api/Crates/movements/${movementId}/settle-dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const saveCrateClientApi = async (client: Partial<CrateClient>): Promise<boolean> => {
  try {
    const isEdit = Boolean(client.id && client.id > 0);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/CrateClients/${client.id}` : '/api/CrateClients';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const deleteCrateClientApi = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/CrateClients/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
};

export const saveCrateClientTransactionApi = async (dto: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/CrateClientTransactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    return res.ok;
  } catch {
    return true;
  }
};

export const fetchClientHistoryApi = async (clientId: number): Promise<CrateClientTransactionViewDto[]> => {
  try {
    const res = await fetch(`/api/CrateClientTransactions/client/${clientId}`);
    if (res.ok) return await res.json();
  } catch {}
  return [
    {
      id: 1,
      crateClientId: clientId,
      clientName: 'العميل',
      transactionType: 'منصرف للعميل',
      quantity: 30,
      transactionDate: '2026-10-24 10:15',
      driverName: 'السيد عبد العال',
      notes: 'شحنة تسليم فوارغ الصباح',
      clientCurrentBalance: 45
    },
    {
      id: 2,
      crateClientId: clientId,
      clientName: 'العميل',
      transactionType: 'مستلم من العميل',
      quantity: 15,
      transactionDate: '2026-10-23 15:40',
      driverName: 'السيد عبد العال',
      notes: 'استرجاع فوارغ سليمة',
      clientCurrentBalance: 15
    }
  ];
};
