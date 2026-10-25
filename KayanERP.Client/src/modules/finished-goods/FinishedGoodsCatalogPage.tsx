import React, { useState, useMemo } from 'react';
import {
  Layers,
  PlusCircle,
  Search,
  CheckCircle2,
  Scale,
  Cake,
  Settings,
  X,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export interface ItemDto {
  id: number;
  itemCode: string;
  itemName: string;
  departmentName: string;
  basePrice: number;
  unit: string;
  barcode?: string;
  isVariant: boolean;
  isMerged: boolean;
  isContainer: boolean;
  multiUom: boolean;
  hideDetailPrint: boolean;
  active: boolean;
}

export interface ItemVariantDto {
  id: number;
  parentItemId: number;
  itemCode: string;
  itemName: string;
  price: number;
  barcode?: string;
}

export interface UomConversionDto {
  id: number;
  itemId: number;
  fromUnit: string;
  toUnit: string;
  conversionFactor: number;
  notes: string;
}

export const FinishedGoodsCatalogPage: React.FC<{ onNavigate?: (tab: string) => void }> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');

  const departmentsList = [
    'صالة تصنيع الحلويات الشرقية',
    'صالة تصنيع الحلويات الغربية والتورت',
    'صالة الكنافة والقطايف',
    'قسم النواشف والكرواسون والبتيفور'
  ];

  const [items, setItems] = useState<ItemDto[]>([
    {
      id: 1,
      itemCode: '302021',
      itemName: 'تورتة 30 * 30 فاخرة',
      departmentName: 'صالة تصنيع الحلويات الغربية والتورت',
      basePrice: 380,
      unit: 'قطعة',
      barcode: '622100101',
      isVariant: true,
      isMerged: false,
      isContainer: false,
      multiUom: true,
      hideDetailPrint: false,
      active: true
    },
    {
      id: 2,
      itemCode: '301015',
      itemName: 'بسبوسة بالسمن البلدي والمكسرات',
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      basePrice: 190,
      unit: 'كجم',
      barcode: '622100102',
      isVariant: true,
      isMerged: false,
      isContainer: false,
      multiUom: true,
      hideDetailPrint: false,
      active: true
    },
    {
      id: 3,
      itemCode: '303040',
      itemName: 'صاج مشكل شرقي فاخر',
      departmentName: 'صالة تصنيع الحلويات الشرقية',
      basePrice: 1250,
      unit: 'صاج',
      barcode: '622100103',
      isVariant: false,
      isMerged: true,
      isContainer: true,
      multiUom: false,
      hideDetailPrint: false,
      active: true
    }
  ]);

  const [allVariants, setAllVariants] = useState<ItemVariantDto[]>([
    { id: 101, parentItemId: 1, itemCode: '302021-1', itemName: 'نصفين (شيكولاتة + فواكه)', price: 390, barcode: '622100101-1' },
    { id: 102, parentItemId: 1, itemCode: '302021-2', itemName: 'شيكولاتة كيت كات ومكسرات', price: 420, barcode: '622100101-2' },
    { id: 103, parentItemId: 2, itemCode: '301015-1', itemName: 'سادة مرملة بالسمن البلدي', price: 160, barcode: '622100102-1' },
    { id: 104, parentItemId: 2, itemCode: '301015-2', itemName: 'مكسرات بندق وفستق فاخر', price: 210, barcode: '622100102-2' }
  ]);

  const [allConversions, setAllConversions] = useState<UomConversionDto[]>([
    { id: 201, itemId: 1, fromUnit: 'بلكة', toUnit: 'قطعة', conversionFactor: 48, notes: 'تعبئة صالة الجاتوه والتورت القياسية' },
    { id: 202, itemId: 2, fromUnit: 'صاج', toUnit: 'كجم', conversionFactor: 6.5, notes: 'وزن صاج البسبوسة النمطي' }
  ]);

  // Modal Workstation State
  const [showWorkstationModal, setShowWorkstationModal] = useState(false);
  const [isNewItemMode, setIsNewItemMode] = useState(false);
  const [activeTabModal, setActiveTabModal] = useState<1 | 2 | 3>(1);
  const [activeItem, setActiveItem] = useState<ItemDto>({
    id: 0,
    itemCode: '',
    itemName: '',
    departmentName: departmentsList[0],
    basePrice: 0,
    unit: 'قطعة',
    barcode: '',
    isVariant: true,
    isMerged: false,
    isContainer: false,
    multiUom: true,
    hideDetailPrint: false,
    active: true
  });

  // Variant Input Form
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantCode, setNewVariantCode] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState<number>(0);
  const [newVariantBarcode, setNewVariantBarcode] = useState('');

  // Conversion Input Form
  const [newConvToUnit, setNewConvToUnit] = useState('بلكة');
  const [newConvFactor, setNewConvFactor] = useState<number>(48);
  const [newConvNotes, setNewConvNotes] = useState('');

  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const openWorkstation = (item: ItemDto, tab: 1 | 2 | 3) => {
    setActiveItem({ ...item });
    setIsNewItemMode(false);
    setActiveTabModal(tab);
    setNewVariantName('');
    setNewVariantCode(`${item.itemCode}-${allVariants.filter(v => v.parentItemId === item.id).length + 1}`);
    setNewVariantPrice(item.basePrice);
    setNewVariantBarcode('');
    setNewConvToUnit('بلكة');
    setNewConvFactor(48);
    setNewConvNotes(`معامل تعبئة ${item.itemName}`);
    setModalMessage(null);
    setShowWorkstationModal(true);
  };

  const openNewItemModal = () => {
    setActiveItem({
      id: Date.now(),
      itemCode: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: '',
      departmentName: departmentsList[0],
      basePrice: 100,
      unit: 'قطعة',
      barcode: '',
      isVariant: true,
      isMerged: false,
      isContainer: false,
      multiUom: true,
      hideDetailPrint: false,
      active: true
    });
    setIsNewItemMode(true);
    setActiveTabModal(1);
    setModalMessage(null);
    setShowWorkstationModal(true);
  };

  const handleSaveActiveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem.itemCode || !activeItem.itemName) {
      setModalMessage('⚠️ يرجى كتابة كود واسم المنتج التام.');
      return;
    }

    if (isNewItemMode) {
      setItems([...items, activeItem]);
      setIsNewItemMode(false);
      setModalMessage('✅ تم حفظ بيانات المنتج بنجاح! يمكنك الآن إضافة النكهات ومصفوفة التعبئة.');
    } else {
      setItems(items.map(i => i.id === activeItem.id ? activeItem : i));
      setModalMessage('✅ تم تحديث بيانات المنتج بنجاح!');
    }
  };

  const handleAddVariant = () => {
    if (!newVariantName.trim()) return;
    const created: ItemVariantDto = {
      id: Date.now(),
      parentItemId: activeItem.id,
      itemCode: newVariantCode.trim() || `${activeItem.itemCode}-${allVariants.length + 1}`,
      itemName: newVariantName.trim(),
      price: newVariantPrice > 0 ? newVariantPrice : activeItem.basePrice,
      barcode: newVariantBarcode.trim()
    };
    setAllVariants([...allVariants, created]);
    setNewVariantName('');
    setNewVariantCode(`${activeItem.itemCode}-${allVariants.filter(v => v.parentItemId === activeItem.id).length + 2}`);
    setNewVariantBarcode('');
    setModalMessage('✅ تم إضافة النكهة بنجاح!');
  };

  const handleAddConversion = () => {
    if (!newConvToUnit.trim() || newConvFactor <= 0) return;
    const created: UomConversionDto = {
      id: Date.now(),
      itemId: activeItem.id,
      fromUnit: newConvToUnit.trim(),
      toUnit: activeItem.unit,
      conversionFactor: newConvFactor,
      notes: newConvNotes.trim()
    };
    setAllConversions([...allConversions, created]);
    setNewConvNotes('');
    setModalMessage('✅ تم حفظ معامل التحويل بنجاح!');
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      if (selectedDepartmentFilter && i.departmentName !== selectedDepartmentFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        i.itemName.toLowerCase().includes(term) ||
        i.itemCode.toLowerCase().includes(term) ||
        (i.barcode && i.barcode.includes(term))
      );
    });
  }, [items, selectedDepartmentFilter, searchTerm]);

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* الشريط العلوي التنفيذي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <Cake className="w-6 h-6 text-amber-500" />
              <span>كتالوج المنتجات التامة والحلويات (Finished Goods Catalog)</span>
            </h1>
            <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              إدارة الأصناف والأسعار والتكتيل
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            إدارة أصناف الحلويات، الأسعار، شجرة النكهات والتفريعات (Variants)، ومصفوفة التعبئة.
          </p>
        </div>

        <button
          onClick={openNewItemModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ إضافة منتج تام جديد</span>
        </button>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الكود أو الباركود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-2 outline-none font-bold text-gray-800 dark:text-zinc-200"
          />
        </div>

        <select
          value={selectedDepartmentFilter}
          onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-gray-700 dark:text-zinc-300"
        >
          <option value="">-- كل الصالات والأقسام الإنتاجية --</option>
          {departmentsList.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <span className="bg-indigo-50 dark:bg-zinc-900 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl font-mono font-bold">
          إجمالي المنتجات: {filteredItems.length}
        </span>
      </div>

      {/* جدول عرض المنتجات التامة */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">كود الصنف</th>
                <th className="py-3 px-3 text-right">اسم المنتج التام</th>
                <th className="py-3 px-3">القسم / الصالة</th>
                <th className="py-3 px-3">سعر البيع الأساسي</th>
                <th className="py-3 px-3">الوحدة</th>
                <th className="py-3 px-3">شجرة النكهات (Variants)</th>
                <th className="py-3 px-3">معامل التعبئة</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredItems.map(item => {
                const varCount = allVariants.filter(v => v.parentItemId === item.id).length;
                const conv = allConversions.find(c => c.itemId === item.id);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.itemCode}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">{item.itemName}</span>
                      <div className="flex gap-1 mt-0.5">
                        {item.isMerged && <span className="bg-cyan-500/10 text-cyan-600 text-[9px] px-1.5 py-0.2 rounded font-bold">مدمج</span>}
                        {item.isContainer && <span className="bg-amber-500/10 text-amber-600 text-[9px] px-1.5 py-0.2 rounded font-bold">حاوية</span>}
                        {item.multiUom && <span className="bg-slate-100 dark:bg-zinc-800 text-gray-400 text-[9px] px-1.5 py-0.2 rounded font-bold">متعدد وحدات</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-zinc-400">{item.departmentName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">{item.basePrice.toLocaleString()} ج.م</td>
                    <td className="py-3 px-3 font-bold">{item.unit}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => openWorkstation(item, 2)}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg font-bold text-[11px]"
                      >
                        🍰 {varCount > 0 ? `${varCount} نكهات / تفريعات` : '➕ إضافة نكهات'}
                      </button>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {conv ? (
                        <span className="text-gray-700 dark:text-zinc-300 font-bold">1 {conv.fromUnit} = {conv.conversionFactor} {conv.toUnit}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${item.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {item.active ? 'مفعل' : 'موقوف'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => openWorkstation(item, 1)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs"
                      >
                        ⚙️ إدارة الصنف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة بطاقة الصنف الشاملة (Item Workstation Modal) بالثيم الداكن الصافي ليلاً والأبيض نهاراً */}
      {showWorkstationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-[#0c0d11] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-zinc-800 text-xs flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-zinc-800">
              <h4 className="font-bold flex items-center gap-2 text-amber-400">
                <Settings className="w-4 h-4" />
                <span>{isNewItemMode ? '➕ إضافة منتج تام جديد' : `⚙️ بطاقة المنتج: ${activeItem.itemName} (${activeItem.itemCode})`}</span>
              </h4>
              <button onClick={() => setShowWorkstationModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* أزرار التبويبات الثلاثية داخل المودال */}
            <div className="flex bg-slate-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-5 pt-2 gap-2">
              <button
                onClick={() => setActiveTabModal(1)}
                className={`py-2 px-4 rounded-t-xl font-bold transition-all border-b-2 ${activeTabModal === 1 ? 'border-amber-500 text-amber-500 bg-white dark:bg-[#0c0d11]' : 'border-transparent text-gray-500'}`}
              >
                📋 1. البيانات الأساسية والأسعار
              </button>
              <button
                disabled={isNewItemMode}
                onClick={() => setActiveTabModal(2)}
                className={`py-2 px-4 rounded-t-xl font-bold transition-all border-b-2 ${activeTabModal === 2 ? 'border-amber-500 text-amber-500 bg-white dark:bg-[#0c0d11]' : 'border-transparent text-gray-500 disabled:opacity-40'}`}
              >
                🍰 2. شجرة النكهات والتفريعات ({allVariants.filter(v => v.parentItemId === activeItem.id).length})
              </button>
              <button
                disabled={isNewItemMode}
                onClick={() => setActiveTabModal(3)}
                className={`py-2 px-4 rounded-t-xl font-bold transition-all border-b-2 ${activeTabModal === 3 ? 'border-amber-500 text-amber-500 bg-white dark:bg-[#0c0d11]' : 'border-transparent text-gray-500 disabled:opacity-40'}`}
              >
                ⚖️ 3. مصفوفة التحويل والتعبئة (UoM)
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {modalMessage && (
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold">
                  {modalMessage}
                </div>
              )}

              {/* التبويب 1: البيانات الأساسية والأسعار */}
              {activeTabModal === 1 && (
                <form onSubmit={handleSaveActiveItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">كود الصنف الأساسي *</label>
                      <input
                        type="text"
                        required
                        value={activeItem.itemCode}
                        onChange={(e) => setActiveItem({ ...activeItem, itemCode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">اسم المنتج التام *</label>
                      <input
                        type="text"
                        required
                        value={activeItem.itemName}
                        onChange={(e) => setActiveItem({ ...activeItem, itemName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">القسم / الصالة *</label>
                      <select
                        value={activeItem.departmentName}
                        onChange={(e) => setActiveItem({ ...activeItem, departmentName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                      >
                        {departmentsList.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">سعر البيع الأساسي (ج.م) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={activeItem.basePrice}
                        onChange={(e) => setActiveItem({ ...activeItem, basePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-zinc-300 font-bold mb-1">وحدة الصنف الأساسية *</label>
                      <select
                        value={activeItem.unit}
                        onChange={(e) => setActiveItem({ ...activeItem, unit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold"
                      >
                        <option value="قطعة">قطعة</option>
                        <option value="علبة">علبة</option>
                        <option value="بلكة">بلكة</option>
                        <option value="صاج">صاج</option>
                        <option value="كجم">كجم</option>
                      </select>
                    </div>
                  </div>

                  {/* خصائص التشغيل والمطابقة */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block text-[11px]">⚙️ خصائص التشغيل والمطابقة:</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.isVariant}
                          onChange={(e) => setActiveItem({ ...activeItem, isVariant: e.target.checked })}
                          className="w-4 h-4 text-amber-500 rounded"
                        />
                        <span className="font-bold text-gray-700 dark:text-zinc-300">صنف متنوع (له نكهات)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.isMerged}
                          onChange={(e) => setActiveItem({ ...activeItem, isMerged: e.target.checked })}
                          className="w-4 h-4 text-amber-500 rounded"
                        />
                        <span className="font-bold text-gray-700 dark:text-zinc-300">مدمج (صاجات / أطباق مشكلة)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.multiUom}
                          onChange={(e) => setActiveItem({ ...activeItem, multiUom: e.target.checked })}
                          className="w-4 h-4 text-amber-500 rounded"
                        />
                        <span className="font-bold text-gray-700 dark:text-zinc-300">متعدد الوحدات (قطعة وبلكة)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.isContainer}
                          onChange={(e) => setActiveItem({ ...activeItem, isContainer: e.target.checked })}
                          className="w-4 h-4 text-amber-500 rounded"
                        />
                        <span className="font-bold text-gray-700 dark:text-zinc-300">صنف حاوية (سبت / صينية)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeItem.active}
                          onChange={(e) => setActiveItem({ ...activeItem, active: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="font-bold text-emerald-600">الصنف مفعّل وجاهز للبيع</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-sm"
                    >
                      💾 حفظ بيانات الصنف
                    </button>
                  </div>
                </form>
              )}

              {/* التبويب 2: شجرة النكهات والتفريعات */}
              {activeTabModal === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border space-y-2">
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block">➕ إضافة نكهة / تفرع جديد:</span>
                    <div>
                      <label className="block text-gray-500 text-[10px] mb-1">اسم النكهة / التفرع *</label>
                      <input
                        type="text"
                        placeholder="مثلاً: شيكولاتة، نصفين، كريمة..."
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 text-[10px] mb-1">كود التفرع الفريد</label>
                      <input
                        type="text"
                        value={newVariantCode}
                        onChange={(e) => setNewVariantCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 text-[10px] mb-1">سعر البيع للتفرع (ج.م)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newVariantPrice}
                        onChange={(e) => setNewVariantPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono font-bold text-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 text-[10px] mb-1">الباركود الخاص بالنكهة</label>
                      <input
                        type="text"
                        value={newVariantBarcode}
                        onChange={(e) => setNewVariantBarcode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      disabled={!newVariantName.trim()}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg disabled:opacity-50"
                    >
                      💾 حفظ النكهة للصنف
                    </button>
                  </div>

                  <div className="md:col-span-7">
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block mb-2">🍰 قائمة النكهات المسجلة للصنف:</span>
                    <table className="w-full text-center border bg-white dark:bg-[#0c0d11] rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                        <tr>
                          <th className="py-2 px-3">كود التفرع</th>
                          <th className="py-2 px-3 text-right">اسم النكهة</th>
                          <th className="py-2 px-3">السعر</th>
                          <th className="py-2 px-3">الباركود</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {allVariants.filter(v => v.parentItemId === activeItem.id).length === 0 ? (
                          <tr><td colSpan={4} className="py-4 text-gray-400">لم يتم تسجيل نكهات لهذا الصنف حتى الآن.</td></tr>
                        ) : (
                          allVariants.filter(v => v.parentItemId === activeItem.id).map(v => (
                            <tr key={v.id}>
                              <td className="py-2 px-3 font-mono font-bold text-gray-400">{v.itemCode}</td>
                              <td className="py-2 px-3 text-right font-bold text-indigo-600 dark:text-amber-400">{v.itemName}</td>
                              <td className="py-2 px-3 font-mono font-bold text-emerald-600">{v.price} ج.م</td>
                              <td className="py-2 px-3 font-mono text-[10px]">{v.barcode || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* التبويب 3: مصفوفة التحويل والتعبئة (UoM) */}
              {activeTabModal === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border space-y-2">
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block">⚖️ ضبط معامل تعبئة جديد:</span>
                    <div>
                      <label className="block text-gray-500 text-[10px] mb-1">الوحدة الكبرى (وحدة التعبئة) *</label>
                      <input
                        type="text"
                        placeholder="مثلاً: بلكة، صاج، كرتونة..."
                        value={newConvToUnit}
                        onChange={(e) => setNewConvToUnit(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 text-[10px] mb-1">تحتوي على عدد من ({activeItem.unit}) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0.1}
                        value={newConvFactor}
                        onChange={(e) => setNewConvFactor(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg font-mono font-bold text-center text-amber-500"
                      />
                      <small className="text-gray-400 text-[9px]">مثال: 48 (أي أن 1 بلكة = 48 قطعة)</small>
                    </div>

                    <div>
                      <label className="block text-gray-500 text-[10px] mb-1">ملاحظات التعبئة</label>
                      <input
                        type="text"
                        placeholder="مثال: تعبئة صالة الجاتوه القياسية..."
                        value={newConvNotes}
                        onChange={(e) => setNewConvNotes(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0c0d11] border rounded-lg text-[11px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddConversion}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg"
                    >
                      💾 اعتماد معامل التحويل
                    </button>
                  </div>

                  <div className="md:col-span-7">
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block mb-2">مصفوفة وحدات التعبئة المعتمدة للصنف:</span>
                    <table className="w-full text-center border bg-white dark:bg-[#0c0d11] rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                        <tr>
                          <th className="py-2 px-3 text-right">معادلة التحويل</th>
                          <th className="py-2 px-3">المعامل الرياضي</th>
                          <th className="py-2 px-3 text-right">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {allConversions.filter(c => c.itemId === activeItem.id).length === 0 ? (
                          <tr><td colSpan={3} className="py-4 text-gray-400">الصنف يتعامل حالياً بوحدته الأساسية ({activeItem.unit}) فقط.</td></tr>
                        ) : (
                          allConversions.filter(c => c.itemId === activeItem.id).map(c => (
                            <tr key={c.id}>
                              <td className="py-2 px-3 text-right font-mono font-bold text-amber-500">1 {c.fromUnit} = {c.conversionFactor} {c.toUnit}</td>
                              <td className="py-2 px-3 font-mono font-bold">{c.conversionFactor}</td>
                              <td className="py-2 px-3 text-right text-gray-400 text-[11px]">{c.notes}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
