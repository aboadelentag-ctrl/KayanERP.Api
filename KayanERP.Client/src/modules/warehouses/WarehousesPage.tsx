import React, { useState, useMemo } from 'react';
import {
  Warehouse,
  PlusCircle,
  Search,
  FileSpreadsheet,
  RotateCw,
  Edit2,
  Trash2,
  CheckCircle2,
  Building2,
  Layers,
  Boxes,
  X
} from 'lucide-react';

interface WarehousesPageProps {
  onNavigate?: (tab: string) => void;
}

export interface WarehouseDto {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  branchName: string;
  warehouseType: 'خامات' | 'منتج تام' | 'صالة تشغيل' | 'معرض' | 'تالف وهوالك';
  parentWarehouse: string;
  description: string;
  status: 'نشط' | 'معطل';
}

export const WarehousesPage: React.FC<WarehousesPageProps> = ({ onNavigate }) => {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([
    {
      id: 1,
      warehouseCode: 'WH-RAW-01',
      warehouseName: 'مستودع الخامات المركزي (المصنع)',
      branchName: 'الفرع الرئيسي - المصنع',
      warehouseType: 'خامات',
      parentWarehouse: 'مستودع رئيسي',
      description: 'المستودع الرئيسي لاستلام الدقيق والسكر والزيوت والمكسرات',
      status: 'نشط'
    },
    {
      id: 2,
      warehouseCode: 'WH-PRD-01',
      warehouseName: 'مستودع التبريد للمنتج التام',
      branchName: 'الفرع الرئيسي - المصنع',
      warehouseType: 'منتج تام',
      parentWarehouse: 'مستودع الخامات المركزي (المصنع)',
      description: 'غرف التبريد لحفظ صواني البسبوسة والكنافة والتورت قبل الشحن',
      status: 'نشط'
    },
    {
      id: 3,
      warehouseCode: 'WH-LINE-01',
      warehouseName: 'مستودع صالة الشرقي (وسيط التشغيل)',
      branchName: 'الفرع الرئيسي - المصنع',
      warehouseType: 'صالة تشغيل',
      parentWarehouse: 'مستودع الخامات المركزي (المصنع)',
      description: 'صالة تصنيع الحلويات الشرقية لحفظ خامات الوردية الجارية',
      status: 'نشط'
    },
    {
      id: 4,
      warehouseCode: 'WH-DKR-SHOW',
      warehouseName: 'مستودع معرض دكرنس',
      branchName: 'فرع دكرنس',
      warehouseType: 'معرض',
      parentWarehouse: 'مستودع رئيسي',
      description: 'ثلاجات العرض وصالة بيع الحلويات لفرع دكرنس',
      status: 'نشط'
    },
    {
      id: 5,
      warehouseCode: 'WH-DMG-01',
      warehouseName: 'مستودع المرتجعات والهوالك',
      branchName: 'الفرع الرئيسي - المصنع',
      warehouseType: 'تالف وهوالك',
      parentWarehouse: 'مستودع الخامات المركزي (المصنع)',
      description: 'حصر أواني وكسر الحلويات المرتجعة لفحص أسباب التلف',
      status: 'نشط'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(w => {
      if (branchFilter !== 'ALL' && !w.branchName.includes(branchFilter)) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        w.warehouseCode.toLowerCase().includes(term) ||
        w.warehouseName.toLowerCase().includes(term) ||
        w.description.toLowerCase().includes(term) ||
        w.branchName.toLowerCase().includes(term)
      );
    });
  }, [warehouses, branchFilter, searchTerm]);

  const exportToExcel = () => {
    let csv = 'كود_المستودع,اسم_المستودع,الفرع_التابع,نوع_المستودع,المستودع_الرئيسي,الوصف,الحالة\n';
    filteredWarehouses.forEach(w => {
      csv += `"${w.warehouseCode}","${w.warehouseName}","${w.branchName}","${w.warehouseType}","${w.parentWarehouse}","${w.description}","${w.status}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `دليل_المستودعات_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف مستودع: [${name}]؟`)) return;
    setWarehouses(warehouses.filter(w => w.id !== id));
    setStatusMessage(`تم حذف مستودع [${name}] بنجاح.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* ترويسة الشاشة بالثيم الليلي الفاحم */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-indigo-400" />
              <span>إدارة المستودعات ومراكز التخزين (Warehouses)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              هيكلة المستودعات والشجرة الهرمية
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            هيكلة المستودعات والشجرة الهرمية وربطها بالفروع ومنافذ الإنتاج.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث بيانات المستودعات والأرصدة الرقابية بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير (Excel)</span>
          </button>

          <button
            onClick={() => {
              setStatusMessage('💡 نموذج إضافة مستودع جديد قيد الربط بشجرة الحسابات.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إضافة مستودع جديد</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* شريط البحث والفلترة */}
      <div className="bg-white dark:bg-[#0f1117] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بكود أو اسم المستودع..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-zinc-400 font-bold">فلترة حسب الفرع:</span>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">كافة الفروع والمراكز الرئيسية</option>
            <option value="المصنع">الفرع الرئيسي - المصنع</option>
            <option value="دكرنس">فرع دكرنس</option>
            <option value="شربين">فرع شربين</option>
            <option value="بلقاس">فرع بلقاس</option>
          </select>
        </div>
      </div>

      {/* جدول المستودعات ومراكز التخزين */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">كود المستودع</th>
                <th className="py-3 px-3 text-right">اسم المستودع</th>
                <th className="py-3 px-3 text-right">الفرع التابع له</th>
                <th className="py-3 px-3">نوع المستودع</th>
                <th className="py-3 px-3 text-right">المستودع الرئيسي (الأب)</th>
                <th className="py-3 px-3 text-right">الوصف</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 w-28">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredWarehouses.map(w => (
                <tr key={w.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{w.warehouseCode}</td>
                  
                  <td className="py-3 px-3 text-right font-bold text-zinc-100">{w.warehouseName}</td>

                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{w.branchName}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      w.warehouseType === 'خامات'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : (w.warehouseType === 'منتج تام'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : (w.warehouseType === 'صالة تشغيل'
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                                : (w.warehouseType === 'معرض'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30')))
                    }`}>
                      {w.warehouseType}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400 font-mono text-[11px]">{w.parentWarehouse}</td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400 max-w-xs truncate">{w.description}</td>

                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {w.status} ✓
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => {
                          setStatusMessage(`تعديل بيانات مستودع [${w.warehouseName}].`);
                          setTimeout(() => setStatusMessage(null), 3000);
                        }}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 rounded-lg transition-all"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id, w.warehouseName)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-zinc-800 rounded-lg transition-all"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

export default WarehousesPage;


