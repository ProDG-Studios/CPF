// Comprehensive Admin Mock Data for RSO Platform

import { format, subDays, subHours, subMonths } from 'date-fns';

// ============ SYSTEM METRICS ============
export const systemMetrics = {
  totalBillsValue: 8_750_000_000, // KES 8.75B
  totalBillsCount: 247,
  totalCertifiedValue: 3_250_000_000,
  totalCertifiedCount: 89,
  pendingValue: 2_100_000_000,
  averageProcessingDays: 14.5,
  successRate: 94.2,
  activeDeeds: 67,
  mintedNotes: 45,
  totalUsers: 156,
};

// ============ USER BREAKDOWN ============
export const usersByRole = {
  suppliers: 78,
  spvs: 12,
  mdas: 42,
  treasury: 18,
  admins: 6,
};

// ============ PIPELINE STAGES ============
export const pipelineData = [
  { stage: 'Submitted', count: 35, value: 890_000_000, color: '#3B82F6' },
  { stage: 'SPV Offers', count: 28, value: 720_000_000, color: '#8B5CF6' },
  { stage: 'Accepted', count: 42, value: 1_100_000_000, color: '#6366F1' },
  { stage: 'MDA Review', count: 31, value: 850_000_000, color: '#F59E0B' },
  { stage: 'MDA Approved', count: 22, value: 640_000_000, color: '#D97706' },
  { stage: 'Treasury', count: 18, value: 520_000_000, color: '#10B981' },
  { stage: 'Certified', count: 89, value: 3_250_000_000, color: '#059669' },
];

// ============ MONTHLY TRENDS ============
export const monthlyTrends = [
  { month: 'Jul 2025', submitted: 18, certified: 8, value: 450_000_000 },
  { month: 'Aug 2025', submitted: 22, certified: 12, value: 580_000_000 },
  { month: 'Sep 2025', submitted: 28, certified: 15, value: 720_000_000 },
  { month: 'Oct 2025', submitted: 35, certified: 18, value: 890_000_000 },
  { month: 'Nov 2025', submitted: 42, certified: 22, value: 1_050_000_000 },
  { month: 'Dec 2025', submitted: 38, certified: 25, value: 980_000_000 },
  { month: 'Jan 2026', submitted: 45, certified: 28, value: 1_150_000_000 },
];

// ============ TOP SUPPLIERS ============
export const topSuppliers = [
  { name: 'Apex Construction Ltd', totalValue: 520_000_000, billsCount: 12, avgDays: 12, certified: 8, email: 'apex@demo.com' },
  { name: 'BuildRight Kenya', totalValue: 480_000_000, billsCount: 10, avgDays: 15, certified: 7, email: 'buildright@demo.com' },
  { name: 'TechSupply Co', totalValue: 350_000_000, billsCount: 8, avgDays: 11, certified: 6, email: 'techsupply@demo.com' },
  { name: 'MedEquip Solutions', totalValue: 320_000_000, billsCount: 9, avgDays: 14, certified: 5, email: 'medequip@demo.com' },
  { name: 'FoodServe Enterprises', totalValue: 280_000_000, billsCount: 7, avgDays: 13, certified: 5, email: 'foodserve@demo.com' },
  { name: 'CleanEnergy Systems', totalValue: 250_000_000, billsCount: 6, avgDays: 10, certified: 4, email: 'cleanenergy@demo.com' },
  { name: 'Mombasa Traders Ltd', totalValue: 220_000_000, billsCount: 5, avgDays: 16, certified: 3, email: 'mombasa.traders@demo.com' },
  { name: 'Nairobi Steel Works', totalValue: 200_000_000, billsCount: 5, avgDays: 12, certified: 4, email: 'nairobi.steel@demo.com' },
  { name: 'Coast Logistics', totalValue: 180_000_000, billsCount: 4, avgDays: 14, certified: 3, email: 'coast.logistics@demo.com' },
  { name: 'Highland Farms', totalValue: 150_000_000, billsCount: 4, avgDays: 11, certified: 3, email: 'highland.farms@demo.com' },
];

// ============ TOP MDAs ============
export const topMDAs = [
  { name: 'Ministry of Works', code: 'MOW', billsCount: 45, totalValue: 1_850_000_000, avgProcessingDays: 13, certified: 28 },
  { name: 'Ministry of Health', code: 'MOH', billsCount: 38, totalValue: 1_420_000_000, avgProcessingDays: 15, certified: 22 },
  { name: 'Ministry of Education', code: 'MOE', billsCount: 32, totalValue: 980_000_000, avgProcessingDays: 12, certified: 18 },
  { name: 'Ministry of Transport', code: 'MOT', billsCount: 28, totalValue: 850_000_000, avgProcessingDays: 14, certified: 15 },
  { name: 'Ministry of ICT', code: 'MOIT', billsCount: 25, totalValue: 720_000_000, avgProcessingDays: 11, certified: 14 },
  { name: 'Ministry of Agriculture', code: 'MOA', billsCount: 22, totalValue: 650_000_000, avgProcessingDays: 16, certified: 12 },
  { name: 'Ministry of Defence', code: 'MOD', billsCount: 18, totalValue: 580_000_000, avgProcessingDays: 18, certified: 8 },
  { name: 'Ministry of Environment', code: 'MOEN', billsCount: 15, totalValue: 420_000_000, avgProcessingDays: 13, certified: 9 },
  { name: 'Ministry of Finance', code: 'MOF', billsCount: 12, totalValue: 380_000_000, avgProcessingDays: 10, certified: 8 },
  { name: 'Ministry of Water Resources', code: 'MOWR', billsCount: 10, totalValue: 320_000_000, avgProcessingDays: 14, certified: 6 },
];

// ============ SPV PERFORMANCE ============
export const spvPerformance = [
  { name: 'Alpha Capital SPV', purchases: 32, totalValue: 1_250_000_000, avgDiscount: 8.5, deeds: 28, notes: 22, email: 'alpha.capital@demo.com' },
  { name: 'Beta Investments', purchases: 28, totalValue: 980_000_000, avgDiscount: 9.2, deeds: 24, notes: 18, email: 'beta.investments@demo.com' },
  { name: 'Gamma Finance', purchases: 22, totalValue: 720_000_000, avgDiscount: 7.8, deeds: 18, notes: 12, email: 'gamma.finance@demo.com' },
  { name: 'Delta Funding', purchases: 18, totalValue: 580_000_000, avgDiscount: 8.8, deeds: 15, notes: 10, email: 'delta.funding@demo.com' },
  { name: 'Epsilon Capital', purchases: 15, totalValue: 450_000_000, avgDiscount: 9.5, deeds: 12, notes: 8, email: 'epsilon.capital@demo.com' },
  { name: 'Zeta Partners', purchases: 12, totalValue: 380_000_000, avgDiscount: 8.2, deeds: 10, notes: 6, email: 'zeta.partners@demo.com' },
];

// ============ RECENT ACTIVITY ============
export const recentActivity = [
  { id: 1, action: 'Bill Certified', actor: 'National Treasury', target: 'INV-2026-0145', value: 45_000_000, time: subHours(new Date(), 1), type: 'success' },
  { id: 2, action: 'SPV Offer Made', actor: 'Alpha Capital SPV', target: 'INV-2026-0148', value: 78_000_000, time: subHours(new Date(), 2), type: 'info' },
  { id: 3, action: 'MDA Approved', actor: 'Ministry of Works', target: 'INV-2026-0142', value: 92_000_000, time: subHours(new Date(), 3), type: 'warning' },
  { id: 4, action: 'Receivable Note Minted', actor: 'Beta Investments', target: 'RN-2026-0089', value: 55_000_000, time: subHours(new Date(), 4), type: 'success' },
  { id: 5, action: 'Offer Accepted', actor: 'Apex Construction Ltd', target: 'INV-2026-0139', value: 120_000_000, time: subHours(new Date(), 5), type: 'info' },
  { id: 6, action: 'New Bill Submitted', actor: 'TechSupply Co', target: 'INV-2026-0150', value: 35_000_000, time: subHours(new Date(), 6), type: 'info' },
  { id: 7, action: 'Tripartite Deed Signed', actor: 'All Parties', target: 'DEED-2026-0078', value: 88_000_000, time: subHours(new Date(), 7), type: 'success' },
  { id: 8, action: 'Payment Terms Set', actor: 'Gamma Finance', target: 'INV-2026-0135', value: 62_000_000, time: subHours(new Date(), 8), type: 'info' },
  { id: 9, action: 'Bill Rejected', actor: 'Ministry of Health', target: 'INV-2026-0128', value: 28_000_000, time: subHours(new Date(), 10), type: 'error' },
  { id: 10, action: 'User Registered', actor: 'System', target: 'New Supplier', value: 0, time: subHours(new Date(), 12), type: 'info' },
  { id: 11, action: 'Bill Certified', actor: 'National Treasury', target: 'INV-2026-0138', value: 72_000_000, time: subDays(new Date(), 1), type: 'success' },
  { id: 12, action: 'SPV Offer Made', actor: 'Delta Funding', target: 'INV-2026-0141', value: 48_000_000, time: subDays(new Date(), 1), type: 'info' },
];

// ============ COMPREHENSIVE BILLS ============
const supplierNames = ['Apex Construction Ltd', 'BuildRight Kenya', 'TechSupply Co', 'MedEquip Solutions', 'FoodServe Enterprises', 'CleanEnergy Systems', 'Mombasa Traders Ltd', 'Nairobi Steel Works', 'Coast Logistics', 'Highland Farms'];
const mdaNames = ['Ministry of Works', 'Ministry of Health', 'Ministry of Education', 'Ministry of Transport', 'Ministry of ICT', 'Ministry of Agriculture'];
const spvNames = ['Alpha Capital SPV', 'Beta Investments', 'Gamma Finance', 'Delta Funding'];
const statuses = ['submitted', 'under_review', 'offer_made', 'offer_accepted', 'mda_reviewing', 'mda_approved', 'terms_set', 'treasury_reviewing', 'certified'];
const billTypes = ['Goods', 'Services', 'Works', 'Mixed'];

export const comprehensiveBills = Array.from({ length: 250 }, (_, i) => {
  const statusIdx = Math.floor(Math.random() * statuses.length);
  const status = statuses[statusIdx];
  const amount = Math.floor(Math.random() * 150_000_000) + 10_000_000;
  const discountRate = (Math.random() * 5 + 5).toFixed(2);
  const offerAmount = Math.floor(amount * (1 - parseFloat(discountRate) / 100));
  const supplierIdx = i % supplierNames.length;
  const mdaIdx = i % mdaNames.length;
  const spvIdx = i % spvNames.length;

  return {
    id: `bill-${i + 1}`,
    invoice_number: `INV-2026-${String(i + 1000).padStart(4, '0')}`,
    supplier: supplierNames[supplierIdx],
    mda: mdaNames[mdaIdx],
    spv: status !== 'submitted' && status !== 'under_review' ? spvNames[spvIdx] : null,
    amount,
    offer_amount: status !== 'submitted' && status !== 'under_review' ? offerAmount : null,
    discount_rate: status !== 'submitted' && status !== 'under_review' ? parseFloat(discountRate) : null,
    status,
    bill_type: billTypes[i % billTypes.length],
    description: `${billTypes[i % billTypes.length]} supply for ${mdaNames[mdaIdx]} project - Contract ${i + 1000}`,
    created_at: subDays(new Date(), Math.floor(Math.random() * 180)),
    updated_at: subDays(new Date(), Math.floor(Math.random() * 60)),
    payment_quarters: status === 'certified' || status === 'mda_approved' ? Math.floor(Math.random() * 8) + 4 : null,
    payment_start_quarter: status === 'certified' || status === 'mda_approved' ? `Q${Math.floor(Math.random() * 4) + 1} 2026` : null,
    certificate_number: status === 'certified' ? `CERT-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}` : null,
    processing_days: status !== 'submitted' && status !== 'under_review' ? Math.floor(Math.random() * 30) + 5 : null,
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    category: ['Construction', 'Medical', 'IT Services', 'Agriculture', 'Transport', 'Education', 'Energy'][Math.floor(Math.random() * 7)],
  };
});

// ============ BLOCKCHAIN DEEDS ============
export const blockchainDeeds = Array.from({ length: 20 }, (_, i) => ({
  id: `deed-${i + 1}`,
  deed_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  invoice_number: `INV-2026-${String(i + 100).padStart(4, '0')}`,
  supplier: supplierNames[i % supplierNames.length],
  mda: mdaNames[i % mdaNames.length],
  spv: spvNames[i % spvNames.length],
  principal_amount: Math.floor(Math.random() * 100_000_000) + 20_000_000,
  purchase_price: Math.floor(Math.random() * 90_000_000) + 18_000_000,
  status: ['pending_assignor', 'pending_procuring_entity', 'pending_servicing_agent', 'fully_executed'][Math.floor(Math.random() * 4)],
  network: 'Sepolia Testnet',
  block_number: 12345678 + i * 100,
  created_at: subDays(new Date(), Math.floor(Math.random() * 30)),
  executed_at: Math.random() > 0.5 ? subDays(new Date(), Math.floor(Math.random() * 15)) : null,
}));

// ============ SYSTEM ALERTS ============
export const systemAlerts = [
  { id: 1, type: 'warning', title: 'High Volume Processing', message: '15 bills pending MDA approval for more than 7 days', count: 15, time: subHours(new Date(), 2) },
  { id: 2, type: 'info', title: 'New SPV Registration', message: 'Epsilon Capital has completed verification', count: 1, time: subHours(new Date(), 4) },
  { id: 3, type: 'success', title: 'Monthly Target Achieved', message: 'January certification target of KES 1B exceeded', count: null, time: subDays(new Date(), 1) },
  { id: 4, type: 'error', title: 'Failed Blockchain Transaction', message: 'Deed signing failed for DEED-2026-0076', count: 1, time: subDays(new Date(), 2) },
  { id: 5, type: 'warning', title: 'Profile Incomplete', message: '8 MDA users have not completed profile setup', count: 8, time: subDays(new Date(), 3) },
];

// ============ QUARTERLY SUMMARY ============
export const quarterlySummary = [
  { quarter: 'Q1 2025', submitted: 45, certified: 32, value: 1_850_000_000, payout: 1_700_000_000 },
  { quarter: 'Q2 2025', submitted: 58, certified: 41, value: 2_200_000_000, payout: 2_050_000_000 },
  { quarter: 'Q3 2025', submitted: 72, certified: 52, value: 2_850_000_000, payout: 2_600_000_000 },
  { quarter: 'Q4 2025', submitted: 85, certified: 61, value: 3_400_000_000, payout: 3_100_000_000 },
  { quarter: 'Q1 2026', submitted: 32, certified: 18, value: 1_250_000_000, payout: 950_000_000 },
];

// ============ PAYMENT SCHEDULES ============
export const paymentSchedules = Array.from({ length: 120 }, (_, i) => {
  const bill = comprehensiveBills[i % comprehensiveBills.length];
  const quarters = bill.payment_quarters || 6;
  const startQ = Math.floor(Math.random() * 4) + 1;
  const year = 2026;
  
  return Array.from({ length: quarters }, (_, qIdx) => {
    const quarterNum = ((startQ - 1 + qIdx) % 4) + 1;
    const yearOffset = Math.floor((startQ - 1 + qIdx) / 4);
    const quarter = `Q${quarterNum} ${year + yearOffset}`;
    const amount = Math.floor((bill.amount || 0) / quarters);
    
    return {
      id: `schedule-${i}-${qIdx}`,
      bill_id: bill.id,
      invoice_number: bill.invoice_number,
      supplier: bill.supplier,
      mda: bill.mda,
      quarter,
      amount,
      status: qIdx === 0 ? 'upcoming' : qIdx < quarters / 2 ? 'scheduled' : 'pending',
      due_date: `2026-${String((quarterNum - 1) * 3 + 1).padStart(2, '0')}-15`,
      paid_amount: qIdx === 0 && Math.random() > 0.7 ? amount : 0,
      paid_date: qIdx === 0 && Math.random() > 0.7 ? format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd') : null,
    };
  });
}).flat();

// ============ EXPANDED ACTIVITY LOG ============
const activityActions = [
  'Bill Submitted', 'Bill Certified', 'SPV Offer Made', 'MDA Approved', 'Receivable Note Minted',
  'Offer Accepted', 'New Bill Submitted', 'Tripartite Deed Signed', 'Payment Terms Set', 'Bill Rejected',
  'User Registered', 'User Verified', 'Profile Updated', 'Document Uploaded', 'Payment Scheduled',
  'Blockchain Transaction Initiated', 'Deed Executed', 'Payment Received', 'Certificate Generated',
  'MDA Authorization Completed', 'Treasury Review Started', 'SPV Due Diligence Completed'
];

export const expandedActivityLog = Array.from({ length: 200 }, (_, i) => {
  const actionIdx = Math.floor(Math.random() * activityActions.length);
  const action = activityActions[actionIdx];
  const bill = comprehensiveBills[i % comprehensiveBills.length];
  const value = Math.random() > 0.3 ? Math.floor(Math.random() * 150_000_000) + 10_000_000 : 0;
  
  const typeMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
    'Bill Certified': 'success',
    'Receivable Note Minted': 'success',
    'Tripartite Deed Signed': 'success',
    'Payment Received': 'success',
    'Certificate Generated': 'success',
    'MDA Approved': 'success',
    'SPV Offer Made': 'info',
    'Offer Accepted': 'info',
    'New Bill Submitted': 'info',
    'User Registered': 'info',
    'Payment Scheduled': 'info',
    'Bill Rejected': 'error',
    'MDA Authorization Completed': 'warning',
  };
  
  return {
    id: `activity-${i + 1}`,
    action,
    actor: i % 5 === 0 ? 'System' : bill.supplier || topMDAs[i % topMDAs.length].name || spvPerformance[i % spvPerformance.length].name,
    target: bill.invoice_number || `USER-${i + 1000}`,
    value,
    type: typeMap[action] || 'info',
    time: subDays(new Date(), Math.floor(Math.random() * 90)),
    metadata: {
      bill_id: bill.id,
      category: bill.category || 'General',
      priority: bill.priority || 'medium',
    }
  };
}).sort((a, b) => b.time.getTime() - a.time.getTime());

// ============ SYSTEM HEALTH METRICS ============
export const systemHealthMetrics = {
  uptime: 99.98,
  responseTime: 145,
  activeSessions: 234,
  apiRequestsToday: 15420,
  errorRate: 0.12,
  databaseSize: 12.5, // GB
  blockchainTransactions: 4523,
  pendingTasks: 23,
  serverLoad: 45.2,
  storageUsed: 68.5, // %
};

// ============ TRANSACTION STATISTICS ============
export const transactionStats = {
  totalTransactions: 3456,
  successfulTransactions: 3310,
  failedTransactions: 146,
  avgTransactionValue: 28_500_000,
  totalVolume: 98_460_000_000,
  peakHour: '14:00-15:00',
  avgProcessingTime: 12.5, // hours
  blockchainConfirmations: 3421,
  pendingConfirmations: 35,
};

// ============ DETAILED MDA PERFORMANCE ============
export const detailedMDAPerformance = topMDAs.map(mda => ({
  ...mda,
  pendingBills: Math.floor(mda.billsCount * 0.3),
  approvedBills: Math.floor(mda.billsCount * 0.5),
  rejectedBills: Math.floor(mda.billsCount * 0.05),
  avgResponseTime: Math.floor(Math.random() * 5) + 8, // days
  approvalRate: 85 + Math.floor(Math.random() * 10), // %
  usersCount: 3 + Math.floor(Math.random() * 5),
  lastActivity: subDays(new Date(), Math.floor(Math.random() * 7)),
  totalValueProcessed: mda.totalValue * 1.2,
}));

// ============ SUPPLIER PERFORMANCE DETAILS ============
export const supplierPerformanceDetails = topSuppliers.map(supplier => ({
  ...supplier,
  pendingBills: Math.floor(supplier.billsCount * 0.4),
  rejectedBills: Math.floor(supplier.billsCount * 0.1),
  avgSubmissionTime: 2 + Math.floor(Math.random() * 3), // days
  profileCompletion: 85 + Math.floor(Math.random() * 15), // %
  rating: 4 + Math.random(), // 4.0 - 5.0
  lastSubmission: subDays(new Date(), Math.floor(Math.random() * 14)),
  avgBillValue: Math.floor(supplier.totalValue / supplier.billsCount),
}));

// ============ BLOCKCHAIN STATISTICS ============
export const blockchainStats = {
  totalDeeds: 89,
  executedDeeds: 67,
  pendingDeeds: 22,
  totalNotesMinted: 45,
  totalVolumeOnChain: 3_250_000_000,
  networkFees: 125_000,
  avgBlockTime: 15.3, // seconds
  lastSync: subHours(new Date(), 1),
  nodesOnline: 12,
  confirmationsAvg: 3.2,
};

// ============ FORMAT HELPERS ============
export const formatKES = (amount: number) => {
  if (amount >= 1_000_000_000) {
    return `KES ${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `KES ${amount.toLocaleString()}`;
};

export const formatFullKES = (amount: number) => {
  return `KES ${amount.toLocaleString()}`;
};
