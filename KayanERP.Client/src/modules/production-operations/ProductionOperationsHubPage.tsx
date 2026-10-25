import React, { useState, useEffect, useMemo } from 'react';
import {
  Factory,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
  TrendingUp,
  RotateCw
} from 'lucide-react';
import {
  fetchProductionOrdersApi,
  fetchProductionLookupsApi,
  saveProductionOrderApi
} from './productionOperationsApi';
import type {
  DepartmentDto,
  ShiftLookupDto,
  ProductionOrderDto,
  ProductionOperationsLookupsDto
} from './productionOperationsApi';

export const ProductionOperationsHubPage: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrderDto[]>([]);
  const [lookups, setLookups] = useState<ProductionOperationsLookupsDto>({
    departments: [],
    shifts: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // حالة إضافة أمر تشغيل جديد
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [shiftName, setShiftName] = useState<string>('الوردية الصباحية');
  const [plannedQuantity, setPlannedQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('كجم');
  const [supervisorName, setSupervisorName] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ords, lkps] = await Promise.all([
        fetchProductionOrdersApi(),
        fetchProductionLookupsApi()
      ]);
      setOrders(ords);
      setLookups(lkps);
      if (lkps.departments.length > 0) setDepartmentId(lkps.departments[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        !searchTerm.trim() ||
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.productName.includes(searchTerm) ||
        o.supervisorName.includes(searchTerm);
      const matchDept = !deptFilter || o.departmentId === deptFilter;
      const matchStatus = !statusFilter || o.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [orders, searchTerm, deptFilter, statusFilter]);

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || plannedQuantity <= 0) return;

    const dept = lookups.departments.find(d => d.id === departmentId);

    const newOrder: ProductionOrderDto = {
      id: Date.now(),
      orderNumber: `PRD-ORD-2026-${Date.now().toString().slice(-3)}`,
      departmentId,
      departmentName: dept?.departmentName || '',
      shiftName,
      productName,
      plannedQuantity: Number(plannedQuantity),
      actualQuantity: 0,
      unit,
      status: 'قيد التشغيل',
      supervisorName: supervisorName || 'شيف التشغيل المسند',
      startTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      standardBatchCost: 85,
      actualBatchCost: 85
    };

    await saveProductionOrderApi(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    setIsModalOpen(false);
    setProductName('');
    setStatusMessage(`تم فتح أمر التشغيل الصناعي (${newOrder.orderNumber}) بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Factory className="w-6 h-6 text-indigo-400" />
              <span>غرفة عمليات الإنتاج والتكاليف الصناعية (MES Hub)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              رقابة أوامر التشغيل المباشرة
            </span>
          </div>
          <p className="text-xs text-slate-400">
            متابعة أوامر التشغيل بالصالات، مقارنة المستهدف بالفعلي، واحتساب تكاليف الطبخة الصناعية لحظياً.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إنشاء أمر تشغيل معملي</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
            title="تحديث"
          >
            <RotateCw className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* البحث والفلترة */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم أمر التشغيل، المنتج، الشيف المسؤول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(Number(e.target.value))}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value={0}>-- كافة صالات التشغيل --</option>
          {lookups.departments.map(d => (
            <option key={d.id} value={d.id}>{d.departmentName}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كل الحالات --</option>
          <option value="قيد التشغيل">قيد التشغيل</option>
          <option value="مكتمل">مكتمل</option>
          <option value="مخطط">مخطط</option>
        </select>
      </div>

      {/* جدول أوامر التشغيل */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-bold">جاري تحميل غرفة عمليات الإنتاج...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold">لا توجد أوامر تشغيل مطابقة للبحث.</div>
        ) : (
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-3">رقم الأمر</th>
                <th className="py-3 px-3 text-right">المنتج المستهدف</th>
                <th className="py-3 px-3">صالة التشغيل</th>
                <th className="py-3 px-3">الوردية</th>
                <th className="py-3 px-3">الشيف المسؤول</th>
                <th className="py-3 px-3">المخطط / الفعلي</th>
                <th className="py-3 px-3">التكلفة المعيارية / الفعلية</th>
                <th className="py-3 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{o.orderNumber}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">{o.productName}</td>
                  <td className="py-3 px-3 font-medium text-gray-700">{o.departmentName}</td>
                  <td className="py-3 px-3 text-gray-600">{o.shiftName}</td>
                  <td className="py-3 px-3 font-medium text-gray-800">{o.supervisorName}</td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className="text-emerald-700">{o.actualQuantity}</span> / <span className="text-gray-500">{o.plannedQuantity} {o.unit}</span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="font-bold text-slate-800">{o.actualBatchCost}</span> / <span className="text-gray-400">{o.standardBatchCost} ج.م</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        o.status === 'مكتمل'
                          ? 'bg-emerald-50 text-emerald-700'
                          : o.status === 'قيد التشغيل'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نافذة إنشاء أمر تشغيل */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Factory className="w-4 h-4 text-amber-400" />
                <span>إصدار أمر تشغيل صناعي جديد</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white">×</button>
            </div>
            <form onSubmit={handleSaveOrder} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">المنتج المراد تصنيعه *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بسبوسة سادة بالسمن البلدي"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">صالة الإنتاج *</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    {lookups.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الوردية</label>
                  <select
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    {lookups.shifts.map(s => (
                      <option key={s.id} value={s.shiftName}>{s.shiftName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الكمية المخططة *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={plannedQuantity}
                    onChange={(e) => setPlannedQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">وحدة القياس</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">الشيف المشرف على التشغيل</label>
                <input
                  type="text"
                  placeholder="مثال: الشيف سمير إبراهيم"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  بدء أمر التشغيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
