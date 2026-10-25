import React, { useState, useMemo } from 'react';
import {
  Factory,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  RotateCw,
  FileSpreadsheet,
  Upload,
  Calendar,
  AlertTriangle,
  Play,
  Check,
  X,
  FileText,
  DollarSign,
  TrendingDown,
  Layers,
  Wrench,
  Users,
  UserCheck,
  Trash2,
  Send,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';

export interface ProductionOrderDto {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  departmentId: number;
  departmentName: string;
  warehouseName: string;
  status: 'PENDING_EXECUTION' | 'COMPLETED';
  details: {
    detailId: number;
    itemName: string;
    plannedQuantity: number;
    producedQuantity: number;
    unit: string;
    batchNumber?: string;
    status: string;
  }[];
}

export const ProductionOperationsHubPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'execution' | 'shift' | 'costing' | 'reports'>('orders');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  // Lookups
  const departmentsList = [
    { id: 1, departmentName: 'صالة تصنيع الحلويات الشرقية' },
    { id: 2, departmentName: 'صالة تصنيع الحلويات الغربية والتورت' },
    { id: 3, departmentName: 'صالة الكنافة والقطايف' },
    { id: 4, departmentName: 'قسم النواشف والكرواسون والبتيفور' }
  ];

  const warehousesList = [
    { id: 1, warehouseName: 'مخزن صالة الحلويات الشرقية (WH-EAST)' },
    { id: 2, warehouseName: 'مخزن صالة الحلويات الغربية والتورت (WH-WEST)' },
    { id: 3, warehouseName: 'مخزن صالة الكنافة والقطايف (WH-KNF)' },
    { id: 4, warehouseName: 'مستودع النواشف والكرواسون' }
  ];

  const itemsList = [
    { id: 101, itemCode: 'FG-BAS-01', itemName: 'بسبوسة سادة بالسمن البلدي', unit: 'كجم', departmentId: 1 },
    { id: 102, itemCode: 'FG-KNF-02', itemName: 'كنافة أساور فستق حلبي', unit: 'كجم', departmentId: 1 },
    { id: 103, itemCode: 'FG-TRT-03', itemName: 'تورتة بلاك فورست فاخرة وسط', unit: 'قطعة', departmentId: 2 },
    { id: 104, itemCode: 'FG-HRS-04', itemName: 'هريسة مكسرات إسكندراني', unit: 'كجم', departmentId: 1 }
  ];

  // Orders State
  const [orders, setOrders] = useState<ProductionOrderDto[]>([
    {
      orderId: 1,
      orderNumber: 'PRD-ORD-2026-001',
      orderDate: '2026-10-25',
      departmentId: 1,
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      warehouseName: 'مخزن صالة الحلويات الشرقية (WH-EAST)',
      status: 'PENDING_EXECUTION',
      details: [
        { detailId: 11, itemName: 'بسبوسة سادة بالسمن البلدي', plannedQuantity: 150, producedQuantity: 145, unit: 'كجم', batchNumber: 'LOT-BAS-01', status: 'IN_PROGRESS' }
      ]
    },
    {
      orderId: 2,
      orderNumber: 'PRD-ORD-2026-002',
      orderDate: '2026-10-24',
      departmentId: 3,
      departmentName: 'صالة الكنافة والقطايف',
      warehouseName: 'مخزن صالة الكنافة والقطايف (WH-KNF)',
      status: 'COMPLETED',
      details: [
        { detailId: 21, itemName: 'كنافة بورما فستق حلبي', plannedQuantity: 80, producedQuantity: 80, unit: 'كجم', batchNumber: 'LOT-KNF-88', status: 'COMPLETED' }
      ]
    }
  ]);

  // Tab 1: Orders Filter
  const [searchOrderTerm, setSearchOrderTerm] = useState('');
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState('');

  // Modal Create Order State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrderDeptId, setNewOrderDeptId] = useState<number>(1);
  const [newOrderWarehouseName, setNewOrderWarehouseName] = useState<string>('مخزن صالة الحلويات الشرقية (WH-EAST)');
  const [newOrderDate, setNewOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedItemToAddId, setSelectedItemToAddId] = useState<number>(0);
  const [itemToAddQty, setItemToAddQty] = useState<number>(10);
  const [newOrderLines, setNewOrderLines] = useState<{ itemId: number; itemName: string; plannedQuantity: number; unit: string }[]>([]);

  // Tab 2: Execution State
  const [selectedExecutionOrderId, setSelectedExecutionOrderId] = useState<number>(1);
  const [executionBatchNumber, setExecutionBatchNumber] = useState('LOT-20261025-01');
  const [executionProducedQty, setExecutionProducedQty] = useState<number>(145);
  const [executionNormalScrap, setExecutionNormalScrap] = useState<number>(3.5);
  const [executionAbnormalScrap, setExecutionAbnormalScrap] = useState<number>(1.5);
  const [executionScrapReason, setExecutionScrapReason] = useState('زيادة تحمير بالفرن الدوار');
  const [bomMaterials, setBomMaterials] = useState([
    { code: 'RAW-SMD-01', name: 'سميد بسبوسة نمرة 1', unit: 'كجم', requiredQty: 75, actualQty: 77 },
    { code: 'RAW-BTR-02', name: 'سمن بلدي طبيعي', unit: 'كجم', requiredQty: 30, actualQty: 30 },
    { code: 'RAW-SUG-03', name: 'سكر أبيض مكرر ناعم', unit: 'كجم', requiredQty: 45, actualQty: 47 }
  ]);

  // Tab 3: Shift Management
  const [shiftDeptFilter, setShiftDeptFilter] = useState<number>(1);
  const [shiftType, setShiftType] = useState('وردية صباحية');
  const [shiftStartTime, setShiftStartTime] = useState('07:00');
  const [shiftEndTime, setShiftEndTime] = useState('15:00');
  const [shiftProducedTotal, setShiftProducedTotal] = useState<number>(150);
  const [shiftCrew, setShiftCrew] = useState([
    { id: 1, code: 'EMP-101', name: 'أحمد السعدي', deptId: 1, jobTitle: 'مشرف صالة تصنيع', status: 'حاضر', hours: 8 },
    { id: 2, code: 'EMP-102', name: 'فتحي حميده', deptId: 1, jobTitle: 'شيف أول بسبوسة', status: 'حاضر', hours: 8 },
    { id: 3, code: 'EMP-103', name: 'سامح فوزي', deptId: 2, jobTitle: 'شيف تورت وحلواني', status: 'حاضر', hours: 8 },
    { id: 4, code: 'EMP-104', name: 'محمود وهدان', deptId: 1, jobTitle: 'مساعد شيف حلواني', status: 'حاضر', hours: 7 }
  ]);

  // Tab 4: Costing
  const [costOrderId, setCostOrderId] = useState<number>(1);
  const [laborRatePerHour, setLaborRatePerHour] = useState<number>(55);
  const [overheadCost, setOverheadCost] = useState<number>(450);
  const [costResult, setCostResult] = useState<{ totalCost: number; unitCost: number; producedQty: number; hours: number } | null>({
    totalCost: 12550,
    unitCost: 86.55,
    producedQty: 145,
    hours: 23
  });

  // Modal Handlers
  const handleDeptChangeInModal = (deptId: number) => {
    setNewOrderDeptId(deptId);
    const wh = warehousesList.find(w => w.id === deptId);
    setNewOrderWarehouseName(wh ? wh.warehouseName : 'مخزن الصالة المعتمد');
    setSelectedItemToAddId(0);
  };

  const handleAddItemToCreate = () => {
    const item = itemsList.find(i => i.id === selectedItemToAddId);
    if (!item || itemToAddQty <= 0) return;
    setNewOrderLines([...newOrderLines, { itemId: item.id, itemName: item.itemName, plannedQuantity: itemToAddQty, unit: item.unit }]);
    setSelectedItemToAddId(0);
    setItemToAddQty(10);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderLines.length) return;

    const dept = departmentsList.find(d => d.id === newOrderDeptId);
    const created: ProductionOrderDto = {
      orderId: Date.now(),
      orderNumber: `PRD-ORD-2026-00${orders.length + 1}`,
      orderDate: newOrderDate,
      departmentId: newOrderDeptId,
      departmentName: dept?.departmentName || 'صالة الإنتاج',
      warehouseName: newOrderWarehouseName,
      status: 'PENDING_EXECUTION',
      details: newOrderLines.map((l, idx) => ({
        detailId: Date.now() + idx,
        itemName: l.itemName,
        plannedQuantity: l.plannedQuantity,
        producedQuantity: 0,
        unit: l.unit,
        status: 'PENDING'
      }))
    };

    setOrders([created, ...orders]);
    setIsCreateModalOpen(false);
    setNewOrderLines([]);
    setStatusMessage('✅ تم إصدار أمر التشغيل بنجاح وربطه بمخزن الصالة آلياً!');
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (selectedOrderStatusFilter && o.status !== selectedOrderStatusFilter) return false;
      if (!searchOrderTerm.trim()) return true;
      const term = searchOrderTerm.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(term) ||
        o.departmentName.toLowerCase().includes(term) ||
        o.details.some(d => d.itemName.toLowerCase().includes(term))
      );
    });
  }, [orders, selectedOrderStatusFilter, searchOrderTerm]);

  const activeShiftWorkers = shiftCrew.filter(c => c.deptId === shiftDeptFilter);
  const presentWorkersCount = activeShiftWorkers.filter(c => c.status === 'حاضر').length;

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الشاشة التنفيذي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <Factory className="w-6 h-6 text-amber-500" />
              <span>غرفة عمليات الإنتاج والتكاليف والورديات الموحدة (MES Hub)</span>
            </h1>
            <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              نظام الربط الصناعي المغلق
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            الربط الإجباري للصالة ومخزنها، تقفيل أصناف الأوامر باللوطات، فرز وحضور الورديات، واحتساب التكاليف الصناعية.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              newOrderLines.length = 0;
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إصدار أمر تشغيل جديد</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex justify-between items-center ${isSuccess ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-600'}`}>
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* التبويبات الخمسة الرئيسية */}
      <div className="flex bg-slate-200/70 dark:bg-zinc-900 p-1.5 rounded-2xl w-fit gap-1 mb-6 text-xs font-bold flex-wrap">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-black text-indigo-700 dark:text-amber-400 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
        >
          <span>📋 1. سجل أوامر التشغيل والإنتاج ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('execution')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'execution' ? 'bg-white dark:bg-black text-indigo-700 dark:text-amber-400 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
        >
          <span>⚙️ 2. التنفيذ الميداني وتقفيل اللوط والهالك</span>
        </button>

        <button
          onClick={() => setActiveTab('shift')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'shift' ? 'bg-white dark:bg-black text-indigo-700 dark:text-amber-400 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
        >
          <span>⏱️ 3. إدارة الوردية وحضور العمال ({activeShiftWorkers.length} عامل)</span>
        </button>

        <button
          onClick={() => setActiveTab('costing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'costing' ? 'bg-white dark:bg-black text-indigo-700 dark:text-amber-400 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
        >
          <span>💰 4. احتساب وتحليل تكلفة الدفعة (Costing)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-black text-indigo-700 dark:text-amber-400 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
        >
          <span>📊 5. مركز التقارير واليوميات وكفاءة الأقسام</span>
        </button>
      </div>

      {/* التبويب 1: سجل أوامر التشغيل والإنتاج */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث برقم الأمر، الصنف، الصالة..."
                value={searchOrderTerm}
                onChange={(e) => setSearchOrderTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-1.5 outline-none font-bold text-gray-800 dark:text-zinc-200"
              />
            </div>

            <select
              value={selectedOrderStatusFilter}
              onChange={(e) => setSelectedOrderStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 font-bold outline-none text-gray-700 dark:text-zinc-300"
            >
              <option value="">-- كل الحالات --</option>
              <option value="PENDING_EXECUTION">جاهز للتنفيذ ⏳</option>
              <option value="COMPLETED">مكتمل ومقفل بالكامل ✓</option>
            </select>
          </div>

          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
            <table className="w-full text-center">
              <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b">
                <tr>
                  <th className="py-3 px-3">رقم أمر التشغيل</th>
                  <th className="py-3 px-3">تاريخ التشغيل</th>
                  <th className="py-3 px-3 text-right">صالة الإنتاج</th>
                  <th className="py-3 px-3 text-right">مخزن الصالة</th>
                  <th className="py-3 px-3 text-right">الأصناف المطلوبة</th>
                  <th className="py-3 px-3">إجمالي الكمية</th>
                  <th className="py-3 px-3">المنفذ الفعلي</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3">الإجراء الميداني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filteredOrders.map(o => (
                  <tr key={o.orderId} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{o.orderNumber}</td>
                    <td className="py-3 px-3 font-mono text-gray-400">{o.orderDate}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">{o.departmentName}</td>
                    <td className="py-3 px-3 text-right text-gray-500 font-mono text-[11px]">{o.warehouseName}</td>
                    <td className="py-3 px-3 text-right">
                      {o.details.map((d, i) => (
                        <div key={i} className="font-bold text-amber-600 dark:text-amber-400">• {d.itemName} ({d.plannedQuantity} {d.unit})</div>
                      ))}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">{o.details.reduce((s, d) => s + d.plannedQuantity, 0)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">{o.details.reduce((s, d) => s + d.producedQuantity, 0)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {o.status === 'COMPLETED' ? 'مكتمل ومقفل ✓' : 'جاهز للتنفيذ ⏳'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          setSelectedExecutionOrderId(o.orderId);
                          setActiveTab('execution');
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
                      >
                        ⚙️ تنفيذ وتقفيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* التبويب 2: التنفيذ الميداني وتقفيل اللوط والهالك */}
      {activeTab === 'execution' && (
        <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 border-t-4 border-t-indigo-600 p-5 shadow-sm text-xs space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-4">
            <div className="flex-1 max-w-md">
              <label className="block text-indigo-700 dark:text-amber-400 font-bold mb-1">أمر التشغيل المفتوح لمباشرة تقفيله:</label>
              <select
                value={selectedExecutionOrderId}
                onChange={(e) => setSelectedExecutionOrderId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-indigo-300 dark:border-zinc-800 rounded-xl font-bold font-mono"
              >
                {orders.map(o => (
                  <option key={o.orderId} value={o.orderId}>[{o.orderNumber}] - {o.departmentName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setStatusMessage('✅ تم تقفيل واعتماد أمر التشغيل وترصيد اللوط وخصم خامات الـ BOM بنجاح!');
                setIsSuccess(true);
                setTimeout(() => setStatusMessage(null), 4000);
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm text-xs"
            >
              ✅ اعتماد التنفيذ وتقفيل أمر التشغيل بالكامل
            </button>
          </div>

          {/* بطاقة الصنف وتفاصيل اللوط */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h5 className="font-bold text-amber-500 text-sm">📦 الصنف: بسبوسة سادة بالسمن البلدي (PRD-BAS-01)</h5>
                <span className="text-gray-400 text-[11px]">المخطط: 150 كجم | الحالة: قيد التنفيذ المباشر</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-500">رقم اللوط:</span>
                  <input
                    type="text"
                    value={executionBatchNumber}
                    onChange={(e) => setExecutionBatchNumber(e.target.value)}
                    className="w-36 px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono font-bold text-center text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-500">الإنتاج الفعلي:</span>
                  <input
                    type="number"
                    value={executionProducedQty}
                    onChange={(e) => setExecutionProducedQty(Number(e.target.value))}
                    className="w-24 px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono font-bold text-center text-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* الهالك التشغيلي */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white dark:bg-[#0c0d11] rounded-xl border">
              <div>
                <label className="block text-gray-500 font-bold mb-1">هالك طبيعي تشغيلي (Normal):</label>
                <input
                  type="number"
                  step="0.01"
                  value={executionNormalScrap}
                  onChange={(e) => setExecutionNormalScrap(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-rose-500 font-bold mb-1">هالك غير طبيعي / إهمال (Abnormal):</label>
                <input
                  type="number"
                  step="0.01"
                  value={executionAbnormalScrap}
                  onChange={(e) => setExecutionAbnormalScrap(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center text-rose-500"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">سبب الهالك والملاحظات:</label>
                <input
                  type="text"
                  value={executionScrapReason}
                  onChange={(e) => setExecutionScrapReason(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded text-[11px]"
                />
              </div>
            </div>

            {/* استهلاك خامات الوصفة BOM */}
            <div>
              <span className="font-bold text-gray-800 dark:text-zinc-200 block mb-2">📋 استهلاك خامات الوصفة (BOM) وانحراف الهدر:</span>
              <table className="w-full text-center border bg-white dark:bg-[#0c0d11] rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                  <tr>
                    <th className="py-2 px-3">كود الخامة</th>
                    <th className="py-2 px-3 text-right">اسم الخامة</th>
                    <th className="py-2 px-3">الوحدة</th>
                    <th className="py-2 px-3">المعياري المطلوب</th>
                    <th className="py-2 px-3">الاستهلاك الفعلي بالصالة</th>
                    <th className="py-2 px-3">مؤشر الهدر / التوفير</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bomMaterials.map((mat, i) => {
                    const diff = mat.actualQty - mat.requiredQty;
                    return (
                      <tr key={i}>
                        <td className="py-2 px-3 font-mono text-gray-400">{mat.code}</td>
                        <td className="py-2 px-3 text-right font-bold">{mat.name}</td>
                        <td className="py-2 px-3">{mat.unit}</td>
                        <td className="py-2 px-3 font-mono font-bold">{mat.requiredQty}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            value={mat.actualQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setBomMaterials(bomMaterials.map((m, idx) => idx === i ? { ...m, actualQty: val } : m));
                            }}
                            className="w-24 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center text-indigo-600 dark:text-indigo-400"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${diff > 0 ? 'bg-rose-500/10 text-rose-500' : diff < 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-gray-400'}`}>
                            {diff > 0 ? `▲ +${diff} هالك` : diff < 0 ? `▼ ${diff} توفير` : 'مطابق 100%'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* التبويب 3: إدارة الوردية وحضور العمال */}
      {activeTab === 'shift' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-gray-500 font-bold mb-1">فرز صالة الإنتاج:</label>
                <select
                  value={shiftDeptFilter}
                  onChange={(e) => setShiftDeptFilter(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                >
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">الوردية:</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                >
                  <option>وردية صباحية (07:00 - 15:00)</option>
                  <option>وردية مسائية (15:00 - 23:00)</option>
                  <option>وردية ليلية (23:00 - 07:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">إجمالي إنتاج الوردية (كجم):</label>
                <input
                  type="number"
                  value={shiftProducedTotal}
                  onChange={(e) => setShiftProducedTotal(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-center text-emerald-600"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setStatusMessage('✅ تم اعتماد الوردية واحتساب معدل الإنتاجية بالساعة لجميع الحاضرين بنجاح!');
                setIsSuccess(true);
                setTimeout(() => setStatusMessage(null), 4000);
              }}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-sm"
            >
              ⏱ اعتماد وإنهاء الوردية ومعدل الإنتاجية
            </button>
          </div>

          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <table className="w-full text-center">
              <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b">
                <tr>
                  <th className="py-3 px-3">الكود</th>
                  <th className="py-3 px-3 text-right">اسم العامل</th>
                  <th className="py-3 px-3">المسمى الوظيفي</th>
                  <th className="py-3 px-3">حالة الحضور</th>
                  <th className="py-3 px-3">ساعات العمل الفعلية</th>
                  <th className="py-3 px-3">معدل إنتاجية العامل المحسوب بالساعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {activeShiftWorkers.map(w => {
                  const rate = w.status === 'حاضر' && w.hours > 0 && presentWorkersCount > 0
                    ? ((shiftProducedTotal / presentWorkersCount) / w.hours).toFixed(2)
                    : '---';

                  return (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <td className="py-3 px-3 font-mono text-gray-400">{w.code}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">{w.name}</td>
                      <td className="py-3 px-3 text-gray-500">{w.jobTitle}</td>
                      <td className="py-3 px-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setShiftCrew(shiftCrew.map(c => c.id === w.id ? { ...c, status: 'حاضر', hours: 8 } : c))}
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${w.status === 'حاضر' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-zinc-900 text-gray-500'}`}
                          >
                            حاضر
                          </button>
                          <button
                            onClick={() => setShiftCrew(shiftCrew.map(c => c.id === w.id ? { ...c, status: 'غائب', hours: 0 } : c))}
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${w.status === 'غائب' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-zinc-900 text-gray-500'}`}
                          >
                            غائب
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <input
                          type="number"
                          step="0.5"
                          min={0}
                          max={8}
                          disabled={w.status !== 'حاضر'}
                          value={w.hours}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setShiftCrew(shiftCrew.map(c => c.id === w.id ? { ...c, hours: val } : c));
                          }}
                          className="w-16 px-1.5 py-1 bg-slate-50 dark:bg-zinc-900 border rounded text-center"
                        /> س
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {rate !== '---' ? `${rate} كجم/ساعة` : '---'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* التبويب 4: احتساب وتحليل تكلفة الدفعة (Costing) */}
      {activeTab === 'costing' && (
        <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 border-t-4 border-t-emerald-600 p-5 shadow-sm text-xs space-y-4">
          <h5 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">💰 احتساب وتحليل تكلفة الدفعة الصناعية (Batch Costing)</h5>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border">
            <div>
              <label className="block text-gray-500 font-bold mb-1">أمر التشغيل المراد حساب تكلفته:</label>
              <select
                value={costOrderId}
                onChange={(e) => setCostOrderId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border rounded-xl font-bold font-mono"
              >
                {orders.map(o => (
                  <option key={o.orderId} value={o.orderId}>[{o.orderNumber}] - {o.departmentName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">معدل أجر ساعة العمل (ج.م):</label>
              <input
                type="number"
                value={laborRatePerHour}
                onChange={(e) => setLaborRatePerHour(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border rounded-xl font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">مصاريف غير مباشرة (Overhead):</label>
              <input
                type="number"
                value={overheadCost}
                onChange={(e) => setOverheadCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border rounded-xl font-mono font-bold text-center"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setCostResult({
                    totalCost: 12550 + overheadCost,
                    unitCost: (12550 + overheadCost) / 145,
                    producedQty: 145,
                    hours: 23
                  });
                }}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm"
              >
                📊 احتساب التكلفة الفعلية
              </button>
            </div>
          </div>

          {costResult && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 border rounded-2xl text-center">
                <span className="text-gray-400 font-bold text-[11px] block">إجمالي تكلفة الوجبة</span>
                <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">{costResult.totalCost.toLocaleString()} ج.م</h4>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 border rounded-2xl text-center">
                <span className="text-gray-400 font-bold text-[11px] block">تكلفة الوحدة الفعلية</span>
                <h4 className="text-xl font-black text-emerald-600 font-mono mt-1">{costResult.unitCost.toFixed(2)} ج.م</h4>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 border rounded-2xl text-center">
                <span className="text-gray-400 font-bold text-[11px] block">الكمية الصالحة المنتجة</span>
                <h4 className="text-xl font-black text-cyan-600 font-mono mt-1">{costResult.producedQty} كجم</h4>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 border rounded-2xl text-center">
                <span className="text-gray-400 font-bold text-[11px] block">ساعات الوردية الفعلية</span>
                <h4 className="text-xl font-black text-amber-500 font-mono mt-1">{costResult.hours} ساعة</h4>
              </div>
            </div>
          )}
        </div>
      )}

      {/* التبويب 5: مركز التقارير واليوميات */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 border-t-4 border-t-cyan-500 p-5 shadow-sm text-xs space-y-4">
          <h5 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">📊 مركز التقارير واليوميات وكفاءة الأقسام</h5>
          <table className="w-full text-center border">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400">
              <tr>
                <th className="py-2.5 px-3">صالة الإنتاج</th>
                <th className="py-2.5 px-3">إجمالي ساعات العمل</th>
                <th className="py-2.5 px-3">إجمالي الإنتاج التام</th>
                <th className="py-2.5 px-3">معدل الإنتاجية (وحدة / ساعة)</th>
                <th className="py-2.5 px-3">الهالك التقديري</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2.5 px-3 font-bold text-right">صالة تصنيع الحلويات الشرقية</td>
                <td className="py-2.5 px-3 font-mono">24 س</td>
                <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">150 كجم</td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">6.25 كجم/س</td>
                <td className="py-2.5 px-3 font-mono text-rose-500">5.0 كجم</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal إصدار أمر تشغيل لصالـة إنتاج (مربوط آلياً بالصالة ومخزنها) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-amber-400">
                <Factory className="w-4 h-4" />
                <span>إصدار أمر تشغيل لصالـة إنتاج (ربط آلي بالصالة ومخزنها)</span>
              </h4>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border">
                <div>
                  <label className="block text-indigo-700 dark:text-amber-400 font-bold mb-1">صالة الإنتاج المسؤولة *</label>
                  <select
                    value={newOrderDeptId}
                    onChange={(e) => handleDeptChangeInModal(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-bold"
                  >
                    {departmentsList.map(d => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-emerald-600 dark:text-emerald-400 font-bold mb-1">مخزن الصالة (مقفل ومربوط آلياً) 🔒</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={newOrderWarehouseName}
                    className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-900 border rounded-lg font-mono font-bold text-[11px] text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">تاريخ التشغيل *</label>
                  <input
                    type="date"
                    value={newOrderDate}
                    onChange={(e) => setNewOrderDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* إضافة أصناف لأمر التشغيل */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border space-y-3">
                <span className="font-bold text-gray-800 dark:text-zinc-200 block">إضافة أصناف لأمر التشغيل:</span>
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <label className="block text-gray-500 text-[10px] mb-1">اختر صنف الصالة المطلوب تصنيعه *</label>
                    <select
                      value={selectedItemToAddId}
                      onChange={(e) => setSelectedItemToAddId(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-bold"
                    >
                      <option value="0">-- اختر الصنف --</option>
                      {itemsList.filter(i => i.departmentId === newOrderDeptId).map(i => (
                        <option key={i.id} value={i.id}>{i.itemName} ({i.itemCode})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-gray-500 text-[10px] mb-1">الكمية المخططة *</label>
                    <input
                      type="number"
                      min={1}
                      value={itemToAddQty}
                      onChange={(e) => setItemToAddQty(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono font-bold text-center"
                    />
                  </div>

                  <div className="col-span-3">
                    <button
                      type="button"
                      onClick={handleAddItemToCreate}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                    >
                      ➕ إضافة للقائمة
                    </button>
                  </div>
                </div>
              </div>

              {/* جدول الأصناف المضافة */}
              <table className="w-full text-center border bg-white dark:bg-[#0c0d11] rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                  <tr>
                    <th className="py-2 px-3 text-right">الصنف</th>
                    <th className="py-2 px-3">الكمية المخططة</th>
                    <th className="py-2 px-3">الوحدة</th>
                    <th className="py-2 px-3 w-16">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {newOrderLines.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-gray-400">لا توجد أصناف مضافة للقائمة.</td></tr>
                  ) : (
                    newOrderLines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-right font-bold">{line.itemName}</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{line.plannedQuantity}</td>
                        <td className="py-2 px-3">{line.unit}</td>
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => setNewOrderLines(newOrderLines.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={newOrderLines.length === 0}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-sm disabled:opacity-50"
                >
                  💾 حفظ وإصدار أمر التشغيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
