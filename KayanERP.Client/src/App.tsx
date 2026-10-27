import React, { useState, useEffect } from 'react';
import {
  Building2,
  UserCheck,
  ShieldCheck,
  LogOut,
  Home,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { BranchProvider, useBranchContext } from './core/context/BranchContext';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { CustomersPage } from './modules/customers/CustomersPage';
import { CratesPage } from './modules/crates/CratesPage';
import { ProductsPage } from './modules/products/ProductsPage';
import { BranchesPage } from './modules/branches/BranchesPage';
import { BranchesPortalPage } from './modules/branches-portal/BranchesPortalPage';
import { CompaniesPage } from './modules/companies/CompaniesPage';
import { SalesPage } from './modules/sales/SalesPage';
import { TransfersPage } from './modules/transfers/TransfersPage';
import { RecipesPage } from './modules/recipes/RecipesPage';
import { ProductionOperationsHubPage } from './modules/production-operations/ProductionOperationsHubPage';
import { MaterialRequisitionsPage } from './modules/materials/MaterialRequisitionsPage';
import { ChartOfAccountsPage } from './modules/accounts/ChartOfAccountsPage';
import { JournalEntriesPage } from './modules/journal/JournalEntriesPage';
import { PurchasingPage } from './modules/purchasing/PurchasingPage';
import { FinancialStatementsPage } from './modules/finance/FinancialStatementsPage';
import { ItemHierarchyPage } from './modules/item-hierarchy/ItemHierarchyPage';
import { ItemCategoriesPage } from './modules/item-categories/ItemCategoriesPage';
import { DepartmentKpisPage } from './modules/department-kpis/DepartmentKpisPage';
import { DepartmentsPage } from './modules/departments/DepartmentsPage';
import { DynamicFormsPage } from './modules/dynamic-forms/DynamicFormsPage';
import { FormViewerPage } from './modules/dynamic-forms/FormViewerPage';
import { AssetsPage } from './modules/assets/AssetsPage';
import { ProductivityPage } from './modules/productivity/ProductivityPage';
import { EmergencyTasksPage } from './modules/emergency-tasks/EmergencyTasksPage';
import { EmergencyTasksReportsPage } from './modules/emergency-tasks/EmergencyTasksReportsPage';
import { EmployeesPage } from './modules/employees/EmployeesPage';
import { EmployeesManagementPage } from './modules/employees/EmployeesManagementPage';
import { TreasuryVouchersPage } from './modules/treasury/TreasuryVouchersPage';
import { ExpensesPayablesPage } from './modules/expenses/ExpensesPayablesPage';
import { FinishedGoodsPage } from './modules/finished-goods/FinishedGoodsPage';
import { FinishedGoodsCatalogPage } from './modules/finished-goods/FinishedGoodsCatalogPage';
import { MaterialReceiptPage } from './modules/material-receipt/MaterialReceiptPage';
import { InventoryDashboardPage } from './modules/inventory-dashboard/InventoryDashboardPage';
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
import { ItemsPage } from './modules/items/ItemsPage';
import type { UserLoginResult } from './modules/auth/authApi';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('workspace');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('kayan_theme') === 'dark');
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('kayan_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('kayan_theme', 'light');
      }
      return next;
    });
  };

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const { user, switchRole } = useAuth();
  const { activeBranchName } = useBranchContext();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kayan_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kayan_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLoginSuccess = (userResult: UserLoginResult) => {
    setIsAuthenticated(true);
    setCurrentTab('workspace');
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('kayan_logged_out', 'true');
    } catch (e) {}
    setIsAuthenticated(false);
    setCurrentTab('login');
  };

  const isMainWorkspace = currentTab === 'workspace';

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'workspace': return <WorkspacePage onNavigate={setCurrentTab} />;
      case 'auth-demo': return <AuthorizeDemoPage onNavigate={setCurrentTab} />;
      case 'form-viewer': return <FormViewerPage onNavigate={setCurrentTab} />;
      case 'finished-goods-catalog': return <FinishedGoodsCatalogPage onNavigate={setCurrentTab} />;
      case 'fg-transfers':
      case 'finished-goods': return <FinishedGoodsPage onNavigate={setCurrentTab} />;
      case 'employees-management': return <EmployeesManagementPage />;
      case 'employees': return <EmployeesPage />;
      case 'emergency-reports': return <EmergencyTasksReportsPage onNavigate={setCurrentTab} />;
      case 'emergency': return <EmergencyTasksPage onNavigate={setCurrentTab} />;
      case 'dynamic-forms': return <DynamicFormsPage />;
      case 'department-kpis': return <DepartmentKpisPage onNavigate={setCurrentTab} />;
      case 'departments': return <DepartmentsPage />;
      case 'companies': return <CompaniesPage />;
      case 'branches-portal': return <BranchesPortalPage onNavigate={setCurrentTab} />;
      case 'items': return <ItemsPage />;
      case 'item-categories': return <ItemCategoriesPage />;
      case 'hierarchy': return <ItemHierarchyPage />;
      case 'products': return <ItemsPage />;
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
      case 'vendor-qc': return <VendorQcRatingPage />;
      case 'warehouses': return <WarehousesPage />;
      case 'print-center': return <PrintCenterPage />;
      case 'forms': return <FormsAndArchivePage />;
      case 'procurement': return <PurchaseOrdersQualityPage />;
      case 'hr': return <CompaniesAndHRPage />;
      case 'inventory': return <InventoryDashboardPage onNavigate={setCurrentTab} />;
      case 'receiving': return <MaterialReceiptPage />;
      case 'expenses': return <ExpensesPayablesPage />;
      case 'finance': return <FinancialStatementsPage onNavigate={setCurrentTab} />;
      case 'journal': return <JournalEntriesPage />;
      case 'accounts': return <ChartOfAccountsPage />;
      case 'materials': return <MaterialRequisitionsPage />;
      case 'production': return <ProductionOperationsHubPage />;
      case 'branches': return <BranchesPage />;
      case 'customers': return <CustomersPage />;
      default: return <WorkspacePage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      {/* الترويسة العلوية الموحدة بعرض الشاشة الكامل وبدون قائمة جانبية */}
      <header className="bg-slate-900 text-slate-200 px-6 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 gap-2 shrink-0 print:hidden z-30 shadow-md">
        
        {/* الجانب الأيمن: زر الرجوع للرئيسية والفرع والمستخدم */}
        <div className="flex items-center gap-3">
          {!isMainWorkspace && (
            <button
              onClick={() => setCurrentTab('workspace')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm transition-all hover:scale-105"
              title="الرجوع إلى منصة كيان المركزية (Workspace)"
            >
              <ArrowRight className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>
          )}

          {isMainWorkspace && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <span className="font-black text-amber-400 text-sm tracking-wide">KayanERP</span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded text-[10px] font-bold">
                أبو عادل
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-slate-400">نطاق الفرع:</span>
            <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {activeBranchName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">المستخدم:</span>
            <span className="text-emerald-300 font-semibold">{user?.fullName}</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {user?.role}
            </span>
          </div>
        </div>

        {/* الجانب الأيسر: زر وضع النهار/الليل ومحاكاة الدور وتسجيل الخروج */}
        <div className="flex items-center gap-3">
          {/* زر وضع النهار والليل */}
          <button
            onClick={toggleDarkMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isDarkMode
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            title={isDarkMode ? 'التبديل إلى وضع النهار' : 'التبديل إلى وضع الليل'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>النهار</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>الليل</span>
              </>
            )}
          </button>

          {/* محاكاة الدور */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>الدور:</span>
            </span>
            <select
              value={user?.role}
              onChange={(e) => switchRole(e.target.value as any)}
              className="bg-slate-800 text-white border border-slate-700 text-xs rounded-lg px-2.5 py-1 outline-none font-medium"
            >
              <option value="Admin">مدير عام (صلاحيات كاملة)</option>
              <option value="ProductionManager">مدير إنتاج ومعمل</option>
              <option value="Accountant">محاسب عام</option>
              <option value="BranchManager">مشرف فرع دكرنس</option>
              <option value="Cashier">كاشير فرع شربين</option>
            </select>
          </div>

          {/* زر الخروج */}
          <button
            onClick={handleLogout}
            title="تسجيل الخروج والانتقال لشاشة الدخول"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* منطقة الشاشة الرئيسية بعرض 100% */}
      <main className="flex-1 overflow-y-auto">
        {renderCurrentTab()}
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






