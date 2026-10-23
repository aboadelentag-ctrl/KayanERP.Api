import React, { useState } from 'react';
import { Building2, UserCheck, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { BranchProvider, useBranchContext } from './core/context/BranchContext';
import { AppSidebar } from './modules/security/AppSidebar';
import { DashboardPage } from './modules/dashboard/DashboardPage';
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
import { TreasuryVouchersPage } from './modules/treasury/TreasuryVouchersPage';
import { ExpensesPayablesPage } from './modules/expenses/ExpensesPayablesPage';
import { MaterialReceiptPage } from './modules/receiving/MaterialReceiptPage';
import { InventoryDashboardPage } from './modules/inventory-dashboard/InventoryDashboardPage';
import { FinishedGoodsPage } from './modules/finished-goods/FinishedGoodsPage';
import { DepartmentsPage } from './modules/departments/DepartmentsPage';
import { CompaniesAndHRPage } from './modules/hr/CompaniesAndHRPage';
import { PurchaseOrdersQualityPage } from './modules/procurement-quality/PurchaseOrdersQualityPage';
import { FormsAndArchivePage } from './modules/forms-archive/FormsAndArchivePage';
import { UsersManagementPage } from './modules/security/UsersManagementPage';
import { PrintCenterPage } from './core/print/PrintCenterPage';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<
    | 'print-center'
    | 'security'
    | 'forms'
    | 'procurement'
    | 'hr'
    | 'departments'
    | 'finished-goods'
    | 'inventory'
    | 'receiving'
    | 'expenses'
    | 'treasury'
    | 'dashboard'
    | 'emergency'
    | 'productivity'
    | 'assets'
    | 'hierarchy'
    | 'finance'
    | 'purchasing'
    | 'journal'
    | 'accounts'
    | 'production'
    | 'materials'
    | 'recipes'
    | 'transfers'
    | 'sales'
    | 'branches'
    | 'products'
    | 'crates'
    | 'customers'
  >('print-center');

  const { user, switchRole } = useAuth();
  const { activeBranchName } = useBranchContext();

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden" dir="rtl">
      <AppSidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-slate-900 text-slate-200 px-6 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 gap-2 shrink-0 print:hidden">
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
              className="bg-slate-800 text-white border border-slate-700 text-xs rounded px-2.5 py-1 outline-none font-medium"
            >
              <option value="Admin">مدير عام (صلاحيات كاملة)</option>
              <option value="ProductionManager">مدير إنتاج ومعمل</option>
              <option value="Accountant">محاسب عام</option>
              <option value="BranchManager">مشرف فرع دكرنس</option>
              <option value="Cashier">كاشير فرع شربين</option>
            </select>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'print-center' && <PrintCenterPage />}
          {currentTab === 'security' && <UsersManagementPage />}
          {currentTab === 'forms' && <FormsAndArchivePage />}
          {currentTab === 'procurement' && <PurchaseOrdersQualityPage />}
          {currentTab === 'hr' && <CompaniesAndHRPage />}
          {currentTab === 'departments' && <DepartmentsPage />}
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
