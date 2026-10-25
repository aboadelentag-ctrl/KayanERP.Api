import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  PlusCircle,
  Search,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  DollarSign,
  Receipt
} from 'lucide-react';
import {
  fetchTreasuryVouchersApi,
  fetchTreasuryLookupsApi,
  saveTreasuryVoucherApi
} from './treasuryApi';
import type {
  TreasuryVoucherDto,
  TreasuryLookupsDto
} from './treasuryApi';

export const TreasuryVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<TreasuryVoucherDto[]>([]);
  const [lookups, setLookups] = useState<TreasuryLookupsDto>({
    treasuries: [],
    beneficiaryTypes: [],
    suppliers: [],
    expenseCategories: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [treasuryFilter, setTreasuryFilter] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // حالة إضافة سند جديد
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [voucherType, setVoucherType] = useState<'RECEIPT' | 'PAYMENT'>('PAYMENT');
  const [amount, setAmount] = useState<number>(0);
  const [selectedTreasury, setSelectedTreasury] = useState<string>('');
  const [beneficiaryType, setBeneficiaryType] = useState<'مورد' | 'عميل' | 'مصروفات تشغيل' | 'سلفة موظف'>('مورد');
  const [beneficiaryName, setBeneficiaryName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'شيك بانكي' | 'تحويل لحظي'>('نقدي');
  const [description, setDescription] = useState<string>('');
  const [referenceDocNumber, setReferenceDocNumber] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vouchersData, lkps] = await Promise.all([
        fetchTreasuryVouchersApi(),
        fetchTreasuryLookupsApi()
      ]);
      setVouchers(vouchersData);
      setLookups(lkps);
      if (lkps.treasuries.length > 0) setSelectedTreasury(lkps.treasuries[0]);
      if (lkps.suppliers.length > 0) setBeneficiaryName(lkps.suppliers[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchSearch =
        !searchTerm.trim() ||
        v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.beneficiaryName.includes(searchTerm) ||
        v.description.includes(searchTerm);
      const matchType = !typeFilter || v.voucherType === typeFilter;
      const matchTreasury = !treasuryFilter || v.treasuryName === treasuryFilter;
      return matchSearch && matchType && matchTreasury;
    });
  }, [vouchers, searchTerm, typeFilter, treasuryFilter]);

  const totalReceipts = useMemo(() => vouchers.filter(v => v.voucherType === 'RECEIPT').reduce((sum, v) => sum + v.amount, 0), [vouchers]);
  const totalPayments = useMemo(() => vouchers.filter(v => v.voucherType === 'PAYMENT').reduce((sum, v) => sum + v.amount, 0), [vouchers]);
  const netTreasuryFlow = useMemo(() => totalReceipts - totalPayments, [totalReceipts, totalPayments]);

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !beneficiaryName.trim()) return;

    const newVoucher: TreasuryVoucherDto = {
      id: Date.now(),
      voucherNumber: `TR-${voucherType === 'RECEIPT' ? 'REC' : 'PAY'}-2026-${Date.now().toString().slice(-3)}`,
      voucherType,
      date: new Date().toISOString().slice(0, 10),
      amount: Number(amount),
      treasuryName: selectedTreasury || lookups.treasuries[0],
      beneficiaryType,
      beneficiaryName,
      paymentMethod,
      status: 'معتمد ومرحل',
      description,
      referenceDocNumber: referenceDocNumber || undefined
    };

    await saveTreasuryVoucherApi(newVoucher);
    setVouchers(prev => [newVoucher, ...prev]);
    setIsModalOpen(false);
    setAmount(0);
    setDescription('');
    setReferenceDocNumber('');
    setStatusMessage(`تم ترحيل السند (${newVoucher.voucherNumber}) بقيمة ${newVoucher.amount.toLocaleString()} ج.م وقيد أثره على الخزينة.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <span>حركة الخزينة وسندات القبض والصرف (Treasury & Cash Flow)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              الرقابة النقدية وسداد الموردين
            </span>
          </div>
          <p className="text-xs text-slate-400">
            إثبات سندات الصرف وسداد دفعات الموردين، تحصيل النقدية، وتسوية العهد اليومية مع القيود المحاسبية.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تحرير سند خزينة جديد</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات التدفق النقدي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي المقبوضات والتحصيلات</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">+{totalReceipts.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-rose-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي المدفوعات وسداد الموردين</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">-{totalPayments.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">صافي حركة السيولة اللحظية</span>
          <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">{netTreasuryFlow.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span></h4>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم السند، اسم المستفيد، البيان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كل أنواع السندات --</option>
          <option value="PAYMENT">سندات صرف نقدية</option>
          <option value="RECEIPT">سندات قبض وتحصيل</option>
        </select>

        <select
          value={treasuryFilter}
          onChange={(e) => setTreasuryFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة الخزائن والعهد --</option>
          {lookups.treasuries.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* جدول السندات */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-bold">جاري تحميل سجلات الخزينة...</div>
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold">لا توجد سندات مطابقة للبحث.</div>
        ) : (
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-3">رقم السند</th>
                <th className="py-3 px-3">النوع</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">الخزينة</th>
                <th className="py-3 px-3 text-right">المستفيد / الجهة</th>
                <th className="py-3 px-3 text-right">البيان والشرح</th>
                <th className="py-3 px-3">طريقة الدفع</th>
                <th className="py-3 px-3">المبلغ</th>
                <th className="py-3 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVouchers.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{v.voucherNumber}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        v.voucherType === 'RECEIPT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {v.voucherType === 'RECEIPT' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{v.voucherType === 'RECEIPT' ? 'قبض' : 'صرف'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-500">{v.date}</td>
                  <td className="py-3 px-3 font-medium text-gray-700">{v.treasuryName}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                    {v.beneficiaryName}
                    <span className="text-[10px] text-gray-400 block font-normal">{v.beneficiaryType}</span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600 max-w-xs truncate">{v.description}</td>
                  <td className="py-3 px-3 font-medium text-gray-700">{v.paymentMethod}</td>
                  <td className="py-3 px-3 font-mono font-black text-sm">
                    <span className={v.voucherType === 'RECEIPT' ? 'text-emerald-700' : 'text-rose-600'}>
                      {v.voucherType === 'RECEIPT' ? '+' : '-'}{v.amount.toLocaleString()} ج.م
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700">
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نافذة تحرير سند جديد */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>تحرير سند خزينة جديد</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white font-bold text-base">×</button>
            </div>

            <form onSubmit={handleSaveVoucher} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">نوع السند *</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    <option value="PAYMENT">سند صرف نقدية (مدفوعات)</option>
                    <option value="RECEIPT">سند قبض نقدية (تحصيلات)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الخزينة المعتمدة *</label>
                  <select
                    value={selectedTreasury}
                    onChange={(e) => setSelectedTreasury(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    {lookups.treasuries.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-center font-black text-emerald-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">طريقة الدفع</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    <option value="نقدي">نقدي كاش</option>
                    <option value="شيك بانكي">شيك بنكي</option>
                    <option value="تحويل لحظي">تحويل لحظي (InstaPay)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">تصنيف الجهة *</label>
                  <select
                    value={beneficiaryType}
                    onChange={(e) => setBeneficiaryType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    {lookups.beneficiaryTypes.map((bt, i) => (
                      <option key={i} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم المستفيد / الجهة *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم المورد أو العميل أو البند..."
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">البيان والشرح التفصيلي *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="اكتب أسباب الصرف أو التحصيل ورقم الفاتورة المرجعية..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-medium"
                ></textarea>
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
                  💾 اعتماد وترحيل السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
