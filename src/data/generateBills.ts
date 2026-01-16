// Extended mock data generator for realistic POC
import { Bill, Supplier, MDA } from './mockData';

const supplierNames = [
  "Kenyan Building Solutions Ltd", "East Africa Medical Supplies", "Safari Tech Systems",
  "Nairobi Furniture Co.", "Lake Region Contractors", "Mombasa Port Services",
  "Highland Pharma Ltd", "Rift Valley Motors", "Coastal Catering Services",
  "Mount Kenya Supplies", "Turkana Solar Solutions", "Western Kenya Textiles",
  "Nairobi Infrastructure Group", "Kenya Medical Technologies", "Digital Solutions EA",
  "Office Excellence Ltd", "Great Rift Constructors", "Pwani Shipping Services",
  "Central Pharmaceutical Co.", "Eldoret Auto Works", "Ocean View Catering",
  "Nyeri General Supplies", "Northern Solar Ltd", "Lakeview Textiles Ltd",
  "Capital Construction Ltd", "MedEquip East Africa", "TechVision Kenya",
  "Premier Office Solutions", "Unity Builders Ltd", "Maritime Logistics Co."
];

const mdaShortNames = [
  "Roads", "Health", "Education", "Water", "ICT", "Agriculture",
  "KPA", "KPLC", "Nairobi", "Mombasa", "Kisumu", "Defence"
];

const categories = [
  "Construction", "Medical Equipment", "IT Services", "Furniture",
  "Logistics", "Pharmaceuticals", "Automotive", "Food & Beverages",
  "General Supplies", "Energy", "Textiles", "Consulting"
];

const descriptions = [
  "Road rehabilitation project Phase",
  "Medical equipment procurement for",
  "Government portal development and maintenance",
  "Office furniture supply for",
  "Water pipeline extension project",
  "Port cargo handling services",
  "Essential medicines supply contract",
  "Vehicle fleet maintenance and repair",
  "Event catering and hospitality services",
  "Office supplies and stationery",
  "Solar installation and maintenance",
  "Hospital uniforms and textiles",
  "Bridge construction project",
  "Dialysis machines procurement",
  "Drainage system upgrade",
  "Cybersecurity implementation",
  "Waste management services",
  "County health center supplies",
  "Assembly furniture and fittings",
  "Agricultural extension supplies"
];

const fiscalYears = ["2022/23", "2023/24", "2024/25"];
const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
const statuses: Bill['status'][] = ['verified', 'pending', 'processing', 'paid'];

// Generate a random date within a range
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// Generate a random amount within phase 1 range (up to 2M)
const randomAmount = (min: number = 100000, max: number = 2000000): number => {
  return Math.round((Math.random() * (max - min) + min) / 1000) * 1000;
};

// Generate extended bills data
export const generateExtendedBills = (count: number = 100): Bill[] => {
  const bills: Bill[] = [];
  
  for (let i = 0; i < count; i++) {
    const supplierIndex = Math.floor(Math.random() * 12); // Use first 12 suppliers
    const mdaIndex = Math.floor(Math.random() * 12); // Use first 12 MDAs
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const fiscalYear = fiscalYears[Math.floor(Math.random() * fiscalYears.length)];
    
    const invoiceDate = randomDate(new Date('2023-01-01'), new Date('2024-01-15'));
    const dueDate = randomDate(new Date(invoiceDate), new Date('2024-03-31'));
    
    const bill: Bill = {
      id: `PB-2024-${String(i + 21).padStart(5, '0')}`,
      supplierId: `sup-${String(supplierIndex + 1).padStart(3, '0')}`,
      supplierName: supplierNames[supplierIndex],
      mdaId: `mda-${String(mdaIndex + 1).padStart(3, '0')}`,
      mdaName: `Ministry/Agency ${mdaShortNames[mdaIndex]}`,
      amount: randomAmount(),
      originalAmount: randomAmount(),
      invoiceDate,
      dueDate,
      status,
      category: categories[Math.floor(Math.random() * categories.length)],
      description: `${descriptions[Math.floor(Math.random() * descriptions.length)]} - Batch ${Math.floor(Math.random() * 10) + 1}`,
      fiscalYear,
      priority,
      ...(status === 'verified' || status === 'paid' ? {
        verificationDate: randomDate(new Date(invoiceDate), new Date()),
      } : {}),
      ...(status === 'paid' ? {
        paymentDate: randomDate(new Date('2024-01-01'), new Date()),
      } : {}),
    };
    
    bills.push(bill);
  }
  
  return bills;
};

// Statistic calculations
export const calculateBillStats = (bills: Bill[]) => {
  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const verifiedBills = bills.filter(b => b.status === 'verified');
  const pendingBills = bills.filter(b => b.status === 'pending');
  const processingBills = bills.filter(b => b.status === 'processing');
  const paidBills = bills.filter(b => b.status === 'paid');
  
  return {
    total: {
      count: bills.length,
      amount: totalAmount,
    },
    verified: {
      count: verifiedBills.length,
      amount: verifiedBills.reduce((sum, b) => sum + b.amount, 0),
    },
    pending: {
      count: pendingBills.length,
      amount: pendingBills.reduce((sum, b) => sum + b.amount, 0),
    },
    processing: {
      count: processingBills.length,
      amount: processingBills.reduce((sum, b) => sum + b.amount, 0),
    },
    paid: {
      count: paidBills.length,
      amount: paidBills.reduce((sum, b) => sum + b.amount, 0),
    },
  };
};
