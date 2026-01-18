import jsPDF from 'jspdf';

// Premium colors
const GOLD = '#f59e0b';
const DARK = '#0a0a0a';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#e5e7eb';

export const generateConceptNotePDF = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Helper functions
  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - margin) {
      addPage();
      return true;
    }
    return false;
  };

  const drawGoldLine = (yPos: number, width: number = contentWidth) => {
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + width, yPos);
  };

  // ============ COVER PAGE ============
  // Dark background
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Gold accent rectangle at top
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Logo placeholder (gold square)
  const logoSize = 20;
  const logoX = (pageWidth - logoSize) / 2;
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(logoX, 60, logoSize, logoSize, 4, 4, 'F');

  // Title
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('Contractor Payment', pageWidth / 2, 105, { align: 'center' });
  doc.text('Facility (CPF)', pageWidth / 2, 120, { align: 'center' });

  // Subtitle
  doc.setTextColor(163, 163, 163);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Government Debt Securitization Platform', pageWidth / 2, 140, { align: 'center' });

  // Badge
  doc.setFillColor(245, 158, 11, 0.1);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(pageWidth / 2 - 35, 155, 70, 10, 5, 5, 'S');
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(10);
  doc.text('Concept Note • January 2026', pageWidth / 2, 162, { align: 'center' });

  // Footer on cover
  doc.setTextColor(115, 115, 115);
  doc.setFontSize(10);
  doc.text('Receivables Securitisation Origination', pageWidth / 2, pageHeight - 40, { align: 'center' });
  doc.text('Confidential Document • For Authorized Recipients Only', pageWidth / 2, pageHeight - 32, { align: 'center' });

  // ============ PAGE 2: EXECUTIVE SUMMARY ============
  addPage();

  // Header
  doc.setFillColor(255, 251, 235);
  doc.rect(margin, y, contentWidth, 50, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(margin, y, 3, 50, 'F');

  doc.setTextColor(146, 64, 14);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin + 10, y + 12);

  doc.setTextColor(64, 64, 64);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const execSummary = 'The Contractor Payment Facility (CPF) is a revolutionary financial infrastructure designed to solve the persistent challenge of delayed government payments to contractors and suppliers. By creating a digital marketplace that converts government receivables into tradeable, blockchain-secured instruments, CPF unlocks billions in working capital while providing institutional investors with sovereign-grade investment opportunities.';
  const splitExec = doc.splitTextToSize(execSummary, contentWidth - 20);
  doc.text(splitExec, margin + 10, y + 24);

  y += 60;

  // Stats Grid
  const stats = [
    { value: 'KES 500B+', label: 'Kenyan Contractor Debt' },
    { value: '6-18', label: 'Months Payment Delay' },
    { value: 'KES 1.8T+', label: 'Pension Fund AUM' },
    { value: '92%', label: 'Typical Advance Rate' }
  ];

  const statWidth = (contentWidth - 15) / 2;
  const statHeight = 25;

  stats.forEach((stat, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (col * (statWidth + 5));
    const statY = y + (row * (statHeight + 5));

    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(x, statY, statWidth, statHeight, 3, 3, 'FD');

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, x + statWidth / 2, statY + 12, { align: 'center' });

    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + statWidth / 2, statY + 20, { align: 'center' });
  });

  y += 65;

  // Section: The Problem
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('The Problem', margin, y);
  drawGoldLine(y + 3);
  y += 15;

  doc.setTextColor(64, 64, 64);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const problemText = 'Governments worldwide owe trillions to contractors, with payment cycles often extending 6-18 months. This creates supplier cash flow crisis, economic inefficiency, and fiscal pressure.';
  const splitProblem = doc.splitTextToSize(problemText, contentWidth);
  doc.text(splitProblem, margin, y);
  y += 20;

  // Problem table
  const problemData = [
    ['Bank Factoring', 'High discount rates (15-30%), limited availability'],
    ['Government Bonds', "Doesn't address supplier liquidity"],
    ['Direct Payment', 'Fiscally impossible in constrained environments'],
    ['Traditional Securitization', 'Complex, expensive, lacks transparency']
  ];

  // Table header
  doc.setFillColor(26, 26, 26);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Current Approach', margin + 5, y + 5.5);
  doc.text('Limitation', margin + 55, y + 5.5);
  y += 8;

  // Table rows
  problemData.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }
    doc.setTextColor(64, 64, 64);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(row[0], margin + 5, y + 5.5);
    doc.text(row[1], margin + 55, y + 5.5);
    y += 8;
  });

  y += 10;

  // ============ PAGE 3: THE SOLUTION ============
  checkPageBreak(100);

  doc.setTextColor(26, 26, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('The CPF Solution', margin, y);
  drawGoldLine(y + 3);
  y += 15;

  doc.setTextColor(64, 64, 64);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const solutionText = 'CPF creates a transparent, efficient marketplace connecting all stakeholders through specialized digital portals:';
  doc.text(solutionText, margin, y);
  y += 12;

  // Stakeholder table
  const stakeholderData = [
    ['Suppliers', 'Submit verified invoices', 'Immediate liquidity (days, not months)'],
    ['SPV', 'Due diligence & purchase', 'Sovereign-grade investment returns'],
    ['MDA', 'Verify & authorize claims', 'Improved contractor relationships'],
    ['Treasury', 'Certify & guarantee', 'Reduced fiscal pressure']
  ];

  // Table header
  doc.setFillColor(26, 26, 26);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Stakeholder', margin + 5, y + 5.5);
  doc.text('Role', margin + 40, y + 5.5);
  doc.text('Benefit', margin + 100, y + 5.5);
  y += 8;

  stakeholderData.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }
    doc.setTextColor(64, 64, 64);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(row[0], margin + 5, y + 5.5);
    doc.text(row[1], margin + 40, y + 5.5);
    doc.text(row[2], margin + 100, y + 5.5);
    y += 8;
  });

  y += 15;

  // Transaction Lifecycle
  checkPageBreak(60);
  
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Lifecycle', margin, y);
  drawGoldLine(y + 3);
  y += 15;

  // Workflow steps
  const steps = ['Supplier', 'SPV', 'MDA', 'Treasury', 'Blockchain'];
  const stepLabels = ['Bill Submit', 'Due Diligence', 'Verification', 'Certification', 'Settlement'];
  const stepWidth = contentWidth / 5;

  steps.forEach((step, index) => {
    const x = margin + (index * stepWidth) + (stepWidth / 2);
    
    // Circle
    doc.setFillColor(245, 158, 11);
    doc.circle(x, y + 8, 6, 'F');
    
    // Number
    doc.setTextColor(10, 10, 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(String(index + 1), x, y + 10, { align: 'center' });
    
    // Arrow (except last)
    if (index < steps.length - 1) {
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.5);
      doc.line(x + 8, y + 8, x + stepWidth - 8, y + 8);
    }
    
    // Labels
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(step, x, y + 22, { align: 'center' });
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(stepLabels[index], x, y + 28, { align: 'center' });
  });

  y += 40;

  // ============ FINANCIAL MODEL ============
  checkPageBreak(80);

  doc.setTextColor(26, 26, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Model', margin, y);
  drawGoldLine(y + 3);
  y += 15;

  // Discount rates table
  const ratesData = [
    ['AAA (Treasury Certified)', '5-8%', '6-10% annualized'],
    ['AA (MDA Approved)', '8-12%', '10-15% annualized'],
    ['A (Under Review)', '12-18%', '15-22% annualized']
  ];

  doc.setFillColor(26, 26, 26);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Profile', margin + 5, y + 5.5);
  doc.text('Discount Rate', margin + 70, y + 5.5);
  doc.text('Effective Yield', margin + 120, y + 5.5);
  y += 8;

  ratesData.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }
    doc.setTextColor(64, 64, 64);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(row[0], margin + 5, y + 5.5);
    doc.text(row[1], margin + 70, y + 5.5);
    doc.text(row[2], margin + 120, y + 5.5);
    y += 8;
  });

  y += 10;

  // Example transaction
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Example Transaction', margin, y);
  y += 8;

  const exampleData = [
    ['Invoice Amount', 'KES 100,000,000'],
    ['Discount Rate', '8%'],
    ['SPV Purchase Price', 'KES 92,000,000'],
    ['Supplier Receives (Immediate)', 'KES 92,000,000'],
    ['SPV Receives at Maturity', 'KES 100,000,000'],
    ['SPV Profit', 'KES 8,000,000']
  ];

  exampleData.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(255, 251, 235);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }
    doc.setTextColor(64, 64, 64);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(row[0], margin + 5, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(row[1], margin + contentWidth - 5, y + 5, { align: 'right' });
    y += 7;
  });

  // ============ PAGE 4: MARKET & ROADMAP ============
  addPage();

  // Market Opportunity
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Market Opportunity', margin, y);
  drawGoldLine(y + 3);
  y += 15;

  // Kenya
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Kenya Focus', margin, y);
  y += 8;

  const kenyaPoints = [
    '• Government Contractor Debt: Estimated KES 500+ billion',
    '• Annual Government Procurement: KES 800+ billion',
    '• Pension Fund AUM: KES 1.8+ trillion (seeking quality investments)',
    '• SME Supplier Base: 7+ million (majority government contractors)'
  ];

  doc.setTextColor(64, 64, 64);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  kenyaPoints.forEach(point => {
    doc.text(point, margin + 5, y);
    y += 6;
  });

  y += 8;

  // Uganda
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Uganda Expansion', margin, y);
  y += 8;

  const ugandaPoints = [
    '• Government Contractor Arrears: UGX 3-5 trillion',
    '• Growing Pension Industry: UGX 20+ trillion AUM',
    '• Strong Regulatory Framework: Bank of Uganda oversight'
  ];

  doc.setTextColor(64, 64, 64);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  ugandaPoints.forEach(point => {
    doc.text(point, margin + 5, y);
    y += 6;
  });

  y += 15;

  // Implementation Roadmap
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Implementation Roadmap', margin, y);
  drawGoldLine(y + 3);
  y += 15;

  const phases = [
    { num: '01', title: 'Proof of Concept', status: 'CURRENT', items: ['✓ Platform complete', '✓ Demo operational', '✓ Testing underway'] },
    { num: '02', title: 'Pilot Program (Q2 2026)', status: '', items: ['Select 2-3 pilot MDAs', 'Onboard 10-20 suppliers', 'Process KES 1-5 billion'] },
    { num: '03', title: 'National Rollout (Q4 2026)', status: '', items: ['All national MDAs', 'Banking integration', 'Mobile app launch'] },
    { num: '04', title: 'Regional Expansion (2027)', status: '', items: ['Uganda launch', 'East Africa expansion', 'Multi-currency support'] }
  ];

  const phaseWidth = (contentWidth - 10) / 2;
  const phaseHeight = 35;

  phases.forEach((phase, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (col * (phaseWidth + 10));
    const phaseY = y + (row * (phaseHeight + 8));

    // Box
    if (phase.status === 'CURRENT') {
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(245, 158, 11);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235);
    }
    doc.roundedRect(x, phaseY, phaseWidth, phaseHeight, 3, 3, 'FD');

    // Phase number
    doc.setTextColor(phase.status === 'CURRENT' ? 245 : 229, phase.status === 'CURRENT' ? 158 : 231, phase.status === 'CURRENT' ? 11 : 235);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(phase.num, x + 5, phaseY + 10);

    // Current badge
    if (phase.status === 'CURRENT') {
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(x + phaseWidth - 25, phaseY + 3, 22, 6, 3, 3, 'F');
      doc.setTextColor(10, 10, 10);
      doc.setFontSize(6);
      doc.text('CURRENT', x + phaseWidth - 14, phaseY + 7, { align: 'center' });
    }

    // Title
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(phase.title, x + 5, phaseY + 18);

    // Items
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    phase.items.forEach((item, itemIndex) => {
      doc.text(item, x + 5, phaseY + 25 + (itemIndex * 4));
    });
  });

  y += (phaseHeight * 2) + 25;

  // Competitive Advantages
  checkPageBreak(60);

  doc.setTextColor(26, 26, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Competitive Advantages', margin, y);
  drawGoldLine(y + 3);
  y += 12;

  const advantages = [
    { title: 'Blockchain Transparency', desc: 'Every transaction is immutable and auditable, reducing fraud' },
    { title: 'Digital-First Approach', desc: 'Paperless processing, real-time updates, mobile-friendly' },
    { title: 'Regulatory Compliance', desc: 'Built-in KYC/AML, audit-ready documentation' },
    { title: 'Investor Confidence', desc: 'Sovereign-backed receivables with structured payments' },
    { title: 'Supplier Benefits', desc: 'Fast liquidity, transparent pricing, no collateral required' }
  ];

  advantages.forEach((adv, index) => {
    doc.setFillColor(245, 158, 11);
    doc.circle(margin + 3, y + 2, 2, 'F');
    
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(adv.title, margin + 10, y + 4);
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(adv.desc, margin + 10, y + 10);
    
    y += 14;
  });

  // ============ FOOTER ON LAST PAGE ============
  y = pageHeight - 30;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);

  doc.setFillColor(245, 158, 11);
  doc.roundedRect(margin, y + 5, 8, 8, 2, 2, 'F');

  doc.setTextColor(26, 26, 26);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Receivables Securitisation Origination', margin + 12, y + 11);

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2026 Receivables Securitisation Origination. All rights reserved.', pageWidth / 2, y + 18, { align: 'center' });
  doc.text('This document is confidential and intended for authorized recipients only.', pageWidth / 2, y + 23, { align: 'center' });

  // Save the PDF
  doc.save('CPF_Concept_Note_2026.pdf');
};
