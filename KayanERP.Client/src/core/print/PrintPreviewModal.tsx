import React from 'react';
import { X, Printer } from 'lucide-react';
import { PrintDocumentTemplate } from './PrintDocumentTemplate';
import type { PrintDocumentData } from './PrintDocumentTemplate';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentData: PrintDocumentData | null;
}

export const PrintPreviewModal: React.FC<Props> = ({ isOpen, onClose, documentData }) => {
  if (!isOpen || !documentData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 print:p-0 print:bg-white" dir="rtl">
      <div className="bg-slate-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden border border-slate-300 print:border-none print:shadow-none print:max-w-none print:max-h-none print:bg-white">
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold">معاينة المستند قبل الطباعة والاعتماد</h2>
              <span className="text-[10px] text-slate-400 font-mono">{documentData.docNumber} - {documentData.type}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة فورية / حفظ PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/60 print:p-0 print:bg-white">
          <PrintDocumentTemplate data={documentData} />
        </div>
      </div>
    </div>
  );
};
