import React, { useState } from 'react';
import { Building2, UserCheck, ShieldCheck, LogOut } from 'lucide-react';
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
import { WarehousesPage } from './modules/warehouses/WarehousesPage';
import { VendorQcRatingPage } from './modules/vendor-qc/VendorQcRatingPage';
import { WorkspacePage } from './modules/workspace/WorkspacePage';
import { LoginPage } from './modules/auth/LoginPage';
import { FormReportsPage } from './modules/form-reports/FormReportsPage';
import { NotFoundPage } from './modules/not-found/NotFoundPage';
import { SuppliersPage } from './modules/suppliers/SuppliersPage';
import { SupplierQualityPage } from './modules/supplier-quality/SupplierQualityPage';
import { SupplierPricesPage } from './modules/supplier-prices/SupplierPricesPage';
import { StockCardPage } from './modules/stock-card/StockCardPage';
import { StockBalancesPage } from './modules/stock-balances/StockBalancesPage';
import { ReportsArchivePage } from './modules/reports-archive/ReportsArchivePage';
import { AuthorizeDemoPage } from './modules/security/AuthorizeDemoPage';
import type { UserLoginResult } from './modules/auth/authApi';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('auth-demo');

  const { user, switchRole } = useAuth();
  const { activeBranchName } = useBranchContext();

  const handleLoginSuccess = (userResult: UserLoginResult) => {
    setIsAuthenticated(true);
    setCurrentTab('workspace');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'auth-demo': return <AuthorizeDemoPage onNavigate={setCurrentTab} />;
      case 'assets': return <AssetsPage onNavigate={setCurrentTab} />;
      case 'crates': return <CratesPage onNavigate={setCurrentTab} />;
      case 'productivity': return <ProductivityPage />;
      case 'purchasing': return <PurchasingPage />;
      case 'recipes': return <RecipesPage />;
      case 'reports-archive': return <ReportsArchivePage />;
      case 'sales': return <SalesPage onNavigate={setCurrentTab} />;
      case 'stock-balances': return <StockBalancesPage onNavigate={setCurrentTab} />;
      case 'stock-card': return <StockCardPage onNavigate={setCurrentTab} />;
      case 'transfers': return <TransfersPage onNavigate={setCurrentTab} />;
      case 'supplier-prices': return <SupplierPricesPage />;
      case 'supplier-quality': return <SupplierQualityPage onNavigate={setCurrentTab} />;
      case 'suppliers': return <SuppliersPage />;
      case 'treasury': return <TreasuryVouchersPage />;
      case 'form-reports': return <FormReportsPage />;
      case 'dashboard': return <DashboardPage />;
      case 'security': return <UsersManagementPage onNavigate={setCurrentTab} />;
      case 'workspace': return <WorkspacePage onNavigate={setCurrentTab} />;
      case 'vendor-qc': return <VendorQcRatingPage />;
      case 'warehouses': return <WarehousesPage />;
      case 'print-center': return <PrintCenterPage />;
      case 'forms': return <FormsAndArchivePage />;
      case 'procurement': return <PurchaseOrdersQualityPage />;
      case 'hr': return <CompaniesAndHRPage />;
      case 'departments': return <DepartmentsPage />;
      case 'finished-goods': return <FinishedGoodsPage />;
      case 'inventory': return <InventoryDashboardPage />;
      case 'receiving': return <MaterialReceiptPage />;
      case 'expenses': return <ExpensesPayablesPage />;
      case 'emergency': return <EmergencyTasksPage />;
      case 'hierarchy': return <ItemHierarchyPage />;
      case 'finance': return <FinancialStatementsPage />;
      case 'journal': return <JournalEntriesPage />;
      case 'accounts': return <ChartOfAccountsPage />;
      case 'materials': return <MaterialRequisitionsPage />;
      case 'production': return <ProductionHubPage />;
      case 'branches': return <BranchesPage />;
      case 'products': return <ProductsPage />;
      case 'customers': return <CustomersPage />;
      default: return <NotFoundPage onNavigate={setCurrentTab} />;
    }
  };

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

          <div className="flex items-center gap-3">
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

            <button
              onClick={handleLogout}
              title="تسجيل الخروج والانتقال لشاشة الدخول"
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {renderCurrentTab()}
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
