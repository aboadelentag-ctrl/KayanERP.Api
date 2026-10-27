import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  PlusCircle,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  X,
  Building2,
  ArrowRightLeft,
  Check
} from 'lucide-react';

export interface RawMaterialDefinition {
  id: number;
  itemCode: string;
  itemName: string;
  availableUnits: string[];
  defaultUnit: string;
  defaultPrice: number;
  suggestedSupplierId: number;
}

export interface PurchaseRequestLineDto {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  selectedUnit: string;
  requestedQty: number;
  notes?: string;
  assignedSupplierId?: number;
  unitPrice?: number;
}

export interface PurchaseRequestDto {
  id: number;
  orderNumber: string;
  orderDate: string;
  requestingDepartment: string;
  requestedBy: string;
  status: 'PENDING_PROCUREMENT' | 'CONVERTED_TO_PO';
  lines: PurchaseRequestLineDto[];
}

export const PurchasingPage: React.FC = () => {
  const departmentsList = [
    'إدارة المخازن المركزية',
    'صالة تصنيع الحلويات الشرقية',
    'صالة تصنيع الحلويات الغربية والتورت',
    'صالة الكنافة والقطايف',
    'قسم النواشف والكرواسون والبتيفور',
    'إدارة الصيانة والتشغيل'
  ];

  const suppliersList = [
    { id: 1, supplierCode: 'SUP-01', supplierName: 'شركة مطاحن الدلتا والصعيد' },
    { id: 2, supplierCode: 'SUP-02', supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي' },
    { id: 3, supplierCode: 'SUP-03', supplierName: 'الشركة المصرية لتجارة وتكرير السكر' },
    { id: 4, supplierCode: 'SUP-04', supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف' },
    { id: 5, supplierCode: 'SUP-05', supplierName: 'الشركة السورية لاستيراد المكسرات' }
  ];

  const rawMaterialsList: RawMaterialDefinition[] = [
    { id: 101, itemCode: 'RAW-FLOUR-72', itemName: 'دقيق فاخر استخراج 72%', availableUnits: ['كجم', 'شيكارة (50 كجم)', 'طن'], defaultUnit: 'شيكارة (50 كجم)', defaultPrice: 925.0, suggestedSupplierId: 1 },
    { id: 102, itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي ممتاز', availableUnits: ['كجم', 'صفيحة (16 كجم)', 'برميل (200 كجم)'], defaultUnit: 'صفيحة (16 كجم)', defaultPrice: 3040.0, suggestedSupplierId: 2 },
    { id: 103, itemCode: 'RAW-SUG-01', itemName: 'سكر مكرر ناعم فاخر', availableUnits: ['كجم', 'شيكارة (50 كجم)', 'طن'], defaultUnit: 'شيكارة (50 كجم)', defaultPrice: 1400.0, suggestedSupplierId: 3 },
    { id: 104, itemCode: 'RAW-SMD-03', itemName: 'سميد بسبوسة نمرة 1 مرمل', availableUnits: ['كجم', 'شيكارة (50 كجم)'], defaultUnit: 'شيكارة (50 كجم)', defaultPrice: 1200.0, suggestedSupplierId: 1 },
    { id: 105, itemCode: 'RAW-PST-05', itemName: 'فستق حلبي محمص نمرة 1', availableUnits: ['كجم', 'كرتونة (10 كجم)'], defaultUnit: 'كجم', defaultPrice: 750.0, suggestedSupplierId: 5 },
    { id: 106, itemCode: 'PCK-BOX-09', itemName: 'كرتون صواني البسبوسة 50*50', availableUnits: ['قطعة', 'ربطة (100 قطعة)'], defaultUnit: 'قطعة', defaultPrice: 4.5, suggestedSupplierId: 4 }
  ];

  // قراءة الطلبات من التخزين المحلي لتثبيت حالتها بعد التحويل
  const [requests, setRequests] = useState<PurchaseRequestDto[]>(() => {
    const saved = localStorage.getItem('kayan_purchase_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 1,
        orderNumber: 'PR-2026-00101',
        orderDate: '2026-10-24',
        requestingDepartment: 'إدارة المخازن المركزية',
        requestedBy: 'أمين المخزن الرئيسي',
        status: 'PENDING_PROCUREMENT',
        lines: [
          { id: 11, itemId: 101, itemCode: 'RAW-FLOUR-72', itemName: 'دقيق فاخر استخراج 72%', selectedUnit: 'شيكارة (50 كجم)', requestedQty: 100, notes: 'رصيد الدقيق قارب على حد إعادة الطلب', assignedSupplierId: 1, unitPrice: 925 },
          { id: 12, itemId: 103, itemCode: 'RAW-SUG-01', itemName: 'سكر مكرر ناعم فاخر', selectedUnit: 'شيكارة (50 كجم)', requestedQty: 60, notes: 'لاستهلاك تشغيل الأسبوع القادم', assignedSupplierId: 3, unitPrice: 1400 }
        ]
      },
      {
        id: 2,
        orderNumber: 'PR-2026-00102',
        orderDate: '2026-10-23',
        requestingDepartment: 'صالة تصنيع الحلويات الشرقية',
        requestedBy: 'أحمد السعدي (مشرف صالة)',
        status: 'CONVERTED_TO_PO',
        lines: [
          { id: 21, itemId: 102, itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي ممتاز', selectedUnit: 'صفيحة (16 كجم)', requestedQty: 75, notes: 'عاجل لتشغيل طلبات عطلة نهاية الأسبوع', assignedSupplierId: 2, unitPrice: 3040 }
        ]
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalRequestDept, setModalRequestDept] = useState(departmentsList[0]);
  const [modalOrderDate, setModalOrderDate] = useState('2026-10-25');
  const [modalLines, setModalLines] = useState<{
    itemId: number;
    selectedUnit: string;
    requestedQty: number;
    notes: string;
    itemSearchText: string;
    isDropdownOpen: boolean;
  }[]>([
    { itemId: 101, selectedUnit: 'شيكارة (50 كجم)', requestedQty: 100, notes: '', itemSearchText: '', isDropdownOpen: false }
  ]);

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [requestToConvert, setRequestToConvert] = useState<PurchaseRequestDto | null>(null);
  const [convertLinesData, setConvertLinesData] = useState<{
    id: number;
    supplierId: number;
    unitPrice: number;
  }[]>([]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.orderNumber.toLowerCase().includes(term) ||
        r.requestingDepartment.toLowerCase().includes(term) ||
        r.lines.some(l => l.itemName.toLowerCase().includes(term))
      );
    });
  }, [requests, searchTerm]);

  const openCreateModal = () => {
    setModalRequestDept(departmentsList[0]);
    setModalOrderDate(new Date().toISOString().slice(0, 10));
    setModalLines([
      { itemId: rawMaterialsList[0].id, selectedUnit: rawMaterialsList[0].defaultUnit, requestedQty: 50, notes: '', itemSearchText: '', isDropdownOpen: false }
    ]);
    setShowCreateModal(true);
  };

  const handleAddNewLine = () => {
    const item = rawMaterialsList[0];
    setModalLines([
      ...modalLines,
      { itemId: item.id, selectedUnit: item.defaultUnit, requestedQty: 10, notes: '', itemSearchText: '', isDropdownOpen: false }
    ]);
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: PurchaseRequestDto = {
      id: Date.now(),
      orderNumber: `PR-2026-00${String(requests.length + 101)}`,
      orderDate: modalOrderDate,
      requestingDepartment: modalRequestDept,
      requestedBy: 'مشرف الصالة الطالبة',
      status: 'PENDING_PROCUREMENT',
      lines: modalLines.map((l, idx) => {
        const item = rawMaterialsList.find(i => i.id === l.itemId) || rawMaterialsList[0];
        return {
          id: Date.now() + idx,
          itemId: item.id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          selectedUnit: l.selectedUnit,
          requestedQty: Number(l.requestedQty),
          notes: l.notes || '',
          assignedSupplierId: item.suggestedSupplierId,
          unitPrice: item.defaultPrice
        };
      })
    };
    const updated = [newReq, ...requests];
    setRequests(updated);
    localStorage.setItem('kayan_purchase_requests', JSON.stringify(updated));
    setShowCreateModal(false);
    setStatusMessage(`✅ تم إصدار طلب الشراء [${newReq.orderNumber}] بنجاح.`);
  };

  const openConvertModal = (req: PurchaseRequestDto) => {
    if (req.status === 'CONVERTED_TO_PO') return; // منع الفتح إذا كان محولاً مسبقاً
    setRequestToConvert(req);
    setConvertLinesData(
      req.lines.map(l => {
        const item = rawMaterialsList.find(i => i.id === l.itemId);
        return {
          id: l.id,
          supplierId: l.assignedSupplierId || item?.suggestedSupplierId || 1,
          unitPrice: l.unitPrice || item?.defaultPrice || 100
        };
      })
    );
    setShowConvertModal(true);
  };

  const handleConfirmAndNavigate = () => {
    if (!requestToConvert) return;

    // 1. تحديث وتثبيت حالة الطلب لمنع الضغط عليه مرة أخرى
    const updatedRequests = requests.map(r => 
      r.id === requestToConvert.id ? { ...r, status: 'CONVERTED_TO_PO' as const } : r
    );
    setRequests(updatedRequests);
    localStorage.setItem('kayan_purchase_requests', JSON.stringify(updatedRequests));

    // 2. تجميع الأصناف حسب المورد وتوليد أوامر التوريد بدون تكرار
    const existingPOs = JSON.parse(localStorage.getItem('kayan_purchase_orders') || '[]');
    const supplierGroups: { [suppId: number]: any[] } = {};

    requestToConvert.lines.forEach(l => {
      const lineData = convertLinesData.find(c => c.id === l.id);
      const sId = lineData?.supplierId || 1;
      const price = lineData?.unitPrice || 100;
      if (!supplierGroups[sId]) supplierGroups[sId] = [];
      supplierGroups[sId].push({
        ...l,
        unitPrice: price,
        total: l.requestedQty * price
      });
    });

    const newGeneratedPOs: any[] = [];
    let counter = existingPOs.length + 101;

    Object.keys(supplierGroups).forEach(suppIdStr => {
      const suppId = Number(suppIdStr);
      const suppObj = suppliersList.find(s => s.id === suppId);
      const lines = supplierGroups[suppId];
      const totalSum = lines.reduce((acc, curr) => acc + curr.total, 0);

      newGeneratedPOs.push({
        id: Date.now() + Math.random(),
        poNumber: `PO-2026-${counter++}`,
        supplierName: suppObj?.supplierName || 'مورد معتمد',
        details: lines.map(i => `${i.itemName} (${i.requestedQty} ${i.selectedUnit})`).join('، '),
        issueDate: new Date().toISOString().slice(0, 10),
        expectedDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        totalAmount: totalSum,
        status: 'معتمد قيد التوريد',
        coaStatus: 'شهادات مطابقة'
      });
    });

    localStorage.setItem('kayan_purchase_orders', JSON.stringify([...newGeneratedPOs, ...existingPOs]));
    setShowConvertModal(false);

    // 3. التحويل المباشر لشاشة أوامر التوريد
    const poTabBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
      el.textContent?.includes('أوامر توريد من الموردين') || el.textContent?.includes('فواتير الشراء')
    ) as HTMLElement;

    if (poTabBtn) {
      poTabBtn.click();
    } else {
      window.location.hash = '#/purchase-orders';
      window.location.reload();
    }
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800/80 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-amber-500" />
              <span>إدارة طلبات واحتياجات الشراء (Procurement & Sourcing)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              طلبات الأقسام ⟵ تفكيك وتوزيع الموردين
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            تقديم طلبات الأصناف والكميات بالصالات، وتخصيص كل صنف لمورده المعتمد وتحويله لأمر توريد مستقل.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ إنشاء طلب شراء أصناف جديد</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* جدول الطلبات */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800/80 shadow-lg overflow-hidden text-xs">
        <table className="w-full text-center">
          <thead className="bg-slate-100 dark:bg-[#151822] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-3">رقم الطلب</th>
              <th className="py-3 px-3">التاريخ</th>
              <th className="py-3 px-3 text-right">الإدارة الطالبة / المسؤول</th>
              <th className="py-3 px-3">عدد الأصناف</th>
              <th className="py-3 px-3">الحالة الرقابية</th>
              <th className="py-3 px-3">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60">
            {filteredRequests.map(r => {
              const isConverted = r.status === 'CONVERTED_TO_PO';
              return (
                <tr key={r.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">{r.orderNumber}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{r.orderDate}</td>
                  <td className="py-3 px-3 text-right font-bold text-zinc-100">
                    <span>{r.requestingDepartment}</span>
                    <small className="block text-zinc-500 font-normal">بطلب من: {r.requestedBy}</small>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="bg-zinc-800 px-2 py-0.5 rounded font-bold text-[10px] text-slate-700 dark:text-zinc-300">
                      {r.lines.length} أصناف
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      isConverted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isConverted ? 'تم التحويل لأوامر توريد معتمدة ✅' : 'قيد الاعتماد بالكميات ⏳'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {/* إذا تم التحويل يصبح الزر معطلاً وثابتاً لمنع الضغط عليه مرة أخرى */}
                    {isConverted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        <span>مكتمل ومعتمد</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => openConvertModal(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] shadow-sm mx-auto"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>توزيع الموردين والتحويل لأمر توريد</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal 1: إنشاء طلب شراء جديد */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0f1117] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-slate-100 dark:bg-[#151822] text-white flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-amber-400">
                <ShoppingCart className="w-4 h-4" />
                <span>طلب شراء واحتياج أصناف جديد (للصالات والمخازن)</span>
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-600 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">الإدارة / الصالة الطالبة *</label>
                  <select
                    value={modalRequestDept}
                    onChange={(e) => setModalRequestDept(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-amber-500/40 rounded-lg font-bold text-zinc-100"
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">تاريخ الطلب</label>
                  <input
                    type="date"
                    value={modalOrderDate}
                    onChange={(e) => setModalOrderDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-zinc-100"
                  />
                </div>
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-visible bg-[#0a0c10]">
                <div className="p-3 bg-[#13161f] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="font-bold text-zinc-200">📋 قائمة الأصناف والكميات المطلوبة:</span>
                  <button
                    type="button"
                    onClick={handleAddNewLine}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                  >
                    ➕ إضافة صنف آخر
                  </button>
                </div>

                <table className="w-full text-center">
                  <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3 text-right" style={{ width: '40%' }}>الصنف (بحث بالاسم أو الكود) *</th>
                      <th className="py-2.5 px-3 w-48">الكمية والوحدة *</th>
                      <th className="py-2.5 px-3 text-right">ملاحظات أمام الصنف</th>
                      <th className="py-2.5 px-3 w-14">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
                    {modalLines.map((line, idx) => {
                      const selectedItem = rawMaterialsList.find(i => i.id === line.itemId) || rawMaterialsList[0];
                      const query = line.itemSearchText.trim().toLowerCase();
                      const searchResults = rawMaterialsList.filter(item =>
                        !query || item.itemName.toLowerCase().includes(query) || item.itemCode.toLowerCase().includes(query)
                      );

                      return (
                        <tr key={idx} className="relative">
                          <td className="py-2 px-3 text-right relative">
                            <input
                              type="text"
                              value={line.isDropdownOpen ? line.itemSearchText : `${selectedItem.itemName} [${selectedItem.itemCode}]`}
                              onFocus={() => {
                                const copy = [...modalLines];
                                copy[idx].isDropdownOpen = true;
                                copy[idx].itemSearchText = '';
                                setModalLines(copy);
                              }}
                              onChange={(e) => {
                                const val = e.target.value;
                                const copy = [...modalLines];
                                copy[idx].itemSearchText = val;
                                copy[idx].isDropdownOpen = true;
                                setModalLines(copy);
                              }}
                              placeholder="ابحث بالاسم أو الكود..."
                              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs outline-none text-zinc-100 focus:border-amber-500"
                            />

                            {line.isDropdownOpen && (
                              <div className="absolute z-50 top-full right-0 w-full bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto mt-1 text-xs">
                                {searchResults.map(item => (
                                  <div
                                    key={item.id}
                                    onMouseDown={() => {
                                      const copy = [...modalLines];
                                      copy[idx].itemId = item.id;
                                      copy[idx].selectedUnit = item.defaultUnit;
                                      copy[idx].isDropdownOpen = false;
                                      setModalLines(copy);
                                    }}
                                    className="p-2.5 px-3 hover:bg-amber-500/20 cursor-pointer flex justify-between items-center border-b border-slate-200 dark:border-zinc-800"
                                  >
                                    <span className="font-bold text-zinc-100">{item.itemName}</span>
                                    <span className="font-mono text-amber-400 font-bold">[{item.itemCode}]</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5 justify-center">
                              <input
                                type="number"
                                step="any"
                                min="0.001"
                                value={line.requestedQty}
                                onChange={(e) => {
                                  const copy = [...modalLines];
                                  copy[idx].requestedQty = Number(e.target.value);
                                  setModalLines(copy);
                                }}
                                className="w-20 px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-center text-amber-400"
                              />
                              <select
                                value={line.selectedUnit}
                                onChange={(e) => {
                                  const copy = [...modalLines];
                                  copy[idx].selectedUnit = e.target.value;
                                  setModalLines(copy);
                                }}
                                className="px-1.5 py-1 bg-[#202330] border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-[11px] text-amber-300 outline-none"
                              >
                                {selectedItem.availableUnits.map(u => (
                                  <option key={u} value={u}>{u}</option>
                                ))}
                              </select>
                            </div>
                          </td>

                          <td className="py-2 px-3 text-right">
                            <input
                              type="text"
                              value={line.notes}
                              placeholder="ملاحظات التشغيل..."
                              onChange={(e) => {
                                const copy = [...modalLines];
                                copy[idx].notes = e.target.value;
                                setModalLines(copy);
                              }}
                              className="w-full px-2.5 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-200"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <button type="button" onClick={() => setModalLines(modalLines.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-600">
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md">🚀 إرسال طلب الشراء للمشتريات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: توزيع وتخصيص المورد لكل صنف */}
      {showConvertModal && requestToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0f1117] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-emerald-900/60 text-white flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-emerald-400">
                <ArrowRightLeft className="w-4 h-4" />
                <span>تحويل الطلب [{requestToConvert.orderNumber}] - تخصيص الموردين وتوليد أوامر التوريد</span>
              </h4>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-600 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl">
                💡 <strong>منظومة المشتريات:</strong> نظراً لأن طلب الشراء يحتوي على خامات متعددة، حدد أمام كل صنف المورد المعتمد له وسعر الوحدة، وسيقوم النظام آلياً بتفكيكها إلى أمر توريد منفصل لكل مورد ونقلها لشاشة أوامر التوريد فوراً.
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-[#0a0c10]">
                <table className="w-full text-center">
                  <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400">
                    <tr>
                      <th className="py-2.5 px-3 text-right" style={{ width: '28%' }}>الصنف المطلوب</th>
                      <th className="py-2.5 px-3 w-28">الكمية والوحدة</th>
                      <th className="py-2.5 px-3 text-right" style={{ width: '35%' }}>🏢 المورد المعتمد لهذا الصنف *</th>
                      <th className="py-2.5 px-3 w-28">سعر الوحدة (ج.م)</th>
                      <th className="py-2.5 px-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {requestToConvert.lines.map((l) => {
                      const cur = convertLinesData.find(c => c.id === l.id);
                      const suppId = cur?.supplierId || 1;
                      const price = cur?.unitPrice || 0;
                      const lineTotal = l.requestedQty * price;

                      return (
                        <tr key={l.id}>
                          <td className="py-2.5 px-3 text-right font-bold text-zinc-100">
                            {l.itemName}
                            {l.notes && <small className="block text-zinc-500">{l.notes}</small>}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{l.requestedQty} {l.selectedUnit}</td>
                          
                          <td className="py-2.5 px-3 text-right">
                            <select
                              value={suppId}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setConvertLinesData(convertLinesData.map(c => c.id === l.id ? { ...c, supplierId: val } : c));
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#171922] border border-emerald-500/50 rounded-lg font-bold text-emerald-300 text-xs"
                            >
                              {suppliersList.map(s => (
                                <option key={s.id} value={s.id}>{s.supplierName}</option>
                              ))}
                            </select>
                          </td>

                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              step="any"
                              value={price}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setConvertLinesData(convertLinesData.map(c => c.id === l.id ? { ...c, unitPrice: val } : c));
                              }}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded font-mono font-bold text-center text-zinc-100"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                            {lineTotal.toLocaleString()} ج.م
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowConvertModal(false)} className="px-4 py-2 bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl">إلغاء</button>
                <button
                  type="button"
                  onClick={handleConfirmAndNavigate}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>اعتماد وتوليد أوامر التوريد والتحويل لشاشة الموردين ➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PurchasesPage = PurchasingPage;
export const PurchaseOrdersPage = PurchasingPage;
export const PurchaseInvoicesPage = PurchasingPage;
export default PurchasingPage;


