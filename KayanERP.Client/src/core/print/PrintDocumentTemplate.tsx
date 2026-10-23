import React from 'react';
import { generateCode128Svg, generateQrSvg } from './barcodeUtils';

export interface PrintDocumentData {
  type: 'فاتورة مبيعات ضريبية' | 'سند قبض نقدية' | 'سند صرف نقدية' | 'إذن تسليم وتحويل منتج تام';
  docNumber: string;
  date: string;
  time?: string;
  branchName: string;
  clientOrSupplierName: string;
  referenceNo?: string;
  notes?: string;
  totalAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  paymentMethod?: string;
  items?: Array<{
    id: number;
    name: string;
    unit: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface Props {
  data: PrintDocumentData;
}

export const PrintDocumentTemplate: React.FC<Props> = ({ data }) => {
  const qrRawText = `SELLER:حلويات أبو عادل (كيان)|VAT:492-810-334|DOC:${data.docNumber}|DATE:${data.date}|TOTAL:${data.totalAmount || data.netAmount || 0}`;
  const qrSvg = generateQrSvg(qrRawText);
  const barcodeSvg = generateCode128Svg(data.docNumber);

  return (
    <div className="bg-white text-slate-900 p-8 max-w-4xl mx-auto border border-gray-200 rounded-2xl shadow-xs print:shadow-none print:border-none print:p-0 print:max-w-none font-sans" dir="rtl">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-sm print:border print:border-slate-900">
            K
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">حلويات أبو عادل (كيان)</h1>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">لتصنيع وتوزيع أرقى الحلويات الشرقية والغربية</p>
            <div className="text-[11px] text-slate-500 flex gap-3 font-mono mt-1">
              <span>س.ت: 108422 / الدقهلية</span>
              <span>•</span>
              <span>ب.ض: 492-810-334</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="w-20 h-20 bg-white p-1 border border-slate-200 rounded-xl"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <span className="text-[9px] font-mono text-slate-500 mt-1">منظومة الفوترة الإلكترونية</span>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">نوع المستند:</span>
            <span className="text-base font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-lg">
              {data.type}
            </span>
          </div>
          <div className="text-left font-mono text-xs">
            <span className="text-slate-500">رقم الوثيقة: </span>
            <b className="text-slate-900 font-bold text-sm">{data.docNumber}</b>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">التاريخ والوقت:</span>
            <span className="font-mono font-bold text-slate-800">{data.date} {data.time || '10:00 ص'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">الفرع / الموقع:</span>
            <span className="font-bold text-slate-800">{data.branchName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">الجهة / العميل:</span>
            <span className="font-bold text-slate-800">{data.clientOrSupplierName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">طريقة المعاملة:</span>
            <span className="font-bold text-indigo-700">{data.paymentMethod || 'نقدي (خزينة)'}</span>
          </div>
        </div>
      </div>

      {data.items && data.items.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">م</th>
                <th className="py-2.5 px-3">بيان الصنف أو الخامة</th>
                <th className="py-2.5 px-3 text-center">الوحدة</th>
                <th className="py-2.5 px-3 text-center">الكمية</th>
                <th className="py-2.5 px-3 text-center">السعر (ج.م)</th>
                <th className="py-2.5 px-3 text-center">الإجمالي (ج.م)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((it, idx) => (
                <tr key={it.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{it.name}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{it.unit}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{it.quantity}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">{it.price.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{it.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-6 mb-8 pt-2">
        <div className="w-56">
          <div className="w-full h-14" dangerouslySetInnerHTML={{ __html: barcodeSvg }} />
          <p className="text-[10px] text-slate-400 text-center mt-1">امسح الباركود للتحقق من أصل الوثيقة</p>
        </div>

        <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          {data.totalAmount !== undefined && (
            <div className="flex justify-between text-slate-600">
              <span>المجموع قبل الضريبة:</span>
              <span className="font-mono font-bold text-slate-800">{data.totalAmount.toLocaleString()} ج.م</span>
            </div>
          )}
          {data.taxAmount !== undefined && (
            <div className="flex justify-between text-slate-600">
              <span>ضريبة القيمة المضافة (14%):</span>
              <span className="font-mono font-bold text-slate-800">{data.taxAmount.toLocaleString()} ج.م</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-indigo-950 pt-2 border-t border-slate-200">
            <span>الصافي المستحق:</span>
            <span className="font-mono font-bold text-base text-emerald-700">
              {(data.netAmount || data.totalAmount || 0).toLocaleString()} ج.م
            </span>
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="text-xs text-slate-600 mb-8 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl">
          <span className="font-bold text-amber-900">ملاحظات واعتمادات: </span>
          <span>{data.notes}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-600 pt-6 border-t border-slate-200 print:mt-12">
        <div>
          <span className="font-bold block text-slate-800 mb-8">المستلم / العميل</span>
          <span className="border-b border-dashed border-slate-400 block w-32 mx-auto"></span>
        </div>
        <div>
          <span className="font-bold block text-slate-800 mb-8">أمين الخزينة / العهدة</span>
          <span className="border-b border-dashed border-slate-400 block w-32 mx-auto"></span>
        </div>
        <div>
          <span className="font-bold block text-slate-800 mb-8">المدير المالي / الاعتماد</span>
          <span className="border-b border-dashed border-slate-400 block w-32 mx-auto"></span>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
        طُبعت هذه الوثيقة آلياً بواسطة منظومة KayanERP Enterprise | فرع {data.branchName}
      </div>
    </div>
  );
};
