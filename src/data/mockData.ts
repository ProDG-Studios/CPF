// Comprehensive mock data store - all data cached in memory

export interface PendingBillRange {
  range: string;
  rangeMin: number;
  rangeMax: number;
  numberOfBills: number;
  amountBillion: number;
  cumulativeByNumber: number;
  cumulativeByValue: number;
  percentByNumber: number;
  percentByValue: number;
}

export interface MDA {
  id: string;
  name: string;
  shortName: string;
  totalBills: number;
  totalAmount: number;
  verifiedBills: number;
  verifiedAmount: number;
  pendingBills: number;
  pendingAmount: number;
  category: 'ministry' | 'agency' | 'county';
}

export interface Supplier {
  id: string;
  name: string;
  registrationNo: string;
  category: string;
  totalBills: number;
  totalAmount: number;
  verifiedAmount: number;
  pendingAmount: number;
  status: 'active' | 'suspended' | 'verified';
  county: string;
  contactEmail: string;
}

export interface Bill {
  id: string;
  supplierId: string;
  supplierName: string;
  mdaId: string;
  mdaName: string;
  amount: number;
  originalAmount: number;
  invoiceDate: string;
  dueDate: string;
  status: 'verified' | 'pending' | 'processing' | 'rejected' | 'paid';
  verificationDate?: string;
  paymentDate?: string;
  category: string;
  description: string;
  fiscalYear: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TransactionStep {
  step: number;
  title: string;
  description: string;
  entity: string;
  entityType: 'supplier' | 'mda' | 'treasury' | 'spv' | 'investor';
  status: 'completed' | 'active' | 'pending';
  completedDate?: string;
  estimatedDate?: string;
  documents: string[];
  responsible: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'payment' | 'verification' | 'document';
  amount?: number;
  status: 'completed' | 'upcoming' | 'in-progress';
}

export interface MonthlyTrend {
  month: string;
  verified: number;
  pending: number;
  paid: number;
  totalAmount: number;
}

// ============ MOCK DATA ============

export const pendingBillsData: PendingBillRange[] = [
  { range: "1 - 500K", rangeMin: 1, rangeMax: 500000, numberOfBills: 22346, amountBillion: 8.37, cumulativeByNumber: 22346, cumulativeByValue: 8.37, percentByNumber: 79, percentByValue: 5 },
  { range: "500K - 1M", rangeMin: 500000, rangeMax: 1000000, numberOfBills: 1595, amountBillion: 1.34, cumulativeByNumber: 23941, cumulativeByValue: 9.70, percentByNumber: 85, percentByValue: 6 },
  { range: "1M - 2M", rangeMin: 1000000, rangeMax: 2000000, numberOfBills: 1425, amountBillion: 3.00, cumulativeByNumber: 25366, cumulativeByValue: 12.70, percentByNumber: 90, percentByValue: 8 },
  { range: "2M - 5M", rangeMin: 2000000, rangeMax: 5000000, numberOfBills: 1289, amountBillion: 6.44, cumulativeByNumber: 26655, cumulativeByValue: 19.15, percentByNumber: 95, percentByValue: 12 },
  { range: "5M - 10M", rangeMin: 5000000, rangeMax: 10000000, numberOfBills: 365, amountBillion: 2.52, cumulativeByNumber: 27020, cumulativeByValue: 21.67, percentByNumber: 96, percentByValue: 14 },
  { range: "10M - 50M", rangeMin: 10000000, rangeMax: 50000000, numberOfBills: 640, amountBillion: 7.49, cumulativeByNumber: 27660, cumulativeByValue: 29.15, percentByNumber: 98, percentByValue: 19 },
  { range: "50M - 100M", rangeMin: 50000000, rangeMax: 100000000, numberOfBills: 198, amountBillion: 10.72, cumulativeByNumber: 27858, cumulativeByValue: 39.88, percentByNumber: 99, percentByValue: 26 },
  { range: "100M - 500M", rangeMin: 100000000, rangeMax: 500000000, numberOfBills: 170, amountBillion: 29.27, cumulativeByNumber: 28028, cumulativeByValue: 69.15, percentByNumber: 99, percentByValue: 45 },
  { range: "500M - 1B", rangeMin: 500000000, rangeMax: 1000000000, numberOfBills: 138, amountBillion: 40.98, cumulativeByNumber: 28166, cumulativeByValue: 110.12, percentByNumber: 100, percentByValue: 71 },
  { range: "Above 1B", rangeMin: 1000000000, rangeMax: Infinity, numberOfBills: 24, amountBillion: 45.04, cumulativeByNumber: 28190, cumulativeByValue: 155.1, percentByNumber: 100, percentByValue: 100 },
];

export const mdaData: MDA[] = [
  { id: "mda-001", name: "Ministry of Roads & Infrastructure", shortName: "Roads", totalBills: 3420, totalAmount: 28500000000, verifiedBills: 2100, verifiedAmount: 15200000000, pendingBills: 1320, pendingAmount: 13300000000, category: "ministry" },
  { id: "mda-002", name: "Ministry of Health", shortName: "Health", totalBills: 4850, totalAmount: 22300000000, verifiedBills: 3200, verifiedAmount: 14500000000, pendingBills: 1650, pendingAmount: 7800000000, category: "ministry" },
  { id: "mda-003", name: "Ministry of Education", shortName: "Education", totalBills: 5200, totalAmount: 18700000000, verifiedBills: 4100, verifiedAmount: 12800000000, pendingBills: 1100, pendingAmount: 5900000000, category: "ministry" },
  { id: "mda-004", name: "Ministry of Water & Sanitation", shortName: "Water", totalBills: 2100, totalAmount: 15400000000, verifiedBills: 1400, verifiedAmount: 9200000000, pendingBills: 700, pendingAmount: 6200000000, category: "ministry" },
  { id: "mda-005", name: "Ministry of ICT & Digital Economy", shortName: "ICT", totalBills: 890, totalAmount: 8900000000, verifiedBills: 650, verifiedAmount: 6100000000, pendingBills: 240, pendingAmount: 2800000000, category: "ministry" },
  { id: "mda-006", name: "Ministry of Agriculture", shortName: "Agriculture", totalBills: 3100, totalAmount: 12600000000, verifiedBills: 2300, verifiedAmount: 8900000000, pendingBills: 800, pendingAmount: 3700000000, category: "ministry" },
  { id: "mda-007", name: "Kenya Ports Authority", shortName: "KPA", totalBills: 420, totalAmount: 9800000000, verifiedBills: 320, verifiedAmount: 7200000000, pendingBills: 100, pendingAmount: 2600000000, category: "agency" },
  { id: "mda-008", name: "Kenya Power & Lighting", shortName: "KPLC", totalBills: 680, totalAmount: 11200000000, verifiedBills: 520, verifiedAmount: 8400000000, pendingBills: 160, pendingAmount: 2800000000, category: "agency" },
  { id: "mda-009", name: "Nairobi County Government", shortName: "Nairobi", totalBills: 2800, totalAmount: 14500000000, verifiedBills: 1900, verifiedAmount: 9800000000, pendingBills: 900, pendingAmount: 4700000000, category: "county" },
  { id: "mda-010", name: "Mombasa County Government", shortName: "Mombasa", totalBills: 1200, totalAmount: 6800000000, verifiedBills: 850, verifiedAmount: 4600000000, pendingBills: 350, pendingAmount: 2200000000, category: "county" },
  { id: "mda-011", name: "Kisumu County Government", shortName: "Kisumu", totalBills: 980, totalAmount: 4200000000, verifiedBills: 720, verifiedAmount: 3100000000, pendingBills: 260, pendingAmount: 1100000000, category: "county" },
  { id: "mda-012", name: "Ministry of Defence", shortName: "Defence", totalBills: 450, totalAmount: 8900000000, verifiedBills: 380, verifiedAmount: 7200000000, pendingBills: 70, pendingAmount: 1700000000, category: "ministry" },
];

export const supplierData: Supplier[] = [
  { id: "sup-001", name: "Kenyan Building Solutions Ltd", registrationNo: "PVT-2015-0234", category: "Construction", totalBills: 45, totalAmount: 892000000, verifiedAmount: 650000000, pendingAmount: 242000000, status: "verified", county: "Nairobi", contactEmail: "info@kbsolutions.co.ke" },
  { id: "sup-002", name: "East Africa Medical Supplies", registrationNo: "PVT-2012-1456", category: "Medical Equipment", totalBills: 128, totalAmount: 456000000, verifiedAmount: 380000000, pendingAmount: 76000000, status: "verified", county: "Nairobi", contactEmail: "procurement@eams.co.ke" },
  { id: "sup-003", name: "Safari Tech Systems", registrationNo: "PVT-2018-0892", category: "IT Services", totalBills: 67, totalAmount: 234000000, verifiedAmount: 180000000, pendingAmount: 54000000, status: "active", county: "Nairobi", contactEmail: "sales@safaritech.co.ke" },
  { id: "sup-004", name: "Nairobi Furniture Co.", registrationNo: "PVT-2010-0567", category: "Furniture", totalBills: 89, totalAmount: 123000000, verifiedAmount: 98000000, pendingAmount: 25000000, status: "verified", county: "Nairobi", contactEmail: "orders@nairobifurn.co.ke" },
  { id: "sup-005", name: "Lake Region Contractors", registrationNo: "PVT-2014-0345", category: "Construction", totalBills: 34, totalAmount: 1250000000, verifiedAmount: 890000000, pendingAmount: 360000000, status: "active", county: "Kisumu", contactEmail: "tenders@lakeregion.co.ke" },
  { id: "sup-006", name: "Mombasa Port Services", registrationNo: "PVT-2016-0789", category: "Logistics", totalBills: 56, totalAmount: 567000000, verifiedAmount: 420000000, pendingAmount: 147000000, status: "verified", county: "Mombasa", contactEmail: "ops@mpslogistics.co.ke" },
  { id: "sup-007", name: "Highland Pharma Ltd", registrationNo: "PVT-2011-0234", category: "Pharmaceuticals", totalBills: 234, totalAmount: 789000000, verifiedAmount: 650000000, pendingAmount: 139000000, status: "verified", county: "Nakuru", contactEmail: "supply@highlandpharma.co.ke" },
  { id: "sup-008", name: "Rift Valley Motors", registrationNo: "PVT-2013-0456", category: "Automotive", totalBills: 23, totalAmount: 345000000, verifiedAmount: 280000000, pendingAmount: 65000000, status: "active", county: "Eldoret", contactEmail: "fleet@rvmotors.co.ke" },
  { id: "sup-009", name: "Coastal Catering Services", registrationNo: "PVT-2017-0678", category: "Food & Beverages", totalBills: 167, totalAmount: 89000000, verifiedAmount: 72000000, pendingAmount: 17000000, status: "verified", county: "Mombasa", contactEmail: "events@coastalcatering.co.ke" },
  { id: "sup-010", name: "Mount Kenya Supplies", registrationNo: "PVT-2019-0123", category: "General Supplies", totalBills: 312, totalAmount: 156000000, verifiedAmount: 120000000, pendingAmount: 36000000, status: "active", county: "Nyeri", contactEmail: "orders@mtkenyasupplies.co.ke" },
  { id: "sup-011", name: "Turkana Solar Solutions", registrationNo: "PVT-2020-0567", category: "Energy", totalBills: 18, totalAmount: 678000000, verifiedAmount: 450000000, pendingAmount: 228000000, status: "active", county: "Turkana", contactEmail: "projects@turkanasolar.co.ke" },
  { id: "sup-012", name: "Western Kenya Textiles", registrationNo: "PVT-2009-0890", category: "Textiles", totalBills: 78, totalAmount: 234000000, verifiedAmount: 190000000, pendingAmount: 44000000, status: "verified", county: "Kakamega", contactEmail: "sales@wktextiles.co.ke" },
];

export const billsData: Bill[] = [
  { id: "PB-2024-00001", supplierId: "sup-001", supplierName: "Kenyan Building Solutions Ltd", mdaId: "mda-001", mdaName: "Ministry of Roads & Infrastructure", amount: 1850000, originalAmount: 1850000, invoiceDate: "2023-06-15", dueDate: "2023-09-15", status: "verified", verificationDate: "2024-01-10", category: "Construction", description: "Road rehabilitation - Thika Highway Section B", fiscalYear: "2023/24", priority: "high" },
  { id: "PB-2024-00002", supplierId: "sup-002", supplierName: "East Africa Medical Supplies", mdaId: "mda-002", mdaName: "Ministry of Health", amount: 975000, originalAmount: 975000, invoiceDate: "2023-07-20", dueDate: "2023-10-20", status: "verified", verificationDate: "2024-01-08", category: "Medical Equipment", description: "Medical equipment for Kenyatta National Hospital", fiscalYear: "2023/24", priority: "high" },
  { id: "PB-2024-00003", supplierId: "sup-003", supplierName: "Safari Tech Systems", mdaId: "mda-005", mdaName: "Ministry of ICT & Digital Economy", amount: 1450000, originalAmount: 1500000, invoiceDate: "2023-08-10", dueDate: "2023-11-10", status: "processing", category: "IT Services", description: "Government portal development Phase 2", fiscalYear: "2023/24", priority: "medium" },
  { id: "PB-2024-00004", supplierId: "sup-004", supplierName: "Nairobi Furniture Co.", mdaId: "mda-003", mdaName: "Ministry of Education", amount: 680000, originalAmount: 680000, invoiceDate: "2023-05-25", dueDate: "2023-08-25", status: "pending", category: "Furniture", description: "School desks for Nairobi primary schools", fiscalYear: "2023/24", priority: "low" },
  { id: "PB-2024-00005", supplierId: "sup-005", supplierName: "Lake Region Contractors", mdaId: "mda-004", mdaName: "Ministry of Water & Sanitation", amount: 1920000, originalAmount: 1920000, invoiceDate: "2023-04-12", dueDate: "2023-07-12", status: "verified", verificationDate: "2024-01-12", category: "Construction", description: "Water pipeline extension - Kisumu County", fiscalYear: "2023/24", priority: "high" },
  { id: "PB-2024-00006", supplierId: "sup-006", supplierName: "Mombasa Port Services", mdaId: "mda-007", mdaName: "Kenya Ports Authority", amount: 1200000, originalAmount: 1200000, invoiceDate: "2023-09-05", dueDate: "2023-12-05", status: "processing", category: "Logistics", description: "Port cargo handling services Q3", fiscalYear: "2023/24", priority: "medium" },
  { id: "PB-2024-00007", supplierId: "sup-007", supplierName: "Highland Pharma Ltd", mdaId: "mda-002", mdaName: "Ministry of Health", amount: 890000, originalAmount: 890000, invoiceDate: "2023-03-18", dueDate: "2023-06-18", status: "paid", verificationDate: "2023-12-01", paymentDate: "2024-01-05", category: "Pharmaceuticals", description: "Essential medicines supply contract", fiscalYear: "2022/23", priority: "high" },
  { id: "PB-2024-00008", supplierId: "sup-008", supplierName: "Rift Valley Motors", mdaId: "mda-012", mdaName: "Ministry of Defence", amount: 1780000, originalAmount: 1800000, invoiceDate: "2023-02-28", dueDate: "2023-05-28", status: "verified", verificationDate: "2024-01-15", category: "Automotive", description: "Vehicle fleet maintenance contract", fiscalYear: "2022/23", priority: "medium" },
  { id: "PB-2024-00009", supplierId: "sup-009", supplierName: "Coastal Catering Services", mdaId: "mda-009", mdaName: "Nairobi County Government", amount: 450000, originalAmount: 450000, invoiceDate: "2023-10-10", dueDate: "2024-01-10", status: "pending", category: "Food & Beverages", description: "Event catering services", fiscalYear: "2023/24", priority: "low" },
  { id: "PB-2024-00010", supplierId: "sup-010", supplierName: "Mount Kenya Supplies", mdaId: "mda-003", mdaName: "Ministry of Education", amount: 320000, originalAmount: 320000, invoiceDate: "2023-11-15", dueDate: "2024-02-15", status: "pending", category: "General Supplies", description: "Office supplies for district offices", fiscalYear: "2023/24", priority: "low" },
  { id: "PB-2024-00011", supplierId: "sup-011", supplierName: "Turkana Solar Solutions", mdaId: "mda-008", mdaName: "Kenya Power & Lighting", amount: 1950000, originalAmount: 2000000, invoiceDate: "2023-01-20", dueDate: "2023-04-20", status: "verified", verificationDate: "2024-01-18", category: "Energy", description: "Solar installation - Turkana County schools", fiscalYear: "2022/23", priority: "high" },
  { id: "PB-2024-00012", supplierId: "sup-012", supplierName: "Western Kenya Textiles", mdaId: "mda-002", mdaName: "Ministry of Health", amount: 560000, originalAmount: 560000, invoiceDate: "2023-08-25", dueDate: "2023-11-25", status: "processing", category: "Textiles", description: "Hospital bed linens and uniforms", fiscalYear: "2023/24", priority: "medium" },
  { id: "PB-2024-00013", supplierId: "sup-001", supplierName: "Kenyan Building Solutions Ltd", mdaId: "mda-001", mdaName: "Ministry of Roads & Infrastructure", amount: 1650000, originalAmount: 1650000, invoiceDate: "2023-07-08", dueDate: "2023-10-08", status: "verified", verificationDate: "2024-01-20", category: "Construction", description: "Bridge construction - Nyeri bypass", fiscalYear: "2023/24", priority: "high" },
  { id: "PB-2024-00014", supplierId: "sup-002", supplierName: "East Africa Medical Supplies", mdaId: "mda-002", mdaName: "Ministry of Health", amount: 1120000, originalAmount: 1150000, invoiceDate: "2023-09-12", dueDate: "2023-12-12", status: "processing", category: "Medical Equipment", description: "Dialysis machines for county hospitals", fiscalYear: "2023/24", priority: "high" },
  { id: "PB-2024-00015", supplierId: "sup-005", supplierName: "Lake Region Contractors", mdaId: "mda-001", mdaName: "Ministry of Roads & Infrastructure", amount: 1890000, originalAmount: 1890000, invoiceDate: "2023-06-30", dueDate: "2023-09-30", status: "pending", category: "Construction", description: "Drainage system upgrade - Kisumu CBD", fiscalYear: "2023/24", priority: "medium" },
  { id: "PB-2024-00016", supplierId: "sup-003", supplierName: "Safari Tech Systems", mdaId: "mda-005", mdaName: "Ministry of ICT & Digital Economy", amount: 780000, originalAmount: 780000, invoiceDate: "2023-04-05", dueDate: "2023-07-05", status: "paid", verificationDate: "2023-11-15", paymentDate: "2023-12-20", category: "IT Services", description: "Cybersecurity audit and implementation", fiscalYear: "2022/23", priority: "high" },
  { id: "PB-2024-00017", supplierId: "sup-006", supplierName: "Mombasa Port Services", mdaId: "mda-010", mdaName: "Mombasa County Government", amount: 920000, originalAmount: 920000, invoiceDate: "2023-05-18", dueDate: "2023-08-18", status: "verified", verificationDate: "2024-01-22", category: "Logistics", description: "Waste management logistics contract", fiscalYear: "2023/24", priority: "medium" },
  { id: "PB-2024-00018", supplierId: "sup-007", supplierName: "Highland Pharma Ltd", mdaId: "mda-011", mdaName: "Kisumu County Government", amount: 670000, originalAmount: 670000, invoiceDate: "2023-10-25", dueDate: "2024-01-25", status: "pending", category: "Pharmaceuticals", description: "Medical supplies for county health centers", fiscalYear: "2023/24", priority: "high" },
  { id: "PB-2024-00019", supplierId: "sup-004", supplierName: "Nairobi Furniture Co.", mdaId: "mda-009", mdaName: "Nairobi County Government", amount: 890000, originalAmount: 900000, invoiceDate: "2023-03-10", dueDate: "2023-06-10", status: "verified", verificationDate: "2024-01-08", category: "Furniture", description: "Office furniture for county assembly", fiscalYear: "2022/23", priority: "low" },
  { id: "PB-2024-00020", supplierId: "sup-010", supplierName: "Mount Kenya Supplies", mdaId: "mda-006", mdaName: "Ministry of Agriculture", amount: 420000, originalAmount: 420000, invoiceDate: "2023-08-02", dueDate: "2023-11-02", status: "processing", category: "General Supplies", description: "Agricultural extension supplies", fiscalYear: "2023/24", priority: "medium" },
];

// Payment Schedule interface for MDA repayment plans
export interface PaymentSchedule {
  id: string;
  mdaId: string;
  mdaName: string;
  fiscalYear: string;
  quarterlyPayments: {
    quarter: string;
    amount: number;
    status: 'paid' | 'due' | 'upcoming';
    dueDate: string;
    paidDate?: string;
  }[];
  totalCommitted: number;
  totalPaid: number;
}

export const paymentSchedules: PaymentSchedule[] = [
  {
    id: "ps-001",
    mdaId: "mda-001",
    mdaName: "Ministry of Roads & Infrastructure",
    fiscalYear: "2024/25",
    quarterlyPayments: [
      { quarter: "Q1 2024/25", amount: 3325000000, status: "paid", dueDate: "2024-09-30", paidDate: "2024-09-28" },
      { quarter: "Q2 2024/25", amount: 3325000000, status: "due", dueDate: "2024-12-31" },
      { quarter: "Q3 2024/25", amount: 3325000000, status: "upcoming", dueDate: "2025-03-31" },
      { quarter: "Q4 2024/25", amount: 3325000000, status: "upcoming", dueDate: "2025-06-30" },
    ],
    totalCommitted: 13300000000,
    totalPaid: 3325000000,
  },
  {
    id: "ps-002",
    mdaId: "mda-002",
    mdaName: "Ministry of Health",
    fiscalYear: "2024/25",
    quarterlyPayments: [
      { quarter: "Q1 2024/25", amount: 1950000000, status: "paid", dueDate: "2024-09-30", paidDate: "2024-09-25" },
      { quarter: "Q2 2024/25", amount: 1950000000, status: "due", dueDate: "2024-12-31" },
      { quarter: "Q3 2024/25", amount: 1950000000, status: "upcoming", dueDate: "2025-03-31" },
      { quarter: "Q4 2024/25", amount: 1950000000, status: "upcoming", dueDate: "2025-06-30" },
    ],
    totalCommitted: 7800000000,
    totalPaid: 1950000000,
  },
  {
    id: "ps-003",
    mdaId: "mda-003",
    mdaName: "Ministry of Education",
    fiscalYear: "2024/25",
    quarterlyPayments: [
      { quarter: "Q1 2024/25", amount: 1475000000, status: "paid", dueDate: "2024-09-30", paidDate: "2024-09-30" },
      { quarter: "Q2 2024/25", amount: 1475000000, status: "due", dueDate: "2024-12-31" },
      { quarter: "Q3 2024/25", amount: 1475000000, status: "upcoming", dueDate: "2025-03-31" },
      { quarter: "Q4 2024/25", amount: 1475000000, status: "upcoming", dueDate: "2025-06-30" },
    ],
    totalCommitted: 5900000000,
    totalPaid: 1475000000,
  },
];

export const transactionSteps: TransactionStep[] = [
  { step: 1, title: "Bill Submission & Verification", description: "Suppliers submit invoices for verification. MDA validates the authenticity, completeness, and eligibility of each pending bill against contract records.", entity: "MDAs (Obligor)", entityType: "mda", status: "completed", completedDate: "2024-01-02", documents: ["Invoice Package", "Contract Reference", "Delivery Confirmation", "Goods Receipt Note"], responsible: "MDA Verification Committee" },
  { step: 2, title: "MDA Payment Plan Approval", description: "MDA prepares and approves a payment schedule committing future budget allocations to service the verified pending bills over the agreed repayment period.", entity: "MDAs (Obligor)", entityType: "mda", status: "completed", completedDate: "2024-01-04", documents: ["Payment Schedule", "Budget Commitment Letter", "Cash Flow Projections", "Accounting Officer Approval"], responsible: "MDA Accounting Officer" },
  { step: 3, title: "Receivables Sale Agreement", description: "Supplier signs receivables sale agreement to SPV and introduces the SPV to MDA to consent to terms.", entity: "Suppliers (Originator)", entityType: "supplier", status: "completed", completedDate: "2024-01-05", documents: ["Sale Agreement", "Supplier KYC Documents", "Tax Compliance Certificate"], responsible: "Supplier Legal Team" },
  { step: 4, title: "MDA Consent & Authorization", description: "MDA consents to the sale, confirms the payment plan, and authorizes NT to debit its budget vote to pay suppliers for the agreed period.", entity: "MDAs (Obligor)", entityType: "mda", status: "completed", completedDate: "2024-01-08", documents: ["Consent Letter", "Budget Authorization", "Verification Certificate", "Payment Plan Confirmation"], responsible: "MDA Accounting Officer" },
  { step: 5, title: "Agreement Forward to Treasury", description: "MDA forwards agreement with supplier and approved payment schedule to NT for implementation.", entity: "MDAs (Obligor)", entityType: "mda", status: "completed", completedDate: "2024-01-10", documents: ["Forwarding Letter", "Complete Agreement Package", "Payment Schedule"], responsible: "MDA Finance Department" },
  { step: 6, title: "Servicer Agreement", description: "NT signs a servicer agreement with SPV, commits to the payment schedule, and facilitates SPV to pay supplier.", entity: "National Treasury (Fiscal Agent)", entityType: "treasury", status: "active", estimatedDate: "2024-01-20", documents: ["Servicer Agreement", "Payment Schedule", "Collection Mandate", "IFMIS Integration Docs"], responsible: "National Treasury" },
  { step: 7, title: "Bond Issuance", description: "SPV pools verified receivables and issues the Pending Bills Liquidation Bond backed by Treasury payment commitments.", entity: "SPV (Issuer)", entityType: "spv", status: "pending", estimatedDate: "2024-02-01", documents: ["Bond Prospectus", "Credit Rating Report", "Legal Opinion", "Receivables Schedule"], responsible: "SPV / Transaction Advisors" },
  { step: 8, title: "Investment Flow", description: "Pension funds and institutional investors purchase the bond. Funds flow into the SPV.", entity: "Investors", entityType: "investor", status: "pending", estimatedDate: "2024-02-15", documents: ["Investment Agreement", "Fund Transfer Confirmations", "Investor KYC"], responsible: "Pension Funds / Investors" },
  { step: 9, title: "Supplier Payment", description: "SPV uses investor funds to immediately settle verified supplier bills. Provides confirmation to NT & MDAs.", entity: "SPV (Issuer)", entityType: "spv", status: "pending", estimatedDate: "2024-02-20", documents: ["Payment Instructions", "Bank Confirmations", "Receipt Acknowledgments"], responsible: "SPV Payment Team" },
  { step: 10, title: "NSE Listing", description: "SPV lists the bond on the NSE for secondary trading, providing investor liquidity.", entity: "SPV (Issuer)", entityType: "spv", status: "pending", estimatedDate: "2024-03-01", documents: ["NSE Listing Application", "Trading Memorandum", "Market Maker Agreement"], responsible: "SPV / NSE" },
  { step: 11, title: "Treasury Servicing", description: "NT pays the SPV quarterly as per the agreed payment schedule. SPV uses these to service bond interest and principal.", entity: "National Treasury (Fiscal Agent)", entityType: "treasury", status: "pending", estimatedDate: "2024-03-15", documents: ["Quarterly Payment Schedule", "Settlement Confirmations", "Investor Distribution Report"], responsible: "National Treasury" },
];

export const timelineEvents: TimelineEvent[] = [
  { id: "evt-001", date: "2024-01-05", title: "Phase 1 Kickoff", description: "Official launch of the Pending Bills Securitization Program", type: "milestone", status: "completed" },
  { id: "evt-002", date: "2024-01-10", title: "First Batch Verification", description: "1,250 bills verified totaling KES 2.1B", type: "verification", amount: 2100000000, status: "completed" },
  { id: "evt-003", date: "2024-01-15", title: "MDA Consent Received", description: "All 12 pilot MDAs have submitted consent letters", type: "document", status: "completed" },
  { id: "evt-004", date: "2024-01-20", title: "Treasury Agreement", description: "National Treasury to sign servicer agreement", type: "milestone", status: "in-progress" },
  { id: "evt-005", date: "2024-02-01", title: "Bond Issuance", description: "Launch of Pending Bills Liquidation Bond", type: "milestone", status: "upcoming" },
  { id: "evt-006", date: "2024-02-15", title: "First Investor Tranche", description: "Expected first tranche of KES 5B from pension funds", type: "payment", amount: 5000000000, status: "upcoming" },
  { id: "evt-007", date: "2024-02-20", title: "Supplier Payments Begin", description: "First batch of supplier payments to be disbursed", type: "payment", amount: 2100000000, status: "upcoming" },
  { id: "evt-008", date: "2024-03-01", title: "NSE Listing", description: "Bond to be listed on Nairobi Securities Exchange", type: "milestone", status: "upcoming" },
];

export const monthlyTrends: MonthlyTrend[] = [
  { month: "Jul 2023", verified: 1200, pending: 4500, paid: 200, totalAmount: 8.5 },
  { month: "Aug 2023", verified: 1800, pending: 4200, paid: 450, totalAmount: 12.3 },
  { month: "Sep 2023", verified: 2400, pending: 3800, paid: 680, totalAmount: 15.8 },
  { month: "Oct 2023", verified: 3100, pending: 3400, paid: 920, totalAmount: 19.2 },
  { month: "Nov 2023", verified: 3800, pending: 3000, paid: 1350, totalAmount: 22.7 },
  { month: "Dec 2023", verified: 4500, pending: 2600, paid: 1800, totalAmount: 26.4 },
  { month: "Jan 2024", verified: 5200, pending: 2200, paid: 2400, totalAmount: 30.1 },
];

export const totalStats = {
  totalBills: 28190,
  totalAmountBillion: 155.1,
  eligibleBills: 25366,
  eligibleAmountBillion: 12.70,
  verifiedBills: 15420,
  verifiedAmountBillion: 45.8,
  paidBills: 2400,
  paidAmountBillion: 8.2,
  processingBills: 4200,
  processingAmountBillion: 18.5,
};

export const categoryBreakdown = [
  { category: "Construction", bills: 8420, amount: 52.3, percentage: 34 },
  { category: "Medical Equipment", bills: 4850, amount: 28.7, percentage: 18 },
  { category: "IT Services", bills: 2340, amount: 15.2, percentage: 10 },
  { category: "Logistics", bills: 3120, amount: 18.9, percentage: 12 },
  { category: "Pharmaceuticals", bills: 2890, amount: 12.4, percentage: 8 },
  { category: "General Supplies", bills: 4200, amount: 16.8, percentage: 11 },
  { category: "Others", bills: 2370, amount: 10.8, percentage: 7 },
];

export const countyBreakdown = [
  { county: "Nairobi", bills: 8500, amount: 45.2 },
  { county: "Mombasa", bills: 3200, amount: 18.7 },
  { county: "Kisumu", bills: 2100, amount: 12.4 },
  { county: "Nakuru", bills: 1800, amount: 9.8 },
  { county: "Eldoret", bills: 1500, amount: 8.2 },
  { county: "Nyeri", bills: 1200, amount: 6.5 },
  { county: "Other Counties", bills: 9890, amount: 54.3 },
];

// Helper functions
export const formatCurrency = (amount: number, compact = false): string => {
  if (compact && amount >= 1000000000) {
    return `KES ${(amount / 1000000000).toFixed(1)}B`;
  }
  if (compact && amount >= 1000000) {
    return `KES ${(amount / 1000000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    verified: 'bg-success/20 text-success',
    pending: 'bg-warning/20 text-warning',
    processing: 'bg-primary/20 text-primary',
    rejected: 'bg-destructive/20 text-destructive',
    paid: 'bg-secondary/20 text-secondary',
    completed: 'bg-success/20 text-success',
    active: 'bg-accent/20 text-accent',
    upcoming: 'bg-muted text-muted-foreground',
    'in-progress': 'bg-primary/20 text-primary',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
};
