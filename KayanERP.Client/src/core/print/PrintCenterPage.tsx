import React, { useState } from 'react';
import {
  Printer,
  Receipt,
  HandCoins,
  Truck,
  QrCode,
  FileText,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { PrintPreviewModal } from './PrintPreviewModal';
import type { PrintDocumentData } from './PrintDocumentTemplate';

export const PrintCenterPage: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<PrintDocumentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sampleDocuments: PrintDocumentData[] = [
    {
      type: 'فاتورة مبيعات ضريبية',
      docNumber: 'INV-2026-9041',
      date: '2026-10-23',
      time: '02:30 م',
      branchName: 'المعرض الرئيسي (المنصورة)',
      clientOrSupplierName: 'شركة الأندلس لتنظيم الحفلات والمؤتمرات',
      paymentMethod: 'نقدي فوري (خزينة المعرض)',
      totalAmount: 18500,
      taxAmount: 2590,
      netAmount: 21090,
      notes: 'شاملة خدمة التوصيل والتعبئة في صواني استانلس معقمة',
      items: [
        { id: 1, name: 'بسبوسة مكسرات لوكس سمن بلدي', unit: 'صينية مقاس 50', quantity: 20, price: 420, total: 8400 },
        { id: 2, name: 'كنافة أساور نوتيلا وبندق', unit: 'كيلو', quantity: 15, price: 280, total: 4200 },
        { id: 3, name: 'تورتة شوكولاتة كروكانت مقاس 26', unit: 'قطعة (تورتة)', quantity: 10, price: 380, total: 3800 },
        { id: 4, name: 'جاتوه سواريه مشكل فاخر', unit: 'دستة (12 قطعة)', quantity: 8, price: 262.5, total: 2100 },
      ],
    },
    {
      type: 'سند قبض نقدية',
      docNumber: 'VCH-REC-2026-001',
      date: '2026-10-23',
      time: '11:15 ص',
      branchName: 'خزينة المركز الرئيسي والمصنع',
      clientOrSupplierName: 'سوبر ماركت الفهد (تحصيل دفعة)',
      paymentMethod: 'نقدي (كاش في الخزينة)',
      totalAmount: 15000,
      netAmount: 15000,
      notes: 'تحصيل نقدي تحت حساب مديونية فواتير توريد الحلويات الشرقية والغربية',
    },
    {
      type: 'سند صرف نقدية',
      docNumber: 'VCH-PAY-2026-001',
      date: '2026-10-23',
      time: '12:00 م',
      branchName: 'خزينة المركز الرئيسي والمصنع',
      clientOrSupplierName: 'شركة مطاحن الدلتا والصعيد',
      paymentMethod: 'نقدي (كاش من الخزينة)',
      totalAmount: 10000,
      netAmount: 10000,
      notes: 'سداد دفعة نقدية فورية من مستحقات توريد الدقيق الفاخر للمعمل',
    },
    {
      type: 'إذن تسليم وتحويل منتج تام',
      docNumber: 'TRN-FG-2026-001',
      date: '2026-10-23',
      time: '08:00 ص',
      branchName: 'صالة تصنيع الحلويات الشرقية -> فرع دكرنس',
      clientOrSupplierName: 'مشرف فرع دكرنس (استلام بضاعة المعرض)',
      paymentMethod: 'تحويل داخلي بين الفروع',
      notes: 'تمت المعاينة ومطابقة عدد 25 صينية بحالة طازجة ممتازة',
      items: [
        { id: 1, name: 'بسبوسة مكسرات لوكس سمن بلدي', unit: 'صينية مقاس 50', quantity: 25, price: 420, total: 10500 },
      ],
    },
  ];

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen font-sans" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><QrCode className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">الفوترة الإلكترونية</span>
            <span className="text-base font-bold text-gray-900">QR Code مطابق</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Printer className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">تنسيق الطباعة</span>
            <span className="text-base font-bold font-mono text-indigo-950">A4 & Thermal 80mm</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">حالة المحرك</span>
            <span className="text-base font-bold text-emerald-700">SVG Native Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600"><FileText className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">النماذج المعتمدة</span>
            <span className="text-base font-bold text-gray-900">4 قوالب جاهزة</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Printer className="w-7 h-7 text-amber-500" />
          <span>محرك الطباعة والفواتير الرسمية (Print & Invoicing Engine)</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          إصدار ومعاينة الفواتير الضريبية وسندات الصرف والقبض وأذون الشحن بباركود التتبع ورمز الـ QR
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sampleDocuments.map((doc) => (
          <div key={doc.docNumber} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  {doc.type.includes('فاتورة') ? (
                    <Receipt className="w-5 h-5 text-emerald-600" />
                  ) : doc.type.includes('قبض') || doc.type.includes('صرف') ? (
                    <HandCoins className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Truck className="w-5 h-5 text-amber-600" />
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{doc.type}</h3>
                    <span className="text-xs font-mono text-gray-400">{doc.docNumber}</span>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {doc.date}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">الفرع / الموقع:</span>
                  <span className="font-semibold text-gray-900">{doc.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">الجهة / العميل:</span>
                  <span className="font-semibold text-gray-900">{doc.clientOrSupplierName}</span>
                </div>
                {doc.netAmount && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-gray-400">المبلغ الإجمالي:</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">
                      {doc.netAmount.toLocaleString()} ج.م
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">QR + باركود تتبع</span>
              <button
                onClick={() => {
                  setSelectedDoc(doc);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>معاينة وطباعة الوثيقة</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <PrintPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentData={selectedDoc}
      />
    </div>
  );
};
