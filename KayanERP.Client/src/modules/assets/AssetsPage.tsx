import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  RotateCw,
  PlusCircle,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  ArrowLeftRight,
  Printer,
  History,
  AlertOctagon,
  X,
  Building2,
  Package,
  Layers,
  Scale,
  ShieldAlert,
  Send,
  Inbox,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchFixedAssetsApi,
  fetchCirculatingInventoryApi,
  fetchCrateMovementsApi,
  saveFixedAssetApi,
  dispatchCrateApi,
  receiveCrateApi,
  settleDisputeApi,
  triggerEmergencySOSApi,
  fallbackDepartmentsList,
  fallbackEmployeesList,
} from './assetsApi';
import type {
  FixedAssetModel,
  CirculatingContainerModel,
  CrateHandoverMovementModel,
  DepartmentApiDto,
  EmployeeQuickDto,
  DispatchCrateDto,
  ReceiveCrateDto,
  SettleDisputeDto,
} from './assetsApi';

interface Props {
  initialTab?: 'fixed' | 'circulating' | 'custody';
  onNavigate?: (tab: string) => void;
}

export const AssetsPage: React.FC<Props> = ({ initialTab = 'fixed', onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'fixed' | 'circulating' | 'custody'>(initialTab);

  const [fixedAssetsList, setFixedAssetsList] = useState<FixedAssetModel[]>([]);
  const [circulatingAssetsList, setCirculatingAssetsList] = useState<CirculatingContainerModel[]>([]);
  const [crateMovementsHistory, setCrateMovementsHistory] = useState<CrateHandoverMovementModel[]>([]);
  const [dbDepartments] = useState<DepartmentApiDto[]>(fallbackDepartmentsList);
  const [employeesCatalog] = useState<EmployeeQuickDto[]>(fallbackEmployeesList);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<boolean>(true);

  // فلاتر الأصول الثابتة
  const [fixedAssetSearch, setFixedAssetSearch] = useState<string>('');
  const [fixedDeptFilter, setFixedDeptFilter] = useState<string>('');
  const [fixedCategoryFilter, setFixedCategoryFilter] = useState<string>('');
  const [fixedStatusFilter, setFixedStatusFilter] = useState<string>('');

  // فلاتر تداول الأسبات
  const [crateFilterStatus, setCrateFilterStatus] = useState<string>('');

  // فلاتر جرد الأقسام
  const [selectedCustodyDept, setSelectedCustodyDept] = useState<string>('قسم الشرقي والمخبوزات');

  // النوافذ المنبثقة للأصول
  const [isFixedAssetModalOpen, setIsFixedAssetModalOpen] = useState<boolean>(false);
  const [editingFixedAsset, setEditingFixedAsset] = useState<Partial<FixedAssetModel>>({});
  const [isMachineTransferModalOpen, setIsMachineTransferModalOpen] = useState<boolean>(false);
  const [selectedMachineToTransfer, setSelectedMachineToTransfer] = useState<FixedAssetModel | null>(null);
  const [targetTransferDept, setTargetTransferDept] = useState<string>('قسم الجاتوه والتورت والحلويات الغربية');
  const [targetTransferEmpCode, setTargetTransferEmpCode] = useState<string>('EMP-002');

  const [isDirectSOSModalOpen, setIsDirectSOSModalOpen] = useState<boolean>(false);
  const [assetForSOS, setAssetForSOS] = useState<FixedAssetModel | null>(null);
  const [directSOSTitle, setDirectSOSTitle] = useState<string>('');
  const [directSOSDescription, setDirectSOSDescription] = useState<string>('');

  const [isAssetHistoryModalOpen, setIsAssetHistoryModalOpen] = useState<boolean>(false);
  const [selectedHistoryAsset, setSelectedHistoryAsset] = useState<FixedAssetModel | null>(null);

  // النوافذ المنبثقة للأسبات
  const [isCrateDispatchModalOpen, setIsCrateDispatchModalOpen] = useState<boolean>(false);
  const [newCrateDispatch, setNewCrateDispatch] = useState<DispatchCrateDto>({
    movementType: 'DISPATCH_BRANCH',
    containerName: 'سبت بلاستيك قياسي مضلع للحلويات',
    dispatchedQuantity: 20,
    sourceLocation: 'مستودع التعبئة والتغليف والتوزيع',
    destinationLocation: 'فرع ومعرض دكرنس الرئيسي',
    notes: '',
  });

  const [isCrateReceiveModalOpen, setIsCrateReceiveModalOpen] = useState<boolean>(false);
  const [selectedMovementForReceive, setSelectedMovementForReceive] = useState<CrateHandoverMovementModel | null>(null);
  const [receiveCrateDto, setReceiveCrateDto] = useState<ReceiveCrateDto>({
    actualReceivedQuantity: 0,
    damagedCount: 0,
    receiveNotes: '',
  });

  const [isCrateSettleModalOpen, setIsCrateSettleModalOpen] = useState<boolean>(false);
  const [selectedMovementForSettle, setSelectedMovementForSettle] = useState<CrateHandoverMovementModel | null>(null);
  const [settleDisputeDto, setSettleDisputeDto] = useState<SettleDisputeDto>({
    arbitrationDecision: 'تحميل العجز على المستلم (إهمال)',
    arbitrationText: '',
    financialPenalty: 150,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assets, cratesInv, movements] = await Promise.all([
        fetchFixedAssetsApi(),
        fetchCirculatingInventoryApi(),
        fetchCrateMovementsApi(crateFilterStatus),
      ]);
      setFixedAssetsList(assets);
      setCirculatingAssetsList(cratesInv);
      setCrateMovementsHistory(movements);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [crateFilterStatus]);

  // تصفية الأصول الثابتة
  const filteredFixedAssets = useMemo(() => {
    return fixedAssetsList.filter((a) => {
      if (fixedDeptFilter && a.department !== fixedDeptFilter) return false;
      if (fixedCategoryFilter && a.category !== fixedCategoryFilter) return false;
      if (fixedStatusFilter && a.status !== fixedStatusFilter) return false;
      if (fixedAssetSearch.trim()) {
        const term = fixedAssetSearch.trim().toLowerCase();
        const matchCode = a.assetCode.toLowerCase().includes(term);
        const matchName = a.name.toLowerCase().includes(term);
        const matchCust = a.custodianName.toLowerCase().includes(term);
        const matchDept = a.department.toLowerCase().includes(term);
        if (!matchCode && !matchName && !matchCust && !matchDept) return false;
      }
      return true;
    });
  }, [fixedAssetsList, fixedDeptFilter, fixedCategoryFilter, fixedStatusFilter, fixedAssetSearch]);

  const departmentFixedAssets = useMemo(() => {
    return fixedAssetsList.filter((a) => a.department === selectedCustodyDept);
  }, [fixedAssetsList, selectedCustodyDept]);

  // فتح نوافذ الأصول
  const openNewFixedAssetModal = () => {
    setEditingFixedAsset({
      id: 0,
      assetCode: `AST-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      department: dbDepartments[0].displayName,
      category: 'أفران وتسوية',
      brandModel: '',
      serialNumber: '',
      custodianCode: employeesCatalog[0].displayCode,
      custodianName: employeesCatalog[0].displayName,
      status: 'OPERATIONAL',
    });
    setIsFixedAssetModalOpen(true);
  };

  const editFixedAsset = (asset: FixedAssetModel) => {
    setEditingFixedAsset({ ...asset });
    setIsFixedAssetModalOpen(true);
  };

  const handleSaveFixedAsset = async () => {
    if (!editingFixedAsset.name || !editingFixedAsset.assetCode) return;
    try {
      await saveFixedAssetApi(editingFixedAsset);
      setFeedbackMessage('✅ تم قيد الماكينة وتثبيت العهدة بنجاح!');
      setIsSuccessFeedback(true);
      setIsFixedAssetModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedbackMessage(`خطأ: ${err.message}`);
      setIsSuccessFeedback(false);
    }
  };

  const openTransferForSpecificMachine = (asset: FixedAssetModel) => {
    setSelectedMachineToTransfer(asset);
    const otherDept = dbDepartments.find((d) => d.displayName !== asset.department)?.displayName || dbDepartments[0].displayName;
    setTargetTransferDept(otherDept);
    setTargetTransferEmpCode(employeesCatalog[1]?.displayCode || employeesCatalog[0].displayCode);
    setIsMachineTransferModalOpen(true);
  };

  const submitMachineTransfer = async () => {
    if (!selectedMachineToTransfer) return;
    const emp = employeesCatalog.find((e) => e.displayCode === targetTransferEmpCode);
    try {
      await saveFixedAssetApi({
        ...selectedMachineToTransfer,
        department: targetTransferDept,
        custodianCode: targetTransferEmpCode,
        custodianName: emp ? emp.displayName : 'مشرف الصالة الجديدة',
        historyLogs: [
          {
            date: new Date().toISOString().slice(0, 10),
            eventType: 'نقل عهدة',
            description: `نقل من ${selectedMachineToTransfer.department} إلى ${targetTransferDept}`,
            performedByCode: user?.username || 'ADMIN',
            performedByName: user?.fullName || 'مدير المنظومة',
            costImpact: '---',
          },
          ...selectedMachineToTransfer.historyLogs,
        ],
      });

      setFeedbackMessage(`✅ تم نقل عهدة الماكينة (${selectedMachineToTransfer.name}) بنجاح إلى (${targetTransferDept})!`);
      setIsSuccessFeedback(true);
      setIsMachineTransferModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedbackMessage(`خطأ: ${err.message}`);
      setIsSuccessFeedback(false);
    }
  };

  const openDirectSOSModal = (asset: FixedAssetModel) => {
    setAssetForSOS(asset);
    setDirectSOSTitle(`عطل طارئ: ${asset.name} [${asset.assetCode}]`);
    setDirectSOSDescription(`عطل مفاجئ بماكينة صالة ${asset.department}. كود الأصل: ${asset.assetCode}.`);
    setIsDirectSOSModalOpen(true);
  };

  const submitDirectSOS = async () => {
    if (!assetForSOS) return;
    try {
      const taskNum = await triggerEmergencySOSApi(
        assetForSOS,
        directSOSTitle,
        directSOSDescription,
        user?.fullName || 'مشرف الصالة',
        user?.username || 'EMP-SOS'
      );
      setFeedbackMessage(`🚨 تم بث بلاغ الطوارئ (${taskNum}) وتحويل الماكينة إلى حالة (تحت الصيانة والإصلاح) بنجاح!`);
      setIsSuccessFeedback(true);
      setIsDirectSOSModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedbackMessage(`خطأ: ${err.message}`);
      setIsSuccessFeedback(false);
    }
  };

  const openAssetHistoryModal = (asset: FixedAssetModel) => {
    setSelectedHistoryAsset(asset);
    setIsAssetHistoryModalOpen(true);
  };

  // عمليات الأسبات والحاويات
  const submitCrateDispatch = async () => {
    if (newCrateDispatch.dispatchedQuantity <= 0) return;
    try {
      await dispatchCrateApi({
        ...newCrateDispatch,
        dispatchedByName: user?.fullName || 'رمضان عبدالعليم',
        dispatchedByCode: user?.username || 'EMP-003',
      });
      setFeedbackMessage('✅ تم إصدار إذن تسليم الأسبات بنجاح، بانتظار فحص واستلام الطرف الآخر!');
      setIsSuccessFeedback(true);
      setIsCrateDispatchModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedbackMessage(`خطأ: ${err.message}`);
      setIsSuccessFeedback(false);
    }
  };

  const openReceiveCrateModal = (m: CrateHandoverMovementModel) => {
    setSelectedMovementForReceive(m);
    setReceiveCrateDto({
      actualReceivedQuantity: m.dispatchedQuantity,
      damagedCount: 0,
      receiveNotes: '',
    });
    setIsCrateReceiveModalOpen(true);
  };

  const submitCrateReceive = async () => {
    if (!selectedMovementForReceive) return;
    try {
      await receiveCrateApi(selectedMovementForReceive.id, {
        ...receiveCrateDto,
        receivedByName: user?.fullName || 'أمين مستودع الفرع',
        receivedByCode: user?.username || 'EMP-RCV',
      });
      setFeedbackMessage('✅ تم تسجيل الاستلام وتحديث حركة الأسبات بنجاح!');
      setIsSuccessFeedback(true);
      setIsCrateReceiveModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedbackMessage(`خطأ: ${err.message}`);
      setIsSuccessFeedback(false);
    }
  };

  const openSettleDisputeModal = (m: CrateHandoverMovementModel) => {
    setSelectedMovementForSettle(m);
    setSettleDisputeDto({
      arbitrationDecision: 'تحميل العجز على المستلم (إهمال)',
      arbitrationText: `إقرار عجز (${m.shortageQuantity}) وكسر (${m.damagedCount}) واعتماد التسوية`,
      financialPenalty: (m.shortageQuantity + m.damagedCount) * 50,
    });
    setIsCrateSettleModalOpen(true);
  };

  const submitCrateSettle = async () => {
    if (!selectedMovementForSettle) return;
    try {
      await settleDisputeApi(selectedMovementForSettle.id, {
        ...settleDisputeDto,
        arbitratedByName: user?.fullName || 'اللجنة المشتركة',
        arbitratedByCode: user?.username || 'LEGAL-01',
      });
      setFeedbackMessage('✅ تم اعتماد قرار لجنة التحكيم وتسوية عهدة الأسبات بنجاح!');
      setIsSuccessFeedback(true);
      setIsCrateSettleModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedbackMessage(`خطأ: ${err.message}`);
      setIsSuccessFeedback(false);
    }
  };

  // تصدير إكسيل
  const exportAssetsToExcel = () => {
    if (!filteredFixedAssets.length) return;
    const headers = ['كود_الأصل', 'اسم_الماكينة', 'القسم', 'التصنيف', 'الماركة_والموديل', 'الرقم_التسلسلي', 'مسؤول_العهدة', 'الحالة_الفنية'];
    const rows = filteredFixedAssets.map((a) => [
      `"${a.assetCode}"`,
      `"${a.name}"`,
      `"${a.department}"`,
      `"${a.category || ''}"`,
      `"${a.brandModel || ''}"`,
      `"${a.serialNumber || ''}"`,
      `"${a.custodianName}"`,
      `"${a.status}"`,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `سجل_الأصول_والماكينات_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportCrateMovementsToExcel = () => {
    if (!crateMovementsHistory.length) return;
    const headers = ['رقم_الإذن', 'التاريخ', 'نوع_الحركة', 'نوع_الحاوية', 'المنصرف', 'المصدر', 'المُسلِّم', 'المستقبل', 'المستلم', 'الكمية_المستلمة', 'العجز', 'الكسر', 'الحالة'];
    const rows = crateMovementsHistory.map((m) => [
      `"${m.movementNumber}"`,
      `"${m.createdAt}"`,
      `"${m.movementType}"`,
      `"${m.containerName}"`,
      m.dispatchedQuantity,
      `"${m.sourceLocation}"`,
      `"${m.dispatchedByName}"`,
      `"${m.destinationLocation}"`,
      `"${m.receivedByName || ''}"`,
      m.receivedQuantity,
      m.shortageQuantity,
      m.damagedCount,
      `"${m.status}"`,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `سجل_تداول_الأسبات_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. Header التنفيذي */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-indigo-400" />
              <span>🏭 حوكمة الأصول والماكينات ورقابة دورة استلام وتسليم الأسبات</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black">
              نظام الفصل المؤسسي والرقابة الميدانية
            </span>
          </div>
          <p className="text-xs text-slate-400">
            فصل كامل بين نقل عهدة الماكينات الرأسمالية (كمية = 1) ودورة تداول الأسبات والصواني المجمعة مع محاضر فض النزاعات.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'fixed' && (
            <>
              <button
                onClick={openNewFixedAssetModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>قيد أصل / ماكينة جديدة</span>
              </button>

              <button
                onClick={() => {
                  if (fixedAssetsList.length > 0) openTransferForSpecificMachine(fixedAssetsList[0]);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>نقل عهدة ماكينة رأسمالية</span>
              </button>

              <button
                onClick={exportAssetsToExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>تصدير إكسيل</span>
              </button>
            </>
          )}

          {activeTab === 'circulating' && (
            <>
              <button
                onClick={() => setIsCrateDispatchModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>إصدار إذن تسليم وصرف أسبات وأوعية</span>
              </button>

              <button
                onClick={exportCrateMovementsToExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>تصدير سجل الحركات</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. رسائل التنبيه */}
      {feedbackMessage && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
          isSuccessFeedback ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage('')} className="font-bold text-gray-500 hover:text-gray-800">×</button>
        </div>
      )}

      {/* 3. شريط التبويبات */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('fixed')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'fixed'
              ? 'border-amber-500 text-gray-900 bg-white rounded-t-xl'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-500" />
          <span>🏭 سجل الأصول والماكينات الرأسمالية ({fixedAssetsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('circulating')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'circulating'
              ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl'
              : 'border-transparent text-gray-500 hover:text-indigo-600'
          }`}
        >
          <Boxes className="w-4 h-4 text-indigo-600" />
          <span>🧺 رقابة دورة استلام وتسليم الأسبات والأوعية ({crateMovementsHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('custody')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'custody'
              ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
              : 'border-transparent text-gray-500 hover:text-emerald-600'
          }`}
        >
          <Printer className="w-4 h-4 text-emerald-600" />
          <span>📑 بطاقة جرد وعهدة الأقسام والصالات</span>
        </button>
      </div>

      {/* 4. تبويب 1: سجل الأصول والماكينات */}
      {activeTab === 'fixed' && (
        <div className="space-y-6">
          {/* كروت الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-t-4 border-t-emerald-500 text-center shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">ماكينات تعمل بكفاءة تامة</span>
              <h4 className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {fixedAssetsList.filter((a) => a.status === 'OPERATIONAL').length} أصل
              </h4>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-t-4 border-t-amber-500 text-center shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">تحت الصيانة والإصلاح (SOS)</span>
              <h4 className="text-2xl font-black font-mono text-amber-600 mt-1">
                {fixedAssetsList.filter((a) => a.status === 'UNDER_MAINTENANCE').length} أصل
              </h4>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-t-4 border-t-rose-500 text-center shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">متوقفة / عطل حرج في الصالة</span>
              <h4 className="text-2xl font-black font-mono text-rose-600 mt-1">
                {fixedAssetsList.filter((a) => a.status === 'OUT_OF_SERVICE').length} أصل
              </h4>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-t-4 border-t-slate-800 text-center shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">إجمالي الأصول والماكينات</span>
              <h4 className="text-2xl font-black font-mono text-gray-900 mt-1">
                {fixedAssetsList.length} أصل
              </h4>
            </div>
          </div>

          {/* فلاتر البحث */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4">
                <div className="relative flex items-center">
                  <Search className="absolute right-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث بكود الأصل، الماكينة، الموديل، السريال..."
                    value={fixedAssetSearch}
                    onChange={(e) => setFixedAssetSearch(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <select
                  value={fixedDeptFilter}
                  onChange={(e) => setFixedDeptFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="">-- كل الإدارات والأقسام المعتمدة --</option>
                  {dbDepartments.map((dept) => (
                    <option key={dept.id} value={dept.displayName}>{dept.displayName}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={fixedCategoryFilter}
                  onChange={(e) => setFixedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                >
                  <option value="">-- كل التصنيفات --</option>
                  <option value="أفران وتسوية">أفران وخطوط تسوية</option>
                  <option value="عجانات ومضارب">عجانات ومضارب خفق</option>
                  <option value="ثلاجات وتبريد">ثلاجات وتبريد وتجميد</option>
                  <option value="تغليف وتعبئة">تعبئة وتغليف وسيلر</option>
                  <option value="سيارات توزيع">سيارات ولوجستيات</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={fixedStatusFilter}
                  onChange={(e) => setFixedStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                >
                  <option value="">-- كل الحالات الفنية --</option>
                  <option value="OPERATIONAL">تعمل بكفاءة</option>
                  <option value="UNDER_MAINTENANCE">تحت الصيانة (SOS)</option>
                  <option value="OUT_OF_SERVICE">معطلة تماماً</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <button
                  onClick={() => {
                    setFixedAssetSearch('');
                    setFixedDeptFilter('');
                    setFixedCategoryFilter('');
                    setFixedStatusFilter('');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>

          {/* جدول الأصول */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-xs font-bold">📋 سجل الأصول والماكينات الرأسمالية (المعروض: {filteredFixedAssets.length})</h2>
              <span className="text-[11px] text-slate-400 font-mono">محدث لحظياً مع قاعدة البيانات</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-gray-600 font-bold border-b text-center">
                  <tr>
                    <th className="py-3 px-3">كود الأصل (Tag)</th>
                    <th className="py-3 px-3 text-right">اسم الأصل / الماكينة</th>
                    <th className="py-3 px-3">القسم / الصالة الفعلية</th>
                    <th className="py-3 px-3">الماركة والموديل</th>
                    <th className="py-3 px-3">الرقم التسلسلي (S/N)</th>
                    <th className="py-3 px-3">مسؤول العهدة (HR)</th>
                    <th className="py-3 px-3">الحالة الفنية</th>
                    <th className="py-3 px-3" style={{ minWidth: '220px' }}>الإجراءات والربط الميداني</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-center">
                  {filteredFixedAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">{asset.assetCode}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900">
                        {asset.name}
                        {asset.category && (
                          <span className="bg-slate-100 text-slate-600 border px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                            {asset.category}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                          {asset.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{asset.brandModel || '---'}</td>
                      <td className="py-3 px-3 font-mono text-gray-500">{asset.serialNumber || '---'}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{asset.custodianName}</div>
                        <span className="text-[10px] text-gray-400 font-mono">[{asset.custodianCode}]</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          asset.status === 'OPERATIONAL'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : asset.status === 'UNDER_MAINTENANCE'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {asset.status === 'OPERATIONAL' ? 'تعمل بكفاءة ✓' : asset.status === 'UNDER_MAINTENANCE' ? 'تحت الصيانة ⚙️' : 'معطلة ⛔'}
                        </span>
                        {asset.activeSOSTaskNumber && (
                          <span className="block mt-1 font-mono text-[10px] text-rose-600 font-bold">
                            🚨 {asset.activeSOSTaskNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openTransferForSpecificMachine(asset)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                            title="نقل عهدة هذه الماكينة لصالة أخرى"
                          >
                            🔄 نقل
                          </button>

                          <button
                            onClick={() => openDirectSOSModal(asset)}
                            className="px-2 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-bold shadow-xs transition-colors"
                            title="إطلاق بلاغ طارئ واستدعاء صيانة"
                          >
                            🚨 عطل
                          </button>

                          <button
                            onClick={() => openAssetHistoryModal(asset)}
                            className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
                            title="استعراض الأرشيف الكامل"
                          >
                            📜 السجل
                          </button>

                          <button
                            onClick={() => editFixedAsset(asset)}
                            className="px-2 py-1 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            تعديل
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. تبويب 2: دورة تداول الأسبات والحاويات */}
      {activeTab === 'circulating' && (
        <div className="space-y-6">
          {/* جدول الأرصدة اللحظية للحاويات */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-xs font-bold">🧺 موقف الأرصدة اللحظية للحاويات والأسبات بالمصنع</h2>
              <button onClick={loadData} className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-bold">
                <RotateCw className="w-3.5 h-3.5" />
                <span>تحديث الأرصدة</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-50 text-gray-700 font-bold border-b">
                  <tr>
                    <th className="py-3 px-3 text-right">نوع الوعاء / الحاوية</th>
                    <th className="py-3 px-3 text-right">المواصفة الفنية</th>
                    <th className="py-3 px-3">الرصيد الكلي بالمصنع</th>
                    <th className="py-3 px-3 text-emerald-600">بصالات الإنتاج</th>
                    <th className="py-3 px-3 text-indigo-600">بمستودع التعبئة</th>
                    <th className="py-3 px-3 text-amber-600">عهدة خارجية بالفروع</th>
                    <th className="py-3 px-3 text-rose-600">متنازع عليها (عجز)</th>
                    <th className="py-3 px-3 text-slate-500">توالف وكسر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {circulatingAssetsList.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-right font-bold text-gray-900">{c.containerName}</td>
                      <td className="py-3 px-3 text-right text-gray-500 font-mono text-[11px]">{c.specification}</td>
                      <td className="py-3 px-3 font-mono font-black text-sm text-gray-900">{c.totalFactoryQuantity}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">{c.inProductionFloorQuantity}</td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">{c.inPackagingWarehouseQuantity}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-600">{c.withDriversAndBranchesQuantity}</td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-600">{c.disputedQuantity}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">{c.damagedQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* سجل حركات الأسبات */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xs font-bold">
                🚚 سجل أذون صرف واستلام الأسبات ومحاضر النزاع ({crateMovementsHistory.length} حركة)
              </h2>
              <select
                value={crateFilterStatus}
                onChange={(e) => setCrateFilterStatus(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 text-xs rounded-xl px-3 py-1 outline-none font-medium"
              >
                <option value="">-- كل الحالات --</option>
                <option value="PENDING_RECEIPT">بانتظار تأكيد المستلم ⏳</option>
                <option value="DISPUTED">نزاع عجز وكسر معلق ⚠️</option>
                <option value="COMPLETED">مكتمل ومستلم بالكامل ✓</option>
                <option value="RESOLVED">تم التحكيم وفض النزاع ⚖️</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-50 text-gray-600 font-bold border-b">
                  <tr>
                    <th className="py-3 px-3">رقم الإذن</th>
                    <th className="py-3 px-3">تاريخ الحركة</th>
                    <th className="py-3 px-3">نوع الحركة</th>
                    <th className="py-3 px-3 text-right">نوع الوعاء</th>
                    <th className="py-3 px-3">المنصرف</th>
                    <th className="py-3 px-3">الموقع المُرسل</th>
                    <th className="py-3 px-3">القائم بالصرف</th>
                    <th className="py-3 px-3">الموقع المستلم</th>
                    <th className="py-3 px-3">المستلم الفعلي</th>
                    <th className="py-3 px-3">المستلم</th>
                    <th className="py-3 px-3">العجز والكسر</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3" style={{ minWidth: '130px' }}>الإجراء الميداني</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {crateMovementsHistory.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">{m.movementNumber}</td>
                      <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">{m.createdAt}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.movementType === 'DISPATCH_BRANCH'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {m.movementType === 'DISPATCH_BRANCH' ? 'صرف خارجي / للفروع' : 'مرتجع للمصنع'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-gray-800">{m.containerName}</td>
                      <td className="py-3 px-3 font-mono font-black text-sm text-gray-900">{m.dispatchedQuantity}</td>
                      <td className="py-3 px-3 text-gray-600">{m.sourceLocation}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-800">{m.dispatchedByName}</div>
                        <span className="text-[10px] text-gray-400 font-mono">[{m.dispatchedByCode}]</span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{m.destinationLocation}</td>
                      <td className="py-3 px-3">
                        {m.receivedByName ? (
                          <>
                            <div className="font-bold text-gray-800">{m.receivedByName}</div>
                            <span className="text-[10px] text-gray-400 font-mono">[{m.receivedByCode}]</span>
                          </>
                        ) : (
                          <span className="text-gray-400">---</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                        {m.receivedQuantity > 0 ? m.receivedQuantity : '-'}
                      </td>
                      <td className="py-3 px-3">
                        {m.shortageQuantity > 0 || m.damagedCount > 0 ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                            عجز: {m.shortageQuantity} | كسر: {m.damagedCount}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'DISPUTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : m.status === 'RESOLVED'
                            ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {m.status === 'COMPLETED'
                            ? 'مكتمل ✓'
                            : m.status === 'DISPUTED'
                            ? 'نزاع عجز ⚠️'
                            : m.status === 'RESOLVED'
                            ? 'تم التحكيم ⚖️'
                            : 'بانتظار المستلم ⏳'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {m.status === 'PENDING_RECEIPT' && (
                            <button
                              onClick={() => openReceiveCrateModal(m)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            >
                              📥 تأكيد الاستلام
                            </button>
                          )}
                          {m.status === 'DISPUTED' && (
                            <button
                              onClick={() => openSettleDisputeModal(m)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            >
                              ⚖️ فض النزاع
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. تبويب 3: بطاقة جرد الأقسام */}
      {activeTab === 'custody' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="w-full md:w-1/3">
              <label className="block text-gray-700 font-bold mb-1 text-xs">اختر الصالة أو القسم الفعلي:</label>
              <select
                value={selectedCustodyDept}
                onChange={(e) => setSelectedCustodyDept(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-emerald-400 rounded-xl font-bold text-gray-900 text-xs focus:outline-none"
              >
                {dbDepartments.map((d) => (
                  <option key={d.id} value={d.displayName}>{d.displayName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة محضر جرد وعهدة القسم (رسمي)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-xs font-bold">🏭 الماكينات والمعدات بعهدة ({selectedCustodyDept})</h2>
              <span className="font-mono text-[11px] text-amber-400 font-bold">{departmentFixedAssets.length} أصول</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-50 text-gray-700 font-bold border-b">
                  <tr>
                    <th className="py-2.5 px-3">كود الأصل</th>
                    <th className="py-2.5 px-3 text-right">اسم الماكينة</th>
                    <th className="py-2.5 px-3">الماركة والموديل</th>
                    <th className="py-2.5 px-3">الرقم التسلسلي</th>
                    <th className="py-2.5 px-3">الحالة الفنية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departmentFixedAssets.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{a.assetCode}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">{a.name}</td>
                      <td className="py-2.5 px-3 text-gray-600">{a.brandModel || '---'}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">{a.serialNumber || '---'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          a.status === 'OPERATIONAL'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : a.status === 'UNDER_MAINTENANCE'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {a.status === 'OPERATIONAL' ? 'تعمل بكفاءة ✓' : a.status === 'UNDER_MAINTENANCE' ? 'تحت الصيانة ⚙️' : 'معطلة ⛔'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* مودال 1: صرف أسبات */}
      {isCrateDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-bold">📦 إصدار إذن تسليم وصرف أسبات / صواني (طرف أول مُسلِّم)</h4>
              <button onClick={() => setIsCrateDispatchModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">نوع الوعاء / الحاوية *</label>
                  <select
                    value={newCrateDispatch.containerName}
                    onChange={(e) => setNewCrateDispatch({ ...newCrateDispatch, containerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold"
                  >
                    {circulatingAssetsList.map((c) => (
                      <option key={c.id} value={c.containerName}>{c.containerName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">نوع الحركة *</label>
                  <select
                    value={newCrateDispatch.movementType}
                    onChange={(e) => setNewCrateDispatch({ ...newCrateDispatch, movementType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold"
                  >
                    <option value="DISPATCH_BRANCH">صرف للفروع وسيارات التوزيع 📤</option>
                    <option value="RETURN_FACTORY">استلام ومرتجع للمصنع 📥</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الكمية المنصرفة (بالعدد) *</label>
                  <input
                    type="number"
                    min={1}
                    value={newCrateDispatch.dispatchedQuantity}
                    onChange={(e) => setNewCrateDispatch({ ...newCrateDispatch, dispatchedQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono font-bold text-center text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">المُسلِّم المعتمد</label>
                  <input
                    type="text"
                    readOnly
                    value={`${user?.fullName || 'المسؤول المعتمد'} [${user?.username || 'HR-01'}]`}
                    className="w-full px-3 py-2 bg-slate-100 border border-gray-200 rounded-xl text-indigo-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الموقع المُرسل (المصدر) *</label>
                  <input
                    type="text"
                    value={newCrateDispatch.sourceLocation}
                    onChange={(e) => setNewCrateDispatch({ ...newCrateDispatch, sourceLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">الموقع المستلم (الجهة / الفرع) *</label>
                  <input
                    type="text"
                    value={newCrateDispatch.destinationLocation}
                    onChange={(e) => setNewCrateDispatch({ ...newCrateDispatch, destinationLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">ملاحظات إذن التسليم</label>
                <input
                  type="text"
                  placeholder="أرقام سيارات، أذون تسليم، أو تعليمات خاصة..."
                  value={newCrateDispatch.notes || ''}
                  onChange={(e) => setNewCrateDispatch({ ...newCrateDispatch, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCrateDispatchModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={submitCrateDispatch}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  💾 حفظ وإصدار إذن التسليم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال 2: تأكيد الاستلام الميداني */}
      {isCrateReceiveModalOpen && selectedMovementForReceive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between">
              <h4 className="font-bold">📥 فحص وتأكيد الاستلام الميداني: {selectedMovementForReceive.movementNumber}</h4>
              <button onClick={() => setIsCrateReceiveModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-gray-400 block text-[11px]">نوع الوعاء</span>
                  <strong className="text-indigo-700 text-xs">{selectedMovementForReceive.containerName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">الكمية المنصرفة</span>
                  <strong className="text-gray-900 font-mono text-sm">{selectedMovementForReceive.dispatchedQuantity}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">المُسلِّم</span>
                  <strong className="text-gray-700 text-xs">{selectedMovementForReceive.dispatchedByName}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-700 font-bold mb-1">الكمية المستلمة السليمة *</label>
                  <input
                    type="number"
                    min={0}
                    value={receiveCrateDto.actualReceivedQuantity}
                    onChange={(e) => setReceiveCrateDto({ ...receiveCrateDto, actualReceivedQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-emerald-400 rounded-xl font-mono font-bold text-center text-sm"
                  />
                </div>

                <div>
                  <label className="block text-rose-700 font-bold mb-1">عدد الأوعية المكسورة والتالفة *</label>
                  <input
                    type="number"
                    min={0}
                    value={receiveCrateDto.damagedCount}
                    onChange={(e) => setReceiveCrateDto({ ...receiveCrateDto, damagedCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-rose-400 rounded-xl font-mono font-bold text-center text-sm text-rose-600"
                  />
                </div>
              </div>

              {selectedMovementForReceive.dispatchedQuantity > receiveCrateDto.actualReceivedQuantity && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-bold text-[11px]">
                  ⚠️ تنبيه عجز: يوجد عجز بمقدار ({selectedMovementForReceive.dispatchedQuantity - receiveCrateDto.actualReceivedQuantity}) وعاء. سيتحول الإذن إلى (نزاع رسمي).
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-bold mb-1">ملاحظات الاستلام وأسباب الكسر أو العجز</label>
                <input
                  type="text"
                  placeholder="اكتب ملاحظات المعاينة الميدانية..."
                  value={receiveCrateDto.receiveNotes || ''}
                  onChange={(e) => setReceiveCrateDto({ ...receiveCrateDto, receiveNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCrateReceiveModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={submitCrateReceive}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  ✅ تأكيد المعاينة والاستلام
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال 3: فض وتسوية النزاع والعجز */}
      {isCrateSettleModalOpen && selectedMovementForSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-rose-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Scale className="w-4 h-4" />
                <span>⚖️ محضر فض وتسوية نزاع الحاويات: {selectedMovementForSettle.movementNumber}</span>
              </h4>
              <button onClick={() => setIsCrateSettleModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold">
                واقعة النزاع: من منصرف ({selectedMovementForSettle.dispatchedQuantity}) تم استلام ({selectedMovementForSettle.receivedQuantity})، بعجز قدره ({selectedMovementForSettle.shortageQuantity}) مفقود و ({selectedMovementForSettle.damagedCount}) تالف/مكسور.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">قرار لجنة التحكيم المعتمد *</label>
                  <select
                    value={settleDisputeDto.arbitrationDecision}
                    onChange={(e) => setSettleDisputeDto({ ...settleDisputeDto, arbitrationDecision: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl font-bold"
                  >
                    <option value="تحميل العجز على المستلم (إهمال)">تحميل العجز والكسر على المستلم (إهمال)</option>
                    <option value="تحميل العجز على السائق والمُسلِّم">تحميل العجز على السائق والمُسلِّم (نقل)</option>
                    <option value="إقرار هدر تشغيلي مسموح به (استهلاك)">إقرار هدر تشغيلي طبيعي معتمد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">الجزاء أو التعويض المالي (ج.م)</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={settleDisputeDto.financialPenalty}
                    onChange={(e) => setSettleDisputeDto({ ...settleDisputeDto, financialPenalty: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl font-mono font-bold text-center text-rose-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">نص منطوق القرار ومحضر التسوية النهائي *</label>
                <textarea
                  rows={3}
                  value={settleDisputeDto.arbitrationText}
                  onChange={(e) => setSettleDisputeDto({ ...settleDisputeDto, arbitrationText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl outline-none"
                  placeholder="اكتب حيثيات قرار لجنة فض المنازعات والخصم المالي المعتمد..."
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCrateSettleModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={submitCrateSettle}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  ⚖️ اعتماد القرار وتسوية العهدة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال 4: إطلاق بلاغ طارئ مباشر (SOS) */}
      {isDirectSOSModalOpen && assetForSOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-rose-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                <span>🚨 إطلاق بلاغ طارئ واستدعاء صيانة فوري: {assetForSOS.name}</span>
              </h4>
              <button onClick={() => setIsDirectSOSModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold text-[11px]">
                ⚠️ تنبيه تشغيلي: سيتم تحويل حالة الماكينة [{assetForSOS.assetCode}] فوراً إلى (تحت الصيانة والإصلاح UNDER_MAINTENANCE).
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">عنوان المشكلة أو العطل الطارئ *</label>
                <input
                  type="text"
                  value={directSOSTitle}
                  onChange={(e) => setDirectSOSTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">شرح مظهر العطل</label>
                <textarea
                  rows={3}
                  value={directSOSDescription}
                  onChange={(e) => setDirectSOSDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsDirectSOSModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={submitDirectSOS}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  🚨 إرسال البلاغ وتثبيت العطل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال 5: نقل عهدة ماكينة */}
      {isMachineTransferModalOpen && selectedMachineToTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-amber-500 text-slate-950 flex items-center justify-between font-black">
              <h4>🔄 نقل عهدة ماكينة: {selectedMachineToTransfer.name}</h4>
              <button onClick={() => setIsMachineTransferModalOpen(false)} className="text-slate-800 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[11px]">الصالة الحالية (المصدر)</span>
                  <strong className="text-gray-800">{selectedMachineToTransfer.department}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">مسؤول العهدة الحالي</span>
                  <strong className="text-gray-800 font-mono">[{selectedMachineToTransfer.custodianCode}] {selectedMachineToTransfer.custodianName}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الصالة المستلمة الجديدة *</label>
                  <select
                    value={targetTransferDept}
                    onChange={(e) => setTargetTransferDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-emerald-400 rounded-xl font-bold"
                  >
                    {dbDepartments.map((d) => (
                      <option key={d.id} value={d.displayName}>{d.displayName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">المشرف المستلم الجديد (من HR) *</label>
                  <select
                    value={targetTransferEmpCode}
                    onChange={(e) => setTargetTransferEmpCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-emerald-400 rounded-xl font-mono font-bold"
                  >
                    {employeesCatalog.map((emp) => (
                      <option key={emp.id} value={emp.displayCode}>[{emp.displayCode}] - {emp.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsMachineTransferModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={submitMachineTransfer}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xs"
                >
                  🔄 ترحيل وتثبيت النقل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال 6: قيد / تعديل أصل ثابت */}
      {isFixedAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-amber-500 text-slate-950 flex items-center justify-between font-black">
              <h4>{editingFixedAsset.id === 0 ? '🏭 قيد أصل / ماكينة جديدة' : `🛠 تعديل أصل: ${editingFixedAsset.name}`}</h4>
              <button onClick={() => setIsFixedAssetModalOpen(false)} className="text-slate-800 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4">
                  <label className="block text-gray-700 font-bold mb-1">كود الأصل (Tag) *</label>
                  <input
                    type="text"
                    value={editingFixedAsset.assetCode || ''}
                    onChange={(e) => setEditingFixedAsset({ ...editingFixedAsset, assetCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono font-bold text-indigo-700"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block text-gray-700 font-bold mb-1">اسم الماكينة *</label>
                  <input
                    type="text"
                    value={editingFixedAsset.name || ''}
                    onChange={(e) => setEditingFixedAsset({ ...editingFixedAsset, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">القسم / الصالة المخصصة *</label>
                  <select
                    value={editingFixedAsset.department || dbDepartments[0].displayName}
                    onChange={(e) => setEditingFixedAsset({ ...editingFixedAsset, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold"
                  >
                    {dbDepartments.map((d) => (
                      <option key={d.id} value={d.displayName}>{d.displayName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">مسؤول العهدة (من HR) *</label>
                  <select
                    value={editingFixedAsset.custodianCode || employeesCatalog[0].displayCode}
                    onChange={(e) => {
                      const emp = employeesCatalog.find((x) => x.displayCode === e.target.value);
                      setEditingFixedAsset({
                        ...editingFixedAsset,
                        custodianCode: e.target.value,
                        custodianName: emp?.displayName || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono font-bold"
                  >
                    {employeesCatalog.map((emp) => (
                      <option key={emp.id} value={emp.displayCode}>[{emp.displayCode}] - {emp.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الماركة والموديل</label>
                  <input
                    type="text"
                    value={editingFixedAsset.brandModel || ''}
                    onChange={(e) => setEditingFixedAsset({ ...editingFixedAsset, brandModel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الرقم التسلسلي (S/N)</label>
                  <input
                    type="text"
                    value={editingFixedAsset.serialNumber || ''}
                    onChange={(e) => setEditingFixedAsset({ ...editingFixedAsset, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الحالة التشغيلية</label>
                  <select
                    value={editingFixedAsset.status || 'OPERATIONAL'}
                    onChange={(e) => setEditingFixedAsset({ ...editingFixedAsset, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="OPERATIONAL">تعمل بكفاءة تامة ✓</option>
                    <option value="UNDER_MAINTENANCE">تحت الصيانة والإصلاح ⚙️</option>
                    <option value="OUT_OF_SERVICE">معطلة تماماً ⛔</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsFixedAssetModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveFixedAsset}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xs"
                >
                  💾 حفظ الأصل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال 7: سجل عمليات الماكينة */}
      {isAssetHistoryModalOpen && selectedHistoryAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>📜 سجل عمليات الماكينة: {selectedHistoryAsset.name}</span>
              </h4>
              <button onClick={() => setIsAssetHistoryModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-50 text-gray-700 font-bold border-b">
                    <tr>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">النوع</th>
                      <th className="py-2.5 px-3 text-right">البيان</th>
                      <th className="py-2.5 px-3">المسؤول</th>
                      <th className="py-2.5 px-3">الأثر والتكلفة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedHistoryAsset.historyLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-gray-400 font-bold">
                          لا توجد عمليات مسجلة في الأرشيف لهذه الماكينة.
                        </td>
                      </tr>
                    ) : (
                      selectedHistoryAsset.historyLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-gray-500">{log.date}</td>
                          <td className="py-2.5 px-3 font-bold text-indigo-700">{log.eventType}</td>
                          <td className="py-2.5 px-3 text-right text-gray-800">{log.description}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-gray-600">[{log.performedByCode}]</span> {log.performedByName}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{log.costImpact}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setIsAssetHistoryModalOpen(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
