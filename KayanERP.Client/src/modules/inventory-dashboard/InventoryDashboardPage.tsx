import React, { useState } from 'react';
import {
  Boxes,
  Search,
  FileSpreadsheet,
  AlertTriangle,
  RotateCw,
  TrendingDown,
  Layers
} from 'lucide-react';

interface InventoryDashboardPageProps {
  onNavigate?: (tab: string) => void;
}

export const InventoryDashboardPage: React.FC<InventoryDashboardPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const stockItems = [
    { code: 'RAW-SUG-01', name: 'سكر أبيض ناعم كيس 50 كجم', category: 'خامات', warehouse: 'مستودع الخامات المركزي', balance: 420, reserved: 50, available: 370, unit: 'شيكارة', cost: 850, totalVal: 357000, status: 'مخزون آمن ✓' },
    { code: 'RAW-BTR-02', name: 'زبدة طبيعي نيوزيلندي قالب 25 كجم', category: 'خامات', warehouse: 'مستودع الخامات المركزي', balance: 55, reserved: 30, available: 25, unit: 'كرتونة', cost: 4200, totalVal: 231000, status: 'مخزون آمن ✓' },
    { code: 'FG-BAS-01', name: 'بسبوسة سادة بالسمن البلدي', category: 'منتج تام', warehouse: 'مخزن كنترول المنتج التام', balance: 180, reserved: 30, available: 150, unit: 'كجم', cost: 75, totalVal: 13500, status: 'مخزون آمن ✓' },
    { code: 'WIP-DGH-01', name: 'عجينة معمول بالتمر جاهزة', category: 'نصف مصنع', warehouse: 'ثلاجة النصف مصنع والتجهيزات', balance: 8, reserved: 0, available: 8, unit: 'كجم', cost: 65, totalVal: 520, status: 'قارب على النفاذ ⚠️' }
  ];

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الشاشة التنفيذي والمؤشرات */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-500" />
            <span>لوحة قيادة ورقابة المخزون التنفيذية (Live Inventory Control)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            التقييم المالي اللحظي للأرصدة، إنذار الصلاحية (FEFO)، ومراقبة النواقص والمسار التراكمي.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('تم تصدير كشف الأرصدة إلى Excel')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير الأرصدة (Excel)</span>
          </button>
        </div>
      </div>

      {/* بطاقات المؤشرات اللحظية الأربعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">إجمالي القيمة المالية للمخزون</span>
          <h4 className="text-2xl font-black text-gray-900 dark:text-zinc-100 font-mono mt-1">2,480,500 <span className="text-xs text-gray-400 font-normal">ج.م</span></h4>
          <small className="text-[10px] text-gray-400 block mt-1">موزع على كافة مخازن وفروع المصنع</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">قيمة مخزون الخامات الأولية</span>
          <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">1,250,000 <span className="text-xs text-gray-400 font-normal">ج.م</span></h4>
          <small className="text-[10px] text-gray-400 block mt-1">المستودعات المركزية ومخازن الخامات</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">قيمة المنتج التام الجاهز للبيع</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">890,000 <span className="text-xs text-gray-400 font-normal">ج.م</span></h4>
          <small className="text-[10px] text-gray-400 block mt-1">مخازن الكنترول ومعارض الفروع</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">رادار الصلاحية والنواقص</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">6 نواقص <span className="text-xs text-amber-500 font-bold mr-1">3 لوطات مهددة</span></h4>
          <small className="text-[10px] text-gray-400 block mt-1">متابعة دقيقة لحد الأمان وتواريخ الصلاحية</small>
        </div>
      </div>

      {/* جدول الأرصدة والمخازن */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-3">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث باسم الصنف أو الكود أو المستودع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-1.5 outline-none font-bold text-gray-800 dark:text-zinc-200"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 font-bold text-gray-700 dark:text-zinc-300 outline-none"
          >
            <option value="">-- كافة التصنيفات (خامات، وسيط، تام) --</option>
            <option value="خامات">خامات</option>
            <option value="منتج تام">منتج تام</option>
            <option value="نصف مصنع">نصف مصنع</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">كود الصنف</th>
                <th className="py-3 px-3 text-right">اسم الصنف</th>
                <th className="py-3 px-3">النوع</th>
                <th className="py-3 px-3">المستودع</th>
                <th className="py-3 px-3">الرصيد الفعلي</th>
                <th className="py-3 px-3">المحجوز</th>
                <th className="py-3 px-3">الرصيد المتاح</th>
                <th className="py-3 px-3">متوسط التكلفة</th>
                <th className="py-3 px-3">القيمة الإجمالية</th>
                <th className="py-3 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {stockItems.map(item => (
                <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.code}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">{item.name}</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded border dark:border-zinc-800 font-mono text-[10px]">{item.category}</span></td>
                  <td className="py-3 px-3 text-gray-500 dark:text-zinc-400">{item.warehouse}</td>
                  <td className="py-3 px-3 font-mono font-bold">{item.balance} {item.unit}</td>
                  <td className="py-3 px-3 font-mono text-amber-500">{item.reserved} {item.unit}</td>
                  <td className="py-3 px-3 font-mono font-black text-emerald-600">{item.available} {item.unit}</td>
                  <td className="py-3 px-3 font-mono">{item.cost.toLocaleString()} ج.م</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">{item.totalVal.toLocaleString()} ج.م</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      item.status.includes('آمن')
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
