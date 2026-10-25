import React, { useState, useMemo } from 'react';
import {
  PackageOpen,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  RotateCw,
  FileSpreadsheet,
  Download,
  Upload,
  AlertTriangle,
  Scale,
  Calendar,
  Check,
  X,
  Gavel,
  ShieldCheck,
  FileText,
  Trash2,
  Send,
  Building2
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';

export interface RequisitionLineDto {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  requestedQty: number;
  dispatchedQty: number;
  receivedQty: number;
  batchNumber?: string;
  expiryDate?: string;
  lineStatus: 'PENDING' | 'DISPATCHED' | 'ACCEPTED' | 'DISPUTED';
  discrepancyReason?: string;
  warehouseNotes?: string;
  unitCost?: number;
}

export interface RequisitionDetailDto {
  id: number;
  requisitionNumber: string;
  departmentId: number;
  departmentName: string;
  requestedBy: string;
  createdAt: string;
  status: 'SUBMITTED' | 'DISPATCHED' | 'COMPLETED' | 'DISPUTED';
  fromWarehouseId?: number;
  fromWarehouseName?: string;
  dispatchedBy?: string;
  dispatchedAt?: string;
  lines: RequisitionLineDto[];
}

export interface AuditRowDto {
  requisitionId: number;
  requisitionNumber: string;
  requestDate: string;
  departmentId: number;
  departmentName: string;
  requestedBy: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  requestedQty: number;
  dispatchedQty: number;
  batchNumber: string;
  expiryDate?: string;
  receivedQty: number;
  finalApprovedQty: number;
  scrapOrLossQty: number;
  disputeStatusTitle: string;
  discrepancyReason?: string;
  resolutionNotes?: string;
  floorStockBefore: number;
  floorStockAfter: number;
  currentFloorStock: number;
}

export const MaterialRequisitionsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'REQUEST' | 'DISPATCH' | 'RECEIVE' | 'DISPUTE' | 'AUDIT'>('REQUEST');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Lookups
  const departments = [
    { id: 1, departmentName: 'صالة تصنيع الحلويات الشرقية' },
    { id: 2, departmentName: 'صالة تصنيع الحلويات الغربية والتورت' },
    { id: 3, departmentName: 'قسم النواشف والكرواسون والبتيفور' },
    { id: 4, departmentName: 'مستودع التعبئة والتغليف والتوزيع' }
  ];

  const warehouses = [
    { id: 1, warehouseName: 'مستودع الخامات والمستلزمات الرئيسي (WH-MAIN)' },
    { id: 2, warehouseName: 'ثلاجة النصف مصنع والمكسرات المركزية' },
    { id: 3, warehouseName: 'مستودع أدوات التعبئة والكرتون (WH-PACK)' }
  ];

  const rawMaterials = [
    { id: 1, itemCode: 'RAW-SUG-01', itemName: 'سكر مكرر ناعم فاخر', unit: 'كجم' },
    { id: 2, itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي', unit: 'كجم' },
    { id: 3, itemCode: 'RAW-CHK-03', itemName: 'شيكولاتة خام بلجيكي داكنة', unit: 'كجم' },
    { id: 4, itemCode: 'RAW-FLR-04', itemName: 'دقيق فاخر استخراج 72%', unit: 'كجم' },
    { id: 5, itemCode: 'RAW-PST-05', itemName: 'فستق حلبي محمص نمرة 1', unit: 'كجم' }
  ];

  // Requisitions State
  const [requisitions, setRequisitions] = useState<RequisitionDetailDto[]>([
    {
      id: 1,
      requisitionNumber: 'REQ-20261025-001',
      departmentId: 1,
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      requestedBy: 'أحمد السعدي [مشرف الصالة]',
      createdAt: '2026-10-25 08:30',
      status: 'SUBMITTED',
      fromWarehouseName: 'مستودع الخامات والمستلزمات الرئيسي (WH-MAIN)',
      lines: [
        { id: 101, itemId: 1, itemCode: 'RAW-SUG-01', itemName: 'سكر مكرر ناعم فاخر', unit: 'كجم', requestedQty: 150, dispatchedQty: 0, receivedQty: 0, lineStatus: 'PENDING' },
        { id: 102, itemId: 2, itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي', unit: 'كجم', requestedQty: 60, dispatchedQty: 0, receivedQty: 0, lineStatus: 'PENDING' }
      ]
    },
    {
      id: 2,
      requisitionNumber: 'REQ-20261025-002',
      departmentId: 2,
      departmentName: 'صالة تصنيع الحلويات الغربية والتورت',
      requestedBy: 'سامح فوزي [شيف المعمل]',
      createdAt: '2026-10-25 09:15',
      status: 'DISPATCHED',
      fromWarehouseName: 'مستودع الخامات والمستلزمات الرئيسي (WH-MAIN)',
      dispatchedBy: 'فتحي حميده [أمين المخزن]',
      dispatchedAt: '2026-10-25 10:00',
      lines: [
        { id: 201, itemId: 3, itemCode: 'RAW-CHK-03', itemName: 'شيكولاتة خام بلجيكي داكنة', unit: 'كجم', requestedQty: 40, dispatchedQty: 40, receivedQty: 38, batchNumber: 'LOT-FEFO-202610-09', expiryDate: '2027-04-10', lineStatus: 'DISPUTED', discrepancyReason: 'عجز وزن 2 كجم أثناء استلام الكرتونة بالصالة' }
      ]
    }
  ]);

  // Tab 1: Request State
  const [newDepartmentId, setNewDepartmentId] = useState<number>(1);
  const [newLines, setNewLines] = useState<{ itemId: number; requestedQty: number }[]>([
    { itemId: 1, requestedQty: 50 }
  ]);

  // Tab 2: Dispatch State
  const [selectedDispatchReq, setSelectedDispatchReq] = useState<RequisitionDetailDto | null>(null);
  const [dispatchLines, setDispatchLines] = useState<{ [lineId: number]: { whId: number; qty: number; batch: string; exp: string; cost: number } }>({});

  // Tab 4: Dispute State
  const [selectedDisputeReq, setSelectedDisputeReq] = useState<RequisitionDetailDto | null>(null);

  // Tab 5: Audit State
  const [auditRows, setAuditRows] = useState<AuditRowDto[]>([
    {
      requisitionId: 2,
      requisitionNumber: 'REQ-20261025-002',
      requestDate: '2026-10-25 09:15',
      departmentId: 2,
      departmentName: 'صالة تصنيع الحلويات الغربية والتورت',
      requestedBy: 'سامح فوزي',
      itemId: 3,
      itemCode: 'RAW-CHK-03',
      itemName: 'شيكولاتة خام بلجيكي داكنة',
      unit: 'كجم',
      requestedQty: 40,
      dispatchedQty: 40,
      batchNumber: 'LOT-FEFO-202610-09',
      expiryDate: '2027-04-10',
      receivedQty: 38,
      finalApprovedQty: 38,
      scrapOrLossQty: 2,
      disputeStatusTitle: 'نزاع كميات معلق',
      discrepancyReason: 'عجز وزن 2 كجم أثناء استلام الكرتونة بالصالة',
      resolutionNotes: '',
      floorStockBefore: 15,
      floorStockAfter: 53,
      currentFloorStock: 53
    }
  ]);

  const currentDisplayName = useMemo(() => {
    return user ? `${user.fullName} [${user.role}]` : 'المشرف المعتمد';
  }, [user]);

  // Tab 1 Actions
  const handleAddLine = () => {
    setNewLines([...newLines, { itemId: rawMaterials[0].id, requestedQty: 10 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setNewLines(newLines.filter((_, i) => i !== idx));
  };

  const handleSubmitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentId || newLines.length === 0) return;

    const deptName = departments.find(d => d.id === newDepartmentId)?.departmentName || 'صالة الإنتاج';
    const created: RequisitionDetailDto = {
      id: Date.now(),
      requisitionNumber: `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-00${requisitions.length + 1}`,
      departmentId: newDepartmentId,
      departmentName: deptName,
      requestedBy: currentDisplayName,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'SUBMITTED',
      fromWarehouseName: warehouses[0].warehouseName,
      lines: newLines.map((l, i) => {
        const item = rawMaterials.find(m => m.id === l.itemId);
        return {
          id: Date.now() + i,
          itemId: l.itemId,
          itemCode: item?.itemCode || 'RAW-00',
          itemName: item?.itemName || 'خامة',
          unit: item?.unit || 'كجم',
          requestedQty: Number(l.requestedQty),
          dispatchedQty: 0,
          receivedQty: 0,
          lineStatus: 'PENDING'
        };
      })
    };

    setRequisitions([created, ...requisitions]);
    setFeedbackMessage('✅ تم إرسال طلب الخامات للمخازن بنجاح! بانتظار فحص وتخصيص المستودعات بنظام FEFO.');
    setNewLines([{ itemId: rawMaterials[0].id, requestedQty: 20 }]);
    setActiveTab('DISPATCH');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Tab 2 Actions
  const handleOpenDispatch = (req: RequisitionDetailDto) => {
    setSelectedDispatchReq(req);
    const map: any = {};
    req.lines.forEach(l => {
      map[l.id] = {
        whId: warehouses[0].id,
        qty: l.requestedQty,
        batch: `LOT-FEFO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        exp: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
        cost: 45.0
      };
    });
    setDispatchLines(map);
  };

  const handleConfirmDispatch = () => {
    if (!selectedDispatchReq) return;
    setRequisitions(prev =>
      prev.map(r => {
        if (r.id !== selectedDispatchReq.id) return r;
        return {
          ...r,
          status: 'DISPATCHED',
          dispatchedBy: currentDisplayName,
          dispatchedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          lines: r.lines.map(l => {
            const d = dispatchLines[l.id];
            return {
              ...l,
              dispatchedQty: d ? d.qty : l.requestedQty,
              batchNumber: d ? d.batch : 'LOT-FEFO',
              expiryDate: d ? d.exp : '',
              lineStatus: 'DISPATCHED'
            };
          })
        };
      })
    );
    setSelectedDispatchReq(null);
    setFeedbackMessage('✅ تم اعتماد خروج الشحنة من المخازن المحددة بنجاح بنظام FEFO!');
    setActiveTab('RECEIVE');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Tab 3 Actions
  const handleAcceptLine = (reqId: number, lineId: number, isExact: boolean, reason?: string) => {
    setRequisitions(prev =>
      prev.map(r => {
        if (r.id !== reqId) return r;
        const updatedLines = r.lines.map(l => {
          if (l.id !== lineId) return l;
          return {
            ...l,
            receivedQty: isExact ? l.dispatchedQty : l.receivedQty,
            lineStatus: isExact ? ('ACCEPTED' as const) : ('DISPUTED' as const),
            discrepancyReason: isExact ? undefined : reason || 'فرق كمية أثناء الفحص'
          };
        });
        const hasDispute = updatedLines.some(l => l.lineStatus === 'DISPUTED');
        const allCompleted = updatedLines.every(l => l.lineStatus === 'ACCEPTED');
        return {
          ...r,
          status: hasDispute ? 'DISPUTED' : allCompleted ? 'COMPLETED' : 'DISPATCHED',
          lines: updatedLines
        };
      })
    );
    setFeedbackMessage(isExact ? '✅ تم مطابقة وقبول السطر بنجاح.' : '⚠️ تم قيد الفرق وإحالة البند لفض النزاعات.');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Tab 4 Actions
  const handleResolveDispute = (reqId: number, lineId: number, finalQty: number, notes: string) => {
    setRequisitions(prev =>
      prev.map(r => {
        if (r.id !== reqId) return r;
        const updatedLines = r.lines.map(l => {
          if (l.id !== lineId) return l;
          return {
            ...l,
            receivedQty: finalQty,
            lineStatus: 'ACCEPTED' as const,
            warehouseNotes: notes || `اعتمدت التسوية بواسطة ${currentDisplayName}`
          };
        });
        const hasDispute = updatedLines.some(l => l.lineStatus === 'DISPUTED');
        return {
          ...r,
          status: hasDispute ? 'DISPUTED' : 'COMPLETED',
          lines: updatedLines
        };
      })
    );
    setSelectedDisputeReq(null);
    setFeedbackMessage('✅ تم فض النزاع واعتماد التسوية المخزنية وترحيل الرصيد بنجاح!');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الصفحة التنفيذي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <PackageOpen className="w-6 h-6 text-amber-500" />
              <span>طلب وصرف واستلام خامات الصالة الإنتاجية (Floor Stock Handshake)</span>
            </h1>
            <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              دورة تسليم مغلقة بنظام FEFO
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            صرف خامات من المستودع الرئيسي، استلام ومطابقة الصالات، وفض النزاعات وتتبع الأثر المخزني لحظياً.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('تم تصدير سجل طلبات الصرف بنجاح (CSV)')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs border border-gray-200 dark:border-zinc-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>تصدير السجل (CSV)</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-xl text-xs font-bold flex justify-between items-center">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات المؤشرات اللحظية الأربعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-indigo-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">إجمالي طلبات الصرف</span>
          <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">{requisitions.length} طلب</h4>
        </div>
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">بانتظار الصرف وتخصيص اللوطات</span>
          <h4 className="text-xl font-black text-amber-500 font-mono mt-1">{requisitions.filter(r => r.status === 'SUBMITTED').length} طلب</h4>
        </div>
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-cyan-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">شحنات واردة بانتظار فحص الصالة</span>
          <h4 className="text-xl font-black text-cyan-500 font-mono mt-1">{requisitions.filter(r => r.status === 'DISPATCHED').length} شحنة</h4>
        </div>
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-rose-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">نزاعات كميات معلقة</span>
          <h4 className="text-xl font-black text-rose-600 font-mono mt-1">{requisitions.filter(r => r.status === 'DISPUTED').length} نزاع</h4>
        </div>
      </div>

      {/* أزرار التبديل بين المحطات الخمس */}
      <div className="flex bg-slate-200/70 dark:bg-zinc-900 p-1.5 rounded-2xl w-fit gap-1 mb-6 text-xs font-bold flex-wrap">
        <button
          onClick={() => setActiveTab('REQUEST')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'REQUEST' ? 'bg-white dark:bg-black text-indigo-700 dark:text-amber-400 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
        >
          <span>✍ 1. طلب خامات (مشرف الصالة)</span>
        </button>

        <button
          onClick={() => setActiveTab('DISPATCH')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'DISPATCH' ? 'bg-white dark:bg-black text-indigo-700 dark:text-amber-400 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
        >
          <span>📦 2. صرف المخازن وتخصيص اللوطات (FEFO)</span>
          {requisitions.filter(r => r.status === 'SUBMITTED').length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-mono text-[10px] px-1.5 py-0.2 rounded-full">
              {requisitions.filter(r => r.status === 'SUBMITTED').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RECEIVE')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'RECEIVE' ? 'bg-white dark:bg-black text-indigo-700 dark:text-amber-400 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
        >
          <span>🔍 3. استلام الصالة والمطابقة</span>
          {requisitions.filter(r => r.status === 'DISPATCHED').length > 0 && (
            <span className="bg-cyan-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full">
              {requisitions.filter(r => r.status === 'DISPATCHED').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('DISPUTE')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'DISPUTE' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600 hover:text-rose-700'}`}
        >
          <span>⚖ 4. فض النزاعات وتسوية الفروق</span>
          {requisitions.filter(r => r.status === 'DISPUTED').length > 0 && (
            <span className="bg-white text-rose-600 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {requisitions.filter(r => r.status === 'DISPUTED').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'AUDIT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-600'}`}
        >
          <span>📊 5. تقرير دورة حياة الخامات وأرصدة الصالات</span>
        </button>
      </div>

      {/* المحطة 1: تسجيل طلب جديد */}
      {activeTab === 'REQUEST' && (
        <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 border-t-4 border-t-indigo-600 p-5 shadow-sm text-xs">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">➕ تسجيل طلب احتياج خامات للوردية الحالية</h5>
            <span className="text-gray-400 text-[11px]">المشرف يحدد الخامات فقط، وكل خامة ستُصرف بنظام FEFO</span>
          </div>

          <form onSubmit={handleSubmitRequisition} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الصالة الإنتاجية الطالبة *</label>
                <select
                  value={newDepartmentId}
                  onChange={(e) => setNewDepartmentId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم المشرف المسؤول الموثق:</label>
                <input
                  type="text"
                  readOnly
                  value={currentDisplayName}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold text-gray-600 dark:text-zinc-400"
                />
              </div>
            </div>

            <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 flex justify-between items-center">
                <span className="font-bold text-gray-800 dark:text-zinc-200">قائمة الخامات المطلوبة للتشغيل:</span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                >
                  ➕ إضافة سطر خامة
                </button>
              </div>

              <table className="w-full text-center">
                <thead className="bg-slate-100 dark:bg-zinc-900/60 text-gray-600 dark:text-zinc-400">
                  <tr>
                    <th className="py-2.5 px-3 text-right">اسم الخامة أو المكون النصف مصنع *</th>
                    <th className="py-2.5 px-3 w-48">الكمية المطلوبة</th>
                    <th className="py-2.5 px-3 w-20">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {newLines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-right">
                        <select
                          value={line.itemId}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNewLines(newLines.map((l, i) => i === idx ? { ...l, itemId: val } : l));
                          }}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg font-bold"
                        >
                          {rawMaterials.map(m => (
                            <option key={m.id} value={m.id}>{m.itemName} ({m.itemCode}) - {m.unit}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          min={0.1}
                          required
                          value={line.requestedQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNewLines(newLines.map((l, i) => i === idx ? { ...l, requestedQty: val } : l));
                          }}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg font-mono font-bold text-center text-indigo-600 dark:text-indigo-400"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-sm"
            >
              🚀 إرسال الطلب للمخازن المركزية
            </button>
          </form>
        </div>
      )}

      {/* المحطة 2: صرف المخازن وتخصيص اللوطات */}
      {activeTab === 'DISPATCH' && (
        <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 border-t-4 border-t-amber-500 p-5 shadow-sm text-xs space-y-4">
          <h5 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">📦 طلبات التشغيل الجديدة بانتظار الصرف وتخصيص اللوطات (FEFO)</h5>
          
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 text-gray-600 dark:text-zinc-400 border-b">
              <tr>
                <th className="py-3 px-3">رقم الطلب</th>
                <th className="py-3 px-3">الصالة الطالبة</th>
                <th className="py-3 px-3">المشرف الطالب</th>
                <th className="py-3 px-3">تاريخ الطلب</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3">الإجراء المخزني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {requisitions.filter(r => r.status === 'SUBMITTED').map(req => (
                <tr key={req.id}>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{req.requisitionNumber}</td>
                  <td className="py-3 px-3 font-bold">{req.departmentName}</td>
                  <td className="py-3 px-3 text-gray-500">{req.requestedBy}</td>
                  <td className="py-3 px-3 font-mono">{req.createdAt}</td>
                  <td className="py-3 px-3"><span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">بانتظار الصرف</span></td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleOpenDispatch(req)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      🏷️ صرف خامات اللوطات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedDispatchReq && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-amber-300 dark:border-amber-800/80 space-y-3 mt-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-gray-800 dark:text-zinc-200">
                  صرف أسطر الإذن: {selectedDispatchReq.requisitionNumber} ({selectedDispatchReq.departmentName})
                </span>
                <button onClick={() => setSelectedDispatchReq(null)} className="text-gray-400 hover:text-white">إغلاق</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center bg-white dark:bg-[#0c0d11] rounded-xl border">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                      <th className="py-2 px-3 text-right">الخامة المطلوبة</th>
                      <th className="py-2 px-3">المطلوب</th>
                      <th className="py-2 px-3">مخزن الصرف المعتمد *</th>
                      <th className="py-2 px-3">الكمية المصروفة</th>
                      <th className="py-2 px-3">رقم التشغيلة (Batch)</th>
                      <th className="py-2 px-3">تاريخ الصلاحية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedDispatchReq.lines.map(l => (
                      <tr key={l.id}>
                        <td className="py-2 px-3 text-right font-bold">{l.itemName}</td>
                        <td className="py-2 px-3 font-mono font-bold">{l.requestedQty} {l.unit}</td>
                        <td className="py-2 px-3">
                          <select
                            value={dispatchLines[l.id]?.whId || warehouses[0].id}
                            onChange={(e) => {
                              const wId = Number(e.target.value);
                              setDispatchLines({ ...dispatchLines, [l.id]: { ...dispatchLines[l.id], whId: wId } });
                            }}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded"
                          >
                            {warehouses.map(w => (
                              <option key={w.id} value={w.id}>{w.warehouseName}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            value={dispatchLines[l.id]?.qty || l.requestedQty}
                            onChange={(e) => {
                              const q = Number(e.target.value);
                              setDispatchLines({ ...dispatchLines, [l.id]: { ...dispatchLines[l.id], qty: q } });
                            }}
                            className="w-24 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center text-emerald-600"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={dispatchLines[l.id]?.batch || ''}
                            onChange={(e) => {
                              const b = e.target.value;
                              setDispatchLines({ ...dispatchLines, [l.id]: { ...dispatchLines[l.id], batch: b } });
                            }}
                            className="w-32 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono text-center"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={dispatchLines[l.id]?.exp || ''}
                            onChange={(e) => {
                              const exp = e.target.value;
                              setDispatchLines({ ...dispatchLines, [l.id]: { ...dispatchLines[l.id], exp } });
                            }}
                            className="px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono text-center text-[10px]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleConfirmDispatch}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm"
              >
                ✅ اعتماد خروج الشحنة من المخازن بنظام FEFO
              </button>
            </div>
          )}
        </div>
      )}

      {/* المحطة 3: استلام ومطابقة الصالة */}
      {activeTab === 'RECEIVE' && (
        <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 border-t-4 border-t-cyan-500 p-5 shadow-sm text-xs space-y-4">
          <h5 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">🔍 استلام الخامات بصالة الإنتاج والمطابقة المزدوجة صنفاً بصنف</h5>

          {requisitions.filter(r => r.status === 'DISPATCHED' || r.status === 'DISPUTED').map(req => (
            <div key={req.id} className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm ml-2">{req.requisitionNumber}</span>
                  <span className="font-bold">{req.departmentName}</span>
                  <span className="text-gray-400 text-[10px] mr-2">وقت الخروج: {req.dispatchedAt}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${req.status === 'DISPUTED' ? 'bg-rose-500 text-white' : 'bg-cyan-500 text-slate-950'}`}>
                  {req.status === 'DISPUTED' ? '⚠️ نزاع كميات معلق' : 'شحنة واردة بالصالة'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center bg-white dark:bg-[#0c0d11] rounded-xl border">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                      <th className="py-2 px-3 text-right">الخامة</th>
                      <th className="py-2 px-3">المنصرف</th>
                      <th className="py-2 px-3">التشغيلة والصلاحية</th>
                      <th className="py-2 px-3">الكمية المستلمة فعلياً</th>
                      <th className="py-2 px-3">سبب الاختلاف</th>
                      <th className="py-2 px-3">الحالة</th>
                      <th className="py-2 px-3">إجراء المشرف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {req.lines.map(line => (
                      <tr key={line.id}>
                        <td className="py-2 px-3 text-right font-bold">{line.itemName}</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{line.dispatchedQty} {line.unit}</td>
                        <td className="py-2 px-3 font-mono text-[10px]">
                          <code>{line.batchNumber}</code> | {line.expiryDate || '-'}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            disabled={line.lineStatus === 'ACCEPTED'}
                            value={line.receivedQty || line.dispatchedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setRequisitions(prev =>
                                prev.map(r => r.id === req.id ? {
                                  ...r,
                                  lines: r.lines.map(l => l.id === line.id ? { ...l, receivedQty: val } : l)
                                } : r)
                              );
                            }}
                            className="w-24 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="سبب العجز إن وجد..."
                            disabled={line.lineStatus === 'ACCEPTED'}
                            value={line.discrepancyReason || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRequisitions(prev =>
                                prev.map(r => r.id === req.id ? {
                                  ...r,
                                  lines: r.lines.map(l => l.id === line.id ? { ...l, discrepancyReason: val } : l)
                                } : r)
                              );
                            }}
                            className="w-44 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded text-[11px]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            line.lineStatus === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600' :
                            line.lineStatus === 'DISPUTED' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 text-gray-500'
                          }`}>
                            {line.lineStatus === 'ACCEPTED' ? 'تم القبول ✓' : line.lineStatus === 'DISPUTED' ? 'خلاف معلق' : 'قيد الفحص'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {line.lineStatus !== 'ACCEPTED' && (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleAcceptLine(req.id, line.id, true)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[10px]"
                              >
                                ✓ مطابقة
                              </button>
                              <button
                                onClick={() => handleAcceptLine(req.id, line.id, false, line.discrepancyReason)}
                                className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold text-[10px]"
                              >
                                ⚠️ إثبات فرق
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* المحطة 4: فض النزاعات وتسوية الفروق */}
      {activeTab === 'DISPUTE' && (
        <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 border-t-4 border-t-rose-600 p-5 shadow-sm text-xs space-y-4">
          <h5 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">⚖️ صندوق مراجعة وفض النزاعات المخزنية وإثبات التسوية (Dispute Resolution)</h5>

          {requisitions.filter(r => r.status === 'DISPUTED').length === 0 ? (
            <div className="text-center py-12 text-emerald-600 font-bold">
              🎉 ممتاز! لا توجد أي نزاعات أو خلافات كميات معلقة حالياً بين المخزن والصالات.
            </div>
          ) : (
            requisitions.filter(r => r.status === 'DISPUTED').map(disReq => (
              <div key={disReq.id} className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-rose-300 dark:border-rose-900/80 space-y-3">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{disReq.requisitionNumber} - {disReq.departmentName}</span>
                <table className="w-full text-center bg-white dark:bg-[#0c0d11] rounded-xl border">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                      <th className="py-2 px-3 text-right">الخامة</th>
                      <th className="py-2 px-3">المنصرف بالمخزن</th>
                      <th className="py-2 px-3">المستلم بالصالة</th>
                      <th className="py-2 px-3">سبب العجز المسجل</th>
                      <th className="py-2 px-3">الكمية المعتمدة نهائياً</th>
                      <th className="py-2 px-3">قرار ومحضر التسوية</th>
                      <th className="py-2 px-3">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {disReq.lines.filter(l => l.lineStatus === 'DISPUTED').map(line => (
                      <tr key={line.id}>
                        <td className="py-2 px-3 text-right font-bold">{line.itemName}</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-600">{line.dispatchedQty} {line.unit}</td>
                        <td className="py-2 px-3 font-mono font-bold text-rose-600">{line.receivedQty} {line.unit}</td>
                        <td className="py-2 px-3 text-rose-500 font-bold text-[11px]">{line.discrepancyReason}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={line.receivedQty}
                            id={`finalQty_${line.id}`}
                            className="w-24 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center text-emerald-600"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="محضر قرار التسوية..."
                            id={`notes_${line.id}`}
                            className="w-48 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded text-[11px]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => {
                              const qInput = document.getElementById(`finalQty_${line.id}`) as HTMLInputElement;
                              const nInput = document.getElementById(`notes_${line.id}`) as HTMLInputElement;
                              handleResolveDispute(disReq.id, line.id, Number(qInput?.value || line.receivedQty), nInput?.value || '');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                          >
                            ✅ اعتماد وترحيل
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

      {/* المحطة 5: التقرير الرقابي الشامل لدورة حياة الخامات */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 border-t-4 border-t-emerald-600 p-5 shadow-sm text-xs space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">📊 المسار الرقابي لدورة حياة الخامات وأثر رصيد الصالة التراكمي</h5>
            <button
              onClick={() => alert('تم استخراج وتحديث التقرير الرقابي')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
            >
              تحديث واستخراج البيانات
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border">
              <thead className="bg-slate-900 text-white text-[11px]">
                <tr>
                  <th className="py-2.5 px-2">رقم الإذن</th>
                  <th className="py-2.5 px-2">التاريخ</th>
                  <th className="py-2.5 px-2 text-right">الصالة والمشرف</th>
                  <th className="py-2.5 px-2 text-right">الخامة المطلوبة</th>
                  <th className="py-2.5 px-2">المطلوب</th>
                  <th className="py-2.5 px-2">المنصرف واللوط</th>
                  <th className="py-2.5 px-2">المستلم المعتمد</th>
                  <th className="py-2.5 px-2">الهالك / العجز</th>
                  <th className="py-2.5 px-2">حالة النزاع</th>
                  <th className="py-2.5 px-2">رصيد قبل</th>
                  <th className="py-2.5 px-2">رصيد بعد</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[11px]">
                {auditRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="py-2 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.requisitionNumber}</td>
                    <td className="py-2 px-2 font-mono text-gray-400">{row.requestDate}</td>
                    <td className="py-2 px-2 text-right font-bold">{row.departmentName}</td>
                    <td className="py-2 px-2 text-right font-bold text-amber-600">{row.itemName}</td>
                    <td className="py-2 px-2 font-mono">{row.requestedQty} {row.unit}</td>
                    <td className="py-2 px-2 font-mono text-amber-500 font-bold">{row.dispatchedQty} ({row.batchNumber})</td>
                    <td className="py-2 px-2 font-mono text-emerald-600 font-bold">{row.finalApprovedQty} {row.unit}</td>
                    <td className="py-2 px-2 font-mono text-rose-600">{row.scrapOrLossQty > 0 ? `${row.scrapOrLossQty} ${row.unit}` : '-'}</td>
                    <td className="py-2 px-2"><span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-bold">{row.disputeStatusTitle}</span></td>
                    <td className="py-2 px-2 font-mono font-bold">{row.floorStockBefore} {row.unit}</td>
                    <td className="py-2 px-2 font-mono font-black text-emerald-600">{row.floorStockAfter} {row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
