import React, { useState, useEffect } from 'react';
import { Package, Warehouse, Users, LayoutDashboard } from 'lucide-react';
import { CustomersPage } from './modules/customers/CustomersPage';

function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'customers'>('customers');
  const [data, setData] = useState<any>({
    items: [],
    warehouses: [],
    customers: [
      { id: 1, customerName: 'سوبر ماركت الفهد (فرع المعادي)', creditLimit: 50000 },
      { id: 2, customerName: 'شركة حلواني الشام (فرع النزهة)', creditLimit: 100000 }
    ]
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', direction: 'rtl', fontFamily: 'sans-serif' }}>
      {/* شريط التنقل العلوي الموحد */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
            K
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>KayanERP</h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>منظومة إدارة الموارد الذكية</span>
          </div>
        </div>

        {/* أزرار التبديل بين الشاشات */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCurrentTab('customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: currentTab === 'customers' ? '#eef2ff' : 'transparent',
              color: currentTab === 'customers' ? '#4f46e5' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            <Users size={18} />
            <span>إدارة العملاء والائتمان</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: currentTab === 'dashboard' ? '#eef2ff' : 'transparent',
              color: currentTab === 'dashboard' ? '#4f46e5' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            <LayoutDashboard size={18} />
            <span>لوحة التحكم الرئيسية</span>
          </button>
        </nav>
      </header>

      {/* عرض الشاشة المحددة */}
      <main>
        {currentTab === 'customers' ? (
          <CustomersPage />
        ) : (
          <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>لوحة المؤشرات السريعة</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', color: '#059669' }}><Package size={28} /></div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>الأصناف المسجلة</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#0f172a' }}>{data.items?.length || 0}</h3>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '10px', color: '#d97706' }}><Warehouse size={28} /></div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>المستودعات والفروع</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#0f172a' }}>{data.warehouses?.length || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
