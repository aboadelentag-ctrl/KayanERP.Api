import React, { useState, useMemo } from 'react';
import {
  Truck,
  PlusCircle,
  Search,
  FileSpreadsheet,
  RotateCw,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface SupplierViewDto {
  id: number;
  supplierCode: string;
  supplierName: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms: string;
  active: boolean;
  notes?: string;
}

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierViewDto[]>([
    {
      id: 1,
      supplierCode: 'SUP-01',
      supplierName: 'شركة مطاحن الدلتا والصعيد',
      phone: '01012345678',
      email: 'delta.mills@example.com',
      address: 'طنطا - المنطقة الصناعية الأولى',
      taxNumber: '100-245-891',
      paymentTerms: 'آجل 30 يوم',
      active: true,
      notes: 'مورد معتمد للدقيق الفاخر 72% واستخراج 82%'
    },
    {
      id: 2,
      supplierCode: 'SUP-02',
      supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
      phone: '01198765432',
      email: 'wadi.dairy@example.com',
      address: 'المنصورة - طريق دمياط القديم',
      taxNumber: '320-114-558',
      paymentTerms: 'نقدي',
      active: true,
      notes: 'سمن بلدي بقري وجاموسي طبيعي معتمد HACCP'
    },
    {
      id: 3,
      supplierCode: 'SUP-03',
      supplierName: 'الشركة المصرية لتجارة وتكرير السكر',
      phone: '01234567890',
      email: 'egypt.sugar@example.com',
      address: 'الحوامدية - الجيزة',
      taxNumber: '551-098-432',
      paymentTerms: 'آجل 15 يوم',
      active: true,
      notes: 'سكر مكرر أبيض تعبئة 50 كجم'
    },
    {
      id: 4,
      supplierCode: 'SUP-04',
      supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف',
      phone: '01055566677',
      email: 'ahram.pack@example.com',
      address: 'مدينة العاشر من رمضان',
      taxNumber: '774-632-190',
      paymentTerms: 'آجل 60 يوم',
      active: true,
      notes: 'علب تورت وجاتوه وكرتون صواني البسبوسة'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number>(0);
  const [modalSupplierCode, setModalSupplierCode] = useState('');
  const [modalSupplierName, setModalSupplierName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [modalTaxNumber, setModalTaxNumber] = useState('');
  const [modalPaymentTerms, setModalPaymentTerms] = useState('نقدي');
  const [modalActive, setModalActive] = useState(true);
  const [modalNotes, setModalNotes] = useState('');

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      if (activeFilter === 'true' && !s.active) return false;
      if (activeFilter === 'false' && s.active) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.supplierName.toLowerCase().includes(term) ||
        s.supplierCode.toLowerCase().includes(term) ||
        (s.phone && s.phone.includes(term)) ||
        (s.taxNumber && s.taxNumber.includes(term))
      );
    });
  }, [suppliers, activeFilter, searchTerm]);

  const openCreateModal = () => {
    setEditingId(0);
    setModalSupplierCode(`SUP-${String(suppliers.length + 1).padStart(2, '0')}`);
    setModalSupplierName('');
    setModalPhone('');
    setModalEmail('');
    setModalAddress('');
    setModalTaxNumber('');
    setModalPaymentTerms('نقدي');
    setModalActive(true);
    setModalNotes('');
    setShowModal(true);
  };

  const openEditModal = (s: SupplierViewDto) => {
    setEditingId(s.id);
    setModalSupplierCode(s.supplierCode);
    setModalSupplierName(s.supplierName);
    setModalPhone(s.phone || '');
    setModalEmail(s.email || '');
    setModalAddress(s.address || '');
    setModalTaxNumber(s.taxNumber || '');
    setModalPaymentTerms(s.paymentTerms);
    setModalActive(s.active);
    setModalNotes(s.notes || '');
    setShowModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSupplierName.trim()) return;

    if (editingId > 0) {
      setSuppliers(suppliers.map(s => s.id === editingId ? {
        ...s,
        supplierCode: modalSupplierCode,
        supplierName: modalSupplierName.trim(),
        phone: modalPhone.trim() || undefined,
        email: modalEmail.trim() || undefined,
        address: modalAddress.trim() || undefined,
        taxNumber: modalTaxNumber.trim() || undefined,
        paymentTerms: modalPaymentTerms,
        active: modalActive,
        notes: modalNotes.trim() || undefined
      } : s));
      setStatusMessage('✅ تم تحديث بيانات المورد بنجاح.');
    } else {
      const created: SupplierViewDto = {
        id: Date.now(),
        supplierCode: modalSupplierCode.trim() || `SUP-${String(suppliers.length + 1).padStart(2, '0')}`,
        supplierName: modalSupplierName.trim(),
        phone: modalPhone.trim() || undefined,
        email: modalEmail.trim() || undefined,
        address: modalAddress.trim() || undefined,
        taxNumber: modalTaxNumber.trim() || undefined,
        paymentTerms: modalPaymentTerms,
        active: modalActive,
        notes: modalNotes.trim() || undefined
      };
      setSuppliers([...suppliers, created]);
      setStatusMessage('✅ تم تسجيل المورد الجديد بنجاح.');
    }

    setShowModal(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const toggleSupplierStatus = (id: number) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, active: !s.active } : s));
    setStatusMessage('تم تحديث حالة المورد بنجاح.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const deleteSupplier = (s: SupplierViewDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إيقاف المورد [${s.supplierName}]؟`)) return;
    setSuppliers(suppliers.filter(item => item.id !== s.id));
    setStatusMessage('تمت معالجة حذف / إيقاف المورد بنجاح.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const exportSuppliersToExcel = () => {
    let csv = 'كود_المورد,اسم_المورد,الهاتف,البريد_الإلكتروني,العنوان,الرقم_الضريبي,شروط_السداد,الحالة\n';
    filteredSuppliers.forEach(s => {
      const status = s.active ? 'نشط' : 'معطل';
      csv += `"${s.supplierCode}","${s.supplierName}","${s.phone || ''}","${s.email || ''}","${s.address || ''}","${s.taxNumber || ''}","${s.paymentTerms}","${status}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `دليل_الموردين_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-2 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الصفحة مع مسافة علوية كافية لمنع التداخل */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <Truck className="w-6 h-6 text-indigo-500" />
              <span>دليل الموردين وسلاسل الإمداد (Suppliers Management)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              شؤون المشتريات والتعاقدات
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            إدارة موردي الخامات ومواد التعبئة، شروط السداد، والبيانات الضريبية.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportSuppliersToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير (Excel)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل مورد جديد</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات الإحصائيات الثلاثة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-indigo-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">إجمالي الموردين المسجلين</span>
          <h4 className="text-2xl font-black text-gray-900 dark:text-zinc-100 font-mono mt-1">{suppliers.length}</h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-emerald-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">الموردين النشطين</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">{suppliers.filter(s => s.active).length}</h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">موردين بتسهيلات سداد (آجل)</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">
            {suppliers.filter(s => s.paymentTerms.includes('آجل')).length}
          </h4>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث باسم المورد، الكود، الهاتف، أو الرقم الضريبي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-2 outline-none font-bold text-gray-800 dark:text-zinc-200"
          />
        </div>

        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-gray-700 dark:text-zinc-300"
        >
          <option value="">كافة الموردين (نشط ومعطل)</option>
          <option value="true">الموردين النشطين فقط</option>
          <option value="false">الموردين المعطلين فقط</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setActiveFilter('');
          }}
          className="px-3 py-2 bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 rounded-xl font-bold border border-gray-200 dark:border-zinc-800"
        >
          إلغاء
        </button>
      </div>

      {/* جدول الموردين */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
          <span className="font-bold">سجل الموردين المعتمدين ({filteredSuppliers.length} مورد)</span>
          <span className="bg-indigo-600 px-2 py-0.5 rounded font-mono text-[10px]">محدث من قاعدة البيانات</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3 w-28">كود المورد</th>
                <th className="py-3 px-3 text-right">اسم المورد</th>
                <th className="py-3 px-3 text-right">الهاتف والتواصل</th>
                <th className="py-3 px-3 text-right">العنوان</th>
                <th className="py-3 px-3">الرقم الضريبي</th>
                <th className="py-3 px-3">شروط السداد</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 w-36">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredSuppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.supplierCode}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-gray-900 dark:text-zinc-100 block">{s.supplierName}</span>
                    {s.notes && <small className="text-gray-400 block text-[10px] truncate max-w-xs">{s.notes}</small>}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="font-mono text-gray-700 dark:text-zinc-300">{s.phone || '---'}</div>
                    {s.email && <small className="text-gray-400 font-mono block">{s.email}</small>}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-500 max-w-xs truncate">{s.address || '---'}</td>
                  <td className="py-3 px-3 font-mono text-gray-700 dark:text-zinc-300">{s.taxNumber || '---'}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      s.paymentTerms === 'نقدي' ? 'bg-slate-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {s.paymentTerms}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      s.active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                    }`}>
                      {s.active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(s)}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold hover:bg-indigo-100 text-[11px]"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => toggleSupplierStatus(s.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          s.active ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                        }`}
                      >
                        {s.active ? 'إيقاف' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => deleteSupplier(s)}
                        className="p-1 text-rose-500 hover:text-rose-700"
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

      {/* Modal: إضافة / تعديل مورد */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>{editingId > 0 ? 'تعديل بيانات مورد' : 'تسجيل مورد جديد'}</span>
              </h4>
              <button onClick={() => setShowModal(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم المورد / الشركة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مطاحن ومضارب الغربية..."
                    value={modalSupplierName}
                    onChange={(e) => setModalSupplierName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-indigo-400 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">كود المورد</label>
                  <input
                    type="text"
                    value={modalSupplierCode}
                    onChange={(e) => setModalSupplierCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">رقم الهاتف / المحمول</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    value={modalPhone}
                    onChange={(e) => setModalPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    dir="ltr"
                    placeholder="supplier@domain.com"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الرقم الضريبي</label>
                  <input
                    type="text"
                    placeholder="رقم التسجيل الضريبي..."
                    value={modalTaxNumber}
                    onChange={(e) => setModalTaxNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">شروط السداد المعتمدة</label>
                  <select
                    value={modalPaymentTerms}
                    onChange={(e) => setModalPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-bold"
                  >
                    <option value="نقدي">نقدي عند الاستلام</option>
                    <option value="آجل 15 يوم">آجل 15 يوم</option>
                    <option value="آجل 30 يوم">آجل 30 يوم</option>
                    <option value="آجل 60 يوم">آجل 60 يوم</option>
                    <option value="دفعة مقدمة">دفعة مقدمة مع التوريد</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">العنوان ومقر التوريد</label>
                <input
                  type="text"
                  placeholder="المحافظة - المركز - العنوان بالتفصيل..."
                  value={modalAddress}
                  onChange={(e) => setModalAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">ملاحظات ومواصفات التوريد</label>
                <textarea
                  rows={2}
                  placeholder="أي شروط جودة خاصة، أصناف التوريد، أو بنود الاتفاق..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="supplierActiveSwitch"
                  checked={modalActive}
                  onChange={(e) => setModalActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="supplierActiveSwitch" className="font-bold text-gray-700 dark:text-zinc-300 cursor-pointer">
                  المورد نشط ومتاح لأوامر الشراء والتوريد
                </label>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
