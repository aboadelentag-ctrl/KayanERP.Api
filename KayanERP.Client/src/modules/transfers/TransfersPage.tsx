import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  RotateCw,
  ArrowRight,
  ClipboardList,
  Send,
  Inbox,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  User,
  Building2,
  Calendar,
  Layers,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchTransfersApi,
  fetchLookupsApi,
  dispatchTransferApi,
  receiveTransferApi,
  resolveDisputeApi,
} from './transfersApi';
import type {
  BranchTransferViewItem,
  BranchLookupDto,
  WarehouseLookupDto,
  FinishedItemLookupDto,
  DispatchPayload,
} from './transfersApi';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const TransfersPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'dispatch' | 'receive' | 'dispute'>('list');
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [transfers, setTransfers] = useState<BranchTransferViewItem[]>([]);
  const [branches, setBranches] = useState<BranchLookupDto[]>([]);
  const [allWarehouses, setAllWarehouses] = useState<WarehouseLookupDto[]>([]);
  const [branchWarehouses, setBranchWarehouses] = useState<WarehouseLookupDto[]>([]);
  const [finishedItems, setFinishedItems] = useState<FinishedItemLookupDto[]>([]);

  // نموذج الإمداد والشحن الجديد
  const [newDispatch, setNewDispatch] = useState<DispatchPayload>({
    companyId: 1,
    sourceWarehouseId: 1,
    destinationBranchId: 0,
    destinationWarehouseId: 0,
    itemId: 0,
    batchNumber: '',
    dispatchedQty: 25,
    dispatchedCount: 10,
    driverName: 'رمضان عبد العليم',
    vehicleNumber: 'د ق ن 4912',
    notes: '',
  });

  const loadData = async () => {
    setIsProcessing(true);
    try {
      const [transfersData, lookups] = await Promise.all([
        fetchTransfersApi(1),
        fetchLookupsApi(1),
      ]);
      setTransfers(transfersData);
      setBranches(lookups.branches);
      setAllWarehouses(lookups.warehouses);
      setFinishedItems(lookups.items);

      if (lookups.branches.length > 0 && newDispatch.destinationBranchId === 0) {
        const firstBranchId = lookups.branches[0].id;
        const bWarehouses = lookups.warehouses.filter((w: WarehouseLookupDto) => w.branchId === firstBranchId);
        setBranchWarehouses(bWarehouses);
        setNewDispatch((prev) => ({
          ...prev,
          destinationBranchId: firstBranchId,
          destinationWarehouseId: bWarehouses[0]?.id || 0,
          itemId: lookups.items[0]?.id || 0,
        }));
      }
    } catch (err: any) {
      setAlertMessage(`خطأ في جلب بيانات الشحنات: ${err.message}`);
      setIsSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const inTransitList = useMemo(() => transfers.filter((t) => t.status === 'IN_TRANSIT'), [transfers]);
  const disputeList = useMemo(() => transfers.filter((t) => t.status === 'IN_DISPUTE'), [transfers]);

  const handleBranchSelected = (bId: number) => {
    const bWhs = allWarehouses.filter((w) => w.branchId === bId);
    setBranchWarehouses(bWhs);
    setNewDispatch((prev) => ({
      ...prev,
      destinationBranchId: bId,
      destinationWarehouseId: bWhs[0]?.id || 0,
    }));
  };

  const handleSubmitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newDispatch.destinationBranchId <= 0 ||
      newDispatch.destinationWarehouseId <= 0 ||
      newDispatch.itemId <= 0 ||
      newDispatch.dispatchedQty <= 0
    ) {
      setAlertMessage('يرجى تحديد الفرع، المستودع، الصنف والكمية المشحونة.');
      setIsSuccess(false);
      return;
    }

    setIsProcessing(true);
    try {
      await dispatchTransferApi({
        ...newDispatch,
        dispatcherName: user?.fullName || 'مسؤول الكنترول المركزي',
      });
      setAlertMessage('تم شحن البضاعة وخصم الرصيد بنجاح، وهي الآن في الطريق للفرع!');
      setIsSuccess(true);
      setActiveTab('receive');
      await loadData();
    } catch (err: any) {
      setAlertMessage(err.message || 'فشل إتمام إذن الشحن.');
      setIsSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitReceive = async (trf: BranchTransferViewItem) => {
    setIsProcessing(true);
    try {
      await receiveTransferApi({
        transferId: trf.id,
        receivedQty: trf.tempReceivedQty,
        receivedCount: trf.tempReceivedCount,
        receiverName: user?.fullName || 'أمين مستودع الفرع',
        notes: trf.tempNotes,
      });

      setAlertMessage('تمت معالجة استلام الفرع بنجاح!');
      setIsSuccess(true);
      await loadData();
    } catch (err: any) {
      setAlertMessage(err.message || 'فشل اعتماد استلام الفرع.');
      setIsSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitResolveDispute = async (trf: BranchTransferViewItem) => {
    setIsProcessing(true);
    try {
      await resolveDisputeApi({
        transferId: trf.id,
        finalAcceptedQty: trf.tempFinalQty,
        chargeTo: trf.tempChargeTo,
        resolvedBy: user?.fullName || 'اللجنة المشتركة وفض المنازعات',
        notes: 'تم حسم النزاع واعتماد التسوية المخزنية المعتمدة',
      });

      setAlertMessage('تم فض النزاع وترصيد الكمية بمستودع الفرع وتسوية الهالك بنجاح!');
      setIsSuccess(true);
      await loadData();
    } catch (err: any) {
      setAlertMessage(err.message || 'فشل فض النزاع.');
      setIsSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden" dir="rtl">
      
      {/* 1. الشريط العلوي الموحد */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('workspace')}
            title="العودة لمساحة العمل"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" />
              <span>حوكمة إمداد الفروع واستلام المنافذ 🚚</span>
            </h1>
            <span className="text-[11px] text-slate-400">
              الربط اللوجستي: الكنترول المركزي ⇦ سيارات التوزيع ⇦ الفروع والمعارض
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>تحديث الشحنات</span>
          </button>
          <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-400">
            {user?.fullName} ({user?.role})
          </span>
        </div>
      </header>

      {/* 2. تنبيهات النظام */}
      {alertMessage && (
        <div className="px-6 pt-3">
          <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
            isSuccess ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{alertMessage}</span>
            </div>
            <button onClick={() => setAlertMessage('')} className="text-slate-400 hover:text-white font-bold">×</button>
          </div>
        </div>
      )}

      {/* 3. شريط التبويبات الرئيسي */}
      <div className="px-6 pt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'list'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>📋 سجل الشحنات العامة ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'dispatch'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4 text-amber-400" />
          <span>🚚 1. شحن وتوجيه من الكنترول للفرع</span>
        </button>

        <button
          onClick={() => setActiveTab('receive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'receive'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4 text-emerald-400" />
          <span>📥 2. استلام ومطابقة عهدة الفرع</span>
          {inTransitList.length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
              {inTransitList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'dispute'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4 text-rose-400" />
          <span>⚖️ 3. لجنة فض منازعات عجز النقل</span>
          {disputeList.length > 0 && (
            <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
              {disputeList.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. جسم الشاشة التفاعلي */}
      <main className="flex-1 p-6 overflow-y-auto">
        {isProcessing && transfers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>جاري مزامنة خط سير الشحنات اللوجستية...</span>
          </div>
        ) : activeTab === 'list' ? (
          /* ========================================== */
          /* تبويب 1: السجل العام للشحنات                */
          /* ========================================== */
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/70 text-slate-300 font-bold border-b border-slate-800 text-center">
                  <tr>
                    <th className="py-3 px-3">رقم الشحنة</th>
                    <th className="py-3 px-3">التاريخ</th>
                    <th className="py-3 px-3">المستودع المصدر</th>
                    <th className="py-3 px-3">الفرع المستلم</th>
                    <th className="py-3 px-3 text-right">الصنف والتشغيلة</th>
                    <th className="py-3 px-3">الكمية المشحونة</th>
                    <th className="py-3 px-3">الكمية المستلمة</th>
                    <th className="py-3 px-3">السائق والسيارة</th>
                    <th className="py-3 px-3">الحالة اللوجستية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-center">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-slate-500 font-bold">
                        لا توجد شحنات مسجلة بالمنشأة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">{t.transferNumber}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px]">{t.transferDate}</td>
                        <td className="py-3.5 px-3 text-slate-300">{t.sourceWarehouseName}</td>
                        <td className="py-3.5 px-3 font-bold text-amber-400">{t.destinationBranchName}</td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="font-bold text-white">{t.itemName}</div>
                          <span className="text-[10px] text-slate-500 font-mono block">لوط: {t.batchNumber || 'بدون'}</span>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-400 text-sm">
                          {t.dispatchedQty.toFixed(1)} {t.unit}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-sm">
                          {t.receivedQty !== null ? (
                            <span className="text-emerald-400">{t.receivedQty.toFixed(1)} {t.unit}</span>
                          ) : (
                            <span className="text-slate-500 text-xs">في الانتظار</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-slate-200">{t.driverName || '---'}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{t.vehicleNumber || ''}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          {t.status === 'IN_TRANSIT' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800">
                              🚚 في الطريق
                            </span>
                          )}
                          {t.status === 'IN_DISPUTE' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800 animate-pulse">
                              🚨 نزاع عجز
                            </span>
                          )}
                          {t.status === 'RECEIVED' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                              ✓ تم الاستلام
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'dispatch' ? (
          /* ========================================== */
          /* تبويب 2: شحن وإمداد من الكنترول            */
          /* ========================================== */
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl max-w-4xl mx-auto text-xs">
            <h2 className="text-sm font-bold text-indigo-400 flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
              <Boxes className="w-5 h-5 text-amber-400" />
              <span>إصدار إذن شحن وإمداد فرع جديد من الكنترول</span>
            </h2>

            <form onSubmit={handleSubmitDispatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    الفرع المستهدف <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newDispatch.destinationBranchId}
                    onChange={(e) => handleBranchSelected(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value={0}>-- اختر الفرع --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branchName} ({b.branchCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    مستودع الفرع المستلم <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newDispatch.destinationWarehouseId}
                    onChange={(e) => setNewDispatch({ ...newDispatch, destinationWarehouseId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value={0}>-- اختر المستودع --</option>
                    {branchWarehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    المنتج التام المشحون <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newDispatch.itemId}
                    onChange={(e) => setNewDispatch({ ...newDispatch, itemId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value={0}>-- اختر المنتج --</option>
                    {finishedItems.map((itm) => (
                      <option key={itm.id} value={itm.id}>
                        {itm.itemName} ({itm.itemCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    الكمية المشحونة <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newDispatch.dispatchedQty}
                    onChange={(e) => setNewDispatch({ ...newDispatch, dispatchedQty: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-cyan-400 font-mono font-bold text-base rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">عدد الصواني / الأقفاص</label>
                  <input
                    type="number"
                    value={newDispatch.dispatchedCount}
                    onChange={(e) => setNewDispatch({ ...newDispatch, dispatchedCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white font-mono rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    اسم السائق / المندوب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حسن رجب"
                    value={newDispatch.driverName || ''}
                    onChange={(e) => setNewDispatch({ ...newDispatch, driverName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">رقم سيارة التوزيع</label>
                  <input
                    type="text"
                    placeholder="مثال: أ ب ج 512"
                    value={newDispatch.vehicleNumber || ''}
                    onChange={(e) => setNewDispatch({ ...newDispatch, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">رقم التشغيلة (اللوط)</label>
                  <input
                    type="text"
                    placeholder="مثال: LOT-2026-10"
                    value={newDispatch.batchNumber || ''}
                    onChange={(e) => setNewDispatch({ ...newDispatch, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white font-mono rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1.5">ملاحظات وتوجيهات الشحنة</label>
                  <input
                    type="text"
                    placeholder="أي ملاحظات تخص تفريغ الشحنة أو التبريد..."
                    value={newDispatch.notes || ''}
                    onChange={(e) => setNewDispatch({ ...newDispatch, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Truck className="w-4 h-4" />
                  <span>🚚 اعتماد الشحن وخصم الرصيد من الكنترول</span>
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'receive' ? (
          /* ========================================== */
          /* تبويب 3: استلام ومطابقة عهدة الفرع          */
          /* ========================================== */
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
              <Inbox className="w-5 h-5 text-emerald-400" />
              <span>شحنات في الطريق بانتظار مطابقة واستلام الفرع ({inTransitList.length})</span>
            </h2>

            {inTransitList.length === 0 ? (
              <div className="text-center text-slate-500 py-12 font-bold text-xs">
                لا توجد شحنات معلقة على الطريق للفروع حالياً.
              </div>
            ) : (
              <div className="space-y-4">
                {inTransitList.map((trf) => (
                  <div
                    key={trf.id}
                    className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
                  >
                    <div className="w-full md:w-1/4">
                      <span className="font-mono font-bold text-cyan-400 text-sm block">{trf.transferNumber}</span>
                      <strong className="text-white text-sm block mt-0.5">{trf.itemName}</strong>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px]">
                        متجه إلى: {trf.destinationBranchName}
                      </span>
                    </div>

                    <div className="w-full md:w-1/4 md:border-r border-slate-800 md:pr-4">
                      <span className="text-slate-400 text-[11px] block">المشحون من الكنترول:</span>
                      <span className="font-mono font-bold text-indigo-400 text-sm">
                        {trf.dispatchedQty.toFixed(1)} {trf.unit}
                      </span>
                      <span className="text-slate-400 mx-1.5">|</span>
                      <span className="font-mono font-bold text-white">{trf.dispatchedCount} صينية/قفص</span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        السائق: {trf.driverName} ({trf.vehicleNumber})
                      </span>
                    </div>

                    <div className="w-full md:w-1/3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                            الكمية المستلمة فعلياً *
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={trf.tempReceivedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              trf.tempReceivedQty = val;
                              setTransfers([...transfers]);
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-emerald-600/60 text-emerald-400 font-mono font-bold rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">العدد المستلم *</label>
                          <input
                            type="number"
                            value={trf.tempReceivedCount}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              trf.tempReceivedCount = val;
                              setTransfers([...transfers]);
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white font-mono rounded-lg outline-none"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="ملاحظات أمين مخزن الفرع..."
                        value={trf.tempNotes}
                        onChange={(e) => {
                          trf.tempNotes = e.target.value;
                          setTransfers([...transfers]);
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg outline-none text-[11px]"
                      />
                    </div>

                    <div className="w-full md:w-auto shrink-0">
                      <button
                        onClick={() => handleSubmitReceive(trf)}
                        disabled={isProcessing}
                        className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ اعتماد استلام الفرع</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ========================================== */
          /* تبويب 4: لجنة فض منازعات عجز النقل        */
          /* ========================================== */
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
              <Scale className="w-5 h-5 text-rose-500" />
              <span>شحنات متنازع عليها بانتظار قرار لجنة فض المنازعات ({disputeList.length})</span>
            </h2>

            {disputeList.length === 0 ? (
              <div className="text-center text-slate-500 py-12 font-bold text-xs">
                لا توجد أي شحنات متنازع عليها. جميع الاستلامات مطابقة!
              </div>
            ) : (
              <div className="space-y-4">
                {disputeList.map((trf) => (
                  <div
                    key={trf.id}
                    className="p-4 bg-rose-950/20 border border-rose-800/50 rounded-2xl space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-rose-900/40">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-400 text-sm">{trf.transferNumber}</span>
                        <strong className="text-white text-sm">{trf.itemName}</strong>
                        <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-amber-300">
                          فرع: {trf.destinationBranchName}
                        </span>
                      </div>
                      <span className="bg-rose-900/80 border border-rose-700 text-white font-bold px-3 py-1 rounded-full text-[11px]">
                        سبب النزاع: {trf.disputeReason}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <span className="text-slate-400 block text-[11px]">المشحون أصلاً:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {trf.dispatchedQty.toFixed(1)} {trf.unit} ({trf.dispatchedCount} صينية)
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                          الكمية النهائية المقبولة للفرع *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={trf.tempFinalQty}
                          onChange={(e) => {
                            trf.tempFinalQty = Number(e.target.value);
                            setTransfers([...transfers]);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-emerald-600/60 text-emerald-400 font-mono font-bold rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">تحميل مسؤولية العجز *</label>
                        <select
                          value={trf.tempChargeTo}
                          onChange={(e) => {
                            trf.tempChargeTo = e.target.value;
                            setTransfers([...transfers]);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white font-bold rounded-lg outline-none"
                        >
                          <option value="عهدة سائق التوزيع">عهدة سائق التوزيع</option>
                          <option value="هدر وكسر أثناء النقل">هدر وكسر أثناء النقل</option>
                          <option value="جفاف وفقد طبيعي">جفاف وفقد طبيعي</option>
                          <option value="تسوية جردية معتمدة">تسوية جردية معتمدة</option>
                        </select>
                      </div>

                      <div>
                        <button
                          onClick={() => handleSubmitResolveDispute(trf)}
                          disabled={isProcessing}
                          className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Scale className="w-4 h-4" />
                          <span>⚖️ اعتماد قرار اللجنة وترصيد الفرع</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
