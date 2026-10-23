import React, { useState } from 'react';
import {
  Package,
  Users,
  LayoutDashboard,
  Boxes,
  Warehouse,
  Receipt,
  Truck,
  ShieldCheck,
  Building2,
  UserCheck,
  ChefHat,
  Factory,
  ShoppingBag,
  BookOpen,
  Scale,
  ShoppingCart,
  PieChart,
  FolderTree,
  Wrench,
  Award,
  AlertOctagon,
  HandCoins,
  Wallet2,
  CheckSquare,
  Grid2X2,
  Cake
} from 'lucide-react';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { BranchProvider, useBranchContext } from './core/context/BranchContext';
import { CustomersPage } from './modules/customers/CustomersPage';
import { CratesPage } from './modules/crates/CratesPage';
import { ProductsPage } from './modules/products/ProductsPage';
import { BranchesPage } from './modules/branches/BranchesPage';
import { SalesPage } from './modules/sales/SalesPage';
import { TransfersPage } from './modules/transfers/TransfersPage';
import { RecipesPage } from './modules/recipes/RecipesPage';
import { ProductionHubPage } from './modules/production/ProductionHubPage';
import { MaterialRequisitionsPage } from './modules/materials/MaterialRequisitionsPage';
import { ChartOfAccountsPage } from './modules/accounts/ChartOfAccountsPage';
import { JournalEntriesPage } from './modules/journal/JournalEntriesPage';
import { PurchasingPage } from './modules/purchasing/PurchasingPage';
import { FinancialStatementsPage } from './modules/finance/FinancialStatementsPage';
import { ItemHierarchyPage } from './modules/item-hierarchy/ItemHierarchyPage';
import { AssetsPage } from './modules/assets/AssetsPage';
import { ProductivityPage } from './modules/productivity/ProductivityPage';
import { EmergencyTasksPage } from './modules/emergency-tasks/EmergencyTasksPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { TreasuryVouchersPage } from './modules/treasury/TreasuryVouchersPage';
import { ExpensesPayablesPage } from './modules/expenses/ExpensesPayablesPage';
import { MaterialReceiptPage } from './modules/receiving/MaterialReceiptPage';
import { InventoryDashboardPage } from './modules/inventory-dashboard/InventoryDashboardPage';
import { FinishedGoodsPage } from './modules/finished-goods/FinishedGoodsPage';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'finished-goods' | 'inventory' | 'receiving' | 'expenses' | 'treasury' | 'dashboard' | 'emergency' | 'productivity' | 'assets' | 'hierarchy' | 'finance' | 'purchasing' | 'journal' | 'accounts' | 'production' | 'materials' | 'recipes' | 'transfers' | 'sales' | 'branches' | 'products' | 'crates' | 'customers'>('finished-goods');
  const { user, switchRole } = useAuth();
  const { activeBranchName } = useBranchContext();

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <div className="bg-slate-900 text-slate-200 px-6 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>نطاق الفرع النشط:</span>
            <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {activeBranchName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>المستخدم الحالي:</span>
            <span className="text-emerald-300 font-semibold">{user?.fullName}</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>محاكاة الدور:</span>
          </span>
          <select
            value={user?.role}
            onChange={(e) => switchRole(e.target.value as any)}
            className="bg-slate-800 text-white border border-slate-700 text-xs rounded px-2 py-1 outline-none font-medium"
          >
            <option value="Admin">مدير عام (صلاحيات كاملة)</option>
            <option value="ProductionManager">مدير إنتاج ومعمل</option>
            <option value="Accountant">محاسب عام</option>
            <option value="BranchManager">مشرف فرع دكرنس</option>
            <option value="Cashier">كاشير فرع شربين</option>
          </select>
        </div>
      </div>

      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            K
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">KayanERP Enterprise</h2>
            <span className="text-xs text-gray-500">منظومة تصنيع الحلويات وإدارة الفروع المتكاملة</span>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => setCurrentTab('finished-goods')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'finished-goods' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Cake size={16} />
            <span>تسليم التام والكتالوج</span>
          </button>

          <button
            onClick={() => setCurrentTab('inventory')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'inventory' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid2X2 size={16} />
            <span>مؤشرات المخزون</span>
          </button>

          <button
            onClick={() => setCurrentTab('receiving')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'receiving' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckSquare size={16} />
            <span>فحص الخامات (GMP)</span>
          </button>

          <button
            onClick={() => setCurrentTab('expenses')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'expenses' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Wallet2 size={16} />
            <span>المصروفات والغاز</span>
          </button>

          <button
            onClick={() => setCurrentTab('treasury')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'treasury' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <HandCoins size={16} />
            <span>سندات الخزينة</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>لوحة القيادة العامة</span>
          </button>

          <button
            onClick={() => setCurrentTab('emergency')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'emergency' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertOctagon size={16} />
            <span>المهام الطارئة</span>
          </button>

          <button
            onClick={() => setCurrentTab('productivity')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'productivity' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Award size={16} />
            <span>إنتاجية المعمل</span>
          </button>

          <button
            onClick={() => setCurrentTab('assets')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'assets' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Wrench size={16} />
            <span>الأصول والصيانة</span>
          </button>

          <button
            onClick={() => setCurrentTab('hierarchy')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'hierarchy' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FolderTree size={16} />
            <span>شجرة الأصناف (UOM)</span>
          </button>

          <button
            onClick={() => setCurrentTab('finance')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'finance' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <PieChart size={16} />
            <span>القوائم المالية</span>
          </button>

          <button
            onClick={() => setCurrentTab('purchasing')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'purchasing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart size={16} />
            <span>المشتريات</span>
          </button>

          <button
            onClick={() => setCurrentTab('journal')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'journal' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Scale size={16} />
            <span>قيود اليومية</span>
          </button>

          <button
            onClick={() => setCurrentTab('accounts')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'accounts' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={16} />
            <span>شجرة الحسابات</span>
          </button>

          <button
            onClick={() => setCurrentTab('production')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'production' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Factory size={16} />
            <span>أوامر الإنتاج</span>
          </button>

          <button
            onClick={() => setCurrentTab('materials')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'materials' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag size={16} />
            <span>أذون الخامات</span>
          </button>

          <button
            onClick={() => setCurrentTab('recipes')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'recipes' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChefHat size={16} />
            <span>معادلات التصنيع (BOM)</span>
          </button>

          <button
            onClick={() => setCurrentTab('sales')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'sales' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Receipt size={16} />
            <span>المبيعات</span>
          </button>

          <button
            onClick={() => setCurrentTab('transfers')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'transfers' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Truck size={16} />
            <span>شحن الفروع</span>
          </button>

          <button
            onClick={() => setCurrentTab('branches')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'branches' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Warehouse size={16} />
            <span>المستودعات</span>
          </button>

          <button
            onClick={() => setCurrentTab('products')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'products' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package size={16} />
            <span>الأصناف</span>
          </button>

          <button
            onClick={() => setCurrentTab('crates')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'crates' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Boxes size={16} />
            <span>المجنسات</span>
          </button>

          <button
            onClick={() => setCurrentTab('customers')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              currentTab === 'customers' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={16} />
            <span>العملاء</span>
          </button>
        </nav>
      </header>

      <main>
        {currentTab === 'finished-goods' && <FinishedGoodsPage />}
        {currentTab === 'inventory' && <InventoryDashboardPage />}
        {currentTab === 'receiving' && <MaterialReceiptPage />}
        {currentTab === 'expenses' && <ExpensesPayablesPage />}
        {currentTab === 'treasury' && <TreasuryVouchersPage />}
        {currentTab === 'dashboard' && <DashboardPage />}
        {currentTab === 'emergency' && <EmergencyTasksPage />}
        {currentTab === 'productivity' && <ProductivityPage />}
        {currentTab === 'assets' && <AssetsPage />}
        {currentTab === 'hierarchy' && <ItemHierarchyPage />}
        {currentTab === 'finance' && <FinancialStatementsPage />}
        {currentTab === 'purchasing' && <PurchasingPage />}
        {currentTab === 'journal' && <JournalEntriesPage />}
        {currentTab === 'accounts' && <ChartOfAccountsPage />}
        {currentTab === 'materials' && <MaterialRequisitionsPage />}
        {currentTab === 'production' && <ProductionHubPage />}
        {currentTab === 'recipes' && <RecipesPage />}
        {currentTab === 'sales' && <SalesPage />}
        {currentTab === 'transfers' && <TransfersPage />}
        {currentTab === 'branches' && <BranchesPage />}
        {currentTab === 'products' && <ProductsPage />}
        {currentTab === 'crates' && <CratesPage />}
        {currentTab === 'customers' && <CustomersPage />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BranchProvider>
        <AppContent />
      </BranchProvider>
    </AuthProvider>
  );
}
