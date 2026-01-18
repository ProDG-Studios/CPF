// Export utilities for generating CSV and PDF-like exports

import { Bill, Supplier, MDA, formatCurrency } from '@/data/mockData';

// Generate CSV content
export const generateCSV = (data: Record<string, any>[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// Download file helper
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export bills to CSV
export const exportBillsToCSV = (bills: Bill[]): void => {
  const data = bills.map(bill => ({
    'Bill ID': bill.id,
    'Supplier': bill.supplierName,
    'MDA': bill.mdaName,
    'Amount (KES)': bill.amount,
    'Original Amount (KES)': bill.originalAmount,
    'Status': bill.status,
    'Priority': bill.priority,
    'Category': bill.category,
    'Invoice Date': bill.invoiceDate,
    'Due Date': bill.dueDate,
    'Fiscal Year': bill.fiscalYear,
    'Verification Date': bill.verificationDate || '',
    'Payment Date': bill.paymentDate || '',
    'Description': bill.description,
  }));
  generateCSV(data, `bills_export_${new Date().toISOString().split('T')[0]}`);
};

// Export suppliers to CSV
export const exportSuppliersToCSV = (suppliers: Supplier[]): void => {
  const data = suppliers.map(supplier => ({
    'Supplier ID': supplier.id,
    'Name': supplier.name,
    'Registration No': supplier.registrationNo,
    'Category': supplier.category,
    'County': supplier.county,
    'Status': supplier.status,
    'Total Bills': supplier.totalBills,
    'Total Amount (KES)': supplier.totalAmount,
    'Verified Amount (KES)': supplier.verifiedAmount,
    'Pending Amount (KES)': supplier.pendingAmount,
    'Contact Email': supplier.contactEmail,
  }));
  generateCSV(data, `suppliers_export_${new Date().toISOString().split('T')[0]}`);
};

// Export MDAs to CSV
export const exportMDAsToCSV = (mdas: MDA[]): void => {
  const data = mdas.map(mda => ({
    'MDA ID': mda.id,
    'Name': mda.name,
    'Short Name': mda.shortName,
    'Category': mda.category,
    'Total Bills': mda.totalBills,
    'Verified Bills': mda.verifiedBills,
    'Pending Bills': mda.pendingBills,
    'Total Amount (KES)': mda.totalAmount,
    'Verified Amount (KES)': mda.verifiedAmount,
    'Pending Amount (KES)': mda.pendingAmount,
  }));
  generateCSV(data, `mdas_export_${new Date().toISOString().split('T')[0]}`);
};

// Generate printable report HTML
export const generatePrintableReport = (title: string, content: string): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        h2 { font-size: 18px; color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        .header { border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .stat { display: inline-block; margin-right: 40px; }
        .stat-value { font-size: 24px; font-weight: 700; }
        .stat-label { font-size: 12px; color: #666; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CPF Pending Bills Securitization</h1>
        <h2>${title}</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
      ${content}
      <div class="footer">
        <p>CPF Group & Sterling Capital — Transaction Advisors</p>
        <p>Pending Bills Verification Committee — Confidential Document</p>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

// Generate summary report
export const generateBillsSummaryReport = (bills: Bill[]): void => {
  const stats = {
    total: bills.length,
    totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
    verified: bills.filter(b => b.status === 'verified').length,
    verifiedAmount: bills.filter(b => b.status === 'verified').reduce((sum, b) => sum + b.amount, 0),
    pending: bills.filter(b => b.status === 'pending').length,
    pendingAmount: bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0),
    processing: bills.filter(b => b.status === 'processing').length,
    processingAmount: bills.filter(b => b.status === 'processing').reduce((sum, b) => sum + b.amount, 0),
    paid: bills.filter(b => b.status === 'paid').length,
    paidAmount: bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0),
  };

  const content = `
    <div style="margin-bottom: 32px;">
      <div class="stat"><div class="stat-value">${stats.total.toLocaleString()}</div><div class="stat-label">Total Bills</div></div>
      <div class="stat"><div class="stat-value">${formatCurrency(stats.totalAmount, true)}</div><div class="stat-label">Total Value</div></div>
      <div class="stat"><div class="stat-value">${stats.verified.toLocaleString()}</div><div class="stat-label">Verified</div></div>
      <div class="stat"><div class="stat-value">${stats.paid.toLocaleString()}</div><div class="stat-label">Paid</div></div>
    </div>
    
    <h3>Status Breakdown</h3>
    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th>Count</th>
          <th>Amount (KES)</th>
          <th>% of Total</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Verified</td><td>${stats.verified}</td><td>${formatCurrency(stats.verifiedAmount)}</td><td>${((stats.verified / stats.total) * 100).toFixed(1)}%</td></tr>
        <tr><td>Processing</td><td>${stats.processing}</td><td>${formatCurrency(stats.processingAmount)}</td><td>${((stats.processing / stats.total) * 100).toFixed(1)}%</td></tr>
        <tr><td>Pending</td><td>${stats.pending}</td><td>${formatCurrency(stats.pendingAmount)}</td><td>${((stats.pending / stats.total) * 100).toFixed(1)}%</td></tr>
        <tr><td>Paid</td><td>${stats.paid}</td><td>${formatCurrency(stats.paidAmount)}</td><td>${((stats.paid / stats.total) * 100).toFixed(1)}%</td></tr>
      </tbody>
    </table>

    <h3>Recent Bills (Last 10)</h3>
    <table>
      <thead>
        <tr>
          <th>Bill ID</th>
          <th>Supplier</th>
          <th>MDA</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${bills.slice(0, 10).map(bill => `
          <tr>
            <td>${bill.id}</td>
            <td>${bill.supplierName}</td>
            <td>${bill.mdaName}</td>
            <td>${formatCurrency(bill.amount)}</td>
            <td>${bill.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  generatePrintableReport('Bills Summary Report', content);
};
