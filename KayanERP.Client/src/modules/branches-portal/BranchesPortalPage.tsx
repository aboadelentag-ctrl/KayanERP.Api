import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. استيراد الموجه
import { useApp } from '../../context/AppContext';
import { Building2, Store, Warehouse, Plus, ArrowLeft, Trash2, X } from 'lucide-react';
import type { BranchType } from '../../types/navigation';

export const BranchesPortalPage = () => {
  const { branches, activeBranch, switchBranch, isAddBranchModalOpen, setIsAddBranchModalOpen, addBranch, deleteBranch } = useApp();
  const navigate = useNavigate(); // 2. تفعيل الموجه

  // حالات النافذة المنبثقة
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchType, setNewBranchType] = useState<BranchType>('SHOWROOM');
  const [newBranchIsProduction, setNewBranchIsProduction] = useState(false);

  const getBranchIcon = (type: string) => {
    switch (type) {
      case 'FACTORY': return <Building2 className="w-6 h-6" />;
      case 'CENTRAL_WAREHOUSE': return <Warehouse className="w-6 h-6" />;
      default: return <Store className="w-6 h-6" />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchCode) return;
    addBranch({ name: newBranchName, code: newBranchCode, type: newBranchType, isProductionHub: newBranchIsProduction });
    setNewBranchName(''); 
    setNewBranchCode('');
  };

  // 3. دالة الدخول: تغير الفرع في الذاكرة + تنقل المستخدم للوحة الرئيسية
  const handleEnterBranch = (branchId: string) => {
    switchBranch(branchId);
    navigate('/dashboard'); // قم بوضع المسار الصحيح للوحة التحكم الخاصة بك هنا
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* الترويسة وزر الإضافة */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="text-center sm:text-right">
          <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-wider mb-1">
            BRANCHES OPERATIONS
          </h1>
          <p className="text-sm font-bold text-amber-500">
            KAYAN ENTERPRISE SYSTEM V2.0
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            اضغط على أي فرع لتثبيت نطاق العمل الميداني والبدء الفوري بإصدار فواتير المبيعات والعمليات.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddBranchModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 px-5 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          إضافة فرع جديد
        </button>
      </div>

      {/* شبكة الفروع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {branches.map((branch) => {
          const isActive = activeBranch?.id === branch.id;
          
          return (
            <div
              key={branch.id}
              onClick={() => handleEnterBranch(branch.id)} /* تم ربط دالة الدخول هنا */
              className={`group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center overflow-hidden cursor-pointer
                ${isActive 
                  ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.02]' 
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-amber-500/50 hover:shadow-lg hover:-translate-y-1'
                }
              `}
            >
              {/* زر الحذف */}
              {!isActive && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteBranch(branch.id); }}
                  className="absolute top-3 left-3 p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors z-10"
                  title="حذف الفرع"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {isActive && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors
                ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] group-hover:text-amber-500'}
              `}>
                {getBranchIcon(branch.type)}
              </div>
              
              <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                {branch.name}
              </h3>
              
              <div className="text-[10px] text-[var(--text-muted)] font-mono font-bold tracking-widest uppercase mb-6 bg-[var(--bg-app)] px-2 py-1 rounded">
                ID: {branch.code}
              </div>
              
              <div className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors
                ${isActive 
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] group-hover:bg-amber-500/10 group-hover:text-amber-500'
                }
              `}>
                {isActive ? (
                  <>الدخول كـ نطاق نشط</>
                ) : (
                  <>
                    اضغط للدخول <ArrowLeft className="w-3 h-3" />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* نافذة إضافة فرع جديد */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-surface-elevated)]">
              <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" /> إضافة منشأة / فرع جديد
              </h2>
              <button onClick={() => setIsAddBranchModalOpen(false)} className="text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">اسم الفرع (عربي)</label>
                <input 
                  type="text" required value={newBranchName} onChange={e => setNewBranchName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                  placeholder="مثال: معرض المنصورة الجديد"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">كود الفرع (إنجليزي)</label>
                  <input 
                    type="text" required value={newBranchCode} onChange={e => setNewBranchCode(e.target.value)}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none uppercase transition-all"
                    placeholder="e.g. BR-MAN"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">نوع المنشأة</label>
                  <select 
                    value={newBranchType} onChange={e => setNewBranchType(e.target.value as BranchType)}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                  >
                    <option value="SHOWROOM">معرض بيع</option>
                    <option value="FACTORY">مصنع</option>
                    <option value="CENTRAL_WAREHOUSE">مخزن رئيسي</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-app)] hover:bg-[var(--bg-surface-elevated)] transition-colors">
                <input 
                  type="checkbox" checked={newBranchIsProduction} onChange={e => setNewBranchIsProduction(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-sm font-bold text-[var(--text-primary)]">يحتوي على صالة إنتاج وميزان (MES)</span>
              </label>

              <div className="pt-3 flex gap-3">
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20 active:scale-95">
                  حفظ واعتماد الفرع
                </button>
                <button type="button" onClick={() => setIsAddBranchModalOpen(false)} className="flex-1 bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-bold py-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors active:scale-95">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};