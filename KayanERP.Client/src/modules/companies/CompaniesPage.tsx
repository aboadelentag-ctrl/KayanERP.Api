import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Phone,
  Mail,
  MapPin,
  Edit2
} from 'lucide-react';
import { fetchCompaniesApi, saveCompanyApi } from './companiesApi';
import type { CompanyDto } from './companiesApi';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentCompany, setCurrentCompany] = useState<CompanyDto>({
    id: 0,
    companyCode: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    active: true
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchCompaniesApi();
      setCompanies(data);
    } catch (ex: any) {
      setErrorMessage(`خطأ في الاتصال: ${ex.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    const term = searchTerm.toLowerCase();
    return companies.filter(c =>
      c.companyName.toLowerCase().includes(term) ||
      c.companyCode.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  }, [companies, searchTerm]);

  const resetForm = () => {
    setCurrentCompany({
      id: 0,
      companyCode: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      active: true
    });
    setIsEditMode(false);
    setErrorMessage(null);
  };

  const handleEdit = (comp: CompanyDto) => {
    setCurrentCompany({ ...comp });
    setIsEditMode(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentCompany.companyName.trim() || !currentCompany.companyCode.trim()) {
      setErrorMessage('الرجاء إدخال اسم وكود الشركة.');
      return;
    }

    setIsProcessing(true);
    try {
      await saveCompanyApi(currentCompany, isEditMode);

      setCompanies(prev => {
        if (isEditMode) {
          return prev.map(c => (c.id === currentCompany.id ? { ...currentCompany } : c));
        }
        return [{ ...currentCompany, id: Date.now() }, ...prev];
      });

      setSuccessMessage('✅ تم حفظ بيانات الشركة بنجاح!');
      resetForm();
    } catch (ex: any) {
      setErrorMessage(`خطأ: ${ex.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>إدارة الشركات والمؤسسات (Companies Master)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تعريف الكيانات والمؤسسات التابعة داخل النظام وإدارتها ككيان أساسي للمجموعات الصناعية.
          </p>
        </div>

        <button
          onClick={loadCompanies}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
        >
          <RotateCw className="w-4 h-4 text-indigo-600" />
          <span>تحديث</span>
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-600" />{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* نموذج الإضافة / التعديل */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-3.5 font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{isEditMode ? 'تعديل بيانات الشركة' : 'إضافة شركة جديدة'}</span>
              </span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-0.5 rounded"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3 bg-slate-50">
              <div>
                <label className="block text-gray-700 font-bold mb-1">كود الشركة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: COMP-01"
                  value={currentCompany.companyCode}
                  onChange={(e) => setCurrentCompany({ ...currentCompany, companyCode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم الشركة الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مجموعة مصانع وحلواني أبو عادل"
                  value={currentCompany.companyName}
                  onChange={(e) => setCurrentCompany({ ...currentCompany, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  placeholder="010XXXXXXXX"
                  value={currentCompany.phone || ''}
                  onChange={(e) => setCurrentCompany({ ...currentCompany, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="info@company.com"
                  value={currentCompany.email || ''}
                  onChange={(e) => setCurrentCompany({ ...currentCompany, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">العنوان التفصيلي</label>
                <textarea
                  rows={2}
                  placeholder="المدينة، المنطقة الصناعية..."
                  value={currentCompany.address || ''}
                  onChange={(e) => setCurrentCompany({ ...currentCompany, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCompanyActive"
                  checked={currentCompany.active}
                  onChange={(e) => setCurrentCompany({ ...currentCompany, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <label htmlFor="isCompanyActive" className="font-bold text-gray-700 select-none cursor-pointer">
                  الشركة مفعلة ونشطة بالمنظومة
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 mt-2"
              >
                {isProcessing ? '⏳ جاري الحفظ...' : isEditMode ? '💾 حفظ التعديلات' : '➕ إضافة الشركة'}
              </button>
            </form>
          </div>
        </div>

        {/* جدول العرض */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="p-3.5 bg-white border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
              <span className="font-bold text-gray-800">قائمة الشركات المسجلة ({filteredCompanies.length})</span>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث باسم الشركة، الكود، أو العنوان..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none"
                />
              </div>
            </div>

            <table className="w-full text-center">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-2.5 px-3">رقم ID</th>
                  <th className="py-2.5 px-3">الكود</th>
                  <th className="py-2.5 px-3 text-right">اسم الشركة</th>
                  <th className="py-2.5 px-3">الهاتف</th>
                  <th className="py-2.5 px-3 text-right">العنوان</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 font-bold">
                      جاري تحميل بيانات الشركات...
                    </td>
                  </tr>
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 font-bold">
                      لا توجد شركات مطابقة للبحث.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map(comp => (
                    <tr key={comp.id} className={`hover:bg-slate-50 ${comp.active ? '' : 'bg-slate-50/60 opacity-70'}`}>
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{comp.id}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{comp.companyCode}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">{comp.companyName}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">{comp.phone || '---'}</td>
                      <td className="py-2.5 px-3 text-right text-gray-600">{comp.address || '---'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${comp.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {comp.active ? 'مفعل' : 'موقوف'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => handleEdit(comp)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded flex items-center gap-1 mx-auto"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
