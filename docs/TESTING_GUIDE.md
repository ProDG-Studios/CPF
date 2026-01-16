# CPF Bill Securitization Platform - Testing Guide

## Complete End-to-End Test Scenario

This guide walks through a complete securitization workflow using a single bill example, demonstrating all platform features from bill submission to final settlement.

---

## Test Scenario: Ministry of Health Equipment Bill

**Bill Details:**
- **Bill ID:** BILL-2024-001
- **Supplier:** MedEquip Solutions Ltd
- **MDA:** Ministry of Health
- **Amount:** ₦45,000,000
- **Description:** Medical equipment supply for General Hospital renovation

---

## Phase 1: Dashboard Overview (Index Page)

### Navigate to: `/`

**What to observe:**
1. View the **Total Bills Value** KPI card showing aggregate pending bills
2. Check **Pending Bills** count - this should include our test bill
3. Review **Active MDAs** count
4. Observe the **Recent Activity** panel (initially empty or showing system events)

**Actions to test:**
- [ ] Click on different KPI cards to see tooltips
- [ ] Verify charts display correctly with current data
- [ ] Test the **Reset All Data** button in the header to restore initial state

---

## Phase 2: Bills Explorer (Bills Management)

### Navigate to: `/bills`

**Step 2.1: Locate the Test Bill**
1. Use the search bar to find "MedEquip" or "BILL-2024-001"
2. Apply filters:
   - Status: `Pending`
   - Category: `Healthcare`
   - MDA: `Ministry of Health`

**Step 2.2: Upload Supporting Documents**
1. Click the **Upload Documents** button
2. Upload required documents:
   - Invoice (PDF)
   - Delivery receipt (PDF)
   - Contract agreement (PDF)
3. Verify documents appear in the document list

**Step 2.3: Verify the Bill**
1. Locate the bill row in the table
2. Click the **Verify** button (checkmark icon)
3. Observe:
   - Status changes from `Pending` to `Verified`
   - Activity log updates in the header notification bell
   - Toast notification confirms action

**Step 2.4: Process the Bill**
1. Click the **Process** button (play icon)
2. Status changes to `Processing`
3. Check the activity log for the new entry

**Step 2.5: Complete Payment**
1. Click the **Pay** button (banknote icon)
2. Status changes to `Paid`
3. Verify the bill amount is now reflected in paid totals

**Bulk Actions Test:**
1. Select multiple bills using checkboxes
2. Use bulk action buttons to verify/process/pay multiple bills
3. Confirm all selected bills update simultaneously

**Export Test:**
1. Click **Export CSV** to download bill data
2. Click **Print Report** to generate printable HTML report
3. Verify exported data matches displayed data

---

## Phase 3: Workflow Management

### Navigate to: `/workflow`

**Understanding the 11-Step Process:**

| Step | Name | Responsible Party |
|------|------|-------------------|
| 1 | Bill Verification | CPF Team |
| 2 | MDA Payment Plan | MDA Finance |
| 3 | Sale Agreement | Legal Team |
| 4 | Consent | MDA Head |
| 5 | Treasury Agreement | Treasury |
| 6 | Bond Issuance | CPF Team |
| 7 | Investment Funding | Investors |
| 8 | Supplier Settlement | CPF Team |
| 9 | Exchange Listing | Stock Exchange |
| 10 | Treasury Servicing | Treasury |
| 11 | Completion | All Parties |

**Step 3.1: Progress Through Workflow**
1. Observe the current active step (highlighted in blue)
2. Click **Mark as Complete** on the active step
3. Verify:
   - Step status changes to `Completed` (green)
   - Next step becomes `Active` (blue)
   - Progress bar updates percentage
   - Activity log records completion

**Step 3.2: Review Step Details**
1. Click on any step in the left panel
2. View details in the right panel:
   - Description
   - Responsible party
   - Status
   - Completion/estimated date
   - Associated documents

**Step 3.3: Document Management**
1. Upload documents specific to each step
2. View uploaded documents in the step details

**Step 3.4: Quick Actions**
1. Use "Go to Active Step" to jump to current step
2. Use "View Last Completed" to review previous step

---

## Phase 4: MDAs Management

### Navigate to: `/mdas`

**Step 4.1: Review MDA Statistics**
1. View the summary cards:
   - Total MDAs
   - Verified Bills (by MDA)
   - Total Value
   - Average per MDA

**Step 4.2: Explore MDA Details**
1. Find "Ministry of Health" in the table
2. Click **View Details** button
3. In the modal, observe:
   - Bill count for this MDA
   - Total outstanding value
   - Bill status breakdown
   - Payment history chart

**Step 4.3: Analyze MDA Performance**
1. Review the "Bills by MDA" chart
2. Compare verification rates across MDAs
3. Identify MDAs with highest pending bills

---

## Phase 5: Suppliers Management

### Navigate to: `/suppliers`

**Step 5.1: Locate Test Supplier**
1. Search for "MedEquip Solutions"
2. View supplier card with:
   - Verification status
   - Total bills value
   - Bill count
   - Contact information

**Step 5.2: Verify Supplier**
1. If not verified, click **Verify** button
2. Status badge changes to "Verified"
3. Activity log records verification

**Step 5.3: Supplier Actions**
1. Test **Suspend** action (if needed)
2. View supplier-specific bill breakdown
3. Check total amounts owed to supplier

---

## Phase 6: Analytics & Reporting

### Navigate to: `/analytics`

**Step 6.1: Review Dashboard Metrics**
1. Observe real-time statistics:
   - Total Bills Value
   - Pending vs Processed
   - Active Suppliers
   - Bills by Status

**Step 6.2: Analyze Charts**
1. **Status Distribution**: Pie chart showing bill statuses
2. **Category Breakdown**: Bills grouped by category
3. **Trend Analysis**: Processing trends over time

**Step 6.3: Export Reports**
1. Click **Export CSV** for raw data
2. Click **Print Report** for formatted report
3. Verify our test bill appears in exports

---

## Phase 7: Payment Schedules

### Navigate to: `/payment-schedule`

**Step 7.1: View Quarterly Schedule**
1. Review the payment schedule table
2. Each MDA shows quarterly payment obligations:
   - Q1, Q2, Q3, Q4 amounts
   - Total annual commitment
   - Payment status per quarter

**Step 7.2: Record a Payment**
1. Find "Ministry of Health" row
2. Click **Pay** on a due quarter
3. Observe:
   - Status changes to "Paid"
   - Progress bar updates
   - Total paid amount increases

**Step 7.3: Track Progress**
1. Review overall collection progress
2. Compare scheduled vs actual payments
3. Identify overdue payments

---

## Phase 8: Timeline View

### Navigate to: `/timeline`

**Step 8.1: Review Project Timeline**
1. View all project milestones
2. Track progress of each phase
3. See estimated completion dates

**Step 8.2: Activity History**
1. Review recent system activity
2. Filter by action type
3. Trace the complete history of our test bill

---

## Verification Checklist

After completing the test scenario, verify:

### Data Consistency
- [ ] Bill status is `Paid` in Bills Explorer
- [ ] Workflow shows significant progress
- [ ] MDA page reflects the processed bill
- [ ] Supplier page shows updated totals
- [ ] Analytics displays correct aggregates
- [ ] Activity logs show all actions taken

### Cross-Page Synchronization
- [ ] Changes on one page reflect on all related pages
- [ ] KPIs update in real-time
- [ ] Activity feed shows chronological history

### Export Functionality
- [ ] CSV exports contain correct data
- [ ] Print reports are properly formatted
- [ ] All exported data matches UI display

### Document Management
- [ ] Documents persist after upload
- [ ] Documents appear in correct contexts
- [ ] Document preview works correctly

### Session Persistence
- [ ] Refresh browser - data persists
- [ ] Navigate between pages - state maintained
- [ ] Close and reopen - localStorage restores state

---

## Reset and Repeat

To test again with fresh data:

1. Click the **Reset** button in the header
2. Confirm the reset action
3. All data returns to initial state
4. Repeat the test scenario

---

## Common Test Cases

### Happy Path
Follow the complete flow above - bill moves from Pending → Verified → Processing → Paid

### Error Handling
- Try to process an unverified bill (should not be allowed)
- Attempt to complete workflow steps out of order
- Upload invalid file types

### Bulk Operations
- Select 5+ bills and perform bulk verify
- Process multiple bills simultaneously
- Track all changes in activity log

### Search & Filter
- Search by bill ID, supplier name, MDA
- Apply multiple filters simultaneously
- Clear filters and verify all data returns

---

## Notes

- All data is stored in browser localStorage
- No backend/database required for POC
- Data persists across browser sessions
- Use Reset to clear all data and start fresh

---

## Support

For issues or questions about the platform:
- Review the activity logs for recent actions
- Check browser console for any errors
- Use the Reset function to restore known state
