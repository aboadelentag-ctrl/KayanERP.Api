import React, { useState, useEffect } from 'react';
import {
  fetchItemCategoriesApi,
  saveCategoriesToLocal,
  fetchUomConversionsApi,
  saveUomConversionsToLocal,
} from './itemHierarchyApi';
import type { ItemCategoryNode, UomConversionRule } from './itemHierarchyApi';
import { UomConversionModal } from './UomConversionModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  FolderTree,
  ArrowRightLeft,
  Plus,
  Trash2,
  Package,
  Layers,
  Scale
} from 'lucide-react';

export const ItemHierarchyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tree' | 'uom'>('tree');
  const [categories, setCategories] = useState<ItemCategoryNode[]>([]);
  const [uomRules, setUomRules] = useState<UomConversionRule[]>([]);
  const [isUomModalOpen, setIsUomModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [cats, uoms] = await Promise.all([
        fetchItemCategoriesApi(),
        fetchUomConversionsApi(),
      ]);
      setCategories(cats);
      setUomRules(uoms);
    };
    load();
  }, []);

  const handleSaveUomRule = (newRule: UomConversionRule) => {
    const updated = [newRule, ...uomRules];
    setUomRules(updated);
    saveUomConversionsToLocal(updated);
  };

  const handleDeleteUomRule = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف قاعدة تحويل هذه الوحدة؟')) {
      const updated = uomRules.filter((r) => r.id !== id);
      setUomRules(updated);
      saveUomConversionsToLocal(updated);
    }
  };

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-indigo-600" />
            <span>هيكل وتصنيف الأصناف ووحدات القياس (Item Hierarchy & UOM)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            الشجرة السلعية لمجموعات الحلويات والخامات، ومصفوفة تحويل الأوزان والوحدات البيعية
          </p>
        </div>

        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'tree'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الشجرة السلعية</span>
          </button>

          <button
            onClick={() => setActiveTab('uom')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'uom'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>معاملات تحويل الوحدات</span>
          </button>
        </div>
      </div>

      {activeTab === 'tree' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
              <Package className="w-4 h-4" />
              <span>إجمالي المجموعات</span>
            </div>
            <span className="text-2xl font-bold font-mono text-gray-900">{categories.length} مجموعات</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
              <Scale className="w-4 h-4" />
              <span>الخامات ومستلزمات الإنتاج</span>
            </div>
            <span className="text-2xl font-bold font-mono text-gray-900">
              {categories.filter((c) => c.type === 'خامات ومستلزمات').length} أقسام
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
              <Layers className="w-4 h-4" />
              <span>الحلويات الشرقية التامة</span>
            </div>
            <span className="text-2xl font-bold font-mono text-gray-900">
              {categories.filter((c) => c.name.includes('الشرقية') || c.type === 'منتج تام جاهز').length} خطوط
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-1">
              <Package className="w-4 h-4" />
              <span>الحلويات الغربية والتورت</span>
            </div>
            <span className="text-2xl font-bold font-mono text-gray-900">
              {categories.filter((c) => c.name.includes('الغربية')).length} أقسام
            </span>
          </div>

          <div className="md:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mt-2">
            <div className="bg-slate-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-700">
              <span>الهيكل الشجري لمجموعات الأصناف (Hierarchical Categories)</span>
              <span className="text-gray-400 font-normal">مرتب حسب المستوى والكود الشجري</span>
            </div>

            <div className="divide-y divide-gray-100">
              {categories.map((cat) => {
                const indent = (cat.level - 1) * 28;
                const isRoot = cat.level === 1;
                return (
                  <div
                    key={cat.id}
                    className={`px-6 py-3 flex items-center justify-between text-xs hover:bg-slate-50/75 transition-colors ${
                      isRoot ? 'bg-slate-50/30' : ''
                    }`}
                  >
                    <div style={{ marginRight: `${indent}px` }} className="flex items-center gap-3">
                      <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-[11px] ${
                        isRoot ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {cat.code}
                      </span>
                      <span className={`${isRoot ? 'font-bold text-sm text-gray-900' : 'font-medium text-gray-700'}`}>
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 font-mono text-[11px]">
                        يضم <b>{cat.itemCount}</b> صنفاً مسجلاً
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {cat.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'uom' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              قواعد التحويل التلقائي للأوزان عند الشراء والصرف البيعي ومعايير التشغيل في المعمل
            </p>

            <PermissionGuard permission="Products.Manage" showDisabled>
              <button
                type="button"
                onClick={() => setIsUomModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قاعدة تحويل جديدة</span>
              </button>
            </PermissionGuard>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold">
                <tr>
                  <th className="py-3 px-4">كود الصنف</th>
                  <th className="py-3 px-4">اسم الصنف</th>
                  <th className="py-3 px-4 text-center">الوحدة البديلة (الكبرى)</th>
                  <th className="py-3 px-4 text-center">معامل التحويل</th>
                  <th className="py-3 px-4 text-center">الوحدة الأساسية (المخزنية)</th>
                  <th className="py-3 px-4">معادلة التجهيز والعبوة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {uomRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{rule.itemCode}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{rule.itemName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                        1 {rule.alternateUnit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm text-indigo-700">
                      = {rule.conversionFactor}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                        {rule.baseUnit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px] font-mono">{rule.notes}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteUomRule(rule.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                        title="حذف القاعدة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UomConversionModal
        isOpen={isUomModalOpen}
        onClose={() => setIsUomModalOpen(false)}
        onSave={handleSaveUomRule}
      />
    </div>
  );
};
