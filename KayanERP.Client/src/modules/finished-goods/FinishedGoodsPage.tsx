import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  PlusCircle,
  FileSpreadsheet,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Microscope,
  Warehouse,
  Repeat,
  Gavel,
  ShieldCheck,
  Calendar,
  Layers,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchFinishedGoodsDataApi,
  submitNewTransferApi,
  submitCostingAuditApi,
  resolveCostingDisputeApi,
  inspectQcApi,
  receiveControlApi,
  resubmitReworkApi,
  resolveDisputeApi
} from './finishedGoodsApi';
import type {
  FinishedGoodsTransferViewDto,
  WarehouseDto,
  ItemDto,
  CreateTransferRequestDto
} from './finishedGoodsApi';

interface FinishedGoodsPageProps {
  onNavigate?: (tab: string) => void;
}

export const FinishedGoodsPage: React.FC<FinishedGoodsPageProps> = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'costing' | 'qc' | 'control' | 'rework'>('list');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Data
  const [transfers, setTransfers] = useState<FinishedGoodsTransferViewDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [allFinishedItems, setAllFinishedItems] = useState<ItemDto[]>([]);
  const [displayedItems, setDisplayedItems] = useState<ItemDto[]>([]);

  // Tab 2: New Dispatch
  const [newTransfer, setNewTransfer] = useState<CreateTransferRequestDto>({
    sourceWarehouseId: 0,
    destinationWarehouseId: 0,
    itemId: 0,
    batchNumber: '',
    expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    dispatchedQty: 0,
    dispatchedCount: 0,
    notes: '',
    submittedBy: ''
  });
  const [selectedItemUnit, setSelectedItemUnit] = useState<string>('كجم');

  // Input states per transfer for in-place actions
  const [auditInputs, setAuditInputs] = useState<{ [id: number]: { weight: number; count: number; notes: string } }>({});
  const [qcInputs, setQcInputs] = useState<{ [id: number]: { sample: number; rework: number; scrap: number; notes: string } }>({});
  const [controlInputs, setControlInputs] = useState<{ [id: number]: { qty: number; count: number; notes: string } }>({});
  const [reworkInputs, setReworkInputs] = useState<{ [id: number]: { weight: number; count: number; notes: string } }>({});

  // Costing Dispute Modal
  const [selectedCostingDispute, setSelectedCostingDispute] = useState<FinishedGoodsTransferViewDto | null>(null);
  const [costingDisputeFinalWeight, setCostingDisputeFinalWeight] = useState<number>(0);
  const [costingDisputeFinalCount, setCostingDisputeFinalCount] = useState<number>(0);
  const [costingDisputeChargeTo, setCostingDisputeChargeTo] = useState<string>('عجز تصنيع يُحمّل على تقرير وردية الصالة');
  const [costingDisputeNotes, setCostingDisputeNotes] = useState<string>('');

  // Control Dispute Modal
  const [selectedDisputeTransfer, setSelectedDisputeTransfer] = useState<FinishedGoodsTransferViewDto | null>(null);
  const [disputeFinalQty, setDisputeFinalQty] = useState<number>(0);
  const [controlDisputeChargeTo, setControlDisputeChargeTo] = useState<string>('عهدة سائق وعامل النقل الداخلي');
  const [disputeResolutionNotes, setDisputeResolutionNotes] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchFinishedGoodsDataApi();
      setTransfers(data.transfers);
      setWarehouses(data.warehouses);
      setAllFinishedItems(data.finishedItems);
      setDisplayedItems(data.finishedItems);

      // Initialize inputs
      const aMap: any = {};
      const qMap: any = {};
      const cMap: any = {};
      const rMap: any = {};

      data.transfers.forEach((t: FinishedGoodsTransferViewDto) => {
        aMap[t.id] = {
          weight: t.costingActualQty ?? t.prodDispatchedQty,
          count: t.costingActualCount ?? t.prodDispatchedCount,
          notes: ''
        };
        qMap[t.id] = { sample: 0, rework: 0, scrap: 0, notes: '' };
        cMap[t.id] = {
          qty: t.receivedActualQty ?? t.qcApprovedQty,
          count: t.receivedActualCount ?? (t.costingActualCount ?? t.prodDispatchedCount),
          notes: ''
        };
        rMap[t.id] = { weight: t.prodDispatchedQty, count: t.prodDispatchedCount, notes: 'تم التعديل بالصالة' };
      });

      setAuditInputs(aMap);
      setQcInputs(qMap);
      setControlInputs(cMap);
      setReworkInputs(rMap);
    } catch (ex: any) {
      setAlertMessage(`خطأ في جلب البيانات: ${ex.message}`);
      setIsSuccess(false);
    }
  };

  const costingList = useMemo(
    () => transfers.filter(t => t.status === 'PENDING_COSTING' || t.status === 'DISPUTE_COSTING'),
    [transfers]
  );
  const pendingQcList = useMemo(
    () => transfers.filter(t => t.status === 'PENDING_QC'),
    [transfers]
  );
  const controlList = useMemo(
    () => transfers.filter(t => t.status === 'PENDING_RECEIPT' || t.status === 'IN_DISPUTE'),
    [transfers]
  );
  const reworkList = useMemo(
    () => transfers.filter(t => t.status === 'REWORK_IN_PRODUCTION'),
    [transfers]
  );

  const currentDispatcherDisplayName = useMemo(() => {
    return user ? `${user.fullName} [${user.role}]` : 'مشرف الصالة المعتمد';
  }, [user]);

  // Tab 2 Handlers
  const handleSourceWarehouseChange = (wId: number) => {
    setNewTransfer(prev => ({ ...prev, sourceWarehouseId: wId }));
    const wh = warehouses.find(w => w.id === wId);
    if (wh && wh.departmentId) {
      const matched = allFinishedItems.filter(i => i.departmentId === wh.departmentId);
      setDisplayedItems(matched.length ? matched : allFinishedItems);
    } else {
      setDisplayedItems(allFinishedItems);
    }
    setNewTransfer(prev => ({ ...prev, itemId: 0, batchNumber: '' }));
  };

  const handleItemSelected = (itmId: number) => {
    setNewTransfer(prev => ({ ...prev, itemId: itmId }));
    const itm = displayedItems.find(i => i.id === itmId);
    if (itm) {
      setSelectedItemUnit(itm.unit || 'كجم');
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const codeStr = itm.itemCode || itm.id.toString();
      const shelfDays = itm.shelfLifeDays || 3;
      setNewTransfer(prev => ({
        ...prev,
        batchNumber: `LOT-PRD-${todayStr}-${codeStr}-1`,
        expiryDate: new Date(Date.now() + shelfDays * 86400000).toISOString().slice(0, 10)
      }));
    }
  };

  const handleSubmitNewTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransfer.sourceWarehouseId || !newTransfer.destinationWarehouseId || !newTransfer.itemId || newTransfer.dispatchedQty <= 0) {
      setAlertMessage('يرجى استيفاء بيانات الصنف والمخازن والكمية المسلمة.');
      setIsSuccess(false);
      return;
    }

    setIsProcessing(true);
    try {
      const srcWh = warehouses.find(w => w.id === newTransfer.sourceWarehouseId)?.warehouseName || 'صالة التشغيل';
      const destWh = warehouses.find(w => w.id === newTransfer.destinationWarehouseId)?.warehouseName || 'مخزن الكنترول';
      const itm = allFinishedItems.find(i => i.id === newTransfer.itemId);

      const created: FinishedGoodsTransferViewDto = {
        id: Date.now(),
        transferNumber: `TRF-FG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
        transferDate: new Date().toISOString().slice(0, 10),
        sourceWarehouseName: srcWh,
        destinationWarehouseName: destWh,
        itemName: itm?.itemName || 'منتج تام',
        itemCode: itm?.itemCode || 'PRD-00',
        batchNumber: newTransfer.batchNumber,
        expiryDate: newTransfer.expiryDate,
        prodDispatchedQty: Number(newTransfer.dispatchedQty),
        prodDispatchedCount: Number(newTransfer.dispatchedCount),
        prodNotes: newTransfer.notes,
        costingWeightDiff: 0,
        costingCountDiff: 0,
        costingDiscrepancyFlag: false,
        costingDisputeStatus: '',
        qcApprovedQty: 0,
        qcSampleQty: 0,
        qcReworkQty: 0,
        qcScrapQty: 0,
        hasDispute: false,
        disputeStatus: '',
        status: 'PENDING_COSTING'
      };

      await submitNewTransferApi({
        ...newTransfer,
        submittedBy: currentDispatcherDisplayName,
        submittedByCode: user?.role
      });

      setTransfers(prev => [created, ...prev]);
      setAuditInputs(prev => ({
        ...prev,
        [created.id]: { weight: created.prodDispatchedQty, count: created.prodDispatchedCount, notes: '' }
      }));

      setAlertMessage('تم تسجيل إذن التسليم بنجاح وتمريره لميزان التكاليف.');
      setIsSuccess(true);
      setActiveTab('costing');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  // Tab 3: Costing Audit
  const handleSubmitCostingAudit = async (trf: FinishedGoodsTransferViewDto, escalateDispute: boolean) => {
    const inp = auditInputs[trf.id] || { weight: trf.prodDispatchedQty, count: trf.prodDispatchedCount, notes: '' };
    if (inp.weight <= 0) return;

    setIsProcessing(true);
    try {
      await submitCostingAuditApi({
        transferId: trf.id,
        actualWeight: inp.weight,
        actualCount: inp.count,
        auditorName: currentDispatcherDisplayName,
        auditorCode: user?.role,
        notes: inp.notes,
        escalateDispute
      });

      const hasDiff = inp.weight !== trf.prodDispatchedQty || inp.count !== trf.prodDispatchedCount;

      setTransfers(prev =>
        prev.map(t =>
          t.id === trf.id
            ? {
                ...t,
                costingActualQty: inp.weight,
                costingActualCount: inp.count,
                costingDiscrepancyFlag: hasDiff,
                costingDisputeReason: hasDiff ? `تضارب وزن: صالة (${t.prodDispatchedQty}) vs تكاليف (${inp.weight})` : undefined,
                status: escalateDispute ? 'DISPUTE_COSTING' : 'PENDING_QC'
              }
            : t
        )
      );

      if (escalateDispute) {
        setAlertMessage('🚨 تم تصعيد الإذن إلى «لجنة الإنتاج والتكاليف» لتسوية تضارب الأوزان والأعداد!');
        setIsSuccess(false);
      } else {
        setAlertMessage('تم اعتماد ميزان التكاليف وإحالة الإذن للجودة.');
        setIsSuccess(true);
        setActiveTab('qc');
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handleResolveCostingDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCostingDispute || !costingDisputeNotes.trim()) return;

    setIsProcessing(true);
    try {
      await resolveCostingDisputeApi({
        transferId: selectedCostingDispute.id,
        finalAcceptedWeight: costingDisputeFinalWeight,
        finalAcceptedCount: costingDisputeFinalCount,
        resolvedBy: currentDispatcherDisplayName,
        chargeTo: costingDisputeChargeTo,
        resolutionNotes: costingDisputeNotes
      });

      setTransfers(prev =>
        prev.map(t =>
          t.id === selectedCostingDispute.id
            ? {
                ...t,
                costingActualQty: costingDisputeFinalWeight,
                costingActualCount: costingDisputeFinalCount,
                costingDisputeStatus: 'RESOLVED',
                status: 'PENDING_QC'
              }
            : t
        )
      );

      setAlertMessage('تم حسم نزاع الإنتاج والتكاليف وتمرير الإذن لمحطة الجودة بنجاح!');
      setIsSuccess(true);
      setSelectedCostingDispute(null);
      setActiveTab('qc');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  // Tab 4: QC Inspection
  const handleSubmitQcInspection = async (trf: FinishedGoodsTransferViewDto) => {
    const baseCosting = trf.costingActualQty ?? trf.prodDispatchedQty;
    const inp = qcInputs[trf.id] || { sample: 0, rework: 0, scrap: 0, notes: '' };
    const netApproved = baseCosting - (inp.sample + inp.rework + inp.scrap);

    if (netApproved < 0) {
      setAlertMessage('مجموع الخصومات يتجاوز وزن التكاليف المعتمد!');
      setIsSuccess(false);
      return;
    }

    setIsProcessing(true);
    try {
      await inspectQcApi({
        transferId: trf.id,
        approvedQty: netApproved,
        sampleQty: inp.sample,
        reworkQty: inp.rework,
        scrapQty: inp.scrap,
        inspectorName: currentDispatcherDisplayName,
        notes: inp.notes
      });

      setTransfers(prev =>
        prev.map(t =>
          t.id === trf.id
            ? {
                ...t,
                qcApprovedQty: netApproved,
                qcSampleQty: inp.sample,
                qcReworkQty: inp.rework,
                qcScrapQty: inp.scrap,
                status: inp.rework > 0 && netApproved === 0 ? 'REWORK_IN_PRODUCTION' : 'PENDING_RECEIPT'
              }
            : t
        )
      );

      setControlInputs(prev => ({
        ...prev,
        [trf.id]: {
          qty: netApproved,
          count: trf.costingActualCount ?? trf.prodDispatchedCount,
          notes: ''
        }
      }));

      setAlertMessage(`تم إفراج الجودة بصافي ${netApproved.toFixed(2)} كجم للكنترول، وتوجيه ${inp.rework.toFixed(2)} كجم للمرتجعات.`);
      setIsSuccess(true);
      setActiveTab('control');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  // Tab 5: Control Receipt
  const handleSubmitControlReceipt = async (trf: FinishedGoodsTransferViewDto) => {
    const inp = controlInputs[trf.id] || { qty: trf.qcApprovedQty, count: trf.costingActualCount ?? trf.prodDispatchedCount, notes: '' };
    if (inp.qty <= 0) return;

    setIsProcessing(true);
    try {
      const isShortage = inp.qty < trf.qcApprovedQty;
      await receiveControlApi({
        transferId: trf.id,
        receivedQty: inp.qty,
        receivedCount: inp.count,
        receiverName: currentDispatcherDisplayName,
        notes: inp.notes
      });

      setTransfers(prev =>
        prev.map(t =>
          t.id === trf.id
            ? {
                ...t,
                receivedActualQty: inp.qty,
                receivedActualCount: inp.count,
                hasDispute: isShortage,
                disputeReason: isShortage ? `عجز كنترول: معتمد جودة (${t.qcApprovedQty}) vs مستلم (${inp.qty})` : undefined,
                status: isShortage ? 'IN_DISPUTE' : 'COMPLETED'
              }
            : t
        )
      );

      if (isShortage) {
        setAlertMessage('⚠️ تم إحالة الإذن إلى «لجنة فض المنازعات» لوجود عجز غير مبرر بالجودة!');
        setIsSuccess(false);
      } else {
        setAlertMessage('تم استلام الشحنة بمخزن الكنترول وترصيدها في كارت الصنف واللوطات بنجاح!');
        setIsSuccess(true);
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeTransfer || !disputeResolutionNotes.trim()) return;

    setIsProcessing(true);
    try {
      await resolveDisputeApi({
        transferId: selectedDisputeTransfer.id,
        finalAcceptedQty: disputeFinalQty,
        resolvedBy: `لجنة فض المنازعات (${currentDispatcherDisplayName})`,
        chargeTo: controlDisputeChargeTo,
        resolutionNotes: disputeResolutionNotes
      });

      setTransfers(prev =>
        prev.map(t =>
          t.id === selectedDisputeTransfer.id
            ? {
                ...t,
                receivedActualQty: disputeFinalQty,
                disputeStatus: 'RESOLVED',
                status: 'COMPLETED'
              }
            : t
        )
      );

      setAlertMessage('تم فض النزاع واعتماد التسوية وترصيد الكمية المتفق عليها بالكنترول!');
      setIsSuccess(true);
      setSelectedDisputeTransfer(null);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  // Tab 6: Rework
  const handleSubmitRework = async (rw: FinishedGoodsTransferViewDto) => {
    const inp = reworkInputs[rw.id] || { weight: rw.prodDispatchedQty, count: rw.prodDispatchedCount, notes: 'تم التعديل بالصالة' };
    if (inp.weight <= 0) return;

    setIsProcessing(true);
    try {
      await resubmitReworkApi({
        transferId: rw.id,
        adjustedQty: inp.weight,
        adjustedCount: inp.count,
        notes: inp.notes,
        reworkBy: currentDispatcherDisplayName
      });

      setTransfers(prev =>
        prev.map(t =>
          t.id === rw.id
            ? {
                ...t,
                prodDispatchedQty: inp.weight,
                prodDispatchedCount: inp.count,
                status: 'PENDING_COSTING'
              }
            : t
        )
      );

      setAlertMessage('تم الانتهاء من التعديل وإرسال الدفعة إلى ميزان التكاليف بنجاح!');
      setIsSuccess(true);
      setActiveTab('costing');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  // Export CSV
  const exportTransfersToCsv = () => {
    if (!transfers.length) return;
    const headers =
      'رقم_الإذن,التاريخ,الصنف,كود_الصنف,رقم_اللوط,تاريخ_الصلاحية,صالة_المصدر,مخزن_الكنترول,تسليم_الصالة_وزن,تسليم_الصالة_صاج,ميزان_التكاليف_وزن,ميزان_التكاليف_صاج,صافي_مقبول_الجودة,عينات_الجودة,مرتجع_تعديل_الصالة,تالف_جودة,مستلم_الكنترول_وزن,الحالة_الرقابية\n';
    const rows = transfers
      .map(t => {
        return `"${t.transferNumber}","${t.transferDate}","${t.itemName}","${t.itemCode}","${t.batchNumber}","${t.expiryDate || '-'}","${t.sourceWarehouseName}","${t.destinationWarehouseName}",${t.prodDispatchedQty},${t.prodDispatchedCount},${t.costingActualQty || 0},${t.costingActualCount || 0},${t.qcApprovedQty},${t.qcSampleQty},${t.qcReworkQty},${t.qcScrapQty},${t.receivedActualQty || 0},"${t.status}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سجل_تحويلات_المنتج_التام_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_COSTING': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'DISPUTE_COSTING': return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'PENDING_QC': return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'PENDING_RECEIPT': return 'bg-cyan-50 text-cyan-800 border-cyan-300';
      case 'IN_DISPUTE': return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'REWORK_IN_PRODUCTION': return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_COSTING': return '1. بانتظار ميزان التكاليف';
      case 'DISPUTE_COSTING': return '🚨 نزاع: إنتاج وتكاليف';
      case 'PENDING_QC': return '2. بانتظار فحص الجودة';
      case 'PENDING_RECEIPT': return '3. بانتظار استلام الكنترول';
      case 'IN_DISPUTE': return '🚨 نزاع: جودة وكنترول';
      case 'REWORK_IN_PRODUCTION': return '🔄 قيد التعديل بالصالة';
      case 'COMPLETED': return '✓ تم الاستلام والترصيد';
      default: return status;
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-400" />
              <span>حوكمة تحويل المنتج التام واستلام الكنترول (FG Custody Hub)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              دورة تسليم مغلقة بنظام الحلقات الرقابية
            </span>
          </div>
          <p className="text-xs text-slate-400">
            الدورة الصناعية المتكاملة: تسليم الصالة ⇦ ميزان التكاليف ⇦ فحص الجودة ⇦ استلام الكنترول ⇦ تدوير المرتجعات للتعديل.
          </p>
        </div>

        <div className="flex gap-2">
          {transfers.length > 0 && (
            <button
              onClick={exportTransfersToCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير سجل الإذونات (Excel)</span>
            </button>
          )}
          <button
            onClick={loadData}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 shadow-xs transition-colors"
          >
            <RotateCw className="w-4 h-4 text-emerald-400" />
            <span>تحديث البيانات اللحظية</span>
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

      {/* تبويبات المحطات الخمس */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-fit gap-1 mb-6 text-xs font-bold flex-wrap">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'list' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Inbox className="w-4 h-4" />
          <span>📋 سجل الإذونات والمتابعة ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'new' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>➕ 1. تسليم إنتاج الصالة</span>
        </button>

        <button
          onClick={() => setActiveTab('costing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all relative ${activeTab === 'costing' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Scale className="w-4 h-4" />
          <span>⚖️ 2. ميزان وتدقيق التكاليف</span>
          {costingList.length > 0 && (
            <span className="bg-rose-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full mr-1">
              {costingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('qc')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all relative ${activeTab === 'qc' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Microscope className="w-4 h-4" />
          <span>🔬 3. فحص وتصنيف الجودة</span>
          {pendingQcList.length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-mono text-[10px] px-1.5 py-0.2 rounded-full mr-1">
              {pendingQcList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('control')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all relative ${activeTab === 'control' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Warehouse className="w-4 h-4" />
          <span>🏢 4. استلام الكنترول ولجنة النزاع</span>
          {controlList.length > 0 && (
            <span className="bg-indigo-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full mr-1">
              {controlList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rework')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all relative ${activeTab === 'rework' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Repeat className="w-4 h-4" />
          <span>🔄 5. تشغيل وتعديل المرتجعات</span>
          {reworkList.length > 0 && (
            <span className="bg-rose-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full mr-1">
              {reworkList.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: السجل العام للمتابعة */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-2.5 px-3">رقم الإذن</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3 text-right">الصنف / التشغيلة</th>
                <th className="py-2.5 px-3">تسليم الصالة</th>
                <th className="py-2.5 px-3">ميزان التكاليف</th>
                <th className="py-2.5 px-3">مقبول الجودة</th>
                <th className="py-2.5 px-3">مستلم الكنترول</th>
                <th className="py-2.5 px-3">الحالة الرقابية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400 font-bold">
                    لا توجد أذونات تحويل مسجلة حالياً.
                  </td>
                </tr>
              ) : (
                transfers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{t.transferNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-500">{t.transferDate}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="font-bold text-gray-900">{t.itemName}</div>
                      <small className="text-gray-400 font-mono block">
                        <code>{t.batchNumber}</code> | ص: {t.expiryDate || '-'}
                      </small>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-800">{t.prodDispatchedQty.toFixed(2)}</span>
                      <small className="block text-gray-400 text-[10px]">({t.prodDispatchedCount} صاج)</small>
                    </td>
                    <td className="py-2.5 px-3">
                      {t.costingActualQty !== undefined && t.costingActualQty !== null ? (
                        <>
                          <span className={`font-mono font-bold ${t.costingDiscrepancyFlag ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {t.costingActualQty.toFixed(2)}
                          </span>
                          <small className="block text-gray-400 text-[10px]">({t.costingActualCount} صاج)</small>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {t.qcApprovedQty > 0 ? (
                        <>
                          <span className="font-mono font-bold text-emerald-700">{t.qcApprovedQty.toFixed(2)}</span>
                          {t.qcReworkQty > 0 && (
                            <small className="block text-amber-600 font-bold text-[10px]">مرتجع: {t.qcReworkQty.toFixed(2)}</small>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {t.receivedActualQty !== undefined && t.receivedActualQty !== null ? (
                        <span className="font-mono font-bold text-indigo-700">{t.receivedActualQty.toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">لم يستلم بعد</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: تسليم إنتاج الصالة */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-indigo-600 shadow-xs p-5 text-xs">
          <h6 className="font-bold text-indigo-700 mb-4 text-sm flex items-center gap-1.5">
            <Factory className="w-4 h-4" />
            <span>1. إصدار إذن تسليم منتج تام من صالة التشغيل</span>
          </h6>

          <form onSubmit={handleSubmitNewTransfer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">مخزن صالة التشغيل (المصدر) *</label>
                <select
                  value={newTransfer.sourceWarehouseId}
                  onChange={(e) => handleSourceWarehouseChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value={0}>-- اختر صالة التشغيل --</option>
                  {warehouses
                    .filter(w => w.warehouseType === 'صالة تشغيل' || w.warehouseName.includes('صالة'))
                    .map(w => (
                      <option key={w.id} value={w.id}>{w.warehouseName}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">مخزن الكنترول (الوجهة) *</label>
                <select
                  value={newTransfer.destinationWarehouseId}
                  onChange={(e) => setNewTransfer({ ...newTransfer, destinationWarehouseId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value={0}>-- اختر مخزن الكنترول --</option>
                  {warehouses
                    .filter(w => w.warehouseName.includes('كنترول') || w.warehouseCode === '1000' || w.warehouseType !== 'صالة تشغيل')
                    .map(w => (
                      <option key={w.id} value={w.id}>{w.warehouseName}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">المنتج التام المسلّم *</label>
                <select
                  value={newTransfer.itemId}
                  onChange={(e) => handleItemSelected(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value={0}>-- اختر المنتج --</option>
                  {displayedItems.map(itm => (
                    <option key={itm.id} value={itm.id}>{itm.itemName} ({itm.itemCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">رقم التشغيلة / اللوط</label>
                <input
                  type="text"
                  readOnly
                  placeholder="يُولّد آلياً"
                  value={newTransfer.batchNumber}
                  className="w-full px-3 py-2 bg-slate-100 border rounded-xl font-mono text-indigo-700 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">الكمية الصافية ({selectedItemUnit}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min={0.1}
                  required
                  value={newTransfer.dispatchedQty || ''}
                  onChange={(e) => setNewTransfer({ ...newTransfer, dispatchedQty: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-black text-indigo-700 text-center"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">عدد الصواني / الصناديق *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newTransfer.dispatchedCount || ''}
                  onChange={(e) => setNewTransfer({ ...newTransfer, dispatchedCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">تاريخ الصلاحية</label>
                <input
                  type="date"
                  value={newTransfer.expiryDate}
                  onChange={(e) => setNewTransfer({ ...newTransfer, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">مشرف الصالة المسلّم</label>
                <input
                  type="text"
                  readOnly
                  value={currentDispatcherDisplayName}
                  className="w-full px-3 py-2 bg-slate-100 border rounded-xl font-bold text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">ملاحظات التشغيل والتحويل</label>
              <input
                type="text"
                placeholder="مثال: تسليم تشغيل وردية أولى..."
                value={newTransfer.notes || ''}
                onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              {isProcessing ? '⏳ جارٍ الإرسال...' : '✓ إرسال الإذن لميزان ورقابة التكاليف'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: ميزان وتدقيق التكاليف */}
      {activeTab === 'costing' && (
        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-slate-800 shadow-xs p-5 text-xs">
          <h6 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>⚖️ محطة ميزان التكاليف وبوابة نزاع الإنتاج</span>
          </h6>

          {costingList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold">
              لا توجد أذونات بانتظار وزن وتدقيق التكاليف حالياً.
            </div>
          ) : (
            <div className="space-y-4">
              {costingList.map(trf => {
                const inp = auditInputs[trf.id] || { weight: trf.prodDispatchedQty, count: trf.prodDispatchedCount, notes: '' };
                const hasDiff = inp.weight !== trf.prodDispatchedQty || inp.count !== trf.prodDispatchedCount;

                return (
                  <div
                    key={trf.id}
                    className={`p-4 rounded-xl border ${trf.status === 'DISPUTE_COSTING' ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50 border-gray-200'}`}
                  >
                    {trf.status === 'DISPUTE_COSTING' && (
                      <div className="mb-3 p-3 bg-rose-100 text-rose-900 rounded-xl flex justify-between items-center font-bold">
                        <span>🚨 نزاع نشط بين الإنتاج والتكاليف: {trf.costingDisputeReason}</span>
                        <button
                          onClick={() => {
                            setSelectedCostingDispute(trf);
                            setCostingDisputeFinalWeight(trf.costingActualQty ?? trf.prodDispatchedQty);
                            setCostingDisputeFinalCount(trf.costingActualCount ?? trf.prodDispatchedCount);
                            setCostingDisputeNotes('');
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
                        >
                          ⚖️ فض نزاع التكاليف والإنتاج
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-3">
                        <span className="font-mono font-bold text-indigo-700">{trf.transferNumber}</span>
                        <div className="font-bold text-gray-900 mt-0.5">{trf.itemName}</div>
                        <small className="text-gray-400 font-mono">تشغيلة: {trf.batchNumber}</small>
                      </div>

                      <div className="md:col-span-3 border-r pr-3">
                        <span className="text-gray-400 block text-[10px]">تسليم الصالة المعتمد:</span>
                        <span className="font-mono font-black text-slate-800 text-sm">{trf.prodDispatchedQty.toFixed(2)} كجم</span>
                        <span className="text-gray-500 mr-2 font-mono">({trf.prodDispatchedCount} صاج)</span>
                      </div>

                      <div className="md:col-span-4">
                        <div className="grid grid-cols-2 gap-2 mb-1">
                          <div>
                            <label className="block text-rose-700 font-bold text-[10px] mb-0.5">الكمية الفعلية بالميزان *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={inp.weight}
                              onChange={(e) =>
                                setAuditInputs(prev => ({
                                  ...prev,
                                  [trf.id]: { ...inp, weight: Number(e.target.value) }
                                }))
                              }
                              className="w-full px-2 py-1 bg-white border border-rose-300 rounded font-mono font-bold text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-rose-700 font-bold text-[10px] mb-0.5">عدد الصواني / الصاجات *</label>
                            <input
                              type="number"
                              value={inp.count}
                              onChange={(e) =>
                                setAuditInputs(prev => ({
                                  ...prev,
                                  [trf.id]: { ...inp, count: Number(e.target.value) }
                                }))
                              }
                              className="w-full px-2 py-1 bg-white border border-rose-300 rounded font-mono font-bold text-center"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="ملاحظات الميزان والتكاليف..."
                          value={inp.notes}
                          onChange={(e) =>
                            setAuditInputs(prev => ({
                              ...prev,
                              [trf.id]: { ...inp, notes: e.target.value }
                            }))
                          }
                          className="w-full px-2 py-1 bg-white border rounded text-[11px]"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5 text-center">
                        {trf.status !== 'DISPUTE_COSTING' && (
                          <>
                            <button
                              onClick={() => handleSubmitCostingAudit(trf, false)}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                            >
                              ✓ اعتماد وتمرير للجودة
                            </button>
                            {hasDiff && (
                              <button
                                onClick={() => handleSubmitCostingAudit(trf, true)}
                                className="w-full py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-lg"
                              >
                                🚨 تصعيد نزاع للجنة
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: فحص وتصنيف الجودة */}
      {activeTab === 'qc' && (
        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-amber-500 shadow-xs p-5 text-xs">
          <h6 className="font-bold text-amber-800 mb-4 text-sm flex items-center gap-1.5">
            <Microscope className="w-4 h-4 text-amber-600" />
            <span>🔬 محطة توكيد الجودة (QC) - ميزان الخصم الصارم</span>
          </h6>

          {pendingQcList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold">
              لا توجد أذونات بانتظار فحص الجودة حالياً.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQcList.map(trf => {
                const baseCosting = trf.costingActualQty ?? trf.prodDispatchedQty;
                const inp = qcInputs[trf.id] || { sample: 0, rework: 0, scrap: 0, notes: '' };
                const netApproved = baseCosting - (inp.sample + inp.rework + inp.scrap);

                return (
                  <div key={trf.id} className="p-4 rounded-xl border border-gray-200 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-indigo-700 text-sm ml-2">{trf.transferNumber}</span>
                        <span className="font-bold text-gray-900">{trf.itemName}</span>
                        <span className="bg-slate-200 text-slate-800 font-mono font-bold px-2 py-0.5 rounded mr-3 text-[11px]">
                          كمية التكاليف المعتمدة: {baseCosting.toFixed(2)} كجم
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-mono font-bold ${netApproved >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {netApproved >= 0 ? `✓ الصافي للكنترول: ${netApproved.toFixed(2)} كجم` : '⚠️ خطأ: مجموع الخصومات أكبر من وزن التكاليف!'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-10 grid grid-cols-4 gap-2 text-center">
                        <div>
                          <label className="block text-emerald-700 font-bold text-[10px] mb-1">مقبول للكنترول (تلقائي)</label>
                          <input
                            type="number"
                            readOnly
                            value={netApproved >= 0 ? netApproved.toFixed(2) : 0}
                            className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded font-mono font-black text-emerald-700 text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-cyan-700 font-bold text-[10px] mb-1">عينة فحص معملي</label>
                          <input
                            type="number"
                            step="0.01"
                            value={inp.sample}
                            onChange={(e) =>
                              setQcInputs(prev => ({
                                ...prev,
                                [trf.id]: { ...inp, sample: Number(e.target.value) }
                              }))
                            }
                            className="w-full px-2 py-1 bg-white border border-cyan-300 rounded font-mono font-bold text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-amber-700 font-bold text-[10px] mb-1">مرتجع للصالة للتعديل</label>
                          <input
                            type="number"
                            step="0.01"
                            value={inp.rework}
                            onChange={(e) =>
                              setQcInputs(prev => ({
                                ...prev,
                                [trf.id]: { ...inp, rework: Number(e.target.value) }
                              }))
                            }
                            className="w-full px-2 py-1 bg-white border border-amber-300 rounded font-mono font-bold text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-rose-700 font-bold text-[10px] mb-1">إهلاك وتالف فني</label>
                          <input
                            type="number"
                            step="0.01"
                            value={inp.scrap}
                            onChange={(e) =>
                              setQcInputs(prev => ({
                                ...prev,
                                [trf.id]: { ...inp, scrap: Number(e.target.value) }
                              }))
                            }
                            className="w-full px-2 py-1 bg-white border border-rose-300 rounded font-mono font-bold text-center"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <button
                          onClick={() => handleSubmitQcInspection(trf)}
                          disabled={netApproved < 0 || isProcessing}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xs disabled:opacity-50"
                        >
                          ✓ إفراج وتوجيه
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: استلام الكنترول الفعلي */}
      {activeTab === 'control' && (
        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-indigo-600 shadow-xs p-5 text-xs">
          <h6 className="font-bold text-indigo-900 mb-4 text-sm flex items-center gap-1.5">
            <Warehouse className="w-4 h-4 text-indigo-600" />
            <span>🏢 استلام مخزن الكنترول الفعلي وبوابة نزاع الكنترول</span>
          </h6>

          {controlList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold">
              لا توجد شحنات معلقة لاستلام الكنترول أو نزاعات مفتوحة.
            </div>
          ) : (
            <div className="space-y-4">
              {controlList.map(trf => {
                const inp = controlInputs[trf.id] || { qty: trf.qcApprovedQty, count: trf.costingActualCount ?? trf.prodDispatchedCount, notes: '' };

                return (
                  <div
                    key={trf.id}
                    className={`p-4 rounded-xl border ${trf.status === 'IN_DISPUTE' ? 'bg-rose-50/60 border-rose-300' : 'bg-slate-50 border-gray-200'}`}
                  >
                    {trf.status === 'IN_DISPUTE' && (
                      <div className="mb-3 p-3 bg-rose-100 text-rose-900 rounded-xl flex justify-between items-center font-bold">
                        <span>🚨 نزاع نشط بين الجودة والكنترول: {trf.disputeReason}</span>
                        <button
                          onClick={() => {
                            setSelectedDisputeTransfer(trf);
                            setDisputeFinalQty(trf.receivedActualQty ?? trf.qcApprovedQty);
                            setDisputeResolutionNotes('');
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
                        >
                          ⚖️ فض نزاع الكنترول واعتماد التسوية
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-3">
                        <span className="font-mono font-bold text-indigo-700">{trf.transferNumber}</span>
                        <div className="font-bold text-gray-900 mt-0.5">{trf.itemName}</div>
                        <small className="text-gray-500 block">
                          المفرج عنه الصافي: <strong className="text-emerald-700 font-mono text-sm">{trf.qcApprovedQty.toFixed(2)}</strong> كجم
                        </small>
                      </div>

                      <div className="md:col-span-4">
                        <div className="grid grid-cols-2 gap-2 mb-1">
                          <div>
                            <label className="block text-gray-700 font-bold text-[10px] mb-0.5">الكمية المستلمة فعلياً *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={inp.qty}
                              onChange={(e) =>
                                setControlInputs(prev => ({
                                  ...prev,
                                  [trf.id]: { ...inp, qty: Number(e.target.value) }
                                }))
                              }
                              className="w-full px-2 py-1 bg-white border border-indigo-300 rounded font-mono font-black text-indigo-700 text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold text-[10px] mb-0.5">العدد الفعلي المستلم *</label>
                            <input
                              type="number"
                              value={inp.count}
                              onChange={(e) =>
                                setControlInputs(prev => ({
                                  ...prev,
                                  [trf.id]: { ...inp, count: Number(e.target.value) }
                                }))
                              }
                              className="w-full px-2 py-1 bg-white border rounded font-mono font-bold text-center"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="ملاحظات أمين مخزن الكنترول..."
                          value={inp.notes}
                          onChange={(e) =>
                            setControlInputs(prev => ({
                              ...prev,
                              [trf.id]: { ...inp, notes: e.target.value }
                            }))
                          }
                          className="w-full px-2 py-1 bg-white border rounded text-[11px]"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-gray-400 font-bold text-[10px] mb-0.5">أمين المخزن المستلم:</label>
                        <input
                          type="text"
                          readOnly
                          value={currentDispatcherDisplayName}
                          className="w-full px-2 py-1 bg-slate-100 border rounded text-[11px] font-bold text-gray-600"
                        />
                      </div>

                      <div className="md:col-span-2 text-center">
                        {trf.status !== 'IN_DISPUTE' ? (
                          <button
                            onClick={() => handleSubmitControlReceipt(trf)}
                            disabled={isProcessing}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                          >
                            {isProcessing ? '⏳ جارٍ الترصيد...' : '📥 تأكيد الاستلام'}
                          </button>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold block">
                            مجمد بقرار نزاع
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: تشغيل وتعديل المرتجعات */}
      {activeTab === 'rework' && (
        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-rose-600 shadow-xs p-5 text-xs">
          <h6 className="font-bold text-rose-700 mb-4 text-sm flex items-center gap-1.5">
            <Repeat className="w-4 h-4 text-rose-600" />
            <span>🔄 تشغيل وتعديل مرتجعات الجودة داخل الصالة</span>
          </h6>

          {reworkList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold">
              لا توجد كميات مرتجعة للتعديل بالصالة حالياً. كل التشغيلات معتمدة!
            </div>
          ) : (
            <div className="space-y-4">
              {reworkList.map(rw => {
                const inp = reworkInputs[rw.id] || { weight: rw.prodDispatchedQty, count: rw.prodDispatchedCount, notes: 'تم التعديل بالصالة' };

                return (
                  <div key={rw.id} className="p-4 rounded-xl border border-gray-200 bg-slate-50 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-3">
                      <span className="bg-rose-100 text-rose-800 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                        إذن مرتجع: {rw.transferNumber}
                      </span>
                      <div className="font-bold text-gray-900 mt-1">{rw.itemName}</div>
                      <small className="text-gray-400 font-mono">تشغيلة: {rw.batchNumber}</small>
                    </div>

                    <div className="md:col-span-3 border-r pr-3">
                      <span className="text-rose-600 font-bold block text-[10px]">الكمية المطلوب تعديلها:</span>
                      <span className="font-mono font-black text-rose-700 text-base">{rw.prodDispatchedQty.toFixed(2)} كجم</span>
                    </div>

                    <div className="md:col-span-4">
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <div>
                          <label className="block text-gray-700 font-bold text-[10px] mb-0.5">الوزن بعد التعديل *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={inp.weight}
                            onChange={(e) =>
                              setReworkInputs(prev => ({
                                ...prev,
                                [rw.id]: { ...inp, weight: Number(e.target.value) }
                              }))
                            }
                            className="w-full px-2 py-1 bg-white border border-emerald-400 rounded font-mono font-black text-emerald-700 text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-[10px] mb-0.5">العدد بعد التعديل *</label>
                          <input
                            type="number"
                            value={inp.count}
                            onChange={(e) =>
                              setReworkInputs(prev => ({
                                ...prev,
                                [rw.id]: { ...inp, count: Number(e.target.value) }
                              }))
                            }
                            className="w-full px-2 py-1 bg-white border rounded font-mono font-bold text-center"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="الإجراء الفني المتخذ لتصحيح العيب..."
                        value={inp.notes}
                        onChange={(e) =>
                          setReworkInputs(prev => ({
                            ...prev,
                            [rw.id]: { ...inp, notes: e.target.value }
                          }))
                        }
                        className="w-full px-2 py-1 bg-white border rounded text-[11px]"
                      />
                    </div>

                    <div className="md:col-span-2 text-center">
                      <button
                        onClick={() => handleSubmitRework(rw)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                      >
                        ✓ إعادة إرسال للتكاليف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* نافذة فض نزاع بوابة التكاليف والإنتاج */}
      {selectedCostingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-rose-700 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Gavel className="w-4 h-4 text-white" />
                <span>اجتماع لجنة الإنتاج والتكاليف - حسم تضارب الأوزان</span>
              </h4>
              <button onClick={() => setSelectedCostingDispute(null)} className="text-white">×</button>
            </div>

            <form onSubmit={handleResolveCostingDispute} className="p-5 space-y-3">
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <div><strong>الإذن:</strong> {selectedCostingDispute.transferNumber}</div>
                <div><strong>الصنف:</strong> {selectedCostingDispute.itemName}</div>
                <div><strong>سبب النزاع:</strong> {selectedCostingDispute.costingDisputeReason}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الوزن النهائي المعتمد للجودة *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costingDisputeFinalWeight}
                    onChange={(e) => setCostingDisputeFinalWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">العدد النهائي المعتمد *</label>
                  <input
                    type="number"
                    required
                    value={costingDisputeFinalCount}
                    onChange={(e) => setCostingDisputeFinalCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">تحميل فرق الوزن ومسؤولية الانحراف *</label>
                <select
                  value={costingDisputeChargeTo}
                  onChange={(e) => setCostingDisputeChargeTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value="عجز تصنيع يُحمّل على تقرير وردية الصالة">عجز تصنيع يُحمّل على تقرير وردية الصالة</option>
                  <option value="جفاف وفقد طبيعي أثناء التبريد والتكييف">جفاف وفقد طبيعي أثناء التبريد والتكييف</option>
                  <option value="خطأ في قراءة وتصفير ميزان الصالة (تصحيح)">خطأ في قراءة وتصفير ميزان الصالة (تصحيح)</option>
                  <option value="سقوط أو هدر أثناء النقل الداخلي">سقوط أو هدر أثناء النقل الداخلي</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">محضر وتفاصيل قرار اللجنة *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="أسباب القرار المشترك..."
                  value={costingDisputeNotes}
                  onChange={(e) => setCostingDisputeNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedCostingDispute(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  ✓ اعتماد قرار التكاليف والتمرير للجودة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة فض نزاع بوابة الجودة والكنترول */}
      {selectedDisputeTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-rose-700 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Gavel className="w-4 h-4 text-white" />
                <span>اجتماع لجنة فض المنازعات - تسوية عجز الكنترول</span>
              </h4>
              <button onClick={() => setSelectedDisputeTransfer(null)} className="text-white">×</button>
            </div>

            <form onSubmit={handleResolveDispute} className="p-5 space-y-3">
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <div><strong>الإذن:</strong> {selectedDisputeTransfer.transferNumber}</div>
                <div><strong>الصنف:</strong> {selectedDisputeTransfer.itemName}</div>
                <div><strong>سبب النزاع:</strong> {selectedDisputeTransfer.disputeReason}</div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">الكمية النهائية المعتمدة لدخول الكنترول *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={disputeFinalQty}
                  onChange={(e) => setDisputeFinalQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-black text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">توجيه العجز وتحميل المسؤولية *</label>
                <select
                  value={controlDisputeChargeTo}
                  onChange={(e) => setControlDisputeChargeTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value="عهدة سائق وعامل النقل الداخلي">عهدة سائق وعامل النقل الداخلي</option>
                  <option value="هدر وتلف أثناء النقل والتحميل">هدر وتلف أثناء النقل والتحميل</option>
                  <option value="جفاف وفقد طبيعي أثناء التخزين">جفاف وفقد طبيعي أثناء التخزين</option>
                  <option value="تسوية جردية دائنة / مدينة للمخزن">تسوية جردية دائنة / مدينة للمخزن</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">قرار اللجنة ومحضر التسوية *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="محضر اللجنة المشتركة..."
                  value={disputeResolutionNotes}
                  onChange={(e) => setDisputeResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeTransfer(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  ✓ اعتماد قرار اللجنة وترصيد الكنترول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
