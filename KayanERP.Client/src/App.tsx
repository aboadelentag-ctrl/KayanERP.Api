import React, { useEffect, useState } from 'react';
import { getSalesLookups } from './modules/sales/salesService';
import { loginUser, isAuthenticated, logoutUser } from './modules/auth/authService';
import type { SalesLookupsResponse } from './types/sales';
import { Users, Package, Warehouse, RefreshCw, AlertCircle, LogIn, LogOut, Lock } from 'lucide-react';

function App() {
  const [authed, setAuthed] = useState<boolean>(isAuthenticated());
  const [data, setData] = useState<SalesLookupsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // حقول تسجيل الدخول
  const [companyId, setCompanyId] = useState<number>(1);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setError(null);
      await loginUser({ companyId, username, password });
      setAuthed(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل تسجيل الدخول، تأكد من صحة البيانات');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setAuthed(false);
    setData(null);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSalesLookups();
      setData(res);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleLogout();
        setError('انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول');
      } else {
        setError(err?.message || 'تعذر الاتصال بخادم KayanERP API');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) {
      fetchData();
    }
  }, [authed]);

  if (!authed) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', direction: 'rtl', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ background: '#eff6ff', display: 'inline-flex', padding: '16px', borderRadius: '50%', color: '#2563eb', marginBottom: '12px' }}>
              <Lock size={32} />
            </div>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: 'bold' }}>تسجيل الدخول للنظام</h2>
            <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '13px' }}>أدخل بيانات الحساب للوصول إلى KayanERP</p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', marginBottom: '18px', fontSize: '13px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>معرف الشركة (Company ID)</label>
            <input
              type="number"
              value={companyId}
              onChange={(e) => setCompanyId(Number(e.target.value))}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
          >
            <LogIn size={18} />
            {loginLoading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', direction: 'rtl', padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#ffffff', padding: '20px 25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: 'bold' }}>نظام كيان لإدارة الموارد (KayanERP)</h1>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '14px' }}>بوابة المبيعات والبيانات الأساسية المباشرة</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            <RefreshCw size={18} />
            {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            <LogOut size={18} />
            خروج
          </button>
        </div>
      </header>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          <p style={{ fontSize: '18px', fontWeight: '500' }}>جاري استعلام البيانات مباشرة من خادم الـ API...</p>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', marginBottom: '25px' }}>
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      )}

      {data && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', color: '#2563eb' }}><Users size={30} /></div>
              <div>
                <span style={{ color: '#64748b', fontSize: '14px' }}>إجمالي العملاء المسجلين</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '26px', color: '#0f172a' }}>{data.customers?.length || 0}</h3>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '10px', color: '#059669' }}><Package size={30} /></div>
              <div>
                <span style={{ color: '#64748b', fontSize: '14px' }}>إجمالي الأصناف النشطة</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '26px', color: '#0f172a' }}>{data.items?.length || 0}</h3>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '10px', color: '#d97706' }}><Warehouse size={30} /></div>
              <div>
                <span style={{ color: '#64748b', fontSize: '14px' }}>المستودعات والفروع</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '26px', color: '#0f172a' }}>{data.warehouses?.length || 0}</h3>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '25px' }}>
            <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', color: '#1e293b', fontSize: '18px' }}>العملاء وحدود الائتمان</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.customers && data.customers.length > 0 ? (
                  data.customers.map((c) => (
                    <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: '500', color: '#334155' }}>{c.customerName}</span>
                      <span style={{ color: '#059669', direction: 'ltr', fontWeight: 'bold' }}>{c.creditLimit?.toLocaleString()} EGP</span>
                    </li>
                  ))
                ) : (
                  <li style={{ padding: '15px 0', color: '#94a3b8' }}>لا توجد بيانات عملاء حالياً</li>
                )}
              </ul>
            </div>

            <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', color: '#1e293b', fontSize: '18px' }}>المستودعات والمخازن التابعة</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.warehouses && data.warehouses.length > 0 ? (
                  data.warehouses.map((w) => (
                    <li key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: '500', color: '#334155' }}>{w.warehouseName}</span>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{w.warehouseCode}</span>
                    </li>
                  ))
                ) : (
                  <li style={{ padding: '15px 0', color: '#94a3b8' }}>لا توجد بيانات مستودعات حالياً</li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
