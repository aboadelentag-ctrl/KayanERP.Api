import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  DollarSign,
  Flame,
  Zap,
  Droplets,
  Users,
  Building,
  CreditCard,
  Scale,
  X
} from 'lucide-react';
import {
  fetchExpensesPayablesApi,
  fetchSuppliersLookupApi,
  saveExpensePayableApi,
  payExpenseBillApi
} from './expensesApi';
import type { ExpensePayableDto, SupplierLookupItem } from './expensesApi';

export const ExpensesPayablesPage: React.FC = () => {
  const [bills, setBills] = useState<ExpensePayableDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierLookupItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');

  // Add Bill Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [newBill, setNewBill] = useState<Partial<ExpensePayableDto>>({
    category: 'SUPPLIER_PURCHASE',
    costCenterName: 'المستودع الرئيسي للخامات (WH-MAIN)',
    debitAccountCode: '1231',
    debitAccountName: 'مخزن المواد الخام والتعبئة',
    creditAccountCode: '211',
    creditAccountName: 'موردو الخامات والتعبئة',
    title: 'فاتورة توريد خامات إنتاج',
    partyName: '',
    totalAmount: 0,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    notes: ''
  });

  // Pay Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [activeBillToPay, setActiveBillToPay] = useState<ExpensePayableDto | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [suppliersData, billsData] = await Promise.all([
        fetchSuppliersLookupApi(),
        fetchExpensesPayablesApi()
      ]);
      setSuppliers(suppliersData);
      setBills(billsData);
    } catch (ex: any) {
      setStatusMessage(`خطأ في جلب البيانات: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const summary = useMemo(() => {
    const suppliersDue = bills
      .filter(b => b.category === 'SUPPLIER_PURCHASE')
      .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
    const utilitiesDue = bills
      .filter(b => b.category.startsWith('UTILITY'))
      .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
    const payrollDue = bills
      .filter(b => b.category === 'PAYROLL')
      .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
    const rentDue = bills
      .filter(b => b.category === 'RENT')
      .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

    return { suppliersDue, utilitiesDue, payrollDue, rentDue };
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      if (selectedCategoryFilter && b.category !== selectedCategoryFilter) return false;
      if (selectedStatusFilter && b.status !== selectedStatusFilter) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        b.billNumber.toLowerCase().includes(term) ||
        b.title.toLowerCase().includes(term) ||
        b.partyName.toLowerCase().includes(term) ||
        b.costCenterName.toLowerCase().includes(term)
      );
    });
  }, [bills, selectedCategoryFilter, selectedStatusFilter, searchTerm]);

  const handleCategoryChange = (category: any) => {
    let update: Partial<ExpensePayableDto> = { category };
    switch (category) {
      case 'UTILITY_GAS':
        update = {
          ...update,
          title: 'فاتورة غاز أفران الصالات',
          partyName: 'شركة تاون جاس (الغاز الطبيعي)',
          costCenterName: 'صالة الإنتاج الشرقي (CC-EAST)',
          debitAccountCode: '53',
          debitAccountName: 'مصاريف غاز وكهرباء الصالات',
          creditAccountCode: '213',
          creditAccountName: 'مصروفات خدمية مستحقة'
        };
        break;
      case 'UTILITY_ELEC':
        update = {
          ...update,
          title: 'فاتورة كهرباء ثلاجات التبريد',
          partyName: 'شركة توزيع الكهرباء',
          costCenterName: 'صالة الغربي والتبريد (CC-WEST)',
          debitAccountCode: '53',
          debitAccountName: 'مصاريف غاز وكهرباء الصالات',
          creditAccountCode: '213',
          creditAccountName: 'مصروفات خدمية مستحقة'
        };
        break;
      case 'UTILITY_WATER':
        update = {
          ...update,
          title: 'فاتورة مياه الصالات والمصنع',
          partyName: 'شركة مياه الشرب والصرف',
          costCenterName: 'المركز الرئيسي (المصنع)',
          debitAccountCode: '53',
          debitAccountName: 'مصاريف مياه وتشغيل',
          creditAccountCode: '213',
          creditAccountName: 'مصروفات خدمية مستحقة'
        };
        break;
      case 'PAYROLL':
        update = {
          ...update,
          title: 'مسير أجور ورواتب ورديات التشغيل',
          partyName: 'عمال وشيفات صالات التصنيع',
          costCenterName: 'إجمالي صالات التصنيع (CC-FACTORY)',
          debitAccountCode: '52',
          debitAccountName: 'أجور عمال الصالات المباشرة',
          creditAccountCode: '213',
          creditAccountName: 'أجور ومرتبات مستحقة'
        };
        break;
      case 'RENT':
        update = {
          ...update,
          partyName: 'مالك عقار فرع وسط البلد',
          title: 'إيجار مقر فرع وسط البلد (BR-02)',
          costCenterName: 'فرع وسط البلد (BR-02)',
          debitAccountCode: '55',
          debitAccountName: 'مصروفات إيجارات المعارض',
          creditAccountCode: '213',
          creditAccountName: 'إيجارات ومصروفات مستحقة'
        };
        break;
      default:
        update = {
          ...update,
          title: 'فاتورة توريد خامات إنتاج',
          partyName: suppliers[0]?.supplierName || '',
          costCenterName: 'المستودع الرئيسي للخامات (WH-MAIN)',
          debitAccountCode: '1231',
          debitAccountName: 'مخزن المواد الخام والتعبئة',
          creditAccountCode: '211',
          creditAccountName: 'موردو الخامات والتعبئة'
        };
        break;
    }
    setNewBill(prev => ({ ...prev, ...update }));
  };

  const openAddModal = () => {
    setSelectedSupplierId(suppliers[0]?.id || 0);
    setNewBill({
      category: 'SUPPLIER_PURCHASE',
      costCenterName: 'المستودع الرئيسي للخامات (WH-MAIN)',
      debitAccountCode: '1231',
      debitAccountName: 'مخزن المواد الخام والتعبئة',
      creditAccountCode: '211',
      creditAccountName: 'موردو الخامات والتعبئة',
      title: 'فاتورة توريد خامات إنتاج',
      partyName: suppliers[0]?.supplierName || 'يرجى اختيار المورد من القائمة',
      totalAmount: 0,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSupplierSelect = (id: number) => {
    setSelectedSupplierId(id);
    const supp = suppliers.find(s => s.id === id);
    if (supp) {
      setNewBill(prev => ({
        ...prev,
        supplierId: supp.id,
        partyName: supp.supplierName,
        title: `توريد خامات من [${supp.supplierName}]`
      }));
    }
  };

  const handleSaveNewBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBill.category === 'SUPPLIER_PURCHASE' && (!selectedSupplierId || selectedSupplierId === 0)) {
      alert('⚠️ يرجى اختيار المورد المعتمد من القائمة.');
      return;
    }

    if (!newBill.totalAmount || newBill.totalAmount <= 0 || !newBill.title?.trim()) {
      alert('⚠️ يرجى إدخال عنوان ومبلغ الفاتورة بشكل صحيح.');
      return;
    }

    const payload: ExpensePayableDto = {
      id: Date.now(),
      billNumber: `BILL-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`,
      category: newBill.category || 'SUPPLIER_PURCHASE',
      supplierId: newBill.supplierId,
      title: newBill.title,
      partyName: newBill.partyName || 'جهة عامة',
      costCenterName: newBill.costCenterName || 'المركز الرئيسي',
      debitAccountCode: newBill.debitAccountCode || '53',
      debitAccountName: newBill.debitAccountName || 'مصاريف تشغيل',
      creditAccountCode: newBill.creditAccountCode || '213',
      creditAccountName: newBill.creditAccountName || 'مستحقات دائنة',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: newBill.dueDate || new Date().toISOString().slice(0, 10),
      totalAmount: Number(newBill.totalAmount),
      paidAmount: 0,
      remainingAmount: Number(newBill.totalAmount),
      status: 'UNPAID',
      notes: newBill.notes
    };

    await saveExpensePayableApi(payload);
    setBills(prev => [payload, ...prev]);
    setStatusMessage('✅ تم تسجيل استحقاق الفاتورة وتوليد القيد المحاسبي بنجاح!');
    setIsSuccess(true);
    setIsAddModalOpen(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const openPayModal = (bill: ExpensePayableDto) => {
    setActiveBillToPay(bill);
    setPaymentAmountInput(bill.remainingAmount);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBillToPay || paymentAmountInput <= 0) return;

    await payExpenseBillApi(activeBillToPay.id, paymentAmountInput);

    setBills(prev =>
      prev.map(b => {
        if (b.id === activeBillToPay.id) {
          const newPaid = b.paidAmount + paymentAmountInput;
          const newRemaining = Math.max(0, b.totalAmount - newPaid);
          const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIAL';
          return {
            ...b,
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            status: newStatus
          };
        }
        return b;
      })
    );

    setStatusMessage('✅ تم إثبات السداد وتحديث التزام المورد بنجاح!');
    setIsSuccess(true);
    setIsPayModalOpen(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'UTILITY_GAS': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'UTILITY_ELEC': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'UTILITY_WATER': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'PAYROLL': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RENT': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'UTILITY_GAS': return 'غاز أفران 🔥';
      case 'UTILITY_ELEC': return 'كهرباء وتبريد ⚡';
      case 'UTILITY_WATER': return 'مياه 💧';
      case 'PAYROLL': return 'أجور عمال 👥';
      case 'RENT': return 'إيجارات 🏢';
      default: return 'موردو خامات 📦';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIAL': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'مسدد بالكامل ✓';
      case 'PARTIAL': return 'مسدد جزئياً';
      default: return 'مستحق (غير مسدد)';
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* رأس الشاشة التنفيذي */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" />
            <span>استحقاقات الموردين ومصروفات التشغيل والخدمات (AP & OPEX Hub)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة فواتير موردي الخامات، الغاز، الكهرباء، المياه، أجور العاملين، وإيجارات الفروع.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            <RotateCw className="w-4 h-4 text-indigo-600" />
            <span>تحديث</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل استحقاق / فاتورة جديدة</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات المؤشرات اللحظية للالتزامات التشغيلية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-rose-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">مستحقات موردي الخامات (AP)</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">
            {summary.suppliersDue.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">فواتير الغاز والكهرباء والمياه</span>
          <h4 className="text-2xl font-black text-slate-900 font-mono mt-1">
            {summary.utilitiesDue.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-cyan-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">أجور ورواتب العمال والورديات</span>
          <h4 className="text-2xl font-black text-cyan-700 font-mono mt-1">
            {summary.payrollDue.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إيجارات الفروع والمعارض</span>
          <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">
            {summary.rentDue.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="ابحث برقم الفاتورة، البند، أو اسم المورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-mono"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة بنود الالتزامات --</option>
          <option value="SUPPLIER_PURCHASE">موردو الخامات والتعبئة (AP)</option>
          <option value="UTILITY_GAS">غاز الأفران والصالات (Town Gas)</option>
          <option value="UTILITY_ELEC">كهرباء الثلاجات والإنارة</option>
          <option value="UTILITY_WATER">فواتير المياه والصرف</option>
          <option value="PAYROLL">مسيرات أجور ورواتب العمال</option>
          <option value="RENT">إيجارات المعارض ومقرات الفروع</option>
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة حالات السداد --</option>
          <option value="UNPAID">مستحقة بالكامل (غير مسددة)</option>
          <option value="PARTIAL">مسددة جزئياً</option>
          <option value="PAID">مسددة بالكامل ✓</option>
        </select>

        <div className="text-gray-500 font-bold">
          المعروض: <span className="font-mono font-black text-indigo-700">{filteredBills.length}</span> مطالبة
        </div>
      </div>

      {/* جدول عرض الالتزامات والمصروفات */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
          <span className="font-bold">📋 جدول استحقاقات الموردين وفواتير الطاقة والأجور</span>
          <span className="bg-slate-800 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
            مربوط بدليل الموردين الفعلي ✓
          </span>
        </div>

        <table className="w-full text-center">
          <thead className="bg-slate-100 text-gray-700">
            <tr>
              <th className="py-2.5 px-3">رقم المطالبة</th>
              <th className="py-2.5 px-3">البند والتصنيف</th>
              <th className="py-2.5 px-3 text-right">بيان الفاتورة / المستحق</th>
              <th className="py-2.5 px-3 text-right">الجهة المستحقة (المورد / الشركة)</th>
              <th className="py-2.5 px-3">مركز التكلفة</th>
              <th className="py-2.5 px-3">إجمالي المبلغ</th>
              <th className="py-2.5 px-3">المسدد</th>
              <th className="py-2.5 px-3">المتبقي</th>
              <th className="py-2.5 px-3">الحالة</th>
              <th className="py-2.5 px-3">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-400 font-bold">
                  جاري تحميل المطالبات والاستحقاقات...
                </td>
              </tr>
            ) : filteredBills.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-400 font-bold">
                  لا توجد مطالبات أو فواتير مطابقة للبحث.
                </td>
              </tr>
            ) : (
              filteredBills.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{bill.billNumber}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(bill.category)}`}>
                      {getCategoryLabel(bill.category)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900">{bill.title}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-indigo-700">{bill.partyName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border font-mono text-[10px]">
                      {bill.costCenterName}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{bill.totalAmount.toLocaleString()} ج.م</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">{bill.paidAmount.toLocaleString()} ج.م</td>
                  <td className={`py-2.5 px-3 font-mono font-bold ${bill.remainingAmount > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                    {bill.remainingAmount.toLocaleString()} ج.م
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(bill.status)}`}>
                      {getStatusLabel(bill.status)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {bill.remainingAmount > 0 ? (
                      <button
                        onClick={() => openPayModal(bill)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs"
                      >
                        💵 سداد
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-[11px]">مكتمل ✓</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* مودال: تسجيل استحقاق جديد مربوط ديناميكياً بالموردين والفروع */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-white" />
                <span>إثبات استحقاق مالي / فاتورة تشغيل جديدة</span>
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSaveNewBill} className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">نوع الالتزام / الفاتورة *</label>
                  <select
                    value={newBill.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-300 rounded-xl font-bold"
                  >
                    <option value="SUPPLIER_PURCHASE">موردو الخامات والتعبئة (سمن، سكر، دقيق)</option>
                    <option value="UTILITY_GAS">فاتورة غاز الأفران والصالات (Town Gas)</option>
                    <option value="UTILITY_ELEC">فاتورة كهرباء الثلاجات والإنارة</option>
                    <option value="UTILITY_WATER">فاتورة المياه والصرف</option>
                    <option value="PAYROLL">مسير أجور ورواتب عمال الورديات</option>
                    <option value="RENT">إيجار معرض أو مقر فرع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">مركز التكلفة المحمّل عليه *</label>
                  <select
                    value={newBill.costCenterName}
                    onChange={(e) => setNewBill({ ...newBill, costCenterName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    <option value="المستودع الرئيسي للخامات (WH-MAIN)">المستودع الرئيسي للخامات (WH-MAIN)</option>
                    <option value="صالة الإنتاج الشرقي (CC-EAST)">صالة الإنتاج الشرقي (CC-EAST)</option>
                    <option value="صالة الغربي والتبريد (CC-WEST)">صالة الغربي والتبريد (CC-WEST)</option>
                    <option value="فرع المبيعات الخارجية والتوزيع (BR-DIST)">فرع المبيعات الخارجية والتوزيع (BR-DIST)</option>
                    <option value="المعرض الرئيسي (المصنع)">المعرض الرئيسي (المصنع)</option>
                    <option value="فرع وسط البلد (BR-02)">فرع وسط البلد (BR-02)</option>
                  </select>
                </div>

                {newBill.category === 'SUPPLIER_PURCHASE' ? (
                  <div className="col-span-2">
                    <label className="block text-rose-700 font-bold mb-1">اختيار المورد المعتمد من قاعدة البيانات *</label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => handleSupplierSelect(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl font-bold"
                    >
                      <option value={0}>-- اختر المورد المسجل في النظام --</option>
                      {suppliers.map(supp => (
                        <option key={supp.id} value={supp.id}>
                          [{supp.supplierCode}] {supp.supplierName} ({supp.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="col-span-2">
                    <label className="block text-gray-700 font-bold mb-1">الجهة الخدمية المستحقة *</label>
                    <input
                      type="text"
                      required
                      value={newBill.partyName || ''}
                      onChange={(e) => setNewBill({ ...newBill, partyName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border rounded-xl font-bold"
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">بيان وعنوان الفاتورة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: توريد 2 طن سمن طبيعي..."
                    value={newBill.title || ''}
                    onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">إجمالي المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newBill.totalAmount || ''}
                    onChange={(e) => setNewBill({ ...newBill, totalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-indigo-400 rounded-xl font-mono text-center font-black text-indigo-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">تاريخ الاستحقاق الأقصى</label>
                  <input
                    type="date"
                    value={newBill.dueDate}
                    onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* معاينة القيد المزدوج الآلي */}
              <div className="bg-white p-3.5 rounded-xl border border-indigo-200">
                <div className="flex justify-between items-center mb-2">
                  <h6 className="font-bold text-indigo-700 text-xs flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    <span>القيد المحاسبي المتولد آلياً لإثبات الاستحقاق:</span>
                  </h6>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    متزن 100% ✓
                  </span>
                </div>

                <table className="w-full text-center border font-mono">
                  <thead className="bg-slate-50 text-gray-600">
                    <tr>
                      <th className="py-1.5 px-2">طرف القيد</th>
                      <th className="py-1.5 px-2">كود الحساب</th>
                      <th className="py-1.5 px-2 text-right">اسم الحساب المحاسبي</th>
                      <th className="py-1.5 px-2">مدين (Debit)</th>
                      <th className="py-1.5 px-2">دائن (Credit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-1 px-2 text-rose-600 font-bold">من حـ/ (مدين)</td>
                      <td className="py-1 px-2">{newBill.debitAccountCode}</td>
                      <td className="py-1 px-2 text-right">{newBill.debitAccountName}</td>
                      <td className="py-1 px-2 font-bold text-rose-600">{Number(newBill.totalAmount || 0).toLocaleString()}</td>
                      <td className="py-1 px-2">0</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-indigo-600 font-bold">إلى حـ/ (دائن)</td>
                      <td className="py-1 px-2">{newBill.creditAccountCode}</td>
                      <td className="py-1 px-2 text-right">{newBill.creditAccountName} ({newBill.partyName || 'المورد'})</td>
                      <td className="py-1 px-2">0</td>
                      <td className="py-1 px-2 font-bold text-indigo-600">{Number(newBill.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  💾 اعتماد وتثبيت الاستحقاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال: سداد دفعة من الخزينة */}
      {isPayModalOpen && activeBillToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-white" />
                <span>سداد نقدية من الخزينة</span>
              </h4>
              <button onClick={() => setIsPayModalOpen(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-5 space-y-3">
              <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                <div className="font-bold text-gray-900">{activeBillToPay.title}</div>
                <div><strong>إجمالي الفاتورة:</strong> <span className="font-mono">{activeBillToPay.totalAmount.toLocaleString()} ج.م</span></div>
                <div><strong>المسدد سابقاً:</strong> <span className="font-mono text-emerald-700 font-bold">{activeBillToPay.paidAmount.toLocaleString()} ج.م</span></div>
                <div className="text-rose-600 font-bold"><strong>المتبقي المطلوب:</strong> <span className="font-mono text-sm">{activeBillToPay.remainingAmount.toLocaleString()} ج.م</span></div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">المبلغ المطلوب سداده الآن (ج.م) *</label>
                <input
                  type="number"
                  min={1}
                  max={activeBillToPay.remainingAmount}
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-emerald-400 rounded-xl font-mono text-center font-black text-emerald-700 text-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">الخزينة المنصرف منها السداد</label>
                <select className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold">
                  <option>1211 - الخزينة الرئيسية (المصنع)</option>
                  <option>1212 - خزينة فرع التوزيع الخارجي</option>
                  <option>1112 - حساب البنك الأهلي المصري</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  💾 تأكيد السداد وإصدار سند الصرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
