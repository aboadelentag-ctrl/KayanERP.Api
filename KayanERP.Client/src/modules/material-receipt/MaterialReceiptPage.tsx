import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  Truck,
  RotateCw,
  Scale
} from 'lucide-react';

export type MaterialReceiptRecord = {
  id: number;
  receiptNumber: string;
  poNumber: string;
  supplierName: string;
  materialName: string;
  materialCode: string;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  qcStatus: 'مقبول بالكامل' | 'مقبول جزئياً' | 'مرفوض';
  inspectorName: string;
  date: string;
  notes?: string;
};

export const MaterialReceiptPage: React.FC = () => {
  const [receipts, setReceipts] = useState<MaterialReceiptRecord[]>([
    {
      id: 1,
      receiptNumber: 'REC-2026-001',
      poNumber: 'PO-9912',
      supplierName: 'شركة السكر والصناعات التكاملية',
      materialName: 'سكر أبيض ناعم 50 كجم',
      materialCode: 'RAW-SUG-01',
      deliveredQuantity: 100,
      acceptedQuantity: 100,
      rejectedQuantity: 0,
      unit: 'شيكارة',
      qcStatus: 'مقبول بالكامل',
      inspectorName: 'م. إسلام فتحي (مراقب جودة)',
      date: '2026-10-24',
      notes: 'مطابق لمواصفات النقاء ونسبة الرطوبة القياسية'
    },
    {
      id: 2,
      receiptNumber: 'REC-2026-002',
      poNumber: 'PO-9915',
      supplierName: 'المتحدة لمنتجات الألبان والزبد',
      materialName: 'زبدة طبيعي نيوزيلندي قالب 25 كجم',
      materialCode: 'RAW-BTR-02',
      deliveredQuantity: 20,
      acceptedQuantity: 18,
      rejectedQuantity: 2,
      unit: 'كرتونة',
      qcStatus: 'مقبول جزئياً',
      inspectorName: 'م. إسلام فتحي (مراقب جودة)',
      date: '2026-10-24',
      notes: 'تم رفض كرتونتين بسبب تلف العبوة وارتفاع درجة حرارة التبريد'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State
  const [supplierName, setSupplierName] = useState<string>('');
  const [materialName, setMaterialName] = useState<string>('');
  const [deliveredQuantity, setDeliveredQuantity] = useState<number>(0);
  const [acceptedQuantity, setAcceptedQuantity] = useState<number>(0);
  const [unit, setUnit] = useState<string>('شيكارة');
  const [notes, setNotes] = useState<string>('');

  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const matchSearch =
        !searchTerm.trim() ||
        r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.supplierName.includes(searchTerm) ||
        r.materialName.includes(searchTerm);
      const matchStatus = !statusFilter || r.qcStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim() || deliveredQuantity <= 0) return;

    const rejected = Math.max(0, deliveredQuantity - acceptedQuantity);
    const qcStatus: 'مقبول بالكامل' | 'مقبول جزئياً' | 'مرفوض' =
      rejected === 0 ? 'مقبول بالكامل' : acceptedQuantity > 0 ? 'مقبول جزئياً' : 'مرفوض';

    const newRecord: MaterialReceiptRecord = {
      id: Date.now(),
      receiptNumber: `REC-2026-${Date.now().toString().slice(-3)}`,
      poNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: supplierName || 'المورد المعتمد',
      materialName,
      materialCode: `RAW-${Date.now().toString().slice(-4)}`,
      deliveredQuantity: Number(deliveredQuantity),
      acceptedQuantity: Number(acceptedQuantity),
      rejectedQuantity: rejected,
      unit,
      qcStatus,
      inspectorName: 'مراقب الجودة المسؤول',
      date: new Date().toISOString().slice(0, 10),
      notes
    };

    setReceipts(prev => [newRecord, ...prev]);
    setIsModalOpen(false);
    setMaterialName('');
    setSupplierName('');
    setDeliveredQuantity(0);
    setAcceptedQuantity(0);
    setNotes('');
    setStatusMessage(`تم إثبات محضر فحص واستلام الخامات (${newRecord.receiptNumber}) بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-emerald-400" />
              <span>محطة فحص الجودة واستلام الخامات (Material Receipt & QC)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              مطابقة معايير التصنيع الغذائي GMP
            </span>
          </div>
          <p className="text-xs text-slate-400">
            فحص شحنات الخامات الموردة للمستودع المركزي، حصر العينات المرفوضة، وتوثيق أذون الإضافة المخزنية.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إصدار محضر فحص واستلام</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* البحث والفلترة */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم الإذن، المورد، اسم الخامة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة قرارات الجودة --</option>
          <option value="مقبول بالكامل">مقبول بالكامل</option>
          <option value="مقبول جزئياً">مقبول جزئياً</option>
          <option value="مرفوض">مرفوض</option>
        </select>
      </div>

      {/* جدول محاضر الاستلام */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        <table className="w-full text-center">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="py-3 px-3">رقم الإذن</th>
              <th className="py-3 px-3">أمر الشراء</th>
              <th className="py-3 px-3 text-right">المورد</th>
              <th className="py-3 px-3 text-right">الخامة الموردة</th>
              <th className="py-3 px-3">الكمية الواردة</th>
              <th className="py-3 px-3">المقبول</th>
              <th className="py-3 px-3">المرفوض</th>
              <th className="py-3 px-3">قرار فحص الجودة</th>
              <th className="py-3 px-3">المسؤول والفاحص</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredReceipts.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="py-3 px-3 font-mono font-bold text-indigo-700">{r.receiptNumber}</td>
                <td className="py-3 px-3 font-mono text-gray-500">{r.poNumber}</td>
                <td className="py-3 px-3 text-right font-bold text-gray-900">{r.supplierName}</td>
                <td className="py-3 px-3 text-right font-medium text-gray-800">
                  {r.materialName}
                  <span className="text-[10px] text-gray-400 block font-mono">{r.materialCode}</span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-gray-900">{r.deliveredQuantity} {r.unit}</td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-700">{r.acceptedQuantity} {r.unit}</td>
                <td className="py-3 px-3 font-mono font-bold text-rose-600">
                  {r.rejectedQuantity > 0 ? `${r.rejectedQuantity} ${r.unit}` : '-'}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      r.qcStatus === 'مقبول بالكامل'
                        ? 'bg-emerald-50 text-emerald-700'
                        : r.qcStatus === 'مقبول جزئياً'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {r.qcStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-600">{r.inspectorName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* نافذة محضر استلام جديد */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>إثبات محضر فحص واستلام خامات</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white">×</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم المورد *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة السكر والصناعات التكاملية"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم الخامة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سكر ناعم مكرر فاخر"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الكمية الواردة بالكامل *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={deliveredQuantity || ''}
                    onChange={(e) => setDeliveredQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-emerald-800 font-bold mb-1">الكمية المقبولة بعد الفحص *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={acceptedQuantity || ''}
                    onChange={(e) => setAcceptedQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-emerald-400 rounded-xl font-mono text-center font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">تقرير المعاينة والملاحظات الفنية</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات الجودة، الشوائب، التعبئة والتغليف..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
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
                  اعتماد الفحص والاستلام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
