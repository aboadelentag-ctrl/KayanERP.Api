import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  PlusCircle,
  Search,
  CheckCircle2,
  Award,
  AlertTriangle,
  Users,
  Percent,
  Calendar,
  Building2
} from 'lucide-react';
import {
  fetchProductivityLogsApi,
  fetchProductivityLookupsApi,
  saveProductivityRecordApi
} from './productivityApi';
import type {
  WorkerProductivityDto,
  ProductivityLookupsDto
} from './productivityApi';

export const ProductivityPage: React.FC = () => {
  const [logs, setLogs] = useState<WorkerProductivityDto[]>([]);
  const [lookups, setLookups] = useState<ProductivityLookupsDto>({
    departments: [],
    shifts: [],
    workers: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // حالة إضافة قيد إنتاجية
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWorkerCode, setSelectedWorkerCode] = useState<string>('');
  const [shift, setShift] = useState<'صباحي' | 'مسائي' | 'ليلي'>('صباحي');
  const [targetOutput, setTargetOutput] = useState<number>(100);
  const [actualOutput, setActualOutput] = useState<number>(100);
  const [unit, setUnit] = useState<string>('كجم / صينية');
  const [wasteQuantity, setWasteQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [records, lkps] = await Promise.all([
        fetchProductivityLogsApi(),
        fetchProductivityLookupsApi()
      ]);
      setLogs(records);
      setLookups(lkps);
      if (lkps.workers.length > 0) {
        setSelectedWorkerCode(lkps.workers[0].code);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch =
        !searchTerm.trim() ||
        log.workerName.includes(searchTerm) ||
        log.workerCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = !selectedDept || log.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [logs, searchTerm, selectedDept]);

  const avgEfficiency = useMemo(() => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, curr) => acc + curr.efficiencyPercentage, 0);
    return Number((sum / logs.length).toFixed(1));
  }, [logs]);

  const totalBonuses = useMemo(() => logs.reduce((acc, curr) => acc + curr.bonusAmount, 0), [logs]);
  const totalWaste = useMemo(() => logs.reduce((acc, curr) => acc + curr.wasteQuantity, 0), [logs]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const worker = lookups.workers.find(w => w.code === selectedWorkerCode);
    if (!worker || targetOutput <= 0) return;

    const eff = Number(((actualOutput / targetOutput) * 100).toFixed(1));
    const bonus = eff > 100 ? (eff - 100) * 10 : 0;
    const penalty = eff < 95 ? (95 - eff) * 8 : 0;

    const newRecord: WorkerProductivityDto = {
      id: Date.now(),
      workerCode: worker.code,
      workerName: worker.name,
      department: worker.department,
      shift,
      targetOutput: Number(targetOutput),
      actualOutput: Number(actualOutput),
      unit,
      wasteQuantity: Number(wasteQuantity),
      efficiencyPercentage: eff,
      bonusAmount: Math.round(bonus),
      penaltyAmount: Math.round(penalty),
      date: new Date().toISOString().slice(0, 10),
      notes
    };

    await saveProductivityRecordApi(newRecord);
    setLogs(prev => [newRecord, ...prev]);
    setIsModalOpen(false);
    setStatusMessage(`تم قيد مؤشر إنتاجية (${worker.name}) واحتساب الحافز آلياً.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span>متابعة الإنتاجية وكفاءة صالات التشغيل (Worker Productivity)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              رقابة الأداء وحوافز العمال
            </span>
          </div>
          <p className="text-xs text-slate-400">
            مقارنة المستهدف بالفعلي لكل شيف وعامل، مراقبة الهدر في الخامات، واحتساب مكافآت الإنجاز آلياً.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تسجيل بيان إنتاجية وردية</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات المؤشرات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">متوسط كفاءة التشغيل العام</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">{avgEfficiency}%</h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">عدد تسجيلات الورديات</span>
          <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">{logs.length} <span className="text-xs font-normal text-gray-500">سجل</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي حوافز التميز المقدرة</span>
          <h4 className="text-2xl font-black text-amber-600 font-mono mt-1">{totalBonuses.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-rose-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">مجموع الهدر المرصود</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">{totalWaste.toFixed(1)} <span className="text-xs font-normal text-gray-500">كجم</span></h4>
        </div>
      </div>

      {/* شريط الفلترة */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث باسم الشيف، كود الموظف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة الصالات والأقسام --</option>
          {lookups.departments.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* جدول كفاءة الإنتاجية */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-bold">جاري تحميل بيانات إنتاجية الصالات...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold">لا توجد بيانات مسجلة.</div>
        ) : (
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3 text-right">الموظف / الشيف</th>
                <th className="py-3 px-3">الصالة</th>
                <th className="py-3 px-3">الوردية</th>
                <th className="py-3 px-3">المستهدف</th>
                <th className="py-3 px-3">الفعلي المحقق</th>
                <th className="py-3 px-3">نسبة الكفاءة</th>
                <th className="py-3 px-3">الهدر</th>
                <th className="py-3 px-3">الحافز المقدر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-gray-500">{log.date}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                    {log.workerName}
                    <span className="text-[10px] text-gray-400 block font-mono">[{log.workerCode}]</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-700">{log.department}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-gray-700 font-bold">{log.shift}</span>
                  </td>
                  <td className="py-3 px-3 font-mono">{log.targetOutput} {log.unit}</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-900">{log.actualOutput} {log.unit}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono font-black px-2 py-0.5 rounded-full text-[11px] ${
                        log.efficiencyPercentage >= 100
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.efficiencyPercentage >= 95
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {log.efficiencyPercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-rose-600 font-bold">{log.wasteQuantity} كجم</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                    {log.bonusAmount > 0 ? `+${log.bonusAmount} ج.م` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نافذة تسجيل بيان إنتاجية */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>تسجيل إنتاجية وردية لشيف / عامل</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white font-bold text-base">×</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">الموظف / الشيف *</label>
                <select
                  value={selectedWorkerCode}
                  onChange={(e) => setSelectedWorkerCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                >
                  {lookups.workers.map(w => (
                    <option key={w.code} value={w.code}>[{w.code}] {w.name} - {w.department}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الوردية</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    <option value="صباحي">صباحي</option>
                    <option value="مسائي">مسائي</option>
                    <option value="ليلي">ليلي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">وحدة القياس</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الإنتاج المستهدف *</label>
                  <input
                    type="number"
                    min={1}
                    value={targetOutput}
                    onChange={(e) => setTargetOutput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-emerald-800 font-bold mb-1">الإنتاج الفعلي *</label>
                  <input
                    type="number"
                    min={0}
                    value={actualOutput}
                    onChange={(e) => setActualOutput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-emerald-400 rounded-xl font-mono text-center font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-rose-800 font-bold mb-1">الهدر (كجم)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={wasteQuantity}
                    onChange={(e) => setWasteQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl font-mono text-center font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">ملاحظات التشغيل وأسباب التفاوت</label>
                <input
                  type="text"
                  placeholder="أسباب التميز أو الأعطال إن وجدت..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  💾 اعتماد الإنتاجية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
