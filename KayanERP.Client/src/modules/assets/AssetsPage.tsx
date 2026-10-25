import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  PlusCircle,
  Search,
  CheckCircle2
} from 'lucide-react';
import { fetchAssetsApi, fetchAssetLookupsApi, saveAssetApi } from './assetsApi';
import type { AssetDto, AssetLookupsDto } from './assetsApi';

interface AssetsPageProps {
  onNavigate?: (tab: string) => void;
}

export const AssetsPage: React.FC<AssetsPageProps> = () => {
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [lookups, setLookups] = useState<AssetLookupsDto>({ departments: [], categories: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newAsset, setNewAsset] = useState<Partial<AssetDto>>({
    assetCode: `AST-00${Date.now().toString().slice(-2)}`,
    assetName: '',
    category: '',
    purchaseDate: new Date().toISOString().slice(0, 10),
    purchaseCost: 0,
    currentValue: 0,
    depreciationRate: 10,
    accumulatedDepreciation: 0,
    status: 'نشط',
    location: '',
    assignedDepartment: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assetsData, lookupsData] = await Promise.all([fetchAssetsApi(), fetchAssetLookupsApi()]);
      setAssets(assetsData);
      setLookups(lookupsData);
      if (lookupsData.categories.length > 0) {
        setNewAsset(prev => ({
          ...prev,
          category: lookupsData.categories[0],
          assignedDepartment: lookupsData.departments[0] || ''
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      const matchSearch =
        !searchTerm.trim() ||
        item.assetName.includes(searchTerm) ||
        item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.includes(searchTerm);
      const matchCategory = !selectedCategory || item.category === selectedCategory;
      const matchDepartment = !selectedDepartment || item.assignedDepartment === selectedDepartment;
      return matchSearch && matchCategory && matchDepartment;
    });
  }, [assets, searchTerm, selectedCategory, selectedDepartment]);

  const totalCost = useMemo(() => assets.reduce((sum, a) => sum + a.purchaseCost, 0), [assets]);
  const totalCurrentValue = useMemo(() => assets.reduce((sum, a) => sum + a.currentValue, 0), [assets]);
  const totalDepreciation = useMemo(() => assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0), [assets]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.assetName?.trim() || !newAsset.purchaseCost) return;

    const calcCurrentValue = Number(newAsset.purchaseCost) - Number(newAsset.accumulatedDepreciation || 0);
    const assetToSave: AssetDto = {
      id: Date.now(),
      assetCode: newAsset.assetCode || `AST-${Date.now().toString().slice(-3)}`,
      assetName: newAsset.assetName,
      category: newAsset.category || lookups.categories[0],
      purchaseDate: newAsset.purchaseDate || new Date().toISOString().slice(0, 10),
      purchaseCost: Number(newAsset.purchaseCost),
      currentValue: calcCurrentValue,
      depreciationRate: Number(newAsset.depreciationRate || 10),
      accumulatedDepreciation: Number(newAsset.accumulatedDepreciation || 0),
      status: (newAsset.status as any) || 'نشط',
      location: newAsset.location || 'المصنع الرئيسي',
      assignedDepartment: newAsset.assignedDepartment || lookups.departments[0]
    };

    await saveAssetApi(assetToSave);
    setAssets(prev => [assetToSave, ...prev]);
    setIsModalOpen(false);
    setStatusMessage(`تم قيد الأصل الرأسمالي (${assetToSave.assetName}) واحتساب معدل الإهلاك بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Boxes className="w-6 h-6 text-indigo-400" />
              <span>إدارة الأصول الرأسمالية ومعدات المصانع (Asset Management)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">حصر الآلات والإهلاك</span>
          </div>
          <p className="text-xs text-slate-400">
            متابعة خطوط الإنتاج، أفران التسوية، العجانات، الصيانة الدورية، واحتساب مجمع الإهلاك المحاسبي آلياً.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تسجيل أصل رأسمالي جديد</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي عدد الأصول والآلات</span>
          <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">{assets.length} <span className="text-xs font-normal text-gray-500">أصل</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-blue-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">التكلفة التاريخية للشراء</span>
          <h4 className="text-2xl font-black text-blue-700 font-mono mt-1">{totalCost.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-rose-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">مجمع الإهلاك التراكمي</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">{totalDepreciation.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span></h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">القيمة الدفترية الحالية للأسطول</span>
          <h4 className="text-2xl font-black text-emerald-700 font-mono mt-1">{totalCurrentValue.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span></h4>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بكود الأصل، اسم الماكينة، موقع التشغيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة التصنيفات --</option>
          {lookups.categories.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value="">-- كافة الصالات والأقسام --</option>
          {lookups.departments.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-bold">جاري تحميل سجل الأصول والآلات الصناعية...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold">لا توجد أصول مطابقة لمعايير البحث.</div>
        ) : (
          <table className="w-full text-center">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-3">كود الأصل</th>
                <th className="py-3 px-3 text-right">اسم الماكينة / المعدة</th>
                <th className="py-3 px-3">التصنيف</th>
                <th className="py-3 px-3">الصالة التابعة</th>
                <th className="py-3 px-3">تاريخ الشراء</th>
                <th className="py-3 px-3">تكلفة الشراء</th>
                <th className="py-3 px-3">مجمع الإهلاك</th>
                <th className="py-3 px-3">القيمة الدفترية</th>
                <th className="py-3 px-3">الحالة التشغيلية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{asset.assetCode}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                    {asset.assetName}
                    <div className="text-[10px] text-gray-400 font-normal">{asset.location}</div>
                  </td>
                  <td className="py-3 px-3 text-gray-600">{asset.category}</td>
                  <td className="py-3 px-3 font-medium text-gray-800">{asset.assignedDepartment}</td>
                  <td className="py-3 px-3 font-mono text-gray-500">{asset.purchaseDate}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">{asset.purchaseCost.toLocaleString()} ج.م</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-600">
                    {asset.accumulatedDepreciation.toLocaleString()} ج.م
                    <span className="text-[10px] text-gray-400 block font-normal">({asset.depreciationRate}%)</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-emerald-700">{asset.currentValue.toLocaleString()} ج.م</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        asset.status === 'نشط'
                          ? 'bg-emerald-50 text-emerald-700'
                          : asset.status === 'تحت الصيانة'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>إضافة أصل / خط إنتاج جديد</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white font-bold text-base">×</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم الماكينة / المعدة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فرن كونفكشن 10 صواني"
                    value={newAsset.assetName}
                    onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">كود الأصل</label>
                  <input
                    type="text"
                    value={newAsset.assetCode}
                    onChange={(e) => setNewAsset({ ...newAsset, assetCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">التصنيف الفني</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    {lookups.categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">القسم / الصالة المسؤولة</label>
                  <select
                    value={newAsset.assignedDepartment}
                    onChange={(e) => setNewAsset({ ...newAsset, assignedDepartment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    {lookups.departments.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">تاريخ الشراء *</label>
                  <input
                    type="date"
                    required
                    value={newAsset.purchaseDate}
                    onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">تكلفة الشراء (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newAsset.purchaseCost || ''}
                    onChange={(e) => setNewAsset({ ...newAsset, purchaseCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-center font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">نسبة الإهلاك السنوي (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newAsset.depreciationRate || 10}
                    onChange={(e) => setNewAsset({ ...newAsset, depreciationRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">مكان التواجد الفعلي</label>
                  <input
                    type="text"
                    placeholder="مثال: خط الإنتاج رقم 2"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الحالة التشغيلية</label>
                  <select
                    value={newAsset.status}
                    onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  >
                    <option value="نشط">نشط وفي الخدمة</option>
                    <option value="تحت الصيانة">تحت الصيانة الدورية</option>
                    <option value="مكهن">مكهن / خارج الخدمة</option>
                  </select>
                </div>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  💾 اعتماد الأصل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
