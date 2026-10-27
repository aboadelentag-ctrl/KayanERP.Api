import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  PlusCircle,
  Search,
  FileSpreadsheet,
  RotateCw,
  Eye,
  CheckCircle2,
  Trash2,
  X,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';

export interface PurchaseRequestLineDto {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  requestedQty: number;
  notes?: string;
  unitPrice?: number;
}

export interface PurchaseRequestDto {
  id: number;
  orderNumber: string;
  orderDate: string;
  requestingDepartment: string;
  requestedBy: string;
  targetWarehouseName: string;
  supplierId?: number;
  supplierName?: string;
  status: 'PENDING_PROCUREMENT' | 'CONVERTED_TO_PO' | 'PARTIALLY_RECEIVED' | 'CLOSED';
  lines: PurchaseRequestLineDto[];
}

export const PurchasesPage: React.FC = () => {
  const departmentsList = [
    'إدارة المخازن المركزية',
    'صالة تصنيع الحلويات الشرقية',
    'صالة تصنيع الحلويات الغربية والتورت',
    'صالة الكنافة والقطايف',
    'قسم النواشف والكرواسون والبتيفور',
    'إدارة الصيانة والتشغيل'
  ];

  const warehousesList = [
    'مستودع الخامات الرئيسي (WH-MAIN)',
    'ثلاجة النصف مصنع والمكسرات المركزية',
    'مستودع أدوات ومواد التعبئة والتغليف (WH-PACK)'
  ];

  const suppliersList = [
    { id: 1, supplierCode: 'SUP-01', supplierName: 'شركة مطاحن الدلتا والصعيد' },
    { id: 2, supplierCode: 'SUP-02', supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي' },
    { id: 3, supplierCode: 'SUP-03', supplierName: 'الشركة المصرية لتجارة وتكرير السكر' },
    { id: 4, supplierCode: 'SUP-04', supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف' }
  ];

  const rawMaterialsList = [
    { id: 101, itemCode: 'RAW-FLOUR-72', itemName: 'دقيق فاخر استخراج 72%', unit: 'كجم', defaultPrice: 18.5 },
    { id: 102, itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي ممتاز', unit: 'كجم', defaultPrice: 190.0 },
    { id: 103, itemCode: 'RAW-SUG-01', itemName: 'سكر مكرر ناعم فاخر تعبئة 50 كجم', unit: 'كجم', defaultPrice: 28.0 },
    { id: 104, itemCode: 'RAW-SMD-03', itemName: 'سميد بسبوسة نمرة 1 مرمل', unit: 'كجم', defaultPrice: 24.0 },
    { id: 105, itemCode: 'RAW-PST-05', itemName: 'فستق حلبي محمص نمرة 1', unit: 'كجم', defaultPrice: 750.0 },
    { id: 106, itemCode: 'PCK-BOX-09', itemName: 'كرتون صواني البسبوسة 50*50', unit: 'قطعة', defaultPrice: 4.5 },
    { id: 107, itemCode: 'PCK-TRT-26', itemName: 'علبة تورتة مقاس 26 مع قاعدة ذهبية', unit: 'قطعة', defaultPrice: 9.0 }
  ];

  const [requests, setRequests] = useState<PurchaseRequestDto[]>([
    {
      id: 1,
      orderNumber: 'PR-2026-00101',
      orderDate: '2026-10-24',
      requestingDepartment: 'إدارة المخازن المركزية',
      requestedBy: 'أمين المخزن الرئيسي',
      targetWarehouseName: 'مستودع الخامات الرئيسي (WH-MAIN)',
      status: 'PENDING_PROCUREMENT',
      lines: [
        { id: 11, itemId: 101, itemCode: 'RAW-FLOUR-72', itemName: 'دقيق فاخر استخراج 72%', unit: 'كجم', requestedQty: 5000, notes: 'رصيد الدقيق قارب على حد إعادة الطلب' },
        { id: 12, itemId: 103, itemCode: 'RAW-SUG-01', itemName: 'سكر مكرر ناعم فاخر تعبئة 50 كجم', unit: 'كجم', requestedQty: 3000, notes: 'لاستهلاك تشغيل الأسبوع القادم' }
      ]
    },
    {
      id: 2,
      orderNumber: 'PR-2026-00102',
      orderDate: '2026-10-23',
      requestingDepartment: 'صالة تصنيع الحلويات الشرقية',
      requestedBy: 'أحمد السعدي (مشرف صالة)',
      targetWarehouseName: 'مستودع الخامات الرئيسي (WH-MAIN)',
      supplierId: 2,
      supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي',
      status: 'CONVERTED_TO_PO',
      lines: [
        { id: 21, itemId: 102, itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي ممتاز', unit: 'كجم', requestedQty: 1200, unitPrice: 190, notes: 'عاجل لتشغيل طلبات عطلة نهاية الأسبوع' }
      ]
    },
    {
      id: 3,
      orderNumber: 'PR-2026-00103',
      orderDate: '2026-10-22',
      requestingDepartment: 'صالة تصنيع الحلويات الغربية والتورت',
      requestedBy: 'سامح فوزي (شيف تورت)',
      targetWarehouseName: 'ثلاجة النصف مصنع والمكسرات المركزية',
      supplierId: 1,
      supplierName: 'شركة مطاحن الدلتا والصعيد',
      status: 'PARTIALLY_RECEIVED',
      lines: [
        { id: 31, itemId: 105, itemCode: 'RAW-PST-05', itemName: 'فستق حلبي محمص نمرة 1', unit: 'كجم', requestedQty: 250, unitPrice: 750, notes: 'مكسرات لتزيين وحشو التورت' }
      ]
    },
    {
      id: 4,
      orderNumber: 'PR-2026-00104',
      orderDate: '2026-10-20',
      requestingDepartment: 'إدارة المخازن المركزية',
      requestedBy: 'فتحي حميده',
      targetWarehouseName: 'مستودع أدوات ومواد التعبئة والتغليف (WH-PACK)',
      supplierId: 4,
      supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف',
      status: 'CLOSED',
      lines: [
        { id: 41, itemId: 106, itemCode: 'PCK-BOX-09', itemName: 'كرتون صواني البسبوسة 50*50', unit: 'قطعة', requestedQty: 5000, unitPrice: 4.5, notes: 'تعبئة صواني المعارض' }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal 1: طلب شراء جديد بالكميات والملاحظات فقط
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalRequestDept, setModalRequestDept] = useState(departmentsList[0]);
  const [modalWarehouseName, setModalWarehouseName] = useState(warehousesList[0]);
  const [modalOrderDate, setModalOrderDate] = useState('2026-10-25');
  const [modalLines, setModalLines] = useState<{
    itemId: number;
    requestedQty: number;
    notes: string;
    itemSearchText: string;
    isDropdownOpen: boolean;
  }[]>([
    { itemId: 101, requestedQty: 100, notes: 'طلب تشغيل عاجل', itemSearchText: 'دقيق فاخر استخراج 72% [RAW-FLOUR-72]', isDropdownOpen: false }
  ]);
  const [createModalError, setCreateModalError] = useState<string | null>(null);

  // Modal 2: تحويل الطلب لأمر توريد
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [requestToConvert, setRequestToConvert] = useState<PurchaseRequestDto | null>(null);
  const [convertSupplierId, setConvertSupplierId] = useState<number>(1);
  const [convertLinesPricing, setConvertLinesPricing] = useState<{ id: number; unitPrice: number }[]>([]);

  // Modal 3: عرض التفاصيل
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequestDto | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (selectedStatusFilter && r.status !== selectedStatusFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.orderNumber.toLowerCase().includes(term) ||
        r.requestingDepartment.toLowerCase().includes(term) ||
        r.requestedBy.toLowerCase().includes(term) ||
        (r.supplierName && r.supplierName.toLowerCase().includes(term)) ||
        r.lines.some(l => l.itemName.toLowerCase().includes(term) || l.itemCode.toLowerCase().includes(term))
      );
    });
  }, [requests, selectedStatusFilter, searchTerm]);

  const pendingCount = useMemo(() => requests.filter(r => r.status === 'PENDING_PROCUREMENT').length, [requests]);
  const convertedCount = useMemo(() => requests.filter(r => r.status === 'CONVERTED_TO_PO').length, [requests]);
  const partiallyCount = useMemo(() => requests.filter(r => r.status === 'PARTIALLY_RECEIVED').length, [requests]);
  const closedCount = useMemo(() => requests.filter(r => r.status === 'CLOSED').length, [requests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PROCUREMENT': return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      case 'CONVERTED_TO_PO': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'PARTIALLY_RECEIVED': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      case 'CLOSED': return 'bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700';
      default: return 'bg-zinc-800 text-slate-600 dark:text-zinc-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_PROCUREMENT': return 'طلب شراء جديد (بانتظار المشتريات) ⏳';
      case 'CONVERTED_TO_PO': return 'تم التحويل لأمر توريد معتمد ✅';
      case 'PARTIALLY_RECEIVED': return 'توريد جزئي بالمستودع 🚚';
      case 'CLOSED': return 'مكتمل ومغلق 🔒';
      default: return status;
    }
  };

  const openCreateModal = () => {
    setModalRequestDept(departmentsList[0]);
    setModalWarehouseName(warehousesList[0]);
    setModalOrderDate(new Date().toISOString().slice(0, 10));
    setModalLines([
      {
        itemId: rawMaterialsList[0].id,
        requestedQty: 100,
        notes: '',
        itemSearchText: `${rawMaterialsList[0].itemName} [${rawMaterialsList[0].itemCode}]`,
        isDropdownOpen: false
      }
    ]);
    setCreateModalError(null);
    setShowCreateModal(true);
  };

  const handleAddNewLine = () => {
    const defaultItem = rawMaterialsList[0];
    setModalLines([
      ...modalLines,
      {
        itemId: defaultItem.id,
        requestedQty: 50,
        notes: '',
        itemSearchText: `${defaultItem.itemName} [${defaultItem.itemCode}]`,
        isDropdownOpen: false
      }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    setModalLines(modalLines.filter((_, i) => i !== index));
  };

  const handleSelectItem = (lineIndex: number, item: typeof rawMaterialsList[0]) => {
    const updated = [...modalLines];
    updated[lineIndex].itemId = item.id;
    updated[lineIndex].itemSearchText = `${item.itemName} [${item.itemCode}]`;
    updated[lineIndex].isDropdownOpen = false;
    setModalLines(updated);
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalLines.some(l => l.itemId > 0 && l.requestedQty > 0)) {
      setCreateModalError('يجب إضافة صنف واحد على الأقل بكمية صالحة أكبر من الصفر.');
      return;
    }

    const newRequest: PurchaseRequestDto = {
      id: Date.now(),
      orderNumber: `PR-${new Date().getFullYear()}-00${String(requests.length + 101)}`,
      orderDate: modalOrderDate,
      requestingDepartment: modalRequestDept,
      requestedBy: 'مشرف الإدارة الطالبة',
      targetWarehouseName: modalWarehouseName,
      status: 'PENDING_PROCUREMENT',
      lines: modalLines.map((l, idx) => {
        const itemInfo = rawMaterialsList.find(it => it.id === l.itemId) || rawMaterialsList[0];
        return {
          id: Date.now() + idx,
          itemId: itemInfo.id,
          itemCode: itemInfo.itemCode,
          itemName: itemInfo.itemName,
          unit: itemInfo.unit,
          requestedQty: Number(l.requestedQty),
          notes: l.notes || 'طلب تشغيل اعتيادي'
        };
      })
    };

    setRequests([newRequest, ...requests]);
    setShowCreateModal(false);
    setStatusMessage(`✅ تم إصدار طلب الشراء [${newRequest.orderNumber}] وإحالته لمدير المشتريات للتعميد والتحويل لأمر توريد.`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const openConvertModal = (req: PurchaseRequestDto) => {
    setRequestToConvert(req);
    setConvertSupplierId(suppliersList[0].id);
    setConvertLinesPricing(
      req.lines.map(l => {
        const itemInfo = rawMaterialsList.find(i => i.id === l.itemId);
        return {
          id: l.id,
          unitPrice: itemInfo?.defaultPrice || 25
        };
      })
    );
    setShowConvertModal(true);
  };

  const handleConfirmConvertToPo = () => {
    if (!requestToConvert) return;
    const supplierObj = suppliersList.find(s => s.id === convertSupplierId);

    setRequests(
      requests.map(r => {
        if (r.id !== requestToConvert.id) return r;
        return {
          ...r,
          status: 'CONVERTED_TO_PO',
          supplierId: convertSupplierId,
          supplierName: supplierObj?.supplierName || 'مورد معتمد',
          lines: r.lines.map(l => {
            const pricing = convertLinesPricing.find(p => p.id === l.id);
            return {
              ...l,
              unitPrice: pricing ? pricing.unitPrice : 20
            };
          })
        };
      })
    );

    setShowConvertModal(false);
    setStatusMessage(`✅ تم تحويل الطلب [${requestToConvert.orderNumber}] رسمياً إلى أمر توريد معتمد لدى المورد [${supplierObj?.supplierName}] وترحيله لمحطة فحص الجودة (GMP)!`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const exportRequestsToExcel = () => {
    let csv = 'رقم_الطلب,تاريخ_الطلب,الإدارة_الطالبة,المستودع_المستهدف,المورد_المعتمد,عدد_الأصناف,الحالة\n';
    filteredRequests.forEach(r => {
      csv += `"${r.orderNumber}","${r.orderDate}","${r.requestingDepartment}","${r.targetWarehouseName}","${r.supplierName || 'لم يعين بعد'}",${r.lines.length},"${getStatusLabel(r.status)}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `طلبات_وأوامر_الشراء_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الصفحة مع مسافة علوية pt-10 وثيم داكن صافي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-amber-500" />
              <span>إدارة طلبات وأوامر الشراء والتوريد (Procurement & Sourcing)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              طلبات الصالات والمخازن ⟵ اعتماد وتوريد المشتريات
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            تقديم طلبات الأصناف والكميات بالصالات والمخازن، وتحويلها من قبل مدير المشتريات إلى أوامر توريد للموردين.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportRequestsToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير (Excel)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إنشاء طلب شراء أصناف جديد</span>
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

      {/* بطاقات المؤشرات الأربعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-indigo-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">إجمالي طلبات الشراء</span>
          <h4 className="text-2xl font-black text-gray-900 dark:text-zinc-100 font-mono mt-1">{requests.length} طلب</h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">بانتظار دراسة مدير المشتريات</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">{pendingCount}</h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-emerald-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">تم تحويلها لأوامر توريد معتمدة</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">{convertedCount}</h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-cyan-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">شحنات قيد الاستلام والتوريد</span>
          <h4 className="text-2xl font-black text-cyan-500 font-mono mt-1">{partiallyCount}</h4>
        </div>
      </div>

      {/* شريط الفلاتر والبحث */}
      <div className="bg-white dark:bg-[#0c0d11] p-3 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl gap-1 flex-wrap">
          <button
            onClick={() => setSelectedStatusFilter(null)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${selectedStatusFilter === null ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
          >
            الكل ({requests.length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('PENDING_PROCUREMENT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${selectedStatusFilter === 'PENDING_PROCUREMENT' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
          >
            قيد الاعتماد بالكميات ⏳ ({pendingCount})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('CONVERTED_TO_PO')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${selectedStatusFilter === 'CONVERTED_TO_PO' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
          >
            أمر توريد معتمد ✅ ({convertedCount})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('PARTIALLY_RECEIVED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${selectedStatusFilter === 'PARTIALLY_RECEIVED' ? 'bg-cyan-600 text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
          >
            توريد جزئي 🚚 ({partiallyCount})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('CLOSED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${selectedStatusFilter === 'CLOSED' ? 'bg-zinc-700 text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
          >
            مكتمل ومغلق 🔒 ({closedCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم الطلب، الإدارة، الصنف، المورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-1.5 outline-none font-bold text-gray-800 dark:text-zinc-200"
          />
        </div>
      </div>

      {/* جدول الطلبات */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">رقم الطلب</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3 text-right">الإدارة الطالبة / المسؤول</th>
                <th className="py-3 px-3 text-right">المستودع المستهدف</th>
                <th className="py-3 px-3">عدد الأصناف</th>
                <th className="py-3 px-3 text-right">المورد المعتمد للتوريد</th>
                <th className="py-3 px-3">الحالة الرقابية</th>
                <th className="py-3 px-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-gray-400 font-bold">لا توجد طلبات شراء مطابقة لشروط البحث.</td>
                </tr>
              ) : (
                filteredRequests.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.orderNumber}</td>
                    <td className="py-3 px-3 font-mono text-gray-400">{r.orderDate}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">
                      <span>{r.requestingDepartment}</span>
                      <small className="block text-gray-400 font-normal">بطلب من: {r.requestedBy}</small>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-500 font-mono text-[11px]">{r.targetWarehouseName}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold text-[10px]">
                        {r.lines.length} أصناف
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                      {r.supplierName ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {r.supplierName}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">بانتظار تعيين مدير المشتريات</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getStatusBadge(r.status)}`}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRequest(r);
                            setShowDetailsModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded-lg font-bold text-[11px]"
                        >
                          التفاصيل
                        </button>

                        {r.status === 'PENDING_PROCUREMENT' && (
                          <button
                            onClick={() => openConvertModal(r)}
                            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-sm"
                            title="تعيين المورد والأسعار واعتماد أمر التوريد"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>تحويل لأمر توريد</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: إنشاء طلب شراء جديد (كميات وملاحظات فقط) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-amber-400">
                <ShoppingCart className="w-4 h-4" />
                <span>طلب شراء واحتياج أصناف جديد (للصالات والمخازن)</span>
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="p-5 space-y-4 overflow-y-auto flex-1">
              {createModalError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl font-bold">
                  {createModalError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">الإدارة / الصالة الطالبة *</label>
                  <select
                    value={modalRequestDept}
                    onChange={(e) => setModalRequestDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border border-amber-500/40 rounded-lg font-bold"
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">المستودع المستهدف للتسليم *</label>
                  <select
                    value={modalWarehouseName}
                    onChange={(e) => setModalWarehouseName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-bold"
                  >
                    {warehousesList.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">تاريخ الطلب</label>
                  <input
                    type="date"
                    value={modalOrderDate}
                    onChange={(e) => setModalOrderDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* جدول الأصناف والكميات والملاحظات مع القائمة المنسدلة القابلة للبحث */}
              <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-visible bg-white dark:bg-[#0c0d11]">
                <div className="p-3 bg-slate-50 dark:bg-zinc-900 border-b flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block">📋 قائمة الأصناف والكميات المطلوبة من المشتريات:</span>
                    <small className="text-gray-400">حدد الصنف والكمية مع كتابة أية ملاحظات تشغيلية</small>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewLine}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                  >
                    ➕ إضافة صنف آخر
                  </button>
                </div>

                <table className="w-full text-center">
                  <thead className="bg-slate-100 dark:bg-zinc-900/60 text-gray-600 dark:text-zinc-400 border-b">
                    <tr>
                      <th className="py-2.5 px-3 text-right" style={{ width: '45%' }}>الصنف (بحث بالاسم أو الكود) *</th>
                      <th className="py-2.5 px-3 w-32">الكمية المطلوبة</th>
                      <th className="py-2.5 px-3 text-right">ملاحظات أمام الصنف</th>
                      <th className="py-2.5 px-3 w-16">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {modalLines.map((line, idx) => {
                      const selectedItem = rawMaterialsList.find(i => i.id === line.itemId) || rawMaterialsList[0];
                      const searchResults = rawMaterialsList.filter(item =>
                        item.itemName.toLowerCase().includes(line.itemSearchText.toLowerCase()) ||
                        item.itemCode.toLowerCase().includes(line.itemSearchText.toLowerCase())
                      );

                      return (
                        <tr key={idx} className="relative">
                          <td className="py-2 px-3 text-right relative">
                            <div className="relative">
                              <input
                                type="text"
                                value={line.itemSearchText}
                                onFocus={() => {
                                  const copy = [...modalLines];
                                  copy[idx].isDropdownOpen = true;
                                  setModalLines(copy);
                                }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const copy = [...modalLines];
                                  copy[idx].itemSearchText = val;
                                  copy[idx].isDropdownOpen = true;
                                  setModalLines(copy);
                                }}
                                placeholder="اكتب للبحث باسم الصنف أو الكود..."
                                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg font-bold text-xs outline-none focus:border-amber-500"
                              />

                              {line.isDropdownOpen && (
                                <div className="absolute z-50 top-full right-0 w-full bg-white dark:bg-[#111217] border border-gray-300 dark:border-zinc-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto mt-1 text-xs">
                                  {searchResults.length === 0 ? (
                                    <div className="p-3 text-gray-400 text-center">لا توجد أصناف مطابقة للبحث</div>
                                  ) : (
                                    searchResults.map(item => (
                                      <div
                                        key={item.id}
                                        onClick={() => handleSelectItem(idx, item)}
                                        className="p-2.5 px-3 hover:bg-amber-500/10 dark:hover:bg-zinc-800 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 last:border-0"
                                      >
                                        <span className="font-bold text-gray-900 dark:text-zinc-100">{item.itemName}</span>
                                        <div className="flex gap-2">
                                          <span className="font-mono text-indigo-500 font-bold">[{item.itemCode}]</span>
                                          <span className="bg-slate-100 dark:bg-zinc-800 px-1.5 rounded text-[10px] text-gray-400">{item.unit}</span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                min={0.1}
                                step={0.5}
                                value={line.requestedQty}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  const copy = [...modalLines];
                                  copy[idx].requestedQty = val;
                                  setModalLines(copy);
                                }}
                                className="w-20 px-2 py-1 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg font-mono font-bold text-center text-amber-500"
                              />
                              <span className="text-[10px] text-gray-400">{selectedItem.unit}</span>
                            </div>
                          </td>

                          <td className="py-2 px-3 text-right">
                            <input
                              type="text"
                              value={line.notes}
                              placeholder="مثال: تشغيل صواني المناسبات، عاجل..."
                              onChange={(e) => {
                                const val = e.target.value;
                                const copy = [...modalLines];
                                copy[idx].notes = val;
                                setModalLines(copy);
                              }}
                              className="w-full px-2.5 py-1 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-sm transition-all"
                >
                  🚀 إرسال طلب الشراء للمشتريات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: تحويل الطلب لأمر توريد معتمد */}
      {showConvertModal && requestToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                <span>تحويل الطلب [{requestToConvert.orderNumber}] إلى أمر توريد معتمد</span>
              </h4>
              <button onClick={() => setShowConvertModal(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl space-y-1">
                <strong>دور مدير المشتريات:</strong> قم بتحديد المورد المعتمد الذي سيرد الشحنة وتثبيت سعر الوحدة النهائي المتفق عليه.
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800">
                <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">المورد المعتمد لهذا الأمر *</label>
                <select
                  value={convertSupplierId}
                  onChange={(e) => setConvertSupplierId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0c0d11] border border-emerald-500 rounded-xl font-bold text-xs"
                >
                  {suppliersList.map(s => (
                    <option key={s.id} value={s.id}>{s.supplierName} ({s.supplierCode})</option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-center">
                  <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                    <tr>
                      <th className="py-2 px-3 text-right">الصنف</th>
                      <th className="py-2 px-3">الكمية المطلوبة</th>
                      <th className="py-2 px-3 w-32">سعر الوحدة النهائي (ج.م)</th>
                      <th className="py-2 px-3">الإجمالي التقديري</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {requestToConvert.lines.map((l) => {
                      const currentPrice = convertLinesPricing.find(p => p.id === l.id)?.unitPrice || 0;
                      const lineTotal = l.requestedQty * currentPrice;

                      return (
                        <tr key={l.id}>
                          <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">
                            {l.itemName}
                            <small className="block text-gray-400 font-mono text-[10px]">{l.notes}</small>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold">{l.requestedQty} {l.unit}</td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.5"
                              value={currentPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setConvertLinesPricing(convertLinesPricing.map(p => p.id === l.id ? { ...p, unitPrice: val } : p));
                              }}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-900 border rounded font-mono font-bold text-center text-emerald-600"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-600">
                            {lineTotal.toLocaleString()} ج.م
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmConvertToPo}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm"
                >
                  ✅ اعتماد وتوليد أمر التوريد للمورد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: تفاصيل الطلب */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold">تفاصيل طلب الشراء: {selectedRequest.orderNumber}</h4>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border">
                <div><strong>الإدارة الطالبة:</strong> {selectedRequest.requestingDepartment}</div>
                <div><strong>التاريخ:</strong> {selectedRequest.orderDate}</div>
                <div><strong>المستودع:</strong> {selectedRequest.targetWarehouseName}</div>
                <div><strong>الحالة:</strong> {getStatusLabel(selectedRequest.status)}</div>
              </div>

              <table className="w-full text-center border bg-white dark:bg-[#0c0d11] rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                  <tr>
                    <th className="py-2 px-3 text-right">الصنف</th>
                    <th className="py-2 px-3">الكمية المطلوبة</th>
                    <th className="py-2 px-3 text-right">ملاحظات الصنف</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedRequest.lines.map(line => (
                    <tr key={line.id}>
                      <td className="py-2 px-3 text-right font-bold">{line.itemName}</td>
                      <td className="py-2 px-3 font-mono text-amber-500 font-bold">{line.requestedQty} {line.unit}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{line.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-5 py-1.5 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PurchaseOrdersPage = PurchasesPage;
export const PurchaseInvoicesPage = PurchasesPage;
export default PurchasesPage;


