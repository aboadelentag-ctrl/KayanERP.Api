import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  RotateCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Users,
  Warehouse,
  Gavel,
  History,
  Trash2,
  Edit2
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchCratesDataApi,
  submitDispatchApi,
  submitReceiveApi,
  submitSettleDisputeApi,
  saveCrateClientApi,
  deleteCrateClientApi,
  saveCrateClientTransactionApi,
  fetchClientHistoryApi
} from './cratesApi';
import type {
  CrateLookupsDto,
  CirculatingContainerViewDto,
  CrateMovementViewDto,
  DispatchCrateDto,
  ReceiveCrateDto,
  SettleDisputeDto,
  CrateClient,
  CrateClientTransactionViewDto
} from './cratesApi';

interface CratesPageProps {
  onNavigate?: (tab: string) => void;
}

export const CratesPage: React.FC<CratesPageProps> = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'containers' | 'clients'>('containers');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Data
  const [lookups, setLookups] = useState<CrateLookupsDto>({ containers: [], departments: [], warehouses: [] });
  const [containersInventory, setContainersInventory] = useState<CirculatingContainerViewDto[]>([]);
  const [containerMovements, setContainerMovements] = useState<CrateMovementViewDto[]>([]);
  const [clients, setClients] = useState<CrateClient[]>([]);
  const [factoryBalance, setFactoryBalance] = useState<number>(0);

  // Modals Tab 1
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [dispatchDto, setDispatchDto] = useState<DispatchCrateDto>({
    movementType: 'DISPATCH_BRANCH',
    containerName: '',
    dispatchedQuantity: 50,
    sourceLocation: 'مخزن التعبئة المركزي',
    destinationLocation: '',
    notes: ''
  });

  const [selectedMovementToReceive, setSelectedMovementToReceive] = useState<CrateMovementViewDto | null>(null);
  const [receiveDto, setReceiveDto] = useState<ReceiveCrateDto>({
    actualReceivedQuantity: 0,
    damagedCount: 0,
    receiveNotes: ''
  });

  const [selectedMovementToDispute, setSelectedMovementToDispute] = useState<CrateMovementViewDto | null>(null);
  const [disputeDto, setDisputeDto] = useState<SettleDisputeDto>({
    arbitrationDecision: 'تحميل غرامة مالية على السائق',
    arbitrationText: '',
    financialPenalty: 0
  });

  // Tab 2 Clients
  const [showClientForm, setShowClientForm] = useState<boolean>(false);
  const [currentClient, setCurrentClient] = useState<CrateClient>({ id: 0, name: '', crateBalance: 0 });

  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<CrateClient | null>(null);
  const [transactionType, setTransactionType] = useState<string>('منصرف للعميل');
  const [transactionQty, setTransactionQty] = useState<number>(1);
  const [transactionDriver, setTransactionDriver] = useState<string>('');
  const [transactionNotes, setTransactionNotes] = useState<string>('');

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [clientHistory, setClientHistory] = useState<CrateClientTransactionViewDto[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCratesDataApi();
      setLookups(data.lookups);
      setContainersInventory(data.inventory);
      setContainerMovements(data.movements);
      setClients(data.clients);
      setFactoryBalance(data.factoryBalance);
    } catch (ex: any) {
      setAlertMessage(`خطأ في جلب البيانات: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDispatch = () => {
    setDispatchDto({
      movementType: 'DISPATCH_BRANCH',
      containerName: lookups.containers[0]?.containerName || 'صاج ألومنيوم 40×60',
      sourceLocation: 'مخزن التعبئة المركزي',
      destinationLocation: lookups.warehouses[0] || 'فرع دكرنس',
      dispatchedQuantity: 50,
      dispatchedByCode: user?.role || 'EMP-088',
      dispatchedByName: user?.fullName || 'أمين مخزن التعبئة',
      notes: ''
    });
    setShowDispatchModal(true);
  };

  const handleSubmitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatchDto.dispatchedQuantity <= 0) return;

    setIsProcessing(true);
    try {
      await submitDispatchApi(dispatchDto);
      const newMov: CrateMovementViewDto = {
        id: Date.now(),
        movementNumber: `CRT-20261024-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        movementType: dispatchDto.movementType,
        containerName: dispatchDto.containerName,
        dispatchedQuantity: Number(dispatchDto.dispatchedQuantity),
        receivedQuantity: 0,
        shortageQuantity: 0,
        damagedCount: 0,
        sourceLocation: dispatchDto.sourceLocation,
        destinationLocation: dispatchDto.destinationLocation,
        dispatchedByCode: dispatchDto.dispatchedByCode || 'EMP-088',
        dispatchedByName: dispatchDto.dispatchedByName || 'أمين التعبئة',
        receivedByCode: '',
        receivedByName: '',
        status: 'PENDING_RECEIPT'
      };
      setContainerMovements(prev => [newMov, ...prev]);
      setAlertMessage('تم إصدار إذن الصرف بنجاح وبانتظار تأكيد الاستلام من الطرف الثاني.');
      setIsSuccess(true);
      setShowDispatchModal(false);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handleOpenReceive = (m: CrateMovementViewDto) => {
    setSelectedMovementToReceive(m);
    setReceiveDto({
      actualReceivedQuantity: m.dispatchedQuantity,
      damagedCount: 0,
      receivedByCode: user?.role || 'BRANCH-REC-01',
      receivedByName: user?.fullName || 'أمين مخزن الفرع المستلم',
      receiveNotes: ''
    });
  };

  const handleSubmitReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovementToReceive) return;

    setIsProcessing(true);
    try {
      await submitReceiveApi(selectedMovementToReceive.Id || selectedMovementToReceive.id, receiveDto);
      const act = Number(receiveDto.actualReceivedQuantity);
      const dmg = Number(receiveDto.damagedCount);
      const shortage = Math.max(0, selectedMovementToReceive.dispatchedQuantity - act);
      const isDispute = shortage > 0 || dmg > 0;

      setContainerMovements(prev =>
        prev.map(m =>
          m.id === selectedMovementToReceive.id
            ? {
                ...m,
                receivedQuantity: act,
                damagedCount: dmg,
                shortageQuantity: shortage,
                receivedByCode: receiveDto.receivedByCode || 'BRANCH-REC-01',
                receivedByName: receiveDto.receivedByName || 'أمين مخزن الفرع',
                status: isDispute ? 'DISPUTED' : 'COMPLETED'
              }
            : m
        )
      );

      setAlertMessage(isDispute ? '⚠️ تم إثبات الاستلام مع وجود عجز/تلف ونقل الحركة للجنة النزاعات!' : '✓ تم تأكيد الاستلام الميداني وتحديث الأرصدة بنجاح.');
      setIsSuccess(!isDispute);
      setSelectedMovementToReceive(null);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handleOpenDispute = (m: CrateMovementViewDto) => {
    setSelectedMovementToDispute(m);
    const penalty = (m.shortageQuantity + m.damagedCount) * 150;
    setDisputeDto({
      arbitrationDecision: 'تحميل غرامة مالية على السائق',
      arbitrationText: `تسوية عجز (${m.shortageQuantity}) وتالف (${m.damagedCount}) صاج.`,
      financialPenalty: penalty,
      arbitratedByCode: user?.role || 'ADMIN-01',
      arbitratedByName: user?.fullName || 'رئيس لجنة التحكيم'
    });
  };

  const handleSubmitSettleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovementToDispute) return;

    setIsProcessing(true);
    try {
      await submitSettleDisputeApi(selectedMovementToDispute.id, disputeDto);
      setContainerMovements(prev =>
        prev.map(m =>
          m.id === selectedMovementToDispute.id
            ? {
                ...m,
                status: 'RESOLVED',
                arbitrationDecision: disputeDto.arbitrationDecision,
                arbitrationText: disputeDto.arbitrationText,
                financialPenalty: disputeDto.financialPenalty
              }
            : m
        )
      );

      setAlertMessage('تم اعتماد قرار لجنة التحكيم وتسوية العهدة بنجاح.');
      setIsSuccess(true);
      setSelectedMovementToDispute(null);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient.name.trim()) return;

    await saveCrateClientApi(currentClient);
    if (currentClient.id > 0) {
      setClients(prev => prev.map(c => c.id === currentClient.id ? { ...currentClient } : c));
    } else {
      setClients(prev => [...prev, { ...currentClient, id: Date.now() }]);
    }
    setAlertMessage('تم حفظ بيانات العميل بنجاح.');
    setIsSuccess(true);
    setShowClientForm(false);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDeleteClient = async (id: number) => {
    await deleteCrateClientApi(id);
    setClients(prev => prev.filter(c => c.id !== id));
    setAlertMessage('تم حذف العميل بنجاح.');
    setIsSuccess(true);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleOpenTransaction = (client: CrateClient) => {
    setSelectedClient(client);
    setTransactionType('منصرف للعميل');
    setTransactionQty(1);
    setTransactionDriver('');
    setTransactionNotes('');
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || transactionQty <= 0) return;

    setIsProcessing(true);
    try {
      await saveCrateClientTransactionApi({
        crateClientId: selectedClient.id,
        transactionType,
        quantity: transactionQty,
        driverName: transactionDriver,
        notes: transactionNotes
      });

      const delta = transactionType === 'منصرف للعميل' ? transactionQty : -transactionQty;
      setClients(prev =>
        prev.map(c => c.id === selectedClient.id ? { ...c, crateBalance: c.crateBalance + delta } : c)
      );
      setFactoryBalance(prev => transactionType === 'منصرف للعميل' ? prev - transactionQty : prev + transactionQty);

      setAlertMessage('تم تسجيل وترصيد حركة الإسبات للعميل بنجاح.');
      setIsSuccess(true);
      setShowTransactionModal(false);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handleShowHistory = async (client: CrateClient) => {
    setSelectedClient(client);
    setShowHistoryModal(true);
    const data = await fetchClientHistoryApi(client.id);
    setClientHistory(data);
  };

  const exportMovementsToCsv = () => {
    if (!containerMovements.length) return;
    const headers = 'رقم_الحركة,التاريخ,نوع_الحركة,نوع_الفوارغ,المصروف,المستلم,العجز,التالف,المصدر,الوجهة,المسلم,المستلم_المسجل,الحالة\n';
    const rows = containerMovements.map(m => {
      const type = m.movementType === 'DISPATCH_BRANCH' ? 'صرف للفرع' : 'مرتجع للمصنع';
      return `"${m.movementNumber}","${m.createdAt}","${type}","${m.containerName}",${m.dispatchedQuantity},${m.receivedQuantity},${m.shortageQuantity},${m.damagedCount},"${m.sourceLocation}","${m.destinationLocation}","${m.dispatchedByName}","${m.receivedByName}","${m.status}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `حركات_الصاجات_والأسبتة_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-400" />
              <span>حوكمة عهدة الصاجات والأسبتة والفوارغ (Two-Party Handshake & Custody)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              رقابة الحاويات الميدانية
            </span>
          </div>
          <p className="text-xs text-slate-400">
            الرقابة الميدانية المغلقة: صرف الفوارغ ⇦ الاستلام وفصل المهام ⇦ فض نزاعات العجز والكسر ⇦ عهد العملاء والفروع.
          </p>
        </div>

        <div className="flex gap-2">
          {containerMovements.length > 0 && (
            <button
              onClick={exportMovementsToCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير سجل الحركات (CSV)</span>
            </button>
          )}
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            <RotateCw className="w-4 h-4 text-emerald-400" />
            <span>تحديث لحظي</span>
          </button>
        </div>
      </div>

      {alertMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {alertMessage}
          </span>
          <button onClick={() => setAlertMessage(null)}>×</button>
        </div>
      )}

      {/* التبويبات الرئيسية */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-fit gap-1 mb-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('containers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'containers' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Warehouse className="w-4 h-4" />
          <span>🏭 1. دورة الصاجات والأسبتة (المصنع والفروع والسائقين)</span>
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'clients' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Users className="w-4 h-4" />
          <span>👥 2. عهد عملاء الجملة والتوزيع الخارجي ({clients.length})</span>
        </button>
      </div>

      {/* تبويب 1: دورة الصاجات والأسبتة */}
      {activeTab === 'containers' && (
        <div className="space-y-6">
          {/* كروت الأرصدة اللحظية للحاويات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {containersInventory.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-2xl border border-gray-200 border-t-4 border-t-indigo-600 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <h6 className="font-bold text-slate-900 text-sm">{c.containerName}</h6>
                  <span className="bg-indigo-50 text-indigo-700 font-mono font-bold text-xs px-2 py-0.5 rounded">
                    إجمالي المصنع: {c.totalFactoryQuantity}
                  </span>
                </div>
                <small className="text-gray-400 block mb-3 text-[11px]">{c.specification}</small>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <span className="text-gray-500 block text-[10px]">بمخزن التعبئة</span>
                    <strong className="text-emerald-700 font-mono text-sm">{c.inPackagingWarehouseQuantity}</strong>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                    <span className="text-gray-500 block text-[10px]">مع الفروع/السائقين</span>
                    <strong className="text-indigo-700 font-mono text-sm">{c.withDriversAndBranchesQuantity}</strong>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
                    <span className="text-gray-500 block text-[10px]">عجز / تالف</span>
                    <strong className="text-rose-700 font-mono text-sm">{c.disputedQuantity + c.damagedQuantity}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* شريط أدوات الحركات */}
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-slate-800 text-sm">📋 سجل حركة الصاجات والأسبتة والمصافحة الميدانية</h5>
            <button
              onClick={handleOpenDispatch}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إصدار إذن صرف فوارغ (طرف أول)</span>
            </button>
          </div>

          {/* جدول الحركات */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <table className="w-full text-center">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-3 px-3">رقم الحركة</th>
                  <th className="py-3 px-3">التاريخ</th>
                  <th className="py-3 px-3">نوع الحركة</th>
                  <th className="py-3 px-3">نوع الفوارغ</th>
                  <th className="py-3 px-3">المصروف</th>
                  <th className="py-3 px-3">المستلم</th>
                  <th className="py-3 px-3">العجز / التالف</th>
                  <th className="py-3 px-3 text-right">من ⇦ إلى</th>
                  <th className="py-3 px-3">المسلِّم ⇦ المستلم</th>
                  <th className="py-3 px-3">الحالة الرقابية</th>
                  <th className="py-3 px-3">الإجراء الميداني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {containerMovements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{m.movementNumber}</td>
                    <td className="py-3 px-3 font-mono text-gray-500">{m.createdAt}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.movementType === 'DISPATCH_BRANCH' ? 'bg-amber-50 text-amber-800' : 'bg-cyan-50 text-cyan-800'}`}>
                        {m.movementType === 'DISPATCH_BRANCH' ? 'صرف للفرع' : 'مرتجع للمصنع'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900">{m.containerName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700 text-sm">{m.dispatchedQuantity}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm">
                      {m.receivedQuantity > 0 ? m.receivedQuantity : '-'}
                    </td>
                    <td className="py-3 px-3">
                      {m.shortageQuantity > 0 || m.damagedCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono font-bold text-[10px]">
                          عجز: {m.shortageQuantity} | كسر: {m.damagedCount}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      <div>{m.sourceLocation}</div>
                      <small className="text-gray-400 block">⇦ {m.destinationLocation}</small>
                    </td>
                    <td className="py-3 px-3 text-gray-800">
                      <div className="font-bold">{m.dispatchedByName}</div>
                      <small className="text-gray-400 block">{m.receivedByName ? `⇦ ${m.receivedByName}` : 'قيد الانتظار'}</small>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.status === 'DISPUTED'
                            ? 'bg-rose-50 text-rose-700'
                            : m.status === 'RESOLVED'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {m.status === 'COMPLETED'
                          ? '✓ تم الاستلام والترصيد'
                          : m.status === 'DISPUTED'
                          ? '🚨 نزاع: عجز أو تلف'
                          : m.status === 'RESOLVED'
                          ? '⚖️ حُسم بقرار تحكيم'
                          : '⏳ بانتظار تأكيد المستلم'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {m.status === 'PENDING_RECEIPT' ? (
                        <button
                          onClick={() => handleOpenReceive(m)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          📥 تأكيد الاستلام
                        </button>
                      ) : m.status === 'DISPUTED' ? (
                        <button
                          onClick={() => handleOpenDispute(m)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          ⚖️ فض النزاع
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px]">مكتمل</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* تبويب 2: عهد عملاء الجملة والتوزيع الخارجي */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs">
              🏭 رصيد المصنع الداخلي للإسبات: <strong className="text-amber-400 font-mono text-sm">{factoryBalance}</strong> سبت
            </span>
            <button
              onClick={() => { setCurrentClient({ id: 0, name: '', crateBalance: 0 }); setShowClientForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة عميل / مندوب جديد</span>
            </button>
          </div>

          {showClientForm && (
            <div className="bg-white p-4 rounded-2xl border-2 border-indigo-500 shadow-xs">
              <h6 className="font-bold text-gray-900 text-xs mb-3">
                {currentClient.id === 0 ? 'إضافة عميل جديد' : 'تعديل بيانات العميل'}
              </h6>
              <form onSubmit={handleSaveClient} className="grid grid-cols-12 gap-3 items-end text-xs">
                <div className="col-span-6">
                  <label className="block text-gray-700 font-bold mb-1">اسم العميل / المندوب *</label>
                  <input
                    type="text"
                    required
                    placeholder="أدخل اسم العميل..."
                    value={currentClient.name}
                    onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-gray-700 font-bold mb-1">الرصيد الافتتاحي</label>
                  <input
                    type="number"
                    value={currentClient.crateBalance}
                    onChange={(e) => setCurrentClient({ ...currentClient, crateBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-bold"
                  />
                </div>
                <div className="col-span-3 flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl">
                    💾 حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClientForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <table className="w-full text-center">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-2.5 px-3">رقم</th>
                  <th className="py-2.5 px-3 text-right">اسم العميل / المندوب</th>
                  <th className="py-2.5 px-3">رصيد الإسبات الحالي</th>
                  <th className="py-2.5 px-3">إدارة العهدة والحركات</th>
                  <th className="py-2.5 px-3">إعدادات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-gray-500">{c.id}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">{c.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-3 py-1 rounded-full font-mono font-black text-xs ${c.crateBalance > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {c.crateBalance} سبت
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenTransaction(c)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[11px]"
                        >
                          📦 صرف / استلام
                        </button>
                        <button
                          onClick={() => handleShowHistory(c)}
                          className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded text-[11px]"
                        >
                          📜 كشف الحساب
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => { setCurrentClient({ ...c }); setShowClientForm(true); }}
                          className="p-1 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c.id)}
                          className="p-1 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة صرف فوارغ */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>إصدار إذن صرف صاجات / أسبتة (طرف أول)</span>
              </h4>
              <button onClick={() => setShowDispatchModal(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSubmitDispatch} className="p-5 space-y-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">نوع الحركة *</label>
                <select
                  value={dispatchDto.movementType}
                  onChange={(e) => setDispatchDto({ ...dispatchDto, movementType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value="DISPATCH_BRANCH">صرف من المصنع إلى الفرع / السائق</option>
                  <option value="RETURN_FACTORY">إرجاع فوارغ من الفرع إلى المصنع</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">نوع الصاجات / الحاويات *</label>
                <select
                  value={dispatchDto.containerName}
                  onChange={(e) => setDispatchDto({ ...dispatchDto, containerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  {lookups.containers.map(cn => (
                    <option key={cn.id} value={cn.containerName}>{cn.containerName} ({cn.specification})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">المصدر (المُسلِّم) *</label>
                  <input
                    type="text"
                    required
                    value={dispatchDto.sourceLocation}
                    onChange={(e) => setDispatchDto({ ...dispatchDto, sourceLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الوجهة (المستلم) *</label>
                  <input
                    type="text"
                    required
                    value={dispatchDto.destinationLocation}
                    onChange={(e) => setDispatchDto({ ...dispatchDto, destinationLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">العدد المنصرف *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={dispatchDto.dispatchedQuantity}
                  onChange={(e) => setDispatchDto({ ...dispatchDto, dispatchedQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-black text-indigo-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">ملاحظات الإذن</label>
                <input
                  type="text"
                  placeholder="بيانات السائق أو السيارة..."
                  value={dispatchDto.notes || ''}
                  onChange={(e) => setDispatchDto({ ...dispatchDto, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isProcessing ? '⏳ جاري الإصدار...' : '✓ إصدار الإذن للمستلم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة استلام الفوارغ الميداني ومطابقة العجز */}
      {selectedMovementToReceive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تأكيد الاستلام الميداني: {selectedMovementToReceive.movementNumber}</span>
              </h4>
              <button onClick={() => setSelectedMovementToReceive(null)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSubmitReceive} className="p-5 space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                <div><strong>الحاوية:</strong> {selectedMovementToReceive.containerName}</div>
                <div><strong>المصروف:</strong> <span className="font-mono font-bold text-indigo-700">{selectedMovementToReceive.dispatchedQuantity}</span></div>
                <div><strong>المُسلِّم:</strong> {selectedMovementToReceive.dispatchedByName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-800 font-bold mb-1">العدد المستلم فعلياً *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={receiveDto.actualReceivedQuantity}
                    onChange={(e) => setReceiveDto({ ...receiveDto, actualReceivedQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-emerald-400 rounded-xl font-mono text-center font-bold text-emerald-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-rose-800 font-bold mb-1">المكسور والتالف</label>
                  <input
                    type="number"
                    min={0}
                    value={receiveDto.damagedCount}
                    onChange={(e) => setReceiveDto({ ...receiveDto, damagedCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-rose-400 rounded-xl font-mono text-center font-bold text-rose-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">ملاحظات الاستلام والمطابقة</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات العجز أو التلف..."
                  value={receiveDto.receiveNotes || ''}
                  onChange={(e) => setReceiveDto({ ...receiveDto, receiveNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedMovementToReceive(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isProcessing ? '⏳ جاري التأكيد...' : '✓ تأكيد الاستلام وترصيد العهدة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة فض النزاع والتحكيم */}
      {selectedMovementToDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-rose-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-300" />
                <span>لجنة التحكيم - تسوية نزاع: {selectedMovementToDispute.movementNumber}</span>
              </h4>
              <button onClick={() => setSelectedMovementToDispute(null)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSubmitSettleDispute} className="p-5 space-y-3">
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-1 text-rose-900">
                <div><strong>الحاوية:</strong> {selectedMovementToDispute.containerName}</div>
                <div><strong>المنصرف:</strong> {selectedMovementToDispute.dispatchedQuantity} | <strong>المستلم:</strong> {selectedMovementToDispute.receivedQuantity}</div>
                <div className="font-bold">العجز: {selectedMovementToDispute.shortageQuantity} | التالف: {selectedMovementToDispute.damagedCount}</div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">قرار اللجنة وتوجيه المسؤولية *</label>
                <select
                  value={disputeDto.arbitrationDecision}
                  onChange={(e) => setDisputeDto({ ...disputeDto, arbitrationDecision: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value="تحميل غرامة مالية على السائق">تحميل غرامة مالية على السائق</option>
                  <option value="تحميل غرامة مالية على أمين مخزن الفرع">تحميل غرامة مالية على أمين مخزن الفرع</option>
                  <option value="إهلاك كسر طبيعي على عهدة المصنع">إهلاك كسر طبيعي على عهدة المصنع</option>
                  <option value="إعادة الصاجات المعثور عليها لمخزن التعبئة">إعادة الصاجات المعثور عليها لمخزن التعبئة</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">الغرامة المالية المقررة (ج.م)</label>
                <input
                  type="number"
                  step="0.01"
                  value={disputeDto.financialPenalty}
                  onChange={(e) => setDisputeDto({ ...disputeDto, financialPenalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">محضر وتفاصيل القرار</label>
                <textarea
                  rows={2}
                  placeholder="محضر اجتماع اللجنة..."
                  value={disputeDto.arbitrationText}
                  onChange={(e) => setDisputeDto({ ...disputeDto, arbitrationText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedMovementToDispute(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  ✓ اعتماد قرار التحكيم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تسجيل حركة عميل */}
      {showTransactionModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>تسجيل حركة إسبات: {selectedClient.name}</span>
              </h4>
              <button onClick={() => setShowTransactionModal(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">نوع الحركة *</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value="منصرف للعميل">🔴 منصرف للعميل (خروج إسبات من المصنع)</option>
                  <option value="مستلم من العميل">🟢 مستلم من العميل (رجوع إسبات للمصنع)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">عدد الإسبات *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={transactionQty}
                  onChange={(e) => setTransactionQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-black text-indigo-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم السائق / المندوب</label>
                <input
                  type="text"
                  placeholder="اسم السائق الناقل..."
                  value={transactionDriver}
                  onChange={(e) => setTransactionDriver(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">ملاحظات</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات الحركة..."
                  value={transactionNotes}
                  onChange={(e) => setTransactionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  💾 حفظ واعتماد الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة كشف حساب العميل */}
      {showHistoryModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>كشف حساب إسبات: {selectedClient.name}</span>
              </h4>
              <button onClick={() => setShowHistoryModal(false)} className="text-white">×</button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-center">
                <thead className="bg-slate-100 text-gray-700">
                  <tr>
                    <th className="py-2 px-3">التاريخ والوقت</th>
                    <th className="py-2 px-3">نوع الحركة</th>
                    <th className="py-2 px-3">الكمية</th>
                    <th className="py-2 px-3 text-right">السائق / الملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientHistory.map(trans => (
                    <tr key={trans.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-gray-500">{trans.transactionDate}</td>
                      <td className="py-2 px-3 font-bold">
                        <span className={trans.transactionType === 'منصرف للعميل' ? 'text-rose-600' : 'text-emerald-700'}>
                          {trans.transactionType}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-sm">{trans.quantity}</td>
                      <td className="py-2 px-3 text-right text-gray-600">{trans.notes || trans.driverName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
              <span className="font-bold text-indigo-700 text-xs">
                الرصيد الجاري الحالي: <strong className="font-mono text-sm">{selectedClient.crateBalance}</strong> سبت
              </span>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
