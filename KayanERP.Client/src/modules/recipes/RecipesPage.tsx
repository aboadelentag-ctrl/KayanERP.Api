import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchRecipesApi, saveRecipesToLocal } from './recipesApi';
import type { Recipe } from './recipesApi';
import { RecipeModal } from './RecipeModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import { ChefHat, Plus, Edit3, Trash2, Eye, Calculator } from 'lucide-react';

export const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchRecipesApi();
      setRecipes(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveRecipe = (item: Recipe) => {
    let updated: Recipe[];
    if (recipes.some((r) => r.id === item.id)) {
      updated = recipes.map((r) => (r.id === item.id ? item : r));
    } else {
      updated = [item, ...recipes];
    }
    setRecipes(updated);
    saveRecipesToLocal(updated);
  };

  const handleDeleteRecipe = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المعادلة التصنيعية؟')) {
      const updated = recipes.filter((r) => r.id !== id);
      setRecipes(updated);
      saveRecipesToLocal(updated);
    }
  };

  const columns = useMemo<ColumnDef<Recipe>[]>(
    () => [
      {
        key: 'code',
        header: 'كود المعادلة',
        width: '120px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md text-xs">
            {row.code}
          </span>
        ),
      },
      {
        key: 'name',
        header: 'الصنف التام والتصنيف',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{row.category} - ينتج ({row.batchYield} {row.yieldUnit})</div>
          </div>
        ),
      },
      {
        key: 'totalBatchCost',
        header: 'تكلفة الطبخة',
        align: 'center',
        render: (row) => <span className="font-mono text-gray-600">{row.totalBatchCost.toLocaleString()} ج.م</span>,
      },
      {
        key: 'costPerUnit',
        header: 'تكلفة الوحدة / الكيلو',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Calculator className="w-3.5 h-3.5" />
            <span>{row.costPerUnit} ج.م / {row.yieldUnit}</span>
          </div>
        ),
      },
      {
        key: 'ingredientsCount',
        header: 'عدد الخامات',
        align: 'center',
        render: (row) => <span className="text-xs font-semibold text-gray-700">{row.ingredients.length} خامات</span>,
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        render: (row) => (
          <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
            row.status === 'معتمدة'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {row.status}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        align: 'center',
        width: '110px',
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <PermissionGuard permission="Recipes.Manage" showDisabled>
              <button
                onClick={() => {
                  setEditingRecipe(row);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="تعديل المعادلة"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </PermissionGuard>

            <PermissionGuard permission="Recipes.Manage" showDisabled>
              <button
                onClick={() => handleDeleteRecipe(row.id)}
                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="حذف المعادلة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </PermissionGuard>
          </div>
        ),
      },
    ],
    [recipes]
  );

  const filterFields: FilterField[] = [
    {
      key: 'category',
      label: 'التصنيف الصناعي',
      type: 'select',
      options: [
        { label: 'حلويات شرقية', value: 'حلويات شرقية' },
        { label: 'حلويات غربية', value: 'حلويات غربية' },
        { label: 'نواشف ومخبوزات', value: 'نواشف ومخبوزات' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return recipes.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter ? item.category === categoryFilter : true;
      return matchSearch && matchCat;
    });
  }, [recipes, searchTerm, categoryFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-indigo-600" />
            <span>معادلات التصنيع وتكاليف الخامات (BOM Recipes)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إعداد معايير خامات الحلويات، واحتساب تكلفة الكيلو المعيارية وهادر التشغيل قبل نزول أمر المعمل
          </p>
        </div>

        <PermissionGuard permission="Recipes.Manage" showDisabled>
          <button
            type="button"
            onClick={() => {
              setEditingRecipe(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إعداد معادلة تصنيع جديدة</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<Recipe>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setCategoryFilter(f.category || '')}
        isLoading={isLoading}
        exportFileName="معادلات_تصنيع_الحلويات_BOM"
        enableExport={true}
      />

      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecipe(null);
        }}
        onSave={handleSaveRecipe}
        initialData={editingRecipe}
      />
    </div>
  );
};
