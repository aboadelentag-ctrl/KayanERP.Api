import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileSpreadsheet,
  Printer,
  Eye,
  Gavel,
  Trash2,
  PackageCheck,
  Scale,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchTransfersLookupsApi,
  fetchBranchTransfersApi,
  submitMultiDispatchApi,
  submitReceiveLineApi,
  submitResolveDisputeApi
} from './transfersApi';
import type {
  BranchLookupDto,
  WarehouseLookupDto,
  ItemLookupDto,
  BranchTransferViewItem,
  DispatchItemRowModel,
  MultiDispatchFormModel,
  ManifestGroupModel
} from './transfersApi';

interface TransfersPageProps {
  onNavigate?: (tab: string) => void;
}

export const TransfersPage: React.FC<TransfersPageProps> = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'dispatch' | 'receive' | 'dispute'>('list');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterBranchId, setFilterBranchId] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Lookups & Data
  const [branches, setBranches] = useState<BranchLookupDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseLookupDto[]>([]);
  const [finishedItems, setFinishedItems] = useState<ItemLookupDto[]>([]);
  const [transfers, setTransfers] = useState<BranchTransferViewItem[]>([]);

  // Dispatch Form
  const [multiDispatch, setMultiDispatch] = useState<MultiDispatchFormModel>({
    companyId: 1,
    sourceWarehouseId: 1,
    destinationWarehouseId: 0,
    destinationBranchId: 0,
    driverName: '',
    vehicleNumber: '',
    dispatcherName: '',
    notes: '',
    items: [
      { itemId: 0, dispatchedQty: 10, containerType: 'سرفيس', innerCount: 1, crateCount: 1 }
    ]
  });

  // Modal details & print
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedManifest, setSelectedManifest] = useState<ManifestGroupModel | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsProcessing(true);
    try {
      const [lookups, trfs] = await Promise.all([
        fetchTransfersLookupsApi(1),
        fetchBranchTransfersApi(1)
      ]);
      setBranches(lookups.branches);
      setWarehouses(lookups.warehouses);
      setFinishedItems(lookups.items);

      const mapped = trfs.map(t => ({
        ...t,
        tempReceivedQty: t.tempReceivedQty ?? t.dispatchedQty,
        tempReceivedInnerCount: t.tempReceivedInnerCount ?? t.innerCount,
        tempReceivedCrateCount: t.tempReceivedCrateCount ?? t.crateCount,
        tempFinalQty: t.tempFinalQty ?? (t.receivedQty ?? t.dispatchedQty),
        tempChargeTo: t.tempChargeTo || 'عهدة سائق التوزيع'
      }));
      setTransfers(mapped);
    } catch (ex: any) {
      setAlertMessage(`خطأ في جلب البيانات: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const getBaseManifestNumber = (num: string) => {
    if (!num) return '';
    const parts = num.split('-');
    if (parts.length >= 4) return `${parts[0]}-${parts[1]}-${parts[2]}`;
    return num;
  };

  const groupedManifests = useMemo(() => {
    let list = transfers;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(t =>
        t.transferNumber.toLowerCase().includes(term) ||
        (t.driverName && t.driverName.toLowerCase().includes(term)) ||
        t.itemName.toLowerCase().includes(term)
      );
    }

    if (filterBranchId > 0) {
      list = list.filter(t => t.destinationBranchId === filterBranchId);
    }

    if (filterStatus) {
      list = list.filter(t => t.status === filterStatus);
    }

    const groups: { [key: string]: BranchTransferViewItem[] } = {};
    list.forEach(t => {
      const base = getBaseManifestNumber(t.transferNumber);
      if (!groups[base]) groups[base] = [];
      groups[base].push(t);
    });

    return Object.keys(groups).map(base => {
      const lines = groups[base];
      const first = lines[0];
      const hasDispute = lines.some(l => l.status === 'IN_DISPUTE');
      const hasTransit = lines.some(l => l.status === 'IN_TRANSIT');

      const manifest: ManifestGroupModel = {
        manifestBaseNumber: base,
        transferDate: first.transferDate,
        sourceWarehouseName: first.sourceWarehouseName,
        destinationBranchName: first.destinationBranchName,
        destinationWarehouseName: first.destinationWarehouseName,
        driverName: first.driverName,
        vehicleNumber: first.vehicleNumber,
        lines,
        totalDispatchedQty: lines.reduce((acc, curr) => acc + curr.dispatchedQty, 0),
        totalReceivedQty: lines.reduce((acc, curr) => acc + (curr.receivedQty || 0), 0),
        totalInnerCount: lines.reduce((acc, curr) => acc + curr.innerCount, 0),
        totalCrateCount: lines.reduce((acc, curr) => acc + curr.crateCount, 0),
        overallStatus: hasDispute ? 'IN_DISPUTE' : hasTransit ? 'IN_TRANSIT' : 'COMPLETED'
      };
      return manifest;
    });
  }, [transfers, searchTerm, filterBranchId, filterStatus]);

  const inTransitManifests = useMemo(() => {
    return groupedManifests.filter(m => m.lines.some(l => l.status === 'IN_TRANSIT'));
  }, [groupedManifests]);

  const disputedItems = useMemo(() => {
    return transfers.filter(t => t.status === 'IN_DISPUTE');
  }, [transfers]);

  const inTransitCount = useMemo(() => transfers.filter(t => t.status === 'IN_TRANSIT').length, [transfers]);

  const handleBranchChange = (branchId: number) => {
    const branchWhs = warehouses.filter(w => w.branchId === branchId);
    setMultiDispatch(prev => ({
      ...prev,
      destinationBranchId: branchId,
      destinationWarehouseId: branchWhs[0]?.id || 0
    }));
  };

  const handleItemSelect = (index: number, itemId: number) => {
    const itm = finishedItems.find(x => x.id === itemId);
    let containerType = 'صاج/صينية';
    if (itm) {
      if (itm.itemName.includes('جاتوه') || itm.itemName.includes('سواريه')) containerType = 'سرفيس';
      else if (itm.itemName.includes('تورت')) containerType = 'علبة/كرتونة';
    }

    setMultiDispatch(prev => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        itemId,
        containerType,
        batchNumber: `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${itemId.toString().padStart(2, '0')}`
      };
      return { ...prev, items };
    });
  };

  const addDispatchLine = () => {
    setMultiDispatch(prev => ({
      ...prev,
      items: [...prev.items, { itemId: 0, dispatchedQty: 10, containerType: 'سرفيس', innerCount: 1, crateCount: 1 }]
    }));
  };

  const removeDispatchLine = (idx: number) => {
    if (multiDispatch.items.length <= 1) return;
    setMultiDispatch(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmitDispatch = async () => {
    if (multiDispatch.destinationBranchId <= 0 || multiDispatch.destinationWarehouseId <= 0) {
      setAlertMessage('يرجى تحديد الفرع ومستودع الفرع المستلم.');
      setIsSuccess(false);
      return;
    }

    const validItems = multiDispatch.items.filter(i => i.itemId > 0 && i.dispatchedQty > 0);
    if (validItems.length === 0) {
      setAlertMessage('يجب إضافة صنف واحد على الأقل مع تحديد كمية صالحة.');
      setIsSuccess(false);
      return;
    }

    setIsProcessing(true);
    try {
      await submitMultiDispatchApi(multiDispatch);

      const targetBranch = branches.find(b => b.id === multiDispatch.destinationBranchId);
      const targetWh = warehouses.find(w => w.id === multiDispatch.destinationWarehouseId);
      const manifestNum = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

      const newRows: BranchTransferViewItem[] = validItems.map((itm, idx) => {
        const fullItem = finishedItems.find(f => f.id === itm.itemId);
        return {
          id: Date.now() + idx,
          transferNumber: `${manifestNum}-${(idx + 1).toString().padStart(2, '0')}`,
          transferDate: new Date().toISOString().slice(0, 10),
          destinationBranchId: multiDispatch.destinationBranchId,
          sourceWarehouseName: 'مستودع الكنترول المركزي (المصنع)',
          destinationWarehouseName: targetWh?.warehouseName || 'مستودع الفرع',
          destinationBranchName: targetBranch?.branchName || 'فرع المعرض',
          itemName: fullItem?.itemName || 'منتج تام',
          itemCode: fullItem?.itemCode || 'FG',
          unit: fullItem?.unit || 'قطعة',
          batchNumber: itm.batchNumber,
          dispatchedQty: Number(itm.dispatchedQty),
          containerType: itm.containerType,
          innerCount: Number(itm.innerCount),
          crateCount: Number(itm.crateCount),
          driverName: multiDispatch.driverName,
          vehicleNumber: multiDispatch.vehicleNumber,
          status: 'IN_TRANSIT',
          tempReceivedQty: Number(itm.dispatchedQty),
          tempReceivedInnerCount: Number(itm.innerCount),
          tempReceivedCrateCount: Number(itm.crateCount),
          tempNotes: ''
        };
      });

      setTransfers(prev => [...newRows, ...prev]);
      setAlertMessage('✓ تم شحن المانيفست بالكامل وتحديث عهدة الطريق بنجاح!');
      setIsSuccess(true);
      setActiveTab('list');
      setMultiDispatch({
        companyId: 1,
        sourceWarehouseId: 1,
        destinationWarehouseId: 0,
        destinationBranchId: 0,
        driverName: '',
        vehicleNumber: '',
        dispatcherName: '',
        notes: '',
        items: [{ itemId: 0, dispatchedQty: 10, containerType: 'سرفيس', innerCount: 1, crateCount: 1 }]
      });
    } catch (ex: any) {
      setAlertMessage(`خطأ: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };

  const handleReceiveLine = async (item: BranchTransferViewItem) => {
    setIsProcessing(true);
    try {
      const recQty = Number(item.tempReceivedQty ?? item.dispatchedQty);
      const isShortage = recQty < item.dispatchedQty;

      await submitReceiveLineApi({
        transferId: item.id,
        receivedQty: recQty,
        receivedInnerCount: item.tempReceivedInnerCount,
        receivedCrateCount: item.tempReceivedCrateCount,
        notes: item.tempNotes
      });

      setTransfers(prev =>
        prev.map(t =>
          t.id === item.id
            ? {
                ...t,
                receivedQty: recQty,
                receivedInnerCount: item.tempReceivedInnerCount,
                receivedCrateCount: item.tempReceivedCrateCount,
                status: isShortage ? 'IN_DISPUTE' : 'COMPLETED',
                disputeReason: isShortage ? `عجز (${item.dispatchedQty - recQty}) ${item.unit}` : undefined,
                tempFinalQty: recQty
              }
            : t
        )
      );

      setAlertMessage(
        isShortage
          ? `⚠️ تم إثبات استلام مع وجود عجز ونقل الصنف للجنة فض المنازعات!`
          : `✓ تم اعتماد استلام صنف (${item.ItemName || item.itemName}) كاملاً بنجاح!`
      );
      setIsSuccess(!isShortage);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handleResolveDispute = async (trf: BranchTransferViewItem) => {
    setIsProcessing(true);
    try {
      await submitResolveDisputeApi({
        transferId: trf.id,
        finalAcceptedQty: trf.tempFinalQty,
        chargeTo: trf.tempChargeTo
      });

      setTransfers(prev =>
        prev.map(t =>
          t.id === trf.id
            ? {
                ...t,
                status: 'COMPLETED',
                receivedQty: trf.tempFinalQty
              }
            : t
        )
      );

      setAlertMessage(`⚖️ تم فض نزاع صنف (${trf.itemName}) وتوزيع المسؤولية على (${trf.tempChargeTo}) بنجاح!`);
      setIsSuccess(true);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handlePrint = (m: ManifestGroupModel) => {
    setSelectedManifest(m);
    setShowPrintModal(true);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة اللوجستية التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Truck className="w-6 h-6 text-indigo-400" />
              <span>حوكمة تحويل وإمداد الفروع واستلام المنافذ (Branch Transfers & Logistics)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              إدارة حركة المانيفست وسلاسل التوريد
            </span>
          </div>
          <p className="text-xs text-slate-400">
            شحن متعدد الأصناف ⇦ مانيفست التوزيع ⇦ متابعة السرافيس والأسبات ⇦ لجنة فض منازعات عجز النقل.
          </p>
        </div>

        <button
          onClick={loadAll}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
        >
          <RotateCw className="w-4 h-4 text-emerald-400" />
          <span>تحديث لحظي</span>
        </button>
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

      {/* شريط التبويبات الرئيسي */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-fit gap-1 mb-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'list' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Layers className="w-4 h-4" />
          <span>📋 سجل الشحنات والمانيفست ({groupedManifests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'dispatch' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Truck className="w-4 h-4" />
          <span>🚚 1. شحن وتوجيه مانيفست متعدد الأصناف</span>
        </button>
        <button
          onClick={() => setActiveTab('receive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'receive' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>📥 2. استلام ومطابقة عهدة الفرع</span>
          {inTransitCount > 0 && (
            <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black">
              {inTransitCount} صنف
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'dispute' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Scale className="w-4 h-4" />
          <span>⚖️ 3. لجنة فض منازعات عجز النقل</span>
          {disputedItems.length > 0 && (
            <span className="bg-rose-500 text-white px-2 py-0.2 rounded-full text-[10px] font-black">
              {disputedItems.length} نزاع
            </span>
          )}
        </button>
      </div>

      {/* تبويب 1: سجل الشحنات والمانيفست */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث برقم الشحنة، السائق، الصنف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <select
              value={filterBranchId}
              onChange={(e) => setFilterBranchId(Number(e.target.value))}
              className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
            >
              <option value={0}>كل الفروع المستلمة</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
            >
              <option value="">كل الحالات</option>
              <option value="IN_TRANSIT">في الطريق 🚚</option>
              <option value="IN_DISPUTE">نزاع عجز 🚨</option>
              <option value="COMPLETED">مكتمل ومستلم ✓</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <table className="w-full text-center">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-3 px-3">رقم الشحنة</th>
                  <th className="py-3 px-3">التاريخ</th>
                  <th className="py-3 px-3">المستودع المصدر</th>
                  <th className="py-3 px-3">الفرع المستلم</th>
                  <th className="py-3 px-3">السائق والسيارة</th>
                  <th className="py-3 px-3">الأصناف</th>
                  <th className="py-3 px-3">المشحون</th>
                  <th className="py-3 px-3">المستلم</th>
                  <th className="py-3 px-3">الأوعية</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedManifests.map(m => (
                  <tr key={m.manifestBaseNumber} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{m.manifestBaseNumber}</td>
                    <td className="py-3 px-3 font-mono text-gray-500">{m.transferDate}</td>
                    <td className="py-3 px-3 font-medium text-gray-700">{m.sourceWarehouseName}</td>
                    <td className="py-3 px-3 font-bold text-amber-700">{m.destinationBranchName}</td>
                    <td className="py-3 px-3 text-gray-800">
                      <div>{m.driverName || '---'}</div>
                      <small className="font-mono text-gray-400">{m.vehicleNumber}</small>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">{m.lines.length} صنف</td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-900">{m.totalDispatchedQty.toFixed(1)}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className={m.totalReceivedQty < m.totalDispatchedQty ? 'text-rose-600' : 'text-emerald-700'}>
                        {m.totalReceivedQty.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="text-gray-700">{m.totalInnerCount} وعاء</span> / <span className="text-amber-700">{m.totalCrateCount} سبت</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          m.overallStatus === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.overallStatus === 'IN_DISPUTE'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {m.overallStatus === 'COMPLETED' ? 'مكتمل ✓' : m.overallStatus === 'IN_DISPUTE' ? 'نزاع عجز 🚨' : 'في الطريق 🚚'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => { setSelectedManifest(m); setShowDetailsModal(true); }}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>تفاصيل</span>
                        </button>
                        <button
                          onClick={() => handlePrint(m)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>طباعة</span>
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

      {/* تبويب 2: شحن وتوجيه مانيفست متعدد الأصناف */}
      {activeTab === 'dispatch' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 text-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <span>إصدار إذن شحن ومانيفست توزيع (حلويات تامة وأوعية النقل)</span>
              </h3>
              <p className="text-gray-500 text-[11px] mt-0.5">يتم ربط الصنف باللوط تلقائياً وتحديد السرافيس، الصواني، والأسبات بشكل منفصل.</p>
            </div>
            <button
              onClick={addDispatchLine}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة صنف للشحنة</span>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border grid grid-cols-4 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">الفرع المستهدف *</label>
              <select
                value={multiDispatch.destinationBranchId}
                onChange={(e) => handleBranchChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
              >
                <option value={0}>-- اختر الفرع --</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.branchName} ({b.branchCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">مستودع الفرع المستلم *</label>
              <select
                value={multiDispatch.destinationWarehouseId}
                onChange={(e) => setMultiDispatch({ ...multiDispatch, destinationWarehouseId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
              >
                <option value={0}>-- اختر المستودع --</option>
                {warehouses.filter(w => w.branchId === multiDispatch.destinationBranchId).map(w => (
                  <option key={w.id} value={w.id}>{w.warehouseName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">اسم السائق / المندوب *</label>
              <input
                type="text"
                placeholder="اسم السائق المسؤول"
                value={multiDispatch.driverName || ''}
                onChange={(e) => setMultiDispatch({ ...multiDispatch, driverName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">رقم لوحة السيارة</label>
              <input
                type="text"
                placeholder="مثال: أ ب ج 512"
                value={multiDispatch.vehicleNumber || ''}
                onChange={(e) => setMultiDispatch({ ...multiDispatch, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono"
              />
            </div>

            <div className="col-span-4">
              <label className="block text-gray-700 font-bold mb-1">ملاحظات خط سير الشحنة</label>
              <input
                type="text"
                placeholder="توجيهات التسليم والتفريغ..."
                value={multiDispatch.notes || ''}
                onChange={(e) => setMultiDispatch({ ...multiDispatch, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-center">
              <thead className="bg-slate-100 text-gray-700">
                <tr>
                  <th className="py-2.5 px-3 text-right">المنتج التام (حلويات فقط)</th>
                  <th className="py-2.5 px-3">رقم التشغيلة (اللوط)</th>
                  <th className="py-2.5 px-3 w-28">الكمية المشحونة</th>
                  <th className="py-2.5 px-3">نوع الوعاء الداخلي</th>
                  <th className="py-2.5 px-3 w-28">سرافيس / صواني</th>
                  <th className="py-2.5 px-3 w-28">الأسبات الحاملة</th>
                  <th className="py-2.5 px-3 w-12">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {multiDispatch.items.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2">
                      <select
                        value={row.itemId}
                        onChange={(e) => handleItemSelect(idx, Number(e.target.value))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold"
                      >
                        <option value={0}>-- اختر المنتج التام --</option>
                        {finishedItems.map(itm => (
                          <option key={itm.id} value={itm.id}>{itm.itemName} ({itm.itemCode})</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.batchNumber || ''}
                        onChange={(e) => {
                          const items = [...multiDispatch.items];
                          items[idx].batchNumber = e.target.value;
                          setMultiDispatch({ ...multiDispatch, items });
                        }}
                        className="w-full px-2 py-1.5 border rounded-lg font-mono text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0.1}
                        step={0.5}
                        value={row.dispatchedQty}
                        onChange={(e) => {
                          const items = [...multiDispatch.items];
                          items[idx].dispatchedQty = Number(e.target.value);
                          setMultiDispatch({ ...multiDispatch, items });
                        }}
                        className="w-full px-2 py-1.5 border rounded-lg font-mono text-center font-black text-indigo-700"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={row.containerType}
                        onChange={(e) => {
                          const items = [...multiDispatch.items];
                          items[idx].containerType = e.target.value;
                          setMultiDispatch({ ...multiDispatch, items });
                        }}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold"
                      >
                        <option value="سرفيس">سرفيس (جاتوه/سواريه)</option>
                        <option value="صاج/صينية">صاج / صينية (شرقي/نواشف)</option>
                        <option value="علبة/كرتونة">علبة / كرتونة (تورت)</option>
                        <option value="بدون وعاء">بدون وعاء (فرط)</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={row.innerCount}
                        onChange={(e) => {
                          const items = [...multiDispatch.items];
                          items[idx].innerCount = Number(e.target.value);
                          setMultiDispatch({ ...multiDispatch, items });
                        }}
                        className="w-full px-2 py-1.5 border rounded-lg font-mono text-center font-bold"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={row.crateCount}
                        onChange={(e) => {
                          const items = [...multiDispatch.items];
                          items[idx].crateCount = Number(e.target.value);
                          setMultiDispatch({ ...multiDispatch, items });
                        }}
                        className="w-full px-2 py-1.5 border rounded-lg font-mono text-center font-bold text-amber-700"
                      />
                    </td>
                    <td className="p-2">
                      {multiDispatch.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDispatchLine(idx)}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 text-right">إجمالي حمولة الشحنة:</td>
                  <td className="py-2.5 px-3 font-mono text-indigo-700 text-sm">
                    {multiDispatch.items.reduce((sum, i) => sum + Number(i.dispatchedQty || 0), 0)}
                  </td>
                  <td></td>
                  <td className="py-2.5 px-3 font-mono">
                    {multiDispatch.items.reduce((sum, i) => sum + Number(i.innerCount || 0), 0)} وعاء
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-700">
                    {multiDispatch.items.reduce((sum, i) => sum + Number(i.crateCount || 0), 0)} سبت
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmitDispatch}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Truck className="w-4 h-4" />
              <span>اعتماد الشحن وخصم جميع الأصناف وتوجيه المانيفست</span>
            </button>
          </div>
        </div>
      )}

      {/* تبويب 3: استلام ومطابقة عهدة الفرع */}
      {activeTab === 'receive' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-600" />
            <span>شحنات في الطريق بانتظار فحص واستلام عهدة الفرع والأوعية</span>
          </h3>

          {inTransitManifests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border text-gray-400 font-bold text-xs">
              لا توجد شحنات معلقة على الطريق للفروع حالياً.
            </div>
          ) : (
            inTransitManifests.map(m => (
              <div key={m.manifestBaseNumber} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 text-xs space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-indigo-700 text-sm">{m.manifestBaseNumber}</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">متجه إلى: {m.destinationBranchName}</span>
                    <span className="text-gray-500">السائق: {m.driverName} ({m.vehicleNumber})</span>
                  </div>
                </div>

                <table className="w-full text-center">
                  <thead className="bg-slate-100 text-gray-700">
                    <tr>
                      <th className="py-2 px-3 text-right">الصنف</th>
                      <th className="py-2 px-3">اللوط</th>
                      <th className="py-2 px-3">المشحون</th>
                      <th className="py-2 px-3">الأوعية المشحونة</th>
                      <th className="py-2 px-3 w-32">المستلم فعلياً *</th>
                      <th className="py-2 px-3 w-28">سرافيس/صواني</th>
                      <th className="py-2 px-3 w-28">أسبات</th>
                      <th className="py-2 px-3">ملاحظات الفرع</th>
                      <th className="py-2 px-3 w-24">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {m.lines.filter(l => l.status === 'IN_TRANSIT').map(line => (
                      <tr key={line.id}>
                        <td className="py-2 px-3 text-right font-bold text-gray-900">{line.itemName}</td>
                        <td className="py-2 px-3 font-mono text-gray-500">{line.batchNumber}</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-700">{line.dispatchedQty} {line.unit}</td>
                        <td className="py-2 px-3 text-gray-600">{line.innerCount} {line.containerType} ({line.crateCount} سبت)</td>
                        <td className="p-1">
                          <input
                            type="number"
                            step={0.5}
                            value={line.tempReceivedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTransfers(prev => prev.map(t => t.id === line.id ? { ...t, tempReceivedQty: val } : t));
                            }}
                            className="w-full px-2 py-1 border rounded text-center font-mono font-bold text-emerald-700"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={line.tempReceivedInnerCount}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTransfers(prev => prev.map(t => t.id === line.id ? { ...t, tempReceivedInnerCount: val } : t));
                            }}
                            className="w-full px-2 py-1 border rounded text-center font-mono"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={line.tempReceivedCrateCount}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTransfers(prev => prev.map(t => t.id === line.id ? { ...t, tempReceivedCrateCount: val } : t));
                            }}
                            className="w-full px-2 py-1 border rounded text-center font-mono"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            placeholder="أي ملاحظات أو كسر..."
                            value={line.tempNotes || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTransfers(prev => prev.map(t => t.id === line.id ? { ...t, tempNotes: val } : t));
                            }}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="p-1">
                          <button
                            onClick={() => handleReceiveLine(line)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                          >
                            ✓ اعتماد
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* تبويب 4: لجنة فض منازعات عجز النقل */}
      {activeTab === 'dispute' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 text-xs space-y-4">
          <h3 className="font-bold text-rose-700 text-sm flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            <span>لجنة فض منازعات عجز وتلف الشحن بين الكنترول والفروع</span>
          </h3>

          {disputedItems.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-bold">
              لا توجد أي أصناف متنازع عليها حالياً. جميع الاستلامات مطابقة!
            </div>
          ) : (
            <table className="w-full text-center">
              <thead className="bg-rose-50 text-rose-900 border-b">
                <tr>
                  <th className="py-2.5 px-3">رقم الشحنة</th>
                  <th className="py-2.5 px-3">الفرع المستلم</th>
                  <th className="py-2.5 px-3 text-right">الصنف المتأثر</th>
                  <th className="py-2.5 px-3">المشحون</th>
                  <th className="py-2.5 px-3">العجز المثبت</th>
                  <th className="py-2.5 px-3 w-32">الكمية المقبولة</th>
                  <th className="py-2.5 px-3">تحميل مسؤولية العجز</th>
                  <th className="py-2.5 px-3 w-28">قرار اللجنة</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {disputedItems.map(trf => (
                  <tr key={trf.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{trf.transferNumber}</td>
                    <td className="py-2.5 px-3 font-bold">{trf.destinationBranchName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">{trf.itemName}</td>
                    <td className="py-2.5 px-3 font-mono">{trf.dispatchedQty} {trf.unit}</td>
                    <td className="py-2.5 px-3 font-mono font-black text-rose-600">
                      {(trf.dispatchedQty - (trf.receivedQty || 0)).toFixed(1)} {trf.unit}
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step={0.5}
                        value={trf.tempFinalQty}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTransfers(prev => prev.map(t => t.id === trf.id ? { ...t, tempFinalQty: val } : t));
                        }}
                        className="w-full px-2 py-1 border border-emerald-400 rounded text-center font-mono font-bold text-emerald-700"
                      />
                    </td>
                    <td className="p-1">
                      <select
                        value={trf.tempChargeTo}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTransfers(prev => prev.map(t => t.id === trf.id ? { ...t, tempChargeTo: val } : t));
                        }}
                        className="w-full px-2 py-1 border rounded font-bold"
                      >
                        <option value="عهدة سائق التوزيع">عهدة سائق التوزيع</option>
                        <option value="هدر وكسر أثناء النقل">هدر وكسر أثناء النقل</option>
                        <option value="جفاف وفقد طبيعي">جفاف وفقد طبيعي</option>
                        <option value="تسوية جردية معتمدة">تسوية جردية معتمدة</option>
                      </select>
                    </td>
                    <td className="p-1">
                      <button
                        onClick={() => handleResolveDispute(trf)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
                      >
                        ⚖️ اعتماد وترصيد
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* نافذة تفاصيل المانيفست */}
      {showDetailsModal && selectedManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>تفاصيل المانيفست بالكامل: {selectedManifest.manifestBaseNumber}</span>
              </h4>
              <button onClick={() => setShowDetailsModal(false)} className="text-white">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border grid grid-cols-3 gap-3">
                <div><strong>المستودع المصدر:</strong> {selectedManifest.sourceWarehouseName}</div>
                <div><strong>الفرع المستلم:</strong> {selectedManifest.destinationBranchName}</div>
                <div><strong>التاريخ:</strong> <span className="font-mono">{selectedManifest.transferDate}</span></div>
                <div><strong>السائق:</strong> {selectedManifest.driverName || '---'}</div>
                <div><strong>السيارة:</strong> {selectedManifest.vehicleNumber || '---'}</div>
                <div><strong>إجمالي الأوعية:</strong> {selectedManifest.totalInnerCount} وعاء | {selectedManifest.totalCrateCount} سبت</div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-center">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="py-2 px-3 text-right">الصنف</th>
                      <th className="py-2 px-3">اللوط</th>
                      <th className="py-2 px-3">الكمية المشحونة</th>
                      <th className="py-2 px-3">الأوعية</th>
                      <th className="py-2 px-3">الكمية المستلمة</th>
                      <th className="py-2 px-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedManifest.lines.map(l => (
                      <tr key={l.id}>
                        <td className="py-2 px-3 text-right font-bold text-gray-900">{l.itemName}</td>
                        <td className="py-2 px-3 font-mono text-gray-500">{l.batchNumber}</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-700">{l.dispatchedQty} {l.unit}</td>
                        <td className="py-2 px-3">{l.innerCount} {l.containerType} ({l.crateCount} سبت)</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                          {l.receivedQty != null ? `${l.receivedQty} ${l.unit}` : 'بانتظار الاستلام'}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : l.status === 'IN_DISPUTE' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 font-bold rounded-lg"
              >
                إغلاق
              </button>
              <button
                onClick={() => { setShowDetailsModal(false); setShowPrintModal(true); }}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة المانيفست</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الطباعة الرسمية A4 */}
      {showPrintModal && selectedManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 text-xs p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">حلواني ومصانع «أبو عادل»</h2>
                <span className="text-gray-500 text-[11px]">إذن صرف ومنافست شحن بضائع للفروع والمعارض</span>
              </div>
              <div className="text-left font-mono">
                <span className="text-base font-black text-indigo-700">{selectedManifest.manifestBaseNumber}</span>
                <span className="block text-gray-500 text-[11px]">التاريخ: {selectedManifest.transferDate}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border grid grid-cols-2 gap-2 text-xs">
              <div><strong>المستودع المصدر:</strong> {selectedManifest.sourceWarehouseName}</div>
              <div><strong>الفرع المستلم:</strong> {selectedManifest.destinationBranchName}</div>
              <div><strong>السائق المسلم:</strong> {selectedManifest.driverName}</div>
              <div><strong>رقم السيارة:</strong> {selectedManifest.vehicleNumber}</div>
            </div>

            <table className="w-full text-center border">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-2 px-2">م</th>
                  <th className="py-2 px-2 text-right">اسم الصنف</th>
                  <th className="py-2 px-2">اللوط</th>
                  <th className="py-2 px-2">المشحون</th>
                  <th className="py-2 px-2">الأوعية</th>
                  <th className="py-2 px-2">الأسبات</th>
                  <th className="py-2 px-2">المستلم</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedManifest.lines.map((l, i) => (
                  <tr key={l.id}>
                    <td className="py-2 px-2">{i + 1}</td>
                    <td className="py-2 px-2 text-right font-bold text-gray-900">{l.itemName}</td>
                    <td className="py-2 px-2 font-mono text-gray-500">{l.batchNumber}</td>
                    <td className="py-2 px-2 font-mono font-bold text-indigo-700">{l.dispatchedQty} {l.unit}</td>
                    <td className="py-2 px-2">{l.innerCount} {l.containerType}</td>
                    <td className="py-2 px-2 font-mono">{l.crateCount} سبت</td>
                    <td className="py-2 px-2 font-mono">{l.receivedQty != null ? `${l.receivedQty}` : '_________'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-3 text-center pt-8 border-t font-bold text-gray-700">
              <div>
                <span className="block mb-6">أمين مخزن الكنترول</span>
                <span>____________________</span>
              </div>
              <div>
                <span className="block mb-6">سائق التوزيع</span>
                <span>____________________</span>
              </div>
              <div>
                <span className="block mb-6">أمين مستودع الفرع المستلم</span>
                <span>____________________</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة المانيفست A4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
