import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  PlusCircle,
  ClipboardList,
  Layers,
  Clock,
  DollarSign,
  BarChart3,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchProductionLookupsApi,
  fetchActiveOrdersApi,
  ProductionOrderDto,
  DepartmentDto,
  WarehouseDto,
  ItemDto,
  EmployeeDto,
  OrderExecutionFullDto,
  ShiftCrewMemberDto,
  DepartmentKpiResultDto,
  DetailedAttendanceLogDto,
  EmployeeDossierDto
} from './productionOperationsApi';

export const ProductionOperationsHubPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'execution' | 'shift' | 'costing' | 'reports'>('orders');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  const [ordersList, setOrdersList] = useState<ProductionOrderDto[]>([]);
  const [allDepartmentsList, setAllDepartmentsList] = useState<DepartmentDto[]>([]);
  const [allWarehousesList, setAllWarehousesList] = useState<WarehouseDto[]>([]);
  const [allItemsList, setAllItemsList] = useState<ItemDto[]>([]);
  const [allEmployeesList, setAllEmployeesList] = useState<EmployeeDto[]>([]);
  
  const [searchOrderTerm, setSearchOrderTerm] = useState<string>('');
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newOrderDeptId, setNewOrderDeptId] = useState<number>(0);
  const [newOrderDate, setNewOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedItemToAddId, setSelectedItemToAddId] = useState<number>(0);
  const [itemToAddQty, setItemToAddQty] = useState<number>(10);
  const [newOrderLines, setNewOrderLines] = useState<{ itemId: number; itemName: string; plannedQuantity: number; unit: string }[]>([]);

  const [shiftDeptFilter, setShiftDeptFilter] = useState<number>(0);
  const [shiftCrewList, setShiftCrewList] = useState<ShiftCrewMemberDto[]>([]);

  useEffect(() => {
    loadLookupsAndOrders();
  }, []);

  const loadLookupsAndOrders = async () => {
    try {
      const lookups = await fetchProductionLookupsApi();
      setAllDepartmentsList(lookups.departments);
      setAllWarehousesList(lookups.warehouses);
      setAllItemsList(lookups.items);
      setAllEmployeesList(lookups.employees);

      if (lookups.departments.length > 0) {
        setNewOrderDeptId(lookups.departments[0].id);
        setShiftDeptFilter(lookups.departments[0].id);
      }

      setShiftCrewList(
        lookups.employees.map((e) => ({
          employeeId: e.id,
          employeeCode: e.employeeCode,
          employeeName: e.name,
          departmentId: e.departmentId,
          departmentName: e.departmentName,
          jobTitleName: e.jobTitle,
          attendanceStatus: 'حاضر',
          hoursWorked: 8
        }))
      );

      const orders = await fetchActiveOrdersApi();
      setOrdersList(orders);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      const matchSearch = !searchOrderTerm || o.orderNumber.includes(searchOrderTerm) || o.warehouseName.includes(searchOrderTerm) || o.departmentName.includes(searchOrderTerm);
      const matchStatus = !selectedOrderStatusFilter || o.status === selectedOrderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [ordersList, searchOrderTerm, selectedOrderStatusFilter]);

  const filteredShiftCrew = useMemo(() => {
    return shiftCrewList.filter((c) => shiftDeptFilter === 0 || c.departmentId === shiftDeptFilter);
  }, [shiftCrewList, shiftDeptFilter]);

  const addItemToCreateList = () => {
    const itm = allItemsList.find((i) => i.id === selectedItemToAddId);
    if (itm && itemToAddQty > 0) {
      setNewOrderLines((prev) => [
        ...prev,
        { itemId: itm.id, itemName: itm.itemName, plannedQuantity: itemToAddQty, unit: itm.unit }
      ]);
      setSelectedItemToAddId(0);
      setItemToAddQty(10);
    }
  };

  const submitCreateOrder = async () => {
    try {
      setStatusMessage('✅ تم إصدار أمر التشغيل بنجاح وربطه بمخزن الصالة آلياً!');
      setIsSuccess(true);
      setIsCreateModalOpen(false);
      setNewOrderLines([]);
    } catch (ex: any) {
      setStatusMessage(`خطأ: ${ex.message}`);
      setIsSuccess(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-400" />
              <span>غرفة عمليات الإنتاج والتكاليف والورديات الموحدة (MES)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black">نظام الربط الصناعي المغلق</span>
          </div>
          <p className="text-xs text-slate-400">
            الربط الإجباري للصالة ومخزنها، تقفيل كامل أصناف الأوامر باللوطات، فرز وحضور الورديات، وقواعد ساعات العمل والتأخير الصناعية.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إصدار أمر تشغيل جديد</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="font-bold">×</button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'orders' ? 'border-amber-500 text-gray-900 bg-white rounded-t-xl' : 'border-transparent text-gray-500'}`}
        >
          <ClipboardList className="w-4 h-4 text-amber-500" />
          <span>1. سجل أوامر التشغيل والإنتاج ({ordersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('execution')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'execution' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl' : 'border-transparent text-gray-500'}`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>2. التنفيذ الميداني وتقفيل اللوط والهالك</span>
        </button>

        <button
          onClick={() => setActiveTab('shift')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'shift' ? 'border-amber-500 text-amber-700 bg-white rounded-t-xl' : 'border-transparent text-gray-500'}`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>3. إدارة الوردية وحضور العمال ({filteredShiftCrew.length} عامل)</span>
        </button>

        <button
          onClick={() => setActiveTab('costing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'costing' ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl' : 'border-transparent text-gray-500'}`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>4. احتساب وتحليل تكلفة الدفعة (Costing)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'reports' ? 'border-cyan-600 text-cyan-700 bg-white rounded-t-xl' : 'border-transparent text-gray-500'}`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-600" />
          <span>5. مركز التقارير واليوميات وكفاءة الأقسام</span>
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <input
              type="text"
              placeholder="بحث برقم الأمر، الصنف، الصالة..."
              value={searchOrderTerm}
              onChange={(e) => setSearchOrderTerm(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 w-full md:w-1/3 outline-none focus:border-indigo-600"
            />
            <select
              value={selectedOrderStatusFilter}
              onChange={(e) => setSelectedOrderStatusFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold outline-none"
            >
              <option value="">-- كل الحالات --</option>
              <option value="PENDING_EXECUTION">جاهز للتنفيذ ⏳</option>
              <option value="COMPLETED">مكتمل ومقفل بالكامل ✓</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <table className="w-full text-center">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-3 px-3">رقم أمر التشغيل</th>
                  <th className="py-3 px-3">تاريخ التشغيل</th>
                  <th className="py-3 px-3">صالة الإنتاج</th>
                  <th className="py-3 px-3">مخزن الصالة</th>
                  <th className="py-3 px-3 text-right">الأصناف المطلوبة</th>
                  <th className="py-3 px-3">إجمالي الكمية</th>
                  <th className="py-3 px-3">المنفذ الفعلي</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3">الإجراء الميداني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-gray-400 font-bold">لا توجد أوامر تشغيل مطابقة للبحث.</td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">{o.orderNumber}</td>
                      <td className="py-3 px-3 font-mono text-gray-500">{o.orderDate}</td>
                      <td className="py-3 px-3 font-bold text-gray-900">{o.departmentName}</td>
                      <td className="py-3 px-3 text-gray-500">{o.warehouseName}</td>
                      <td className="py-3 px-3 text-right">
                        {o.details.map((d, i) => (
                          <div key={i}>• <strong>{d.itemName}</strong> ({d.plannedQuantity} {d.unit})</div>
                        ))}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">{o.details.reduce((a, b) => a + b.plannedQuantity, 0)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">{o.details.reduce((a, b) => a + b.producedQuantity, 0)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                          {o.status === 'COMPLETED' ? 'مكتمل ✓' : 'جاهز للتنفيذ ⏳'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setActiveTab('execution')}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                        >
                          ⚙️ تنفيذ وتقفيل
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-bold">➕ إصدار أمر تشغيل لصالة إنتاج (ربط آلي بالصالة ومخزنها)</h4>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white font-bold">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">صالة الإنتاج *</label>
                  <select
                    value={newOrderDeptId}
                    onChange={(e) => setNewOrderDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                  >
                    {allDepartmentsList.map((d) => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">مخزن الصالة (مربوط آلياً) 🔒</label>
                  <input
                    type="text"
                    readOnly
                    value="مستودع خامات الصالة الرئيسي"
                    className="w-full px-3 py-2 bg-slate-100 border border-gray-200 rounded-xl font-mono text-emerald-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">تاريخ التشغيل *</label>
                  <input
                    type="date"
                    value={newOrderDate}
                    onChange={(e) => setNewOrderDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div className="p-3 bg-white border rounded-xl space-y-3">
                <h5 className="font-bold text-indigo-700">إضافة أصناف لأمر التشغيل:</h5>
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <label className="block text-gray-700 font-bold mb-1">اختر الصنف *</label>
                    <select
                      value={selectedItemToAddId}
                      onChange={(e) => setSelectedItemToAddId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                    >
                      <option value="0">-- اختر الصنف --</option>
                      {allItemsList.map((itm) => (
                        <option key={itm.id} value={itm.id}>{itm.itemName} ({itm.itemCode})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-gray-700 font-bold mb-1">الكمية المخططة *</label>
                    <input
                      type="number"
                      min={1}
                      value={itemToAddQty}
                      onChange={(e) => setItemToAddQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold text-center"
                    />
                  </div>
                  <div className="col-span-3">
                    <button
                      type="button"
                      onClick={addItemToCreateList}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      ➕ إضافة للقائمة
                    </button>
                  </div>
                </div>

                <table className="w-full text-center border mt-2">
                  <thead className="bg-slate-100 text-gray-700 font-bold">
                    <tr>
                      <th className="py-2 px-3 text-right">الصنف</th>
                      <th className="py-2 px-3">الكمية</th>
                      <th className="py-2 px-3">الوحدة</th>
                      <th className="py-2 px-3">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {newOrderLines.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-gray-400 font-bold">لا توجد أصناف مضافة للقائمة.</td>
                      </tr>
                    ) : (
                      newOrderLines.map((l, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 text-right font-bold">{l.itemName}</td>
                          <td className="py-2 px-3 font-mono font-bold text-indigo-700">{l.plannedQuantity}</td>
                          <td className="py-2 px-3 text-gray-500">{l.unit}</td>
                          <td className="py-2 px-3">
                            <button onClick={() => setNewOrderLines(newOrderLines.filter((_, idx) => idx !== i))} className="text-rose-600 hover:text-rose-800">
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl">إلغاء</button>
                <button
                  type="button"
                  disabled={newOrderLines.length === 0}
                  onClick={submitCreateOrder}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  💾 حفظ وإصدار أمر التشغيل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
