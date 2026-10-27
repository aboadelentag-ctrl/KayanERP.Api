import React, { useState, useEffect } from 'react';
import {
  Factory,
  PlusCircle,
  Search,
  RotateCw,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Calculator,
  Users,
  FileSpreadsheet,
  Settings,
  Scale,
  DollarSign,
  UserCheck,
  Check,
  X,
  Plus,
  Trash2,
  Package,
  ArrowLeft
} from 'lucide-react';

interface Props {
  onNavigate?: (tab: string) => void;
}

interface OrderItem {
  id: string;
  itemCode: string;
  itemName: string;
  availableStock: number;
  plannedQty: number;
  unit: string;
}

export const ProductionOperationsHubPage: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const availableInventoryItems = [
    { code: 'PRD-BAS-01', name: 'بسبوسة سادة بالسمن البلدي', available: 45, unit: 'صاج' },
    { code: 'PRD-BAS-02', name: 'بسبوسة بالمكسرات الفاخرة', available: 20, unit: 'صاج' },
    { code: 'PRD-KNF-01', name: 'كنافة كريمة عثمانلي', available: 16, unit: 'صاج' },
    { code: 'PRD-KNF-02', name: 'كنافة أساور فستق حلبي', available: 12, unit: 'صاج' },
    { code: 'PRD-HR-01', name: 'هريسة إسكندراني لوز وبندق', available: 30, unit: 'صاج' }
  ];

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'PRD-ORD-2026-001',
      orderDate: '2026-10-25',
      hallName: 'صالة تصنيع الحلويات الشرقية',
      hallWarehouse: 'مخزن صالة الحلويات الشرقية (WH-EAST)',
      productDescription: 'بسبوسة سادة بالسمن البلدي (150 صاج)',
      availableStockTag: 'المتاح بالمخزن: 45 صاج',
      totalPlannedQty: 150,
      actualExecutedQty: 145,
      wasteQty: 5,
      lotNumber: 'LOT-20261026-PRD-BAS-01',
      status: 'جاهز للتنفيذ'
    },
    {
      id: 2,
      orderNumber: 'PRD-ORD-2026-002',
      orderDate: '2026-10-24',
      hallName: 'صالة الكنافة والقطايف',
      hallWarehouse: 'مخزن صالة الكنافة والقطايف (WH-KNF)',
      productDescription: 'كنافة كريمة عثمانلي (80 صاج)',
      availableStockTag: 'المتاح بالمخزن: 16 صاج',
      totalPlannedQty: 80,
      actualExecutedQty: 80,
      wasteQty: 0,
      lotNumber: 'LOT-20261024-PRD-KNF-02',
      status: 'مكتمل ومقفل'
    }
  ]);

  // الأمر المختار للتنفيذ والتقفيل في المرحلة 2
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [execActualQty, setExecActualQty] = useState(145);
  const [execWasteQty, setExecWasteQty] = useState(5);

  // حالة إضافة أمر جديد
  const [selectedHall, setSelectedHall] = useState('صالة تصنيع الحلويات الشرقية');
  const [selectedWarehouse, setSelectedWarehouse] = useState('مخزن صالة الحلويات الشرقية (WH-EAST)');
  const [orderDate, setOrderDate] = useState('2026-10-26');
  const [currentItemCode, setCurrentItemCode] = useState(availableInventoryItems[0].code);
  const [currentQty, setCurrentQty] = useState<number>(10);
  const [currentUnit, setCurrentUnit] = useState(availableInventoryItems[0].unit);
  const [orderItemsList, setOrderItemsList] = useState<OrderItem[]>([]);

  const selectedItemData = availableInventoryItems.find(i => i.code === currentItemCode) || availableInventoryItems[0];

  const handleHallChange = (hall: string) => {
    setSelectedHall(hall);
    if (hall.includes('شرقية')) {
      setSelectedWarehouse('مخزن صالة الحلويات الشرقية (WH-EAST)');
    } else if (hall.includes('كنافة')) {
      setSelectedWarehouse('مخزن صالة الكنافة والقطايف (WH-KNF)');
    } else {
      setSelectedWarehouse('مخزن صالة التورت والجاتوه (WH-WEST)');
    }
  };

  const handleAddItemToOrder = () => {
    if (currentQty <= 0) return;
    const itemObj: OrderItem = {
      id: Date.now().toString(),
      itemCode: selectedItemData.code,
      itemName: selectedItemData.name,
      availableStock: selectedItemData.available,
      plannedQty: Number(currentQty),
      unit: currentUnit
    };
    setOrderItemsList([...orderItemsList, itemObj]);
    setCurrentQty(10);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItemsList.length === 0) return;

    const totalQty = orderItemsList.reduce((sum, item) => sum + item.plannedQty, 0);
    const desc = orderItemsList.map(i => `${i.itemName} (${i.plannedQty} ${i.unit})`).join(' + ');

    const newOrderObj = {
      id: orders.length + 1,
      orderNumber: `PRD-ORD-2026-00${orders.length + 1}`,
      orderDate: orderDate,
      hallName: selectedHall,
      hallWarehouse: selectedWarehouse,
      productDescription: desc,
      availableStockTag: `أصناف متعددة (${orderItemsList.length})`,
      totalPlannedQty: totalQty,
      actualExecutedQty: totalQty,
      wasteQty: 0,
      lotNumber: `LOT-${orderDate.replace(/-/g, '')}-PRD-00${orders.length + 1}`,
      status: 'جاهز للتنفيذ' as const
    };

    setOrders([newOrderObj, ...orders]);
    setSelectedOrder(newOrderObj);
    setExecActualQty(totalQty);
    setExecWasteQty(0);
    setOrderItemsList([]);
    setShowNewModal(false);
    setStatusMessage(`✅ تم إصدار أمر التشغيل [${newOrderObj.orderNumber}] بنجاح.`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // زر ترحيل البيانات الفعلي للكنترول والمخازن
  const handleDispatchToControl = () => {
    const transferRecord = {
      id: Date.now(),
      transferNo: `TRF-FG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      transferDate: new Date().toISOString().slice(0, 10),
      itemDescription: selectedOrder.productDescription,
      lotNumber: selectedOrder.lotNumber,
      productionQty: Number(execActualQty),
      hallName: selectedOrder.hallName,
      costingQty: Number(execActualQty),
      costingAmount: Number(execActualQty) * 65.65,
      controlQty: 0,
      qualityStatus: 'قيد الفحص والميزان',
      status: '1. بانتظار ميزان التكاليف'
    };

    try {
      const existing = JSON.parse(localStorage.getItem('kayan_fg_transfers') || '[]');
      localStorage.setItem('kayan_fg_transfers', JSON.stringify([transferRecord, ...existing]));

      // تحديث حالة الأمر
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'مكتمل ومقفل', actualExecutedQty: execActualQty, wasteQty: execWasteQty } : o));
    } catch (e) {
      console.error(e);
    }

    setStatusMessage(`🎯 تم بنجاح ترحيل الإذن [${transferRecord.transferNo}] بكمية (${execActualQty} صاج) إلى حوكمة الكنترول والميزان!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-slate-900 dark:text-zinc-100 transition-colors" dir="rtl">
      
      {/* الترويسة الرئيسية */}
      <div className="bg-white dark:bg-[#0f1117] border border-slate-300 dark:border-zinc-800 shadow-sm dark:shadow-lg p-5 rounded-2xl mb-6 flex flex-wrap justify-between items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Factory className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              <span>غرفة عمليات الإنتاج والتكاليف والورديات الموحدة (MES Hub)</span>
            </h1>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 px-2.5 py-0.5 rounded-lg text-xs font-black">
              نظام الربط الصناعي المغلق
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-zinc-400">
            الربط الإجباري للصالة ومخزنها، تقفيل أصناف الأوامر باللوطات، فرز وحضور الورديات، واحتساب التكاليف الصناعية.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ إصدار أمر تشغيل جديد</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-black flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* المراحل الخمس مع التبديل التفاعلي الكامل */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-6 text-xs">
        <button
          onClick={() => setActiveTab(1)}
          className={`p-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            activeTab === 1
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400/40'
              : 'bg-white dark:bg-[#0f1117] border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. سجل أوامر التشغيل ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`p-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            activeTab === 2
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400/40'
              : 'bg-white dark:bg-[#0f1117] border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>2. التنفيذ الميداني وتقفيل اللوط</span>
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`p-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            activeTab === 3
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
              : 'bg-white dark:bg-[#0f1117] border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. إدارة الوردية وحضور العمال</span>
        </button>

        <button
          onClick={() => setActiveTab(4)}
          className={`p-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            activeTab === 4
              ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-2 ring-teal-400/40'
              : 'bg-white dark:bg-[#0f1117] border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>4. احتساب وتحليل التكلفة</span>
        </button>

        <button
          onClick={() => setActiveTab(5)}
          className={`p-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            activeTab === 5
              ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/40'
              : 'bg-white dark:bg-[#0f1117] border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>5. مركز التقارير واليوميات</span>
        </button>
      </div>

      {/* المرحلة 1: سجل أوامر التشغيل */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead className="bg-slate-200 dark:bg-[#171a24] text-slate-900 dark:text-zinc-100 border-b-2 border-slate-300 dark:border-zinc-700 font-black">
                  <tr>
                    <th className="py-3 px-3">رقم أمر التشغيل</th>
                    <th className="py-3 px-3">تاريخ التشغيل</th>
                    <th className="py-3 px-3 text-right">صالة الإنتاج</th>
                    <th className="py-3 px-3 text-right">مخزن الصالة</th>
                    <th className="py-3 px-3 text-right">الأصناف والرصيد المخزني</th>
                    <th className="py-3 px-3 font-black">إجمالي الكمية</th>
                    <th className="py-3 px-3 font-black">المنفذ الفعلي</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3 w-32">الإجراء الميداني</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 dark:divide-zinc-800 font-bold text-slate-900 dark:text-zinc-200">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-black text-amber-800 dark:text-amber-400">{ord.orderNumber}</td>
                      <td className="py-3 px-3 font-mono text-slate-800 dark:text-zinc-300">{ord.orderDate}</td>
                      <td className="py-3 px-3 text-right font-black text-slate-950 dark:text-white">{ord.hallName}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-zinc-400 text-[11px]">{ord.hallWarehouse}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-slate-950 dark:text-white block">• {ord.productDescription}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200 dark:bg-amber-500/10 text-slate-900 dark:text-amber-300 border border-slate-300 dark:border-amber-500/30 rounded text-[10px] font-mono font-black">
                          {ord.availableStockTag}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-slate-950 dark:text-white text-sm">{ord.totalPlannedQty}</td>
                      <td className="py-3 px-3 font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">{ord.actualExecutedQty}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full font-black text-[10px] border ${
                          ord.status === 'جاهز للتنفيذ'
                            ? 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-400'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setExecActualQty(ord.actualExecutedQty);
                            setExecWasteQty(ord.wasteQty);
                            setActiveTab(2);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1 mx-auto transition-all shadow-sm cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>تنفيذ وتقفيل</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* المرحلة 2: واجهة التنفيذ الميداني وتقفيل اللوط الفعالة بالكامل */}
      {activeTab === 2 && (
        <div className="bg-white dark:bg-[#0f1117] p-6 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="border-b border-slate-300 dark:border-zinc-800 pb-3 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-base font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>المرحلة 2: شاشة التنفيذ الميداني وتقفيل اللوط للأمر: {selectedOrder.orderNumber}</span>
              </h3>
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-400 mt-1">
                الصنف المستهدف: <strong className="text-slate-900 dark:text-white">{selectedOrder.productDescription}</strong>
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 rounded-xl font-mono font-black text-xs">
              كود اللوط: {selectedOrder.lotNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
            <div className="p-4 bg-slate-100 dark:bg-[#141620] rounded-2xl border border-slate-300 dark:border-zinc-800">
              <span className="text-slate-700 dark:text-zinc-400 block mb-1">الكمية المخططة بالمحضر</span>
              <span className="text-3xl font-black font-mono text-slate-950 dark:text-white">
                {selectedOrder.totalPlannedQty} صاج
              </span>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-700/50">
              <span className="text-emerald-900 dark:text-emerald-400 block mb-1">المنفذ السليم (المطابق)</span>
              <input
                type="number"
                value={execActualQty}
                onChange={(e) => setExecActualQty(Number(e.target.value))}
                className="w-full text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 bg-transparent border-b border-emerald-400 outline-none"
              />
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-300 dark:border-rose-700/50">
              <span className="text-rose-900 dark:text-rose-400 block mb-1">الهالك الصناعي (تالف فرن / عجين)</span>
              <input
                type="number"
                value={execWasteQty}
                onChange={(e) => setExecWasteQty(Number(e.target.value))}
                className="w-full text-2xl font-black font-mono text-rose-700 dark:text-rose-400 bg-transparent border-b border-rose-400 outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#171922] rounded-2xl border border-slate-300 dark:border-zinc-700 flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-400 block">خطوة التسليم والترحيل المباشرة:</span>
              <strong className="text-sm font-black text-slate-900 dark:text-zinc-100">
                تسليم المنتج التام إلى الكنترول والميزان المركزي (FG Custody Hub)
              </strong>
            </div>

            {/* الزر الفعلي للترحيل */}
            <button
              onClick={handleDispatchToControl}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>اعتماد التقفيل والترحيل للميزان</span>
            </button>
          </div>
        </div>
      )}

      {/* باقي المراحل (3 و 4 و 5) */}
      {activeTab === 3 && (
        <div className="bg-white dark:bg-[#0f1117] p-6 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-emerald-700 dark:text-emerald-400">المرحلة 3: إدارة الوردية وحضور العمال</h3>
          <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">سجل حضور عمال الوردية الأولى (صباحي - 3 عمال حاضرين).</p>
        </div>
      )}
      {activeTab === 4 && (
        <div className="bg-white dark:bg-[#0f1117] p-6 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-teal-700 dark:text-teal-400">المرحلة 4: احتساب وتحليل تكلفة الدفعة (Costing)</h3>
          <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">تكلفة الصاج الفعلي الواحد: 65.65 ج.م (خامات 8450 + أجور 650 + صناعية 420).</p>
        </div>
      )}
      {activeTab === 5 && (
        <div className="bg-white dark:bg-[#0f1117] p-6 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-rose-700 dark:text-rose-400">المرحلة 5: مركز التقارير واليوميات وكفاءة الأقسام</h3>
          <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">نسبة إنجاز خطة الإنتاج اليومية: 96.6% مع معدل هالك 3.4%.</p>
        </div>
      )}

      {/* النافذة الأصلية المعمارية المنبثقة: أمر تشغيل متعدد الأصناف */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#11131c] border-2 border-slate-400 dark:border-zinc-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-zinc-100" dir="rtl">
            <div className="p-4 bg-slate-100 dark:bg-[#181b26] border-b border-slate-300 dark:border-zinc-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-black text-amber-700 dark:text-amber-400">
                  إصدار أمر تشغيل لصالة إنتاج (ربطاً آلياً بالصالة ومخزنها)
                </h3>
              </div>
              <button onClick={() => setShowNewModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-300 mb-1">صالة الإنتاج المسؤولة</label>
                  <select
                    value={selectedHall}
                    onChange={(e) => handleHallChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#1a1d2b] border border-slate-300 dark:border-zinc-600 rounded-xl text-slate-900 dark:text-zinc-100 font-black outline-none"
                  >
                    <option value="صالة تصنيع الحلويات الشرقية">صالة تصنيع الحلويات الشرقية</option>
                    <option value="صالة الكنافة والقطايف">صالة الكنافة والقطايف</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-zinc-300 mb-1">تاريخ التشغيل</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#1a1d2b] border border-slate-300 dark:border-zinc-600 rounded-xl text-slate-900 dark:text-zinc-100 font-mono font-black outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-[#151824] border border-slate-300 dark:border-zinc-700 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>إضافة أصناف لأمر التشغيل:</span>
                  </span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 rounded-xl font-mono font-black text-xs">
                    الرصيد المتاح بالمخزن: {selectedItemData.available} {selectedItemData.unit}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-6">
                    <label className="block text-slate-700 dark:text-zinc-400 text-[11px] mb-1">الصنف المطلوب تصنيعه</label>
                    <select
                      value={currentItemCode}
                      onChange={(e) => {
                        setCurrentItemCode(e.target.value);
                        const itm = availableInventoryItems.find(i => i.code === e.target.value);
                        if (itm) setCurrentUnit(itm.unit);
                      }}
                      className="w-full p-2 bg-white dark:bg-[#1d2030] border border-slate-300 dark:border-zinc-600 rounded-xl text-slate-900 dark:text-zinc-100 font-bold outline-none"
                    >
                      {availableInventoryItems.map((itm) => (
                        <option key={itm.code} value={itm.code}>
                          [{itm.code}] - {itm.name} (المتاح: {itm.available} {itm.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 dark:text-zinc-400 text-[11px] mb-1">الكمية</label>
                    <input
                      type="number"
                      min="1"
                      value={currentQty}
                      onChange={(e) => setCurrentQty(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-[#1d2030] border border-slate-300 dark:border-zinc-600 rounded-xl text-slate-900 dark:text-zinc-100 font-mono font-black text-center outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 dark:text-zinc-400 text-[11px] mb-1">الوحدة</label>
                    <select
                      value={currentUnit}
                      onChange={(e) => setCurrentUnit(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#1d2030] border border-slate-300 dark:border-zinc-600 rounded-xl text-slate-900 dark:text-zinc-100 font-bold outline-none text-center"
                    >
                      <option value="صاج">صاج</option>
                      <option value="كجم">كجم</option>
                      <option value="قطعة">قطعة</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItemToOrder}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="w-1/3 py-2.5 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-300 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={orderItemsList.length === 0}
                  className={`w-2/3 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md ${
                    orderItemsList.length > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-300 text-slate-500 dark:bg-zinc-800 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وإصدار أمر التشغيل ({orderItemsList.length} أصناف)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductionOperationsHubPage;
