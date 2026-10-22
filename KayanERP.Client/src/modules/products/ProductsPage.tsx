import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchProductsApi, saveProductsToLocal } from './productsApi';
import type { Product } from './productsApi';
import { ProductModal } from './ProductModal';
import { Package, Plus, Edit3, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchProductsApi();
      setProducts(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveProduct = (prod: Product) => {
    let updated: Product[];
    if (prod.id) {
      updated = products.map((p) => (p.id === prod.id ? prod : p));
    } else {
      const newProd: Product = { ...prod, id: Date.now() };
      updated = [newProd, ...products];
    }
    setProducts(updated);
    saveProductsToLocal(updated);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الصنف من الدليل؟')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveProductsToLocal(updated);
    }
  };

  const handleImportExcel = (importedData: any[]) => {
    if (!importedData || !importedData.length) return;
    const mapped: Product[] = importedData.map((row, idx) => ({
      id: Date.now() + idx,
      code: row['كود الصنف'] || `PRD-${100 + idx}`,
      name: row['اسم الصنف'] || 'صنف مستورد',
      category: row['التصنيف'] || 'حلويات شرقية',
      unit: row['الوحدة'] || 'كيلو',
      costPrice: Number(row['سعر التكلفة']) || 0,
      wholesalePrice: Number(row['سعر الجملة']) || 0,
      retailPrice: Number(row['سعر القطاعي']) || 0,
      currentStock: Number(row['الرصيد بالمخزن']) || 0,
      minStockLevel: 5,
      status: 'active',
    }));
    const merged = [...mapped, ...products];
    setProducts(merged);
    saveProductsToLocal(merged);
    alert(`تم استيراد ${mapped.length} صنف بنجاح`);
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        key: 'code',
        header: 'كود الصنف',
        width: '110px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
            {row.code}
          </span>
        ),
      },
      {
        key: 'name',
        header: 'اسم الصنف والتصنيف',
        render: (row) => {
          const categoryColors: Record<string, string> = {
            'حلويات شرقية': 'bg-amber-50 text-amber-700 border-amber-200',
            'حلويات غربية': 'bg-purple-50 text-purple-700 border-purple-200',
            'نواشف ومخبوزات': 'bg-orange-50 text-orange-700 border-orange-200',
            'خامات ومستلزمات': 'bg-slate-50 text-slate-700 border-slate-200',
          };
          return (
            <div>
              <div className="font-semibold text-gray-900">{row.name}</div>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-medium border ${categoryColors[row.category] || 'bg-gray-50 text-gray-600'}`}>
                {row.category} ({row.unit})
              </span>
            </div>
          );
        },
      },
      {
        key: 'costPrice',
        header: 'سعر التكلفة',
        align: 'center',
        render: (row) => <span className="font-mono text-gray-500">{row.costPrice.toFixed(2)} ج.م</span>,
      },
      {
        key: 'wholesalePrice',
        header: 'سعر الجملة',
        align: 'center',
        render: (row) => <span className="font-mono font-bold text-indigo-700">{row.wholesalePrice.toFixed(2)} ج.م</span>,
      },
      {
        key: 'retailPrice',
        header: 'سعر القطاعي',
        align: 'center',
        render: (row) => <span className="font-mono font-bold text-emerald-700">{row.retailPrice.toFixed(2)} ج.م</span>,
      },
      {
        key: 'currentStock',
        header: 'الرصيد المتاح',
        align: 'center',
        render: (row) => {
          const isLow = row.currentStock <= row.minStockLevel;
          return (
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
              isLow ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isLow ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{row.currentStock} {row.unit}</span>
            </div>
          );
        },
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        align: 'center',
        width: '100px',
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => {
                setEditingProduct(row);
                setIsModalOpen(true);
              }}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
              title="تعديل الصنف"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteProduct(row.id)}
              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
              title="حذف الصنف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [products]
  );

  const filterFields: FilterField[] = [
    {
      key: 'category',
      label: 'التصنيف',
      type: 'select',
      options: [
        { label: 'حلويات شرقية', value: 'حلويات شرقية' },
        { label: 'حلويات غربية', value: 'حلويات غربية' },
        { label: 'نواشف ومخبوزات', value: 'نواشف ومخبوزات' },
        { label: 'خامات ومستلزمات', value: 'خامات ومستلزمات' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return products.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter ? item.category === categoryFilter : true;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, categoryFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" />
            <span>دليل الأصناف وقوائم الأسعار والمخزون</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة بطاقات المنتجات، أسعار الجملة والقطاعي، ومراقبة حد الطلب
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      <DataTable<Product>
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
        exportFileName="دليل_الاصناف_وقوائم_الاسعار"
        enableExport={true}
        enableImport={true}
        onImportData={handleImportExcel}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
};
