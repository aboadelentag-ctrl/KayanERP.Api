import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PlusCircle,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  Clock,
  Layers,
  X,
  Send,
  Building2,
  Search
} from 'lucide-react';

export interface WorkerProductivityDto {
  id: number;
  department: string;
  workerName: string;
  workerCode: string;
  itemName: string;
  targetPerHour: number;
  actualPerHour: number;
  shift: string;
  wasteKg: number;
  bonusAmount: number;
  date: string;
}

export const ProductivityPage: React.FC = () => {
  const departmentsList = [
    'قسم الشرقي',
    'قسم المخبوزات',
    'قسم الجاتوه والتورت',
    'الإسفنجي والنواشف'
  ];

  const [selectedDepartment, setSelectedDepartment] = useState('قسم الشرقي');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Data directly from Razor logic + enhancements
  const [allWorkers, setAllWorkers] = useState<WorkerProductivityDto[]>([
    // قسم الشرقي
    { id: 1, department: 'قسم الشرقي', workerCode: 'EMP-014', workerName: 'محمود عبد الرازق', itemName: 'بسبوسة سادة بالسمن البلدي', targetPerHour: 50, actualPerHour: 55, shift: 'صباحي', wasteKg: 1.5, bonusAmount: 150, date: '2026-10-24' },
    { id: 2, department: 'قسم الشرقي', workerCode: 'EMP-022', workerName: 'سامح إبراهيم', itemName: 'كنافة بالكريمة وبورما', targetPerHour: 40, actualPerHour: 36, shift: 'صباحي', wasteKg: 4.0, bonusAmount: 0, date: '2026-10-24' },
    { id: 3, department: 'قسم الشرقي', workerCode: 'EMP-025', workerName: 'محمود حسن', itemName: 'بقلاوة وأساور مكسرات', targetPerHour: 30, actualPerHour: 22, shift: 'مسائي', wasteKg: 2.2, bonusAmount: 0, date: '2026-10-23' },
    // قسم المخبوزات
    { id: 4, department: 'قسم المخبوزات', workerCode: 'EMP-030', workerName: 'إبراهيم علي', itemName: 'باتيه بالجبنة الرومي', targetPerHour: 100, actualPerHour: 100, shift: 'صباحي', wasteKg: 0.5, bonusAmount: 80, date: '2026-10-24' },
    { id: 5, department: 'قسم المخبوزات', workerCode: 'EMP-031', workerName: 'مصطفى كامل', itemName: 'كرواسون زبدة طبيعي', targetPerHour: 80, actualPerHour: 65, shift: 'صباحي', wasteKg: 1.2, bonusAmount: 0, date: '2026-10-24' },
    { id: 6, department: 'قسم المخبوزات', workerCode: 'EMP-032', workerName: 'علي جابر', itemName: 'دنش فواكه وشيكولاتة', targetPerHour: 50, actualPerHour: 30, shift: 'مسائي', wasteKg: 2.8, bonusAmount: 0, date: '2026-10-23' },
    // قسم الجاتوه والتورت
    { id: 7, department: 'قسم الجاتوه والتورت', workerCode: 'EMP-040', workerName: 'شيف طارق', itemName: 'جاتوه شيكولاتة موس فاخر', targetPerHour: 60, actualPerHour: 65, shift: 'صباحي', wasteKg: 0.8, bonusAmount: 120, date: '2026-10-24' },
    { id: 8, department: 'قسم الجاتوه والتورت', workerCode: 'EMP-041', workerName: 'علي عثمان', itemName: 'تورتة بلاك فورست 30*30', targetPerHour: 20, actualPerHour: 21, shift: 'مسائي', wasteKg: 0.8, bonusAmount: 80, date: '2026-10-23' }
  ]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('محمود عبد الرازق');
  const [newWorkerCode, setNewWorkerCode] = useState('EMP-014');
  const [newDepartment, setNewDepartment] = useState('قسم الشرقي');
  const [newItemName, setNewItemName] = useState('بسبوسة سادة بالسمن البلدي');
  const [newTargetPerHour, setNewTargetPerHour] = useState<number>(50);
  const [newActualPerHour, setNewActualPerHour] = useState<number>(55);
  const [newShift, setNewShift] = useState('صباحي');
  const [newWasteKg, setNewWasteKg] = useState<number>(1.2);
  const [newBonusAmount, setNewBonusAmount] = useState<number>(100);

  // Filter Data directly by Department and Search Term
  const filteredWorkers = useMemo(() => {
    return allWorkers.filter(w => {
      const inDept = selectedDepartment === 'الكل' || w.department === selectedDepartment;
      if (!inDept) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        w.workerName.toLowerCase().includes(term) ||
        w.workerCode.toLowerCase().includes(term) ||
        w.itemName.toLowerCase().includes(term)
      );
    });
  }, [allWorkers, selectedDepartment, searchTerm]);

  // Executive Totals
  const totalTarget = useMemo(() => filteredWorkers.reduce((sum, w) => sum + w.targetPerHour, 0), [filteredWorkers]);
  const totalActual = useMemo(() => filteredWorkers.reduce((sum, w) => sum + w.actualPerHour, 0), [filteredWorkers]);
  const avgEfficiency = useMemo(() => {
    if (filteredWorkers.length === 0) return 0;
    const effSum = filteredWorkers.reduce((sum, w) => sum + (w.targetPerHour > 0 ? (w.actualPerHour / w.targetPerHour) * 100 : 0), 0);
    return Math.round((effSum / filteredWorkers.length) * 10) / 10;
  }, [filteredWorkers]);
  const totalWaste = useMemo(() => filteredWorkers.reduce((sum, w) => sum + w.wasteKg, 0), [filteredWorkers]);
  const totalBonus = useMemo(() => filteredWorkers.reduce((sum, w) => sum + w.bonusAmount, 0), [filteredWorkers]);

  const getEfficiency = (actual: number, target: number) => {
    return target > 0 ? Math.round((actual / target) * 1000) / 10 : 0;
  };

  const getEvaluation = (efficiency: number) => {
    if (efficiency >= 100) return 'فوق المتوقع';
    if (efficiency >= 90) return 'ممتاز';
    return 'يحتاج مراجعة';
  };

  const getBadgeClass = (efficiency: number) => {
    if (efficiency >= 100) return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
    if (efficiency >= 90) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    return 'bg-rose-500/10 text-rose-500 border border-rose-500/30';
  };

  const handleSaveShiftRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const created: WorkerProductivityDto = {
      id: Date.now(),
      department: newDepartment,
      workerName: newWorkerName,
      workerCode: newWorkerCode,
      itemName: newItemName,
      targetPerHour: Number(newTargetPerHour),
      actualPerHour: Number(newActualPerHour),
      shift: newShift,
      wasteKg: Number(newWasteKg),
      bonusAmount: Number(newBonusAmount),
      date: new Date().toISOString().slice(0, 10)
    };
    setAllWorkers([created, ...allWorkers]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الشاشة التنفيذي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-500" />
              <span>متابعة الإنتاجية وكفاءة صالات التشغيل (Worker Productivity)</span>
            </h1>
            <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              رقابة الأداء وحوافز العمل
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            مقارنة المستهدف بالفعلي لكل شيف وعامل، مراقبة الهدر في الخامات، واحتساب مكافآت الإنجاز آلياً.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold text-xs text-gray-800 dark:text-zinc-200 outline-none"
          >
            <option value="الكل">-- كل الأقسام والصالات --</option>
            {departmentsList.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ تسجيل بيان إنتاجية وردية</span>
          </button>
        </div>
      </div>

      {/* البطاقات التلخيصية العليا */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-indigo-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">إجمالي المستهدف بالساعة</span>
          <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            {totalTarget} <span className="text-xs font-normal">وحدة</span>
          </h4>
          <small className="text-[10px] text-gray-400">حسب خطط التشغيل المعتمدة</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-emerald-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">الإنتاج الفعلي المحقق</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {totalActual} <span className="text-xs font-normal">وحدة</span>
          </h4>
          <small className="text-[10px] text-gray-400">إجمالي الناتج التام بالصالات</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">متوسط كفاءة التشغيل العام</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">
            {avgEfficiency}%
          </h4>
          <small className="text-[10px] text-gray-400">({filteredWorkers.length} شيف وعامل مسجلين)</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-rose-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">مجموع الهدر / الحوافز</span>
          <h4 className="text-xl font-black text-rose-500 font-mono mt-1">
            {totalWaste.toFixed(1)} كجم <span className="text-xs text-emerald-500 mr-2">+{totalBonus} ج.م حوافز</span>
          </h4>
          <small className="text-[10px] text-gray-400">المرصود خلال فترة العمل</small>
        </div>
      </div>

      {/* شريط البحث الميداني */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث باسم الشيف، كود الموظف، الصنف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-2 outline-none font-bold text-gray-800 dark:text-zinc-200"
          />
        </div>
        <span className="font-bold text-gray-500">
          القسم المعروض: <strong className="text-amber-500">{selectedDepartment}</strong>
        </span>
      </div>

      {/* جدول تفاصيل إنتاجية العمال بالساعة */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3 text-right">الموظف / الشيف</th>
                <th className="py-3 px-3 text-right">الصالة / القسم</th>
                <th className="py-3 px-3">الوردية</th>
                <th className="py-3 px-3">المستهدف</th>
                <th className="py-3 px-3">الفعلي المحقق</th>
                <th className="py-3 px-3">نسبة الكفاءة</th>
                <th className="py-3 px-3">الهدر</th>
                <th className="py-3 px-3">الحافز المقدر</th>
                <th className="py-3 px-3">تقييم الأداء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-gray-400 font-bold">لا توجد بيانات مسجلة لهذا القسم حالياً.</td>
                </tr>
              ) : (
                filteredWorkers.map(w => {
                  const eff = getEfficiency(w.actualPerHour, w.targetPerHour);
                  return (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-3 font-mono text-gray-400">{w.date}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-gray-900 dark:text-zinc-100 block">{w.workerName}</span>
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">[{w.workerCode}]</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-gray-700 dark:text-zinc-300 block">{w.department}</span>
                        <small className="text-gray-400">{w.itemName}</small>
                      </td>
                      <td className="py-3 px-3 font-bold">{w.shift}</td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-700 dark:text-zinc-300">{w.targetPerHour}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{w.actualPerHour}</td>
                      <td className="py-3 px-3 font-mono font-black text-amber-500">{eff}%</td>
                      <td className="py-3 px-3 font-mono text-rose-500 font-bold">{w.wasteKg > 0 ? `${w.wasteKg} كجم` : '-'}</td>
                      <td className="py-3 px-3 font-mono text-emerald-500 font-bold">{w.bonusAmount > 0 ? `+${w.bonusAmount} ج.م` : '-'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getBadgeClass(eff)}`}>
                          {getEvaluation(eff)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: تسجيل بيان إنتاجية وردية جديد */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-amber-500 text-slate-950 flex items-center justify-between">
              <h4 className="font-black flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>تسجيل بيان إنتاجية وردية جديد</span>
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-950 hover:opacity-75">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShiftRecord} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم الشيف / العامل *</label>
                  <input
                    type="text"
                    required
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">كود الموظف</label>
                  <input
                    type="text"
                    value={newWorkerCode}
                    onChange={(e) => setNewWorkerCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">القسم / الصالة *</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الوردية</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                  >
                    <option value="صباحي">صباحي</option>
                    <option value="مسائي">مسائي</option>
                    <option value="ليلي">ليلي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الصنف أو خط العمل *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">المستهدف في الساعة (وحدة) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTargetPerHour}
                    onChange={(e) => setNewTargetPerHour(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الفعلي المحقق في الساعة (وحدة) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newActualPerHour}
                    onChange={(e) => setNewActualPerHour(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-center font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-rose-500 font-bold mb-1">الهدر المرصود (كجم)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={newWasteKg}
                    onChange={(e) => setNewWasteKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-center font-bold text-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-emerald-600 font-bold mb-1">الحافز التقديري (ج.م)</label>
                  <input
                    type="number"
                    min={0}
                    value={newBonusAmount}
                    onChange={(e) => setNewBonusAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-center font-bold text-emerald-600"
                  />
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
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-sm"
                >
                  💾 حفظ بيان الإنتاجية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
