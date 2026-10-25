import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Phone,
  MapPin,
  UserCheck,
  Edit2
} from 'lucide-react';
import {
  fetchBranchesApi,
  saveBranchApi,
  toggleBranchStatusApi
} from './branchesApi';
import type { BranchDto } from './branchesApi';

export const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeBranch, setActiveBranch] = useState<BranchDto>({
    id: 0,
    branchCode: '',
    branchName: '',
    address: '',
    phone: '',
    managerName: '',
    isActive: true
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBranchesApi();
      setBranches(data);
    } catch (ex: any) {
      setStatusMessage(`تعذر جلب الفروع من الخادم: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) return branches;
    const term = searchTerm.toLowerCase();
    return branches.filter(b =>
      b.branchName.toLowerCase().includes(term) ||
      b.branchCode.toLowerCase().includes(term) ||
      b.address.toLowerCase().includes(term) ||
      b.managerName.toLowerCase().includes(term)
    );
  }, [branches, searchTerm]);

  const openAddModal = () => {
    const nextCode = `BR-${(branches.length + 1).toString().padStart(2, '0')}`;
    setActiveBranch({
      id: 0,
      branchCode: nextCode,
      branchName: '',
      address: '',
      phone: '',
      managerName: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: BranchDto) => {
    setActiveBranch({ ...branch });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranch.branchName.trim() || !activeBranch.branchCode.trim()) {
      setStatusMessage('⚠️ يرجى إدخال كود واسم الفرع.');
      setIsSuccess(false);
      return;
    }

    setIsSaving(true);
    try {
      await saveBranchApi(activeBranch);

      setBranches(prev => {
        if (activeBranch.id > 0) {
          return prev.map(b => (b.id === activeBranch.id ? { ...activeBranch } : b));
        }
        return [...prev, { ...activeBranch, id: Date.now() }];
      });

      setStatusMessage('✅ تم حفظ الفرع بنجاح وتثبيته في قاعدة البيانات!');
      setIsSuccess(true);
      setIsModalOpen(false);
    } catch (ex: any) {
      setStatusMessage(`❌ خطأ أثناء الاتصال بالسيرفر: ${ex.message}`);
      setIsSuccess(false);
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (branch: BranchDto) => {
    await toggleBranchStatusApi(branch);
    setBranches(prev =>
      prev.map(b => (b.id === branch.id ? { ...b, isActive: !b.isActive } : b))
    );
    setStatusMessage(`✅ تم تحديث حالة الفرع [${branch.branchName}] بنجاح.`);
    setIsSuccess(true);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-600" />
            <span>إدارة الفروع ومنافذ البيع والتوزيع (Branches & Retail Hub)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل معارض وفروع كيان ERP، العناوين، مسؤولي الفروع، وتخصيص صلاحيات التداول.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadBranches}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            <RotateCw className="w-4 h-4 text-indigo-600" />
            <span>تحديث</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة فرع جديد</span>
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

      {/* شريط البحث السريع والإحصائيات */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="ابحث باسم الفرع، الكود، المدير، أو العنوان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <div className="text-gray-500 font-bold">
          إجمالي الفروع المسجلة: <span className="font-mono font-black text-indigo-700 text-sm">{branches.length}</span> فرع
        </div>
      </div>

      {/* جدول عرض الفروع */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-bold">جاري تحميل بيانات الفروع...</div>
        ) : filteredBranches.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold">لا توجد فروع مسجلة تطابق البحث.</div>
        ) : (
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-3">كود الفرع</th>
                <th className="py-3 px-3 text-right">اسم الفرع / المنفذ</th>
                <th className="py-3 px-3 text-right">العنوان / الموقع</th>
                <th className="py-3 px-3">رقم الهاتف</th>
                <th className="py-3 px-3">المدير المسؤول</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBranches.map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{b.branchCode}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 flex items-center justify-end gap-1.5">
                    <Store className="w-4 h-4 text-indigo-500" />
                    <span>{b.branchName}</span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600 font-medium">
                    <span className="flex items-center justify-end gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{b.address || '---'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-600">
                    <span className="flex items-center justify-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{b.phone || '---'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-800">
                    <span className="flex items-center justify-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{b.managerName || '---'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {b.isActive ? 'نشط ✓' : 'معطل ✕'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(b)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(b)}
                        className={`px-2 py-1 rounded font-bold ${
                          b.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {b.isActive ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نافذة إضافة / تعديل فرع */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span>{activeBranch.id === 0 ? '➕ تسجيل فرع / منفذ بيع جديد' : `✏️ تعديل بيانات فرع: ${activeBranch.branchName}`}</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">كود الفرع *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: BR-03"
                    value={activeBranch.branchCode}
                    onChange={(e) => setActiveBranch({ ...activeBranch, branchCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم الفرع / المنفذ *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فرع دكرنس"
                    value={activeBranch.branchName}
                    onChange={(e) => setActiveBranch({ ...activeBranch, branchName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  placeholder="الشارع، المنطقة، المدينة..."
                  value={activeBranch.address}
                  onChange={(e) => setActiveBranch({ ...activeBranch, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">رقم الهاتف والتواصل</label>
                  <input
                    type="text"
                    placeholder="010XXXXXXXX"
                    value={activeBranch.phone}
                    onChange={(e) => setActiveBranch({ ...activeBranch, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">المدير أو المشرف المسؤول</label>
                  <input
                    type="text"
                    placeholder="اسم مدير الفرع"
                    value={activeBranch.managerName}
                    onChange={(e) => setActiveBranch({ ...activeBranch, managerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="branchActive"
                  checked={activeBranch.isActive}
                  onChange={(e) => setActiveBranch({ ...activeBranch, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <label htmlFor="branchActive" className="font-bold text-gray-700 select-none cursor-pointer">
                  فرع نشط ومفعل في المنظومة
                </label>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSaving ? '⏳ جاري الحفظ...' : '💾 حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
