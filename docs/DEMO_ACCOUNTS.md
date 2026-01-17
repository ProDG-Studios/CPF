# CPF Settlement Platform - Demo Accounts

All demo accounts use the password: **`demo1234`**

## Supplier Accounts

| Email | Company Name | Full Name |
|-------|--------------|-----------|
| `apex@demo.com` | Apex Construction Ltd | Chidi Okonkwo |
| `buildright@demo.com` | BuildRight Nigeria | Amaka Eze |
| `techsupply@demo.com` | TechSupply Co | Emeka Nwosu |
| `medequip@demo.com` | MedEquip Solutions | Ngozi Adeyemi |
| `foodserve@demo.com` | FoodServe Enterprises | Tunde Bakare |
| `cleanenergy@demo.com` | CleanEnergy Systems | Funke Adeleke |

## SPV Accounts (Special Purpose Vehicles)

| Email | SPV Name | Full Name |
|-------|----------|-----------|
| `alpha.capital@demo.com` | Alpha Capital SPV | Adekunle Johnson |
| `beta.investments@demo.com` | Beta Investments | Chioma Onyekachi |
| `gamma.finance@demo.com` | Gamma Finance | Ibrahim Yusuf |
| `delta.funding@demo.com` | Delta Funding | Oluwaseun Alade |

## MDA Accounts (Ministries, Departments, Agencies)

**⚠️ Important:** When submitting a bill to a specific MDA, use the corresponding MDA account to approve it.

| Email | MDA | Department |
|-------|-----|------------|
| `fmw@demo.com` | Federal Ministry of Works | Procurement |
| `fmh@demo.com` | Federal Ministry of Health | Finance |
| `fme@demo.com` | Federal Ministry of Education | Administration |
| `fmit@demo.com` | Federal Ministry of IT | Procurement |
| `fma@demo.com` | Federal Ministry of Agriculture | Finance |
| `fmd@demo.com` | Federal Ministry of Defence | Procurement |

## Treasury Accounts

| Email | Office | Full Name |
|-------|--------|-----------|
| `federal.treasury@demo.com` | Federal Treasury | Babajide Sanwo-Olu |
| `state.treasury@demo.com` | State Treasury | Hafsat Abubakar |
| `cbn.liaison@demo.com` | Central Bank Liaison | Godwin Emefiele Jr |

## Admin Accounts

| Email | Role |
|-------|------|
| `admin@demo.com` | System Administrator |
| `platform.admin@demo.com` | Platform Manager |

---

## Complete Test Flow Example

Here's how to test the full bill lifecycle:

### 1. Supplier Submits Bill
- **Login:** `apex@demo.com` / `demo1234`
- **Action:** Submit a new bill to "Federal Ministry of Works"
- **Note:** Remember which MDA you selected!

### 2. SPV Makes Offer
- **Login:** `alpha.capital@demo.com` / `demo1234`
- **Action:** Go to Bills → Find the bill → Make an offer (e.g., 5% discount)

### 3. Supplier Accepts Offer
- **Login:** `apex@demo.com` / `demo1234`
- **Action:** Go to My Bills → Accept the offer

### 4. MDA Approves Bill
- **Login:** `fmw@demo.com` / `demo1234` (matches the MDA selected in step 1)
- **Action:** Go to Bills → Find the bill → Approve and set payment terms

### 5. Treasury Certifies
- **Login:** `federal.treasury@demo.com` / `demo1234`
- **Action:** Go to Pending → Find the bill → Certify (creates blockchain deed)

### 6. View Blockchain Deed (SPV)
- **Login:** `alpha.capital@demo.com` / `demo1234`
- **Action:** Go to Blockchain → View the created deed

---

## Matching MDAs to Accounts

When a supplier submits a bill to an MDA, use this guide to know which account to log in with:

| If bill is sent to... | Log in as... |
|----------------------|--------------|
| Federal Ministry of Works | `fmw@demo.com` |
| Federal Ministry of Health | `fmh@demo.com` |
| Federal Ministry of Education | `fme@demo.com` |
| Federal Ministry of IT | `fmit@demo.com` |
| Federal Ministry of Agriculture | `fma@demo.com` |
| Federal Ministry of Defence | `fmd@demo.com` |
