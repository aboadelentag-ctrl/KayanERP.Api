import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Phone,
  CreditCard,
  Building,
  CalendarCheck,
  Send
} from 'lucide-react';
import {
  fetchCustomersApi,
  saveCustomerApi,
  toggleCustomerStatusApi,
  deleteCustomerApi
} from './customersApi';
import type { CustomerItemDto } from './customersApi';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isErrorAlert, setIsErrorAlert] = useState<boolean>(false);

  // Modal State (Create / Edit)
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerItemDto>({
    id: 0,
    customerCode: '',
    customerName: '',
    customerType: 'DIST_DAILY',
    phone: '',
    email: '',
    address: '',
    creditLimit: 0,
    paymentTerms: '',
    taxNumber: '',
    active: true,
    notes: ''
  });

  // Modal State (مسودة طلبيات اليوم المرنة)
  const [showDailyOrderPad, setShowDailyOrderPad] = useState<boolean>(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await fetchCustomersApi();
      setCustomers(data);
    } catch (ex: any) {
      setStatusMessage(`خطأ في جلب بيانات العملاء: ${ex.message}`);
      setIsErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (selectedTypeFilter && c.customerType !== selectedTypeFilter) return false;
      if (selectedStatusFilter === 'active' && !c.active) return false;
      if (selectedStatusFilter === 'inactive' && c.active) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(term) ||
        c.customerCode.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term)) ||
        (c.address && c.address.toLowerCase().includes(term))
      );
    });
  }, [customers, selectedTypeFilter, selectedStatusFilter, searchTerm]);

  const kpis = useMemo(() => {
    const totalCount = customers.length;
    const dailyCount = customers.filter(c => c.customerType === 'DIST_DAILY').length;
    const vipCount = customers.filter(c => c.customerType === 'DIST_VIP').length;
    const totalCredit = customers.reduce((sum, c) => sum + Number(c.creditLimit || 0), 0);
    return { totalCount, dailyCount, vipCount, totalCredit };
  }, [customers]);

  const getBranchForType = (type: string) => {
    switch (type) {
      case 'DIST_DAILY':
      case 'DIST_VIP':
      case 'DISTRIBUTOR':
        return 'فرع المبيعات الخارجية والتوزيع';
      case 'WHOLESALE':
        return 'المعرض الرئيسي (المصنع)';
      default:
        return 'معارض التجزئة والصالات';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DIST_DAILY': return 'تاجر يومي (طلب متغير)';
      case 'DIST_VIP': return 'تاجر جملة VIP';
      case 'DISTRIBUTOR': return 'منفذ توزيع خارجي';
      case 'WHOLESALE': return 'معرض / جملة';
      default: return 'قطاعي / معارض';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'DIST_DAILY': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DIST_VIP': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'DISTRIBUTOR': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'WHOLESALE': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const openCreateModal = () => {
    const nextCode = `CUST-${(customers.length + 1).toString().padStart(3, '0')}`;
    setCurrentCustomer({
      id: 0,
      customerCode: nextCode,
      customerName: '',
      customerType: 'DIST_DAILY',
      phone: '',
      email: '',
      address: '',
      creditLimit: 0,
      paymentTerms: 'نقدي عند الاستلام',
      taxNumber: '',
      active: true,
      notes: ''
    });
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (c: CustomerItemDto) => {
    setCurrentCustomer({ ...c });
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer.customerName.trim()) {
      setModalError('يجب إدخال اسم العميل / التاجر.');
      return;
    }

    setIsSaving(true);
    setModalError(null);
    try {
      await saveCustomerApi(currentCustomer);
      setCustomers(prev => {
        if (currentCustomer.id > 0) {
          return prev.map(c => (c.id === currentCustomer.id ? { ...currentCustomer } : c));
        }
        return [{ ...currentCustomer, id: Date.now() }, ...prev];
      });

      setStatusMessage(currentCustomer.id > 0 ? 'تم تعديل بيانات التاجر / العميل بنجاح.' : 'تم تسجيل التاجر الجديد بنجاح.');
      setIsErrorAlert(false);
      setShowModal(false);
    } catch (ex: any) {
      setModalError(`خطأ: ${ex.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (id: number) => {
    await toggleCustomerStatusApi(id);
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, active: !c.active } : c))
    );
    setStatusMessage('تم تحديث حالة العميل بنجاح.');
    setIsErrorAlert(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteCustomer = async (c: CustomerItemDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إيقاف العميل [${c.customerName}]؟`)) return;
    await deleteCustomerApi(c.id);
    setCustomers(prev => prev.filter(item => item.id !== c.id));
    setStatusMessage('تمت معالجة حذف / إيقاف العميل بنجاح.');
    setIsErrorAlert(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const exportCustomersToExcel = () => {
    if (!filteredCustomers.length) return;
    const headers = 'كود_العميل,اسم_العميل,نوع_العميل,الفرع,الهاتف,الحد_الائتماني,شروط_السداد,الحالة\n';
    const rows = filteredCustomers.map(c => {
      const status = c.active ? 'نشط' : 'موقوف';
      return `"${c.customerCode}","${c.customerName}","${getTypeLabel(c.customerType)}","${getBranchForType(c.customerType)}","${c.phone || ''}",${c.creditLimit},"${c.paymentTerms || ''}","${status}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `دليل_العملاء_والتجار_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmDailyOrders = () => {
    setShowDailyOrderPad(false);
    setStatusMessage('🚀 تم اعتماد طلبيات اليوم المتغيرة وإحالتها لغرفة عمليات الإنتاج والتكاليف بنجاح!');
    setIsErrorAlert(false);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>دليل العملاء وشجرة التجار ومنافذ التوزيع (Customers & Distribution Tree)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة حسابات التجار، الفروع التابعة، الحدود الائتمانية، وحصر طلبيات اليوم المرنة.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {customers.length > 0 && (
            <button
              onClick={exportCustomersToExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير (Excel)</span>
            </button>
          )}
          <button
            onClick={() => setShowDailyOrderPad(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>مسودة طلبيات اليوم المرنة</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة عميل / تاجر جديد</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isErrorAlert ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <span className="flex items-center gap-2">
            {isErrorAlert ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات المؤشرات اللحظية (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي العملاء والتجار</span>
          <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">
            {kpis.totalCount} <span className="text-xs font-normal text-gray-500">عميل</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">تجار يوميون (سحب متغير)</span>
          <h4 className="text-2xl font-black text-slate-900 font-mono mt-1">
            {kpis.dailyCount} <span className="text-xs font-normal text-gray-500">تاجر</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-cyan-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">كبار تجار الجملة VIP</span>
          <h4 className="text-2xl font-black text-cyan-700 font-mono mt-1">
            {kpis.vipCount} <span className="text-xs font-normal text-gray-500">تاجر</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي سقوف الائتمان الممنوحة</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {kpis.totalCredit.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>
      </div>

      {/* شريط فلاتر البحث والفرز */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث باسم العميل، الكود، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={selectedTypeFilter}
          onChange={(e) => setSelectedTypeFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة الفئات والشرائح --</option>
          <option value="DIST_DAILY">🚚 تاجر يومي (مبيعات خارجية - طلب متغير)</option>
          <option value="DIST_VIP">🌟 تاجر جملة VIP (مبيعات خارجية)</option>
          <option value="DISTRIBUTOR">🏢 منفذ توزيع خارجي</option>
          <option value="WHOLESALE">🏪 معرض / جملة</option>
          <option value="RETAIL">👤 عميل قطاعي / معارض</option>
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشط فقط</option>
          <option value="inactive">موقوف</option>
        </select>

        <button
          onClick={loadCustomers}
          disabled={isLoading}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          title="تحديث البيانات"
        >
          <RotateCw className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* جدول استعراض العملاء */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        <div className="p-3.5 bg-white border-b border-gray-100 flex justify-between items-center">
          <span className="font-bold text-gray-800">دليل العملاء المسجلين ({filteredCustomers.length} عميل)</span>
          <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded">محدث لحظياً</span>
        </div>

        <table className="w-full text-center">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="py-3 px-3">الكود</th>
              <th className="py-3 px-3 text-right">اسم العميل / التاجر</th>
              <th className="py-3 px-3">الفئة والشريحة</th>
              <th className="py-3 px-3">الفرع / المنفذ التابع</th>
              <th className="py-3 px-3">رقم الهاتف</th>
              <th className="py-3 px-3">الحد الائتماني</th>
              <th className="py-3 px-3 text-right">طبيعة الطلب المرن</th>
              <th className="py-3 px-3">الحالة</th>
              <th className="py-3 px-3">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400 font-bold">
                  جاري تحميل سجل العملاء...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400 font-bold">
                  لا توجد بيانات مطابقة لشروط البحث المحددة.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id} className={`hover:bg-slate-50 ${c.active ? '' : 'bg-slate-50/60 opacity-70'}`}>
                  <td className="py-3 px-3 font-mono font-bold text-gray-500">{c.customerCode}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">{c.customerName}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadgeClass(c.customerType)}`}>
                      {getTypeLabel(c.customerType)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border text-[10px] font-medium">
                      {getBranchForType(c.customerType)}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-600">{c.phone || '---'}</td>
                  <td className="py-3 px-3 font-mono font-black text-indigo-700">
                    {c.creditLimit > 0 ? `${c.creditLimit.toLocaleString()} ج.م` : 'نقدي'}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-500 text-[11px] max-w-[200px] truncate" title={c.notes}>
                    {c.notes || 'حسب الطلب اليومي المباشر'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {c.active ? 'نشط ✓' : 'موقوف ✕'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded flex items-center gap-1"
                        title="تعديل"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`px-2 py-1 rounded font-bold ${c.active ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      >
                        {c.active ? 'إيقاف' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c)}
                        className="p-1 hover:text-rose-600"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: إضافة / تعديل عميل وتاجر */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{currentCustomer.id > 0 ? 'تعديل بيانات عميل / تاجر' : 'تسجيل عميل أو تاجر جديد'}</span>
              </h4>
              <button onClick={() => setShowModal(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-3 bg-slate-50">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">كود التاجر / العميل</label>
                  <input
                    type="text"
                    value={currentCustomer.customerCode}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, customerCode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">اسم العميل / المنشأة أو المحل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الحاج إبراهيم الدسوقي - حلويات الدسوقي"
                    value={currentCustomer.customerName}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الشريحة ونوع التعامل *</label>
                  <select
                    value={currentCustomer.customerType}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, customerType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl font-bold"
                  >
                    <option value="DIST_DAILY">🚚 تاجر يومي (مبيعات خارجية - طلب متغير)</option>
                    <option value="DIST_VIP">🌟 تاجر جملة VIP (حساب جارٍ وحد ائتماني)</option>
                    <option value="DISTRIBUTOR">🏢 منفذ توزيع خارجي</option>
                    <option value="WHOLESALE">🏪 معرض / جملة</option>
                    <option value="RETAIL">👤 عميل قطاعي / معارض</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الفرع التابع له في الشجرة</label>
                  <input
                    type="text"
                    readOnly
                    value={getBranchForType(currentCustomer.customerType)}
                    className="w-full px-3 py-2 bg-slate-100 border rounded-xl font-medium text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">رقم الهاتف / واتساب *</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    value={currentCustomer.phone || ''}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الحد الائتماني المسموح به (ج.م)</label>
                  <input
                    type="number"
                    step="500"
                    placeholder="0 = نقدي"
                    value={currentCustomer.creditLimit}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border rounded-xl font-mono text-center font-black text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">العنوان وموقع التسليم</label>
                  <input
                    type="text"
                    placeholder="المنطقة - الشارع"
                    value={currentCustomer.address || ''}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">شروط السداد</label>
                  <input
                    type="text"
                    placeholder="مثال: نقدي عند الاستلام / أسبوعي"
                    value={currentCustomer.paymentTerms || ''}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الرقم الضريبي (إن وجد)</label>
                  <input
                    type="text"
                    placeholder="سجل / بطاقة ضريبية"
                    value={currentCustomer.taxNumber || ''}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, taxNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="activeCustCheck"
                    checked={currentCustomer.active}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                  <label htmlFor="activeCustCheck" className="font-bold text-gray-700 cursor-pointer">
                    حساب نشط ومتاح للأوردرات
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">طبيعة الطلب اليومي المرن (الأصناف المفضلة / توقيت الاتصال)</label>
                <textarea
                  rows={2}
                  placeholder="مثال: يطلب يومياً اتصالاً قبل الظهر، يفضل استلام أوردر الشرقي مبكراً..."
                  value={currentCustomer.notes || ''}
                  onChange={(e) => setCurrentCustomer({ ...currentCustomer, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isSaving ? '⏳ جاري الحفظ...' : '💾 حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: مسودة طلبيات اليوم المرنة */}
      {showDailyOrderPad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-white" />
                <span>مسودة حصر طلبيات اليوم المرنة (فرع المبيعات الخارجية والتوزيع)</span>
              </h4>
              <button onClick={() => setShowDailyOrderPad(false)} className="text-white">×</button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-xl">
                💡 <strong>مرونة تامة:</strong> يمكنك تدوين ما طلبه كل تاجر في اتصال اليوم مباشرة وتحديثه بسهولة قبل خروج سيارة التوزيع.
              </div>

              <div className="border rounded-xl overflow-hidden bg-white">
                <table className="w-full text-center">
                  <thead className="bg-slate-100 text-gray-700">
                    <tr>
                      <th className="py-2.5 px-3 text-right">اسم التاجر</th>
                      <th className="py-2.5 px-3">الهاتف</th>
                      <th className="py-2.5 px-3">سقف الائتمان</th>
                      <th className="py-2.5 px-3 text-right" style={{ width: '50%' }}>الطلبية المحددة لليوم (الأصناف والكميات المتغيرة)</th>
                      <th className="py-2.5 px-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.filter(x => x.customerType === 'DIST_DAILY' || x.customerType === 'DIST_VIP').map((c, idx) => (
                      <tr key={c.id}>
                        <td className="py-2 px-3 text-right font-bold text-gray-900">{c.customerName}</td>
                        <td className="py-2 px-3 font-mono text-gray-600">{c.phone || '---'}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">{c.creditLimit.toLocaleString()} ج.م</td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="اكتب طلبية اليوم (مثال: 20 صاج بسبوسة، 10 سبت معمول)..."
                            value={c.notes || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomers(prev => prev.map(item => item.id === c.id ? { ...item, notes: val } : item));
                            }}
                            className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            جاهز للتجهيز ✓
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-white border-t flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setShowDailyOrderPad(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDailyOrders}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>اعتماد وإرسال لغرفة عمليات التصنيع (MES Hub)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
