import React, { useState } from 'react';
import {
  PackageOpen,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Scale,
  Calendar,
  AlertTriangle,
  X
} from 'lucide-react';

export const MaterialRequisitionsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [requisitions, setRequisitions] = useState([
    {
      id: 'REQ-202610-001',
      orderNumber: 'PRD-ORD-2026-883',
      department: 'صالة تصنيع الحلويات الشرقية',
      chefName: 'شيف صالة التشغيل (عمرو بدير)',
      date: '2026-10-25',
      itemsCount: 4,
      totalCost: 2850,
      status: 'معتمد ومصروف'
    },
    {
      id: 'REQ-202610-002',
      orderNumber: 'PRD-ORD-2026-884',
      department: 'صالة تصنيع الحلويات الغربية والتورت',
      chefName: 'شيف معمل التورت (سامح فوزي)',
      date: '2026-10-25',
      itemsCount: 3,
      totalCost: 1940,
      status: 'بانتظار موافقة المخزن'
    }
  ]);

  // Form State
  const [selectedOrder, setSelectedOrder] = useState('PRD-ORD-2026-883');
  const [selectedHall, setSelectedHall] = useState('صالة تصنيع الحلويات الشرقية');
  const [chefName, setChefName] = useState('شيف صالة التشغيل');
  const [itemsList, setItemsList] = useState([
    { id: 1, name: 'سمن بلدي بقري طبيعي', qty: 25, unit: 'كجم', unitCost: 190, total: 4750 },
    { id: 2, name: 'دقيق فاخر استخراج 72%', qty: 100, unit: 'كجم', unitCost: 28, total: 2800 }
  ]);

  const totalCost = itemsList.reduce((sum, item) => sum + item.total, 0);

  const addItemRow = () => {
    setItemsList([
      ...itemsList,
      { id: Date.now(), name: 'سكر مكرر ناعم', qty: 50, unit: 'كجم', unitCost: 32, total: 1600 }
    ]);
  };

  const removeItemRow = (id: number) => {
    setItemsList(itemsList.filter(i => i.id !== id));
  };

  const handleSaveRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `REQ-202610-00${requisitions.length + 1}`,
      orderNumber: selectedOrder,
      department: selectedHall,
      chefName,
      date: new Date().toISOString().slice(0, 10),
      itemsCount: itemsList.length,
      totalCost,
      status: 'بانتظار موافقة المخزن'
    };
    setRequisitions([newReq, ...requisitions]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
            <PackageOpen className="w-6 h-6 text-amber-500" />
            <span>أذون صرف خامات الصالة والمعامل (Material Requisitions)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            إصدار ومتابعة طلبات صرف الخامات من المستودع الرئيسي لصالات التشغيل وفق أوامر التصنيع.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ إصدار إذن صرف خامات جديد</span>
        </button>
      </div>

      {/* جدول الأذونات الحالية */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث برقم الإذن أو الصالة أو الشيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-1.5 outline-none font-bold text-gray-800 dark:text-zinc-200"
            />
          </div>
          <span className="font-bold text-gray-500">إجمالي الأذونات: {requisitions.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">رقم الإذن</th>
                <th className="py-3 px-3">أمر التشغيل</th>
                <th className="py-3 px-3 text-right">الصالة الطالبة</th>
                <th className="py-3 px-3 text-right">مقدم الطلب</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">عدد البنود</th>
                <th className="py-3 px-3">التكلفة التقديرية</th>
                <th className="py-3 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {requisitions.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{req.id}</td>
                  <td className="py-3 px-3 font-mono text-gray-700 dark:text-zinc-300">{req.orderNumber}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">{req.department}</td>
                  <td className="py-3 px-3 text-right text-gray-700 dark:text-zinc-300 font-medium">{req.chefName}</td>
                  <td className="py-3 px-3 font-mono text-gray-500 dark:text-zinc-400">{req.date}</td>
                  <td className="py-3 px-3 font-bold">{req.itemsCount} أصناف</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">{req.totalCost.toLocaleString()} ج.م</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      req.status === 'معتمد ومصروف'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* المودال الحديث بتصميم متوافق مع وضع الليل الصافي */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-amber-400">
                <PackageOpen className="w-4 h-4" />
                <span>إصدار إذن طلب وصرف خامات لصالة الإنتاج</span>
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequisition} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الجهة الطالبة / صالة التشغيل *</label>
                  <select
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                  >
                    <option>صالة تصنيع الحلويات الشرقية</option>
                    <option>صالة تصنيع الحلويات الغربية والتورت</option>
                    <option>قسم النواشف والكرواسون</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">رقم أمر التشغيل المرتبط</label>
                  <select
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-amber-500"
                  >
                    <option value="PRD-ORD-2026-883">PRD-ORD-2026-883 (بسبوسة سمن بلدي)</option>
                    <option value="PRD-ORD-2026-884">PRD-ORD-2026-884 (تورتة بلاك فورست)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم الشيف / مقدم الطلب</label>
                  <input
                    type="text"
                    value={chefName}
                    onChange={(e) => setChefName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* جدول الخامات والمقادير المطلوبة */}
              <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-3 bg-slate-50 dark:bg-zinc-900/50 space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800 dark:text-zinc-200">الخامات والمقادير المطلوبة:</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg font-bold text-[11px]"
                  >
                    + إضافة خامة
                  </button>
                </div>

                <div className="space-y-2">
                  {itemsList.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-[#0c0d11] p-2 rounded-lg border border-gray-200 dark:border-zinc-800">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItemsList(itemsList.map(i => i.id === item.id ? { ...i, name: val } : i));
                          }}
                          className="w-full px-2 py-1 bg-transparent border-0 font-bold text-gray-800 dark:text-zinc-100 outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const q = Number(e.target.value);
                            setItemsList(itemsList.map(i => i.id === item.id ? { ...i, qty: q, total: q * i.unitCost } : i));
                          }}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded font-mono text-center font-bold"
                        />
                      </div>
                      <div className="col-span-3 text-left font-mono font-bold text-emerald-600">
                        {item.total.toLocaleString()} ج.م
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(item.id)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-zinc-800 font-bold">
                  <span className="text-gray-500">إجمالي تكلفة الخامات المطلوبة:</span>
                  <span className="font-mono text-amber-500 text-sm font-black">{totalCost.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال إذن الصرف للاعتماد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
