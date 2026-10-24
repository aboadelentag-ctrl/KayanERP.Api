import React, { useState, useEffect, useMemo } from 'react';
import {
  HandCoins,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Landmark,
  Building2,
  Calendar,
  X,
  CreditCard,
  Plus,
  Receipt
} from 'lucide-react';
import {
  fetchTreasuryVouchersApi,
  fetchPartiesLookupApi,
  saveTreasuryVoucherApi,
} from './treasuryApi';
import type { TreasuryVoucherDto, PartyLookupDto } from './treasuryApi';

export const TreasuryVouchersPage: React.FC = () => {
  const [vouchersList, setVouchersList] = useState<TreasuryVoucherDto[]>([]);
  const [partiesList, setPartiesList] = useState<PartyLookupDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<TreasuryVoucherDto>({
    id: 0,
    voucherNumber: '',
    voucherType: 'RECEIPT',
    voucherDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    treasuryCode: '1212',
    treasuryName: 'خزينة فرع التوزيع الخارجي',
    branchName: 'فرع المبيعات الخارجية والتوزيع',
    partyType: 'CUSTOMER',
    partyId: null,
    partyName: '',
    oppositeAccountCode: '1221',
    oppositeAccountName: 'حسابات كبار التجار والعملاء',
    paymentMethod: 'نقدي (كاش)',
    description: '',
    createdBy: 'System',
  });
  const [selectedPartyId, setSelectedPartyId] = useState<number>(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vouchers, parties] = await Promise.all([
        fetchTreasuryVouchersApi(),
        fetchPartiesLookupApi(),
      ]);
      setVouchersList(vouchers);
      setPartiesList(parties);
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(`خطأ في جلب البيانات: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // حساب ملخص السيولة
  const totalReceipts = useMemo(
    () => vouchersList.filter((v) => v.voucherType === 'RECEIPT').reduce((sum, v) => sum + v.amount, 0),
    [vouchersList]
  );

  const totalPayments = useMemo(
    () => vouchersList.filter((v) => v.voucherType === 'PAYMENT').reduce((sum, v) => sum + v.amount, 0),
    [vouchersList]
  );

  const netLiquidity = totalReceipts - totalPayments;

  // السندات المفلترة
  const filteredVouchers = useMemo(() => {
    return vouchersList.filter((v) => {
      const matchType = !selectedTypeFilter || v.voucherType === selectedTypeFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        v.voucherNumber.toLowerCase().includes(term) ||
        v.partyName.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term);
      return matchType && matchSearch;
    });
  }, [vouchersList, selectedTypeFilter, searchTerm]);

  const openVoucherModal = (type: 'RECEIPT' | 'PAYMENT') => {
    setActiveVoucher({
      id: 0,
      voucherNumber: '',
      voucherType: type,
      voucherDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      treasuryCode: '1212',
      treasuryName: 'خزينة فرع التوزيع الخارجي',
      branchName: 'فرع المبيعات الخارجية والتوزيع',
      partyType: type === 'RECEIPT' ? 'CUSTOMER' : 'EXPENSE',
      partyId: null,
      partyName: type === 'RECEIPT' ? '' : 'مصاريف صيانة صالة الشرقي والأفران',
      oppositeAccountCode: type === 'RECEIPT' ? '1221' : '53',
      oppositeAccountName: type === 'RECEIPT' ? 'حسابات كبار التجار والعملاء' : 'مصاريف غاز وصيانة الصالات',
      paymentMethod: 'نقدي (كاش)',
      description: type === 'RECEIPT' ? 'تحصيل دفعة نقدية من التاجر' : 'سداد مصروفات تشغيلية للصالة',
      createdBy: 'المحاسب المالي',
    });
    setSelectedPartyId(0);
    setIsModalOpen(true);
  };

  const handleTreasuryChange = (code: string) => {
    if (code === '1211') {
      setActiveVoucher((prev) => ({
        ...prev,
        treasuryCode: '1211',
        treasuryName: 'الخزينة الرئيسية - المصنع',
        branchName: 'المعرض الرئيسي (المصنع)',
      }));
    } else {
      setActiveVoucher((prev) => ({
        ...prev,
        treasuryCode: '1212',
        treasuryName: 'خزينة فرع التوزيع الخارجي',
        branchName: 'فرع المبيعات الخارجية والتوزيع',
      }));
    }
  };

  const handleCustomerSelected = (partyId: number) => {
    setSelectedPartyId(partyId);
    const cust = partiesList.find((p) => p.id === partyId);
    if (cust) {
      setActiveVoucher((prev) => ({
        ...prev,
        partyId: cust.id,
        partyName: cust.name,
        description: `تحصيل دفعة نقدية من التاجر [${cust.name}]`,
      }));
    }
  };

  const handleSaveVoucher = async () => {
    if (activeVoucher.amount <= 0) {
      setIsSuccess(false);
      setStatusMessage('⚠️ يرجى إدخال مبلغ صحيح أكبر من الصفر.');
      return;
    }

    if (!activeVoucher.partyName.trim()) {
      setIsSuccess(false);
      setStatusMessage('⚠️ يرجى تحديد اسم التاجر أو بند المصروف.');
      return;
    }

    try {
      await saveTreasuryVoucherApi(activeVoucher);
      setIsSuccess(true);
      setStatusMessage('✅ تم ترحيل السند واعتماد أثره المالي وتوليد القيد بنجاح!');
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(`❌ تعذر الحفظ: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. رأس الشاشة التنفيذي */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <HandCoins className="w-6 h-6 text-indigo-600" />
            <span>إدارة الخزائن وسندات القبض والصرف</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إثبات تحصيلات التجار، سداد المصروفات، والربط التلقائي بشجرة الحسابات والعملاء
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => openVoucherModal('RECEIPT')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>إصدار سند قبض (تحصيل)</span>
          </button>

          <button
            onClick={() => openVoucherModal('PAYMENT')}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>إصدار سند صرف (مصروفات)</span>
          </button>
        </div>
      </div>

      {/* 2. رسائل النظام */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
          isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-gray-500 hover:text-gray-800 font-bold">×</button>
        </div>
      )}

      {/* 3. بطاقات المؤشرات اللحظية للسيولة النقدية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي المقبوضات والتحصيلات</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-600">
              {totalReceipts.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-gray-500">ج.م</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-rose-500 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي المصروفات والمدفوعات</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-rose-600">
              {totalPayments.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-gray-500">ج.م</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">صافي السيولة النقدية بالخزائن</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-indigo-700">
              {netLiquidity.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-gray-500">ج.م</span>
          </div>
        </div>
      </div>

      {/* 4. شريط البحث والتصفية */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5">
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث برقم السند، اسم التاجر، أو البيان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- كافة السندات (قبض وصرف) --</option>
              <option value="RECEIPT">سندات القبض (تحصيلات النقدية)</option>
              <option value="PAYMENT">سندات الصرف (المدفوعات والمصروفات)</option>
            </select>
          </div>

          <div className="md:col-span-3 text-left text-gray-500 font-medium">
            إجمالي السندات المعروضة: <strong className="text-indigo-700 font-mono text-sm">{filteredVouchers.length}</strong> سند
          </div>
        </div>
      </div>

      {/* 5. جدول عرض السندات النقدية */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-xs font-bold">📋 دفتر حركة الخزينة وسندات القيود المعتمدة</h2>
          <span className="bg-indigo-600 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full">
            القيود متزنة آلياً ✓
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
              <tr>
                <th className="py-3 px-3">رقم السند</th>
                <th className="py-3 px-3">النوع</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">المبلغ المسدد</th>
                <th className="py-3 px-3">الخزينة المودع/المنصرف منها</th>
                <th className="py-3 px-3 text-right">الطرف المعني (التاجر / المصروف)</th>
                <th className="py-3 px-3">الفرع التابع</th>
                <th className="py-3 px-3">طريقة السداد</th>
                <th className="py-3 px-3 text-right">البيان والشرح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-center">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-gray-400 font-bold">
                    لا توجد سندات مسجلة تطابق خيارات البحث.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{v.voucherNumber}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        v.voucherType === 'RECEIPT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {v.voucherType === 'RECEIPT' ? 'سند قبض 📥' : 'سند صرف 📤'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-500">{v.voucherDate}</td>
                    <td className={`py-3 px-3 font-mono font-black text-sm ${
                      v.voucherType === 'RECEIPT' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {v.amount.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                        {v.treasuryName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">{v.partyName}</td>
                    <td className="py-3 px-3">
                      <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        {v.branchName}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">
                        {v.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-500 max-w-xs truncate" title={v.description}>
                      {v.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal إصدار سند جديد مع مصفوفة القيد المحاسبي المزدوج */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] text-xs">
            
            {/* رأس النافذة */}
            <div className={`px-5 py-3.5 text-white flex items-center justify-between shrink-0 ${
              activeVoucher.voucherType === 'RECEIPT' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span>
                  {activeVoucher.voucherType === 'RECEIPT'
                    ? '📥 إصدار سند قبض نقدي (تحصيل من تاجر / عميل)'
                    : '📤 إصدار سند صرف نقدي (سداد مصروفات تشغيل)'}
                </span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              
              {/* بطاقة الحقول والمدخلات */}
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      المبلغ المطلوب سداده (ج.م) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={activeVoucher.amount || ''}
                      onChange={(e) => setActiveVoucher({ ...activeVoucher, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono font-black text-lg text-indigo-700 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      تاريخ السند <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={activeVoucher.voucherDate}
                      onChange={(e) => setActiveVoucher({ ...activeVoucher, voucherDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      الخزينة المودع بها / المنصرف منها <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={activeVoucher.treasuryCode}
                      onChange={(e) => handleTreasuryChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="1212">1212 - خزينة فرع التوزيع الخارجي</option>
                      <option value="1211">1211 - الخزينة الرئيسية (المصنع)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">الفرع التابع للسند</label>
                    <select
                      value={activeVoucher.branchName}
                      onChange={(e) => setActiveVoucher({ ...activeVoucher, branchName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="فرع المبيعات الخارجية والتوزيع">فرع المبيعات الخارجية والتوزيع</option>
                      <option value="المعرض الرئيسي (المصنع)">المعرض الرئيسي (المصنع)</option>
                      <option value="فرع دكرنس">فرع دكرنس</option>
                    </select>
                  </div>

                  {activeVoucher.voucherType === 'RECEIPT' ? (
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        اختيار التاجر / العميل (من الشجرة) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedPartyId}
                        onChange={(e) => handleCustomerSelected(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-emerald-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                      >
                        <option value={0}>-- اختر التاجر من القائمة --</option>
                        {partiesList.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.code}] {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        بند المصروف / الجهة المستفيدة <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: غاز صالة الشرقي، قطع غيار عجانة"
                        value={activeVoucher.partyName}
                        onChange={(e) => setActiveVoucher({ ...activeVoucher, partyName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-rose-600"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">طريقة الدفع والتحصيل</label>
                    <select
                      value={activeVoucher.paymentMethod}
                      onChange={(e) => setActiveVoucher({ ...activeVoucher, paymentMethod: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="نقدي (كاش)">نقدي (كاش)</option>
                      <option value="تحويل بنكي / محفظة إلكترونية">تحويل بنكي / فودافون كاش</option>
                      <option value="شيك بنكي">شيك بنكي</option>
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-gray-700 font-bold mb-1">
                      البيان والشرح التفصيلي للحركة <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: سداد دفعة نقدية عن طلبيات الأسبوع الجاري..."
                      value={activeVoucher.description}
                      onChange={(e) => setActiveVoucher({ ...activeVoucher, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* معاينة القيد المحاسبي المزدوج الآلي */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 border-r-4 border-r-cyan-500 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <h4 className="font-bold text-cyan-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-cyan-600" />
                    <span>⚖️ القيد المحاسبي المتولد آلياً (Double-Entry Verification):</span>
                  </h4>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    متزن 100%
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs font-mono">
                    <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">طرف القيد</th>
                        <th className="py-2 px-3">كود الحساب</th>
                        <th className="py-2 px-3 text-right">اسم الحساب المالي</th>
                        <th className="py-2 px-3">مدين (Debit)</th>
                        <th className="py-2 px-3">دائن (Credit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeVoucher.voucherType === 'RECEIPT' ? (
                        <>
                          <tr>
                            <td className="py-2 px-3 font-bold text-emerald-600">من حـ/ (مدين)</td>
                            <td className="py-2 px-3">{activeVoucher.treasuryCode}</td>
                            <td className="py-2 px-3 text-right font-bold text-gray-800">{activeVoucher.treasuryName}</td>
                            <td className="py-2 px-3 font-bold text-emerald-600">{activeVoucher.amount.toLocaleString()}</td>
                            <td className="py-2 px-3 text-gray-400">0</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-indigo-600">إلى حـ/ (دائن)</td>
                            <td className="py-2 px-3">1221</td>
                            <td className="py-2 px-3 text-right font-bold text-gray-800">
                              {activeVoucher.partyName || 'حسابات كبار التجار الموزعين'}
                            </td>
                            <td className="py-2 px-3 text-gray-400">0</td>
                            <td className="py-2 px-3 font-bold text-indigo-600">{activeVoucher.amount.toLocaleString()}</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td className="py-2 px-3 font-bold text-rose-600">من حـ/ (مدين)</td>
                            <td className="py-2 px-3">53</td>
                            <td className="py-2 px-3 text-right font-bold text-gray-800">
                              {activeVoucher.partyName || 'مصاريف غاز وصيانة الصالات'}
                            </td>
                            <td className="py-2 px-3 font-bold text-rose-600">{activeVoucher.amount.toLocaleString()}</td>
                            <td className="py-2 px-3 text-gray-400">0</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-indigo-600">إلى حـ/ (دائن)</td>
                            <td className="py-2 px-3">{activeVoucher.treasuryCode}</td>
                            <td className="py-2 px-3 text-right font-bold text-gray-800">{activeVoucher.treasuryName}</td>
                            <td className="py-2 px-3 text-gray-400">0</td>
                            <td className="py-2 px-3 font-bold text-indigo-600">{activeVoucher.amount.toLocaleString()}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveVoucher}
                className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs transition-colors ${
                  activeVoucher.voucherType === 'RECEIPT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                💾 ترحيل السند واعتماد الأثر المالي
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
