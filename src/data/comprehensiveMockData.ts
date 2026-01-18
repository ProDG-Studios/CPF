// Comprehensive mock data for all interfaces - 15-20+ entries each
import { subDays, subMonths, addDays } from 'date-fns';

// ============ SUPPLIER NAMES ============
const supplierNames = [
  'Alpha Construction Ltd', 'Beta Medical Supplies', 'Gamma Tech Solutions', 'Delta Logistics Co',
  'Epsilon Infrastructure', 'Zeta Pharmaceutical', 'Eta Office Supplies', 'Theta Automotive',
  'Iota Catering Services', 'Kappa Building Materials', 'Lambda Energy Solutions', 'Mu Textiles Ltd',
  'Nu Consulting Group', 'Xi Engineering Works', 'Omicron Trading Co', 'Pi Healthcare Supplies',
  'Rho Security Services', 'Sigma IT Solutions', 'Tau Manufacturing', 'Upsilon Transport Ltd',
  'Phi Agricultural Supplies', 'Chi Water Systems', 'Psi Electrical Co', 'Omega General Contractors',
  'Prime Construction Group', 'Apex Medical Equipment', 'Zenith Technology', 'Pinnacle Logistics',
  'Summit Infrastructure', 'Horizon Pharmaceuticals'
];

// ============ MDA NAMES ============
const mdaNames = [
  'Ministry of Works', 'Ministry of Health', 'Ministry of Education', 'Ministry of Transport',
  'Ministry of Agriculture', 'Ministry of Communications', 'Ministry of Finance', 'Ministry of Defense',
  'Ministry of Housing', 'Ministry of Water Resources', 'Ministry of Power', 'Ministry of Environment',
  'Kenya Revenue Authority', 'Kenya National Highways Authority', 'National Construction Authority'
];

// ============ SPV NAMES ============
const spvNames = [
  'Capital Finance SPV', 'Investment Partners SPV', 'Growth Capital SPV', 'Premier Investment SPV',
  'National Receivables SPV', 'Alpha Capital Partners', 'Zenith Factoring Ltd', 'Unity Investment Group',
  'Prosperity Finance SPV', 'Sovereign Capital Partners'
];

// ============ DESCRIPTIONS ============
const descriptions = [
  'Highway construction phase 2 - Section A to C',
  'Hospital equipment procurement and installation',
  'School renovation and furniture supply',
  'Vehicle fleet maintenance contract',
  'Agricultural equipment supply',
  'Data center infrastructure upgrade',
  'Office renovation and furnishing',
  'Water treatment plant construction',
  'Power grid expansion project',
  'Environmental remediation services',
  'Security equipment installation',
  'IT systems modernization',
  'Bridge construction and repair',
  'Medical supplies quarterly contract',
  'Road rehabilitation program',
  'Telecommunications infrastructure',
  'Public housing development',
  'Irrigation system installation',
  'Solar power installation project',
  'Waste management services contract'
];

// ============ HELPER FUNCTIONS ============
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = (min: number, max: number): number => 
  Math.round((Math.random() * (max - min) + min) / 1000000) * 1000000;
const randomRate = (min: number, max: number): number => 
  Math.round((Math.random() * (max - min) + min) * 10) / 10;

// ============ SPV ACCEPTED OFFERS (Need Terms) ============
export const mockAcceptedOffersData = Array.from({ length: 18 }, (_, i) => ({
  id: `acc-${i + 1}`,
  invoice_number: `INV-2024-A${String(i + 1).padStart(3, '0')}`,
  supplier_name: supplierNames[i % supplierNames.length],
  mda_name: mdaNames[i % mdaNames.length],
  amount: randomAmount(25000000, 150000000),
  offer_amount: 0,
  offer_discount_rate: randomRate(5, 12),
  offer_accepted_date: subDays(new Date(), Math.floor(Math.random() * 10) + 1).toISOString(),
  needs_terms: true,
  description: descriptions[i % descriptions.length],
})).map(item => ({
  ...item,
  offer_amount: Math.round(item.amount * (1 - item.offer_discount_rate / 100)),
}));

// ============ MDA PENDING BILLS (SPV Terms Awaiting Approval) ============
// Each bill now has multiple term options set by SPV for MDA to choose from
export const mockMDAPendingBillsData = Array.from({ length: 20 }, (_, i) => {
  const amount = randomAmount(15000000, 120000000);
  const discountRate = randomRate(4, 10);
  const startQuarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
  
  // Generate 3 different term options for MDA to choose from
  const termOptions = [
    {
      id: 'option-1',
      label: 'Standard',
      years: 1,
      quarters: 4,
      coupon_rate: randomRate(10, 12),
      start_quarter: 'Q1 2025',
    },
    {
      id: 'option-2', 
      label: 'Extended',
      years: 2,
      quarters: 8,
      coupon_rate: randomRate(11, 13),
      start_quarter: 'Q2 2025',
    },
    {
      id: 'option-3',
      label: 'Short-term',
      years: 0.5,
      quarters: 2,
      coupon_rate: randomRate(8, 10),
      start_quarter: 'Q1 2025',
    },
  ];
  
  return {
    id: `mpb-${i + 1}`,
    invoice_number: `INV-2024-SPV${String(i + 1).padStart(3, '0')}`,
    supplier_name: supplierNames[i % supplierNames.length],
    spv_name: spvNames[i % spvNames.length],
    amount,
    offer_amount: Math.round(amount * (1 - discountRate / 100)),
    offer_discount_rate: discountRate,
    // Legacy fields for backward compatibility
    payment_quarters: termOptions[0].quarters,
    payment_start_quarter: termOptions[0].start_quarter,
    quarter_rates: Array.from({ length: termOptions[0].quarters }, () => termOptions[0].coupon_rate),
    // New: Multiple term options
    term_options: termOptions,
    description: descriptions[i % descriptions.length],
    terms_submitted_date: subDays(new Date(), Math.floor(Math.random() * 14) + 1).toISOString(),
  };
});

// ============ MDA UNPAID PAYABLES ============
export const mockUnpaidPayablesData = Array.from({ length: 25 }, (_, i) => {
  const daysOutstanding = Math.floor(Math.random() * 180) + 30;
  const invoiceDate = subDays(new Date(), daysOutstanding);
  const dueDate = subDays(new Date(), daysOutstanding - 30);
  const isOverdue = dueDate < new Date();
  
  return {
    id: `unpaid-${i + 1}`,
    invoice_number: `INV-2024-U${String(i + 1).padStart(3, '0')}`,
    supplier_name: supplierNames[i % supplierNames.length],
    amount: randomAmount(5000000, 100000000),
    invoice_date: invoiceDate.toISOString(),
    due_date: dueDate.toISOString(),
    description: descriptions[i % descriptions.length],
    status: isOverdue ? 'overdue' : 'pending',
    days_outstanding: daysOutstanding,
    category: ['Construction', 'Medical', 'IT Services', 'Logistics', 'Consulting'][Math.floor(Math.random() * 5)],
  };
});

// ============ MDA VERIFIED PAYABLES ============
export const mockVerifiedPayablesData = Array.from({ length: 18 }, (_, i) => {
  const amount = randomAmount(10000000, 80000000);
  const discountRate = randomRate(5, 12);
  
  return {
    id: `verified-${i + 1}`,
    invoice_number: `INV-2024-V${String(i + 1).padStart(3, '0')}`,
    supplier_name: supplierNames[i % supplierNames.length],
    amount,
    invoice_date: subMonths(new Date(), Math.floor(Math.random() * 6) + 1).toISOString(),
    verified_date: subDays(new Date(), Math.floor(Math.random() * 30) + 1).toISOString(),
    description: descriptions[i % descriptions.length],
    status: 'verified',
    spv_offer: Math.round(amount * (1 - discountRate / 100)),
    spv_name: spvNames[Math.floor(Math.random() * spvNames.length)],
  };
});

// ============ MDA TREASURY BILLS ============
export const mockTreasuryBillsData = Array.from({ length: 22 }, (_, i) => {
  const amount = randomAmount(20000000, 150000000);
  const isCertified = Math.random() > 0.4;
  const quarters = [2, 3, 4, 6][Math.floor(Math.random() * 4)];
  
  return {
    id: `treasury-${i + 1}`,
    invoice_number: `INV-2024-T${String(i + 1).padStart(3, '0')}`,
    supplier_name: supplierNames[i % supplierNames.length],
    amount,
    sent_to_treasury: subDays(new Date(), Math.floor(Math.random() * 30) + 1).toISOString(),
    description: descriptions[i % descriptions.length],
    status: isCertified ? 'certified' : 'pending_certification',
    certificate_number: isCertified ? `CERT-2025-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}` : undefined,
    payment_quarters: quarters,
    start_quarter: ['Q1 2025', 'Q2 2025', 'Q3 2025'][Math.floor(Math.random() * 3)],
    mda_name: mdaNames[i % mdaNames.length],
    spv_name: spvNames[Math.floor(Math.random() * spvNames.length)],
  };
});

// ============ TREASURY PENDING BILLS ============
export const mockTreasuryPendingBillsData = Array.from({ length: 20 }, (_, i) => {
  const amount = randomAmount(30000000, 200000000);
  const discountRate = randomRate(5, 12);
  const quarters = [2, 3, 4, 6, 8][Math.floor(Math.random() * 5)];
  
  return {
    id: `tpb-${i + 1}`,
    invoice_number: `INV-2024-M${String(i + 1).padStart(3, '0')}`,
    supplier_name: supplierNames[i % supplierNames.length],
    mda_name: mdaNames[i % mdaNames.length],
    spv_name: spvNames[i % spvNames.length],
    amount,
    offer_amount: Math.round(amount * (1 - discountRate / 100)),
    offer_discount_rate: discountRate,
    mda_approved_date: subDays(new Date(), Math.floor(Math.random() * 20) + 1).toISOString(),
    payment_quarters: quarters,
    payment_start_quarter: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'][Math.floor(Math.random() * 4)],
    description: descriptions[i % descriptions.length],
    contract_reference: `CON-${2024}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    work_period: `${['Jan', 'Feb', 'Mar', 'Apr'][Math.floor(Math.random() * 4)]} - ${['Jun', 'Jul', 'Aug', 'Sep'][Math.floor(Math.random() * 4)]} 2024`,
  };
});

// ============ SUPPLIER RECEIVABLES (MOCK BILLS FOR SUPPLIER VIEW) ============
export const mockSupplierReceivablesData = Array.from({ length: 25 }, (_, i) => {
  const statuses = ['submitted', 'under_review', 'offer_made', 'offer_accepted', 'mda_reviewing', 'mda_approved', 'certified', 'rejected'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const amount = randomAmount(5000000, 100000000);
  const hasOffer = ['offer_made', 'offer_accepted', 'mda_reviewing', 'mda_approved', 'certified'].includes(status);
  const discountRate = randomRate(5, 12);
  
  return {
    id: `supp-bill-${i + 1}`,
    invoice_number: `INV-2024-S${String(i + 1).padStart(3, '0')}`,
    mda_name: mdaNames[i % mdaNames.length],
    mda_id: `mda-${(i % mdaNames.length) + 1}`,
    amount,
    currency: 'NGN',
    invoice_date: subDays(new Date(), Math.floor(Math.random() * 90) + 10).toISOString(),
    due_date: addDays(new Date(), Math.floor(Math.random() * 60)).toISOString(),
    description: descriptions[i % descriptions.length],
    status,
    offer_amount: hasOffer ? Math.round(amount * (1 - discountRate / 100)) : null,
    offer_discount_rate: hasOffer ? discountRate : null,
    offer_date: hasOffer ? subDays(new Date(), Math.floor(Math.random() * 15)).toISOString() : null,
    created_at: subDays(new Date(), Math.floor(Math.random() * 90) + 10).toISOString(),
    certificate_number: status === 'certified' ? `CERT-2025-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}` : null,
    spv_id: hasOffer ? `spv-${Math.floor(Math.random() * 10) + 1}` : null,
    spv_name: hasOffer ? spvNames[Math.floor(Math.random() * spvNames.length)] : null,
  };
});

// ============ SPV BROWSE PAYABLES (Available for Purchase) ============
export const mockSPVBrowsePayablesData = Array.from({ length: 24 }, (_, i) => {
  const amount = randomAmount(10000000, 120000000);
  
  return {
    id: `browse-${i + 1}`,
    supplier_id: `sup-${i + 1}`,
    invoice_number: `INV-2024-B${String(i + 1).padStart(3, '0')}`,
    invoice_date: subDays(new Date(), Math.floor(Math.random() * 60) + 10).toISOString(),
    due_date: addDays(new Date(), Math.floor(Math.random() * 90) + 30).toISOString(),
    amount,
    currency: 'NGN',
    description: descriptions[i % descriptions.length],
    work_description: `Detailed work: ${descriptions[i % descriptions.length]}`,
    contract_reference: `CON-${2024}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    status: 'submitted',
    invoice_document_url: null,
    created_at: subDays(new Date(), Math.floor(Math.random() * 60) + 10).toISOString(),
    mda_id: `mda-${(i % mdaNames.length) + 1}`,
    mda_name: mdaNames[i % mdaNames.length],
    supplier_name: supplierNames[i % supplierNames.length],
    supplier_company: `${supplierNames[i % supplierNames.length]} Holdings`,
    supplier_address: `${Math.floor(Math.random() * 200) + 1} Industrial Road, Nairobi`,
    days_outstanding: Math.floor(Math.random() * 120) + 30,
  };
});

// ============ SPV ALL OFFERS (Historical) ============
export const mockSPVAllOffersData = Array.from({ length: 30 }, (_, i) => {
  const statuses = ['offer_made', 'offer_accepted', 'mda_reviewing', 'mda_approved', 'certified', 'rejected'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const amount = randomAmount(15000000, 150000000);
  const discountRate = randomRate(5, 12);
  const wasRejectedBySupplier = status === 'offer_made' && Math.random() > 0.7;
  
  return {
    id: `offer-${i + 1}`,
    invoice_number: `INV-2024-O${String(i + 1).padStart(3, '0')}`,
    supplier_name: supplierNames[i % supplierNames.length],
    mda_name: mdaNames[i % mdaNames.length],
    mda_id: `mda-${(i % mdaNames.length) + 1}`,
    supplier_id: `sup-${i + 1}`,
    amount,
    offer_amount: Math.round(amount * (1 - discountRate / 100)),
    offer_discount_rate: discountRate,
    status,
    offer_date: subDays(new Date(), Math.floor(Math.random() * 60) + 1).toISOString(),
    created_at: subDays(new Date(), Math.floor(Math.random() * 90) + 1).toISOString(),
    rejection_reason: wasRejectedBySupplier ? 'Discount rate too high. Please revise offer.' : null,
    last_rejected_by_supplier: wasRejectedBySupplier,
    last_rejection_date: wasRejectedBySupplier ? subDays(new Date(), Math.floor(Math.random() * 5) + 1).toISOString() : null,
  };
});

// ============ TREASURY CERTIFIED BILLS ============
export const mockTreasuryCertifiedBillsData = Array.from({ length: 22 }, (_, i) => {
  const amount = randomAmount(25000000, 180000000);
  const discountRate = randomRate(5, 12);
  const quarters = [2, 3, 4, 6][Math.floor(Math.random() * 4)];
  
  return {
    id: `cert-${i + 1}`,
    invoice_number: `INV-2024-C${String(i + 1).padStart(3, '0')}`,
    supplier_name: supplierNames[i % supplierNames.length],
    mda_name: mdaNames[i % mdaNames.length],
    spv_name: spvNames[i % spvNames.length],
    amount,
    offer_amount: Math.round(amount * (1 - discountRate / 100)),
    discount_rate: discountRate,
    certificate_number: `CERT-2025-${String(i + 10000).padStart(5, '0')}`,
    certified_date: subDays(new Date(), Math.floor(Math.random() * 30) + 1).toISOString(),
    payment_quarters: quarters,
    payment_start_quarter: ['Q1 2025', 'Q2 2025'][Math.floor(Math.random() * 2)],
    description: descriptions[i % descriptions.length],
    blockchain_deed_id: `deed-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
  };
});

// Export summary stats generators
export const getPayablesStats = () => ({
  totalUnpaid: mockUnpaidPayablesData.length,
  totalUnpaidValue: mockUnpaidPayablesData.reduce((sum, p) => sum + p.amount, 0),
  totalVerified: mockVerifiedPayablesData.length,
  totalVerifiedValue: mockVerifiedPayablesData.reduce((sum, p) => sum + p.amount, 0),
  totalTreasury: mockTreasuryBillsData.length,
  totalTreasuryValue: mockTreasuryBillsData.reduce((sum, p) => sum + p.amount, 0),
  pendingCertification: mockTreasuryBillsData.filter(b => b.status === 'pending_certification').length,
  certified: mockTreasuryBillsData.filter(b => b.status === 'certified').length,
});

export const getTreasuryStats = () => ({
  totalPending: mockTreasuryPendingBillsData.length,
  totalValue: mockTreasuryPendingBillsData.reduce((sum, b) => sum + b.amount, 0),
  totalCertified: mockTreasuryCertifiedBillsData.length,
  certifiedValue: mockTreasuryCertifiedBillsData.reduce((sum, b) => sum + b.amount, 0),
});

export const getSPVStats = () => ({
  acceptedNeedTerms: mockAcceptedOffersData.length,
  totalOffers: mockSPVAllOffersData.length,
  browsablePayables: mockSPVBrowsePayablesData.length,
  totalBrowsableValue: mockSPVBrowsePayablesData.reduce((sum, b) => sum + b.amount, 0),
});
