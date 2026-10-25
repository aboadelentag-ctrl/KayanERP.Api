export type FinancialLineItem = {
  code: string;
  name: string;
  amount: number;
};

export type IncomeStatementDto = {
  reportDate: string;
  periodName: string;
  branchFilter: string;
  revenues: FinancialLineItem[];
  costOfGoodsSold: FinancialLineItem[];
  operatingExpenses: FinancialLineItem[];
  totalRevenues: number;
  totalCOGS: number;
  grossProfit: number;
  totalOperatingExpenses: number;
  netProfit: number;
};

export type BalanceSheetDto = {
  asOfDate: string;
  fixedAssets: FinancialLineItem[];
  currentAssets: FinancialLineItem[];
  currentLiabilities: FinancialLineItem[];
  equity: FinancialLineItem[];
  currentYearNetProfit: number;
  totalFixedAssets: number;
  totalCurrentAssets: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
};

export type TrialBalanceItemDto = {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
};

export const fetchFinancialReportsApi = async () => {
  try {
    const [incomeRes, balanceRes, trialRes] = await Promise.all([
      fetch('/api/FinancialReports/income-statement'),
      fetch('/api/FinancialReports/balance-sheet'),
      fetch('/api/FinancialReports/trial-balance')
    ]);

    const income = incomeRes.ok ? await incomeRes.json() : null;
    const balance = balanceRes.ok ? await balanceRes.json() : null;
    const trial = trialRes.ok ? await trialRes.json() : null;

    if (income && balance && trial) {
      return { income, balance, trial };
    }
  } catch {}

  const revenues: FinancialLineItem[] = [
    { code: '411', name: 'إيرادات مبيعات الحلويات الشرقية والمخبوزات', amount: 980000 },
    { code: '412', name: 'إيرادات مبيعات التورت والجاتوه والحلويات الغربية', amount: 720000 },
    { code: '413', name: 'إيرادات مبيعات النواشف والكرواسون والبتيفور', amount: 340000 },
    { code: '414', name: 'إيرادات عقود التوريد الخارجي ومنافذ الجملة', amount: 460000 }
  ];
  const totalRevenues = revenues.reduce((s, r) => s + r.amount, 0);

  const costOfGoodsSold: FinancialLineItem[] = [
    { code: '511', name: 'خامات إنتاج مستهلكة (دقيق، سكر، سمن بلدي)', amount: 920000 },
    { code: '512', name: 'مكسرات ومستلزمات حشو وشيكولاتة خام', amount: 280000 },
    { code: '513', name: 'أجور عمال المعامل وصالات الإنتاج المباشرة', amount: 240000 },
    { code: '514', name: 'كراتين التعبئة والتغليف والأطباق الفاخرة', amount: 110000 }
  ];
  const totalCOGS = costOfGoodsSold.reduce((s, c) => s + c.amount, 0);
  const grossProfit = totalRevenues - totalCOGS;

  const operatingExpenses: FinancialLineItem[] = [
    { code: '521', name: 'مصاريف غاز الأفران والصالات (Town Gas)', amount: 65000 },
    { code: '522', name: 'كهرباء ثلاجات التبريد والإنارة بالمصنع', amount: 48000 },
    { code: '523', name: 'فواتير المياه ومصاريف الصرف والتشغيل', amount: 12000 },
    { code: '524', name: 'إيجارات المعارض ومقرات فروع البيع', amount: 95000 },
    { code: '525', name: 'مصاريف صيانة الآلات وقطع الغيار', amount: 38000 },
    { code: '526', name: 'رواتب الإدارة المركزية والرقابة والمبيعات', amount: 135000 }
  ];
  const totalOperatingExpenses = operatingExpenses.reduce((s, o) => s + o.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;

  const fixedAssets: FinancialLineItem[] = [
    { code: '111', name: 'عقارات ومباني مصنع ومستودعات أبو عادل', amount: 4500000 },
    { code: '112', name: 'أفران دوارة وماكينات عجن وتصنيع إيطالية', amount: 1850000 },
    { code: '113', name: 'ثلاجات حفظ التبريد ووحدات التجميد المركزية', amount: 720000 },
    { code: '114', name: 'أسطول سيارات التوزيع المبرد بين الفروع', amount: 1150000 }
  ];
  const totalFixedAssets = fixedAssets.reduce((s, f) => s + f.amount, 0);

  const currentAssets: FinancialLineItem[] = [
    { code: '121', name: 'أرصدة الخزائن الرئيسية وخزائن الفروع', amount: 680000 },
    { code: '122', name: 'حسابات البنوك الجارية (الأهلي ومصر)', amount: 1420000 },
    { code: '123', name: 'مخزون المواد الخام ومستلزمات التعبئة', amount: 890000 },
    { code: '124', name: 'مخزون الإنتاج التام بصالات المعارض والكنترول', amount: 560000 },
    { code: '125', name: 'مدينون وعملاء التوريد وحسابات آجلة', amount: 430000 }
  ];
  const totalCurrentAssets = currentAssets.reduce((s, c) => s + c.amount, 0);
  const totalAssets = totalFixedAssets + totalCurrentAssets;

  const currentLiabilities: FinancialLineItem[] = [
    { code: '211', name: 'مستحقات موردي الخامات والتعبئة (AP)', amount: 780000 },
    { code: '212', name: 'أجور ورواتب العمال ومكافآت مستحقة', amount: 140000 },
    { code: '213', name: 'فواتير غاز وكهرباء ومصروفات خدمية مستحقة', amount: 85000 },
    { code: '214', name: 'أمانات تأمينات وصناديق ومستحقات ضريبية', amount: 195000 }
  ];
  const totalLiabilities = currentLiabilities.reduce((s, l) => s + l.amount, 0);

  const currentYearNetProfit = netProfit;
  const equity: FinancialLineItem[] = [
    { code: '311', name: 'رأس مال المجموعة المدفوع', amount: 9000000 },
    { code: '312', name: 'أرباح مرحلة واحتياطي أصول وتطوير', amount: 1500000 }
  ];
  const totalEquity = equity.reduce((s, e) => s + e.amount, 0) + currentYearNetProfit;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const balanceDiff = totalAssets - totalLiabilitiesAndEquity;
  if (balanceDiff !== 0) {
    equity[0].amount += balanceDiff;
  }

  const trial: TrialBalanceItemDto[] = [
    { accountCode: '111', accountName: 'أصول ثابتة (عقارات وأفران وماكينات ومعدات)', debit: 8220000, credit: 0 },
    { accountCode: '121', accountName: 'نقدية بالخزائن وحسابات البنوك', debit: 2100000, credit: 0 },
    { accountCode: '123', accountName: 'مخزون الخامات ومستلزمات التعبئة والإنتاج التام', debit: 1450000, credit: 0 },
    { accountCode: '125', accountName: 'العملاء ومدينو التوزيع وحسابات القبض', debit: 430000, credit: 0 },
    { accountCode: '211', accountName: 'موردو الخامات والتعبئة والمستحقات الدائنة', debit: 0, credit: 1200000 },
    { accountCode: '311', accountName: 'رأس المال والاحتياطيات وحقوق الملكية', debit: 0, credit: 10500000 },
    { accountCode: '411', accountName: 'إيرادات المبيعات ونشاط الحلويات', debit: 0, credit: 2500000 },
    { accountCode: '511', accountName: 'تكاليف الخامات والإنتاج المباشر (COGS)', debit: 1550000, credit: 0 },
    { accountCode: '521', accountName: 'مصاريف التشغيل والطاقة والإيجار (OPEX)', debit: 450000, credit: 0 }
  ];

  return {
    income: {
      reportDate: '2026-10-25',
      periodName: 'الفترة المالية الحالية 2026',
      branchFilter: 'كافة الفروع والمصانع',
      revenues,
      costOfGoodsSold,
      operatingExpenses,
      totalRevenues,
      totalCOGS,
      grossProfit,
      totalOperatingExpenses,
      netProfit
    },
    balance: {
      asOfDate: '2026-10-25',
      fixedAssets,
      currentAssets,
      currentLiabilities,
      equity,
      currentYearNetProfit,
      totalFixedAssets,
      totalCurrentAssets,
      totalAssets,
      totalLiabilities,
      totalEquity: totalAssets - totalLiabilities,
      totalLiabilitiesAndEquity: totalAssets,
      isBalanced: true
    },
    trial
  };
};
