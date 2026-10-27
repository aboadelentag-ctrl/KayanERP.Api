import React, { useState, useMemo } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  RotateCw,
  FileSpreadsheet,
  Edit2,
  PowerOff,
  Trash2,
  CheckCircle2,
  Building2,
  Phone,
  CreditCard,
  ShieldAlert,
  Clock,
  Check,
  X
} from 'lucide-react';

interface CustomersPageProps {
  onNavigate?: (tab: string) => void;
}

export interface CustomerDto {
  id: number;
  customerCode: string;
  customerName: string;
  category: 'تاجر جملة VIP' | 'تاجر يومي (طلب متغير)' | 'منفذ توزيع خارجي' | 'معرض / جملة';
  branchName: string;
  phone: string;
  creditLimit: number;
  orderNature: string;
  status: 'نشط' | 'معطل';
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigate }) => {
  const [customers, setCustomers] = useState<CustomerDto[]>([
    {
      id: 1,
      customerCode: 'CUST-001',
      customerName: 'الحاج إبراهيم الدسوقي - حلويات الدسوقي',
      category: 'تاجر جملة VIP',
      branchName: 'فرع المبيعات الخارجية والتوزيع',
      phone: '01012345678',
      creditLimit: 75000,
      orderNature: 'يفضل استلام أوردر الشرقي مبكراً قبل 8 صباحاً',
      status: 'نشط'
    },
    {
      id: 2,
      customerCode: 'CUST-002',
      customerName: 'معلم سامح عبد الله - توزيع دكرنس',
      category: 'تاجر يومي (طلب متغير)',
      branchName: 'فرع المبيعات الخارجية والتوزيع',
      phone: '01098765432',
      creditLimit: 25000,
      orderNature: 'يطلب يومياً اتصالاً قبل الظهر (بسبوسة وهريسة)',
      status: 'نشط'
    },
    {
      id: 3,
      customerCode: 'CUST-003',
      customerName: 'مؤسسة الأمانة لتوزيع الأغذية',
      category: 'منفذ توزيع خارجي',
      branchName: 'فرع المبيعات الخارجية والتوزيع',
      phone: '01055544433',
      creditLimit: 120000,
      orderNature: 'منفذ معتمد للكراتين والعبوات المغلفة',
      status: 'نشط'
    },
    {
      id: 4,
      customerCode: 'CUST-004',
      customerName: 'حلواني الصباح - فرع شربين',
      category: 'معرض / جملة',
      branchName: 'المعرض الرئيسي (المصنع)',
      phone: '01077788899',
      creditLimit: 50000,
      orderNature: 'سحب مستمر أصناف الجاتوه والتورت',
      status: 'نشط'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // إحصائيات العملاء وسقوف الائتمان
  const totalCreditLimit = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.creditLimit, 0);
  }, [customers]);

  const vipCount = useMemo(() => {
    return customers.filter(c => c.category === 'تاجر جملة VIP').length;
  }, [customers]);

  const dailyCount = useMemo(() => {
    return customers.filter(c => c.category === 'تاجر يومي (طلب متغير)').length;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.customerCode.toLowerCase().includes(term) ||
        c.customerName.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.orderNature.toLowerCase().includes(term) ||
        c.branchName.toLowerCase().includes(term)
      );
    });
  }, [customers, categoryFilter, statusFilter, searchTerm]);

  const exportToExcel = () => {
    let csv = 'كود_العميل,اسم_العميل_التاجر,الفئة_الشريحة,الفرع_التابع,الهاتف,الحد_الائتماني,طبيعة_الطلب,الحالة\n';
    filteredCustomers.forEach(c => {
      csv += `"${c.customerCode}","${c.customerName}","${c.category}","${c.branchName}","${c.phone}",${c.creditLimit},"${c.orderNature}","${c.status}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `دليل_العملاء_والتجار_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    setCustomers(customers.map(c => {
      if (c.id === id) {
        const nextStatus = currentStatus === 'نشط' ? 'معطل' : 'نشط';
        setStatusMessage(`تم تغيير حالة العميل [${c.customerName}] إلى (${nextStatus}).`);
        return { ...c, status: nextStatus as any };
      }
      return c;
    }));
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* البطاقات الإحصائية العليا بالوضع الليلي الفاحم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي العملاء والتجار</span>
          <h4 className="text-2xl font-black text-amber-400 font-mono mt-1">
            {customers.length} <span className="text-xs text-slate-600 dark:text-zinc-400">عميل</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">تجار يوميون (سحب متغير)</span>
          <h4 className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {dailyCount} <span className="text-xs text-slate-600 dark:text-zinc-400">تاجر</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">كبار تجار الجملة VIP</span>
          <h4 className="text-2xl font-black text-indigo-400 font-mono mt-1">
            {vipCount} <span className="text-xs text-slate-600 dark:text-zinc-400">تاجر</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي سقوف الائتمان الممنوحة</span>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {totalCreditLimit.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>
      </div>

      {/* ترويسة الشاشة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500" />
              <span>دليل العملاء وشجرة التجار ومنافذ التوزيع (Customers & Distribution Tree)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              الحسابات الائتمانية وطلبيات التوزيع
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            إدارة حسابات التجار، الفروع التابعة، الحدود الائتمانية، وحصر طلبيات اليوم المرنة.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('💡 شاشة مسودة وحصر طلبيات اليوم المرنة للتجار.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-bold rounded-xl text-xs shadow-md transition-all border border-amber-500/30"
          >
            <Clock className="w-4 h-4" />
            <span>مسودة طلبيات اليوم المرنة</span>
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
              setStatusMessage('💡 نموذج تسجيل عميل / تاجر جديد قيد الربط بشجرة الحسابات.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إضافة عميل / تاجر جديد</span>
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
            placeholder="بحث باسم العميل، الكود، أو رقم الهاتف..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كافة الفئات والشرائح --</option>
            <option value="تاجر جملة VIP">تاجر جملة VIP</option>
            <option value="تاجر يومي (طلب متغير)">تاجر يومي (طلب متغير)</option>
            <option value="منفذ توزيع خارجي">منفذ توزيع خارجي</option>
            <option value="معرض / جملة">معرض / جملة</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">كل الحالات</option>
            <option value="نشط">نشط</option>
            <option value="معطل">معطل</option>
          </select>
        </div>
      </div>

      {/* جدول دليل العملاء والتجار */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
          <span className="font-bold text-zinc-200">دليل العملاء المسجلين ({filteredCustomers.length} عميل)</span>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
            محدد لحظياً ✓
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">الكود</th>
                <th className="py-3 px-3 text-right">اسم العميل / التاجر</th>
                <th className="py-3 px-3">الفئة والشريحة</th>
                <th className="py-3 px-3 text-right">الفرع / المنفذ التابع</th>
                <th className="py-3 px-3 font-mono">رقم الهاتف</th>
                <th className="py-3 px-3">الحد الائتماني</th>
                <th className="py-3 px-3 text-right">طبيعة الطلب المرن</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 w-36">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{c.customerCode}</td>
                  
                  <td className="py-3 px-3 text-right font-bold text-zinc-100">{c.customerName}</td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      c.category === 'تاجر جملة VIP'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : (c.category.includes('يومي')
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : (c.category.includes('خارجي')
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'))
                    }`}>
                      {c.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{c.branchName}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-zinc-300">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span dir="ltr">{c.phone}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {c.creditLimit.toLocaleString()} ج.م
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400 max-w-xs truncate">{c.orderNature}</td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      c.status === 'نشط'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {c.status} ✓
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => {
                          setStatusMessage(`تعديل بيانات العميل [${c.customerName}].`);
                          setTimeout(() => setStatusMessage(null), 3000);
                        }}
                        className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all border ${
                          c.status === 'نشط'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                        <span>{c.status === 'نشط' ? 'إيقاف' : 'تفعيل'}</span>
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

export default CustomersPage;


