# FinLedger Frontend

A production-grade accounting dashboard UI built with vanilla JavaScript (zero dependencies) and a React version. Connects to the [FinLedger Django REST API](../finledger_backend/README.md) backend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Option A — Standalone HTML (no build tools)](#option-a--standalone-html-no-build-tools)
  - [Option B — React + Vite](#option-b--react--vite)
- [Configuration](#configuration)
- [Pages & Modules](#pages--modules)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

FinLedger is a full-featured business accounting suite covering the complete financial workflow — from quotations through invoicing, double-entry bookkeeping, purchase management, and live inventory tracking. The UI is a dark-themed dashboard that talks directly to a Django REST API backend.

```
Login → Dashboard → Accounts → Sales Pipeline → Purchase → Inventory → Reports
```

---

## Features

### Accounts
- **Groups & Subgroups** — Full chart of accounts tree (Primary → Sub-Group hierarchy)
- **Ledgers** — Create and manage account ledgers with Dr/Cr balances, filter by nature (Asset / Liability / Income / Expense)
- **Journal Entries** — Double-entry bookkeeping with real-time Dr = Cr validation, voucher types (Journal, Payment, Receipt, Contra), posted/draft status

### Sales Pipeline
- Full 5-stage document pipeline: **Quotation → Proforma Invoice → Sales Order → Delivery Challan → Invoice**
- One-click stage conversion (converts document to next stage, copies all line items)
- Per-document line items with GST calculation (0% / 5% / 12% / 18% / 28%)
- Live subtotal, GST, and total computation in the create form
- Status management: Draft, Pending, Approved, Confirmed, Dispatched, Paid, Overdue, Converted
- Mark invoices as Paid with a single click

### Purchase Management
- **Purchase Orders** — Create with line items, mark items as received
- **Purchase Invoices** — Auto-generated from POs, record payments
- **Purchase Returns** — Track vendor returns with reason

### Inventory
- **Products** — Full catalog with SKU, category, unit, cost/selling price, GST rate, HSN code
- **Stock levels** — Visual progress bar showing stock vs minimum level, red alert for low stock
- **Stock Adjustments** — Manual IN / OUT / Absolute adjustment with full audit trail
- **Categories** — Hierarchical product categories with product counts
- **Stock Movements** — Read-only audit log of every stock change with reference tracking

### Dashboard
- Live stat cards: Total Revenue, Total Expenses, Receivables, Net Profit
- Recent invoices table
- Account balances panel
- Low stock alerts with progress bars
- Sales pipeline counts per stage
- Quick action shortcuts

### Company
- Multi-company support
- Edit company profile: name, GSTIN, PAN, address, phone, email
- Financial year configuration
- Base currency and GST scheme settings

### Reports
- 9 report cards: Trial Balance, P&L, Balance Sheet, Cash Flow, Sales Register, Purchase Register, GST Report, Aged Receivables, Stock Valuation
- Click any report card to fetch and view live data from the API

---

## Tech Stack

| Concern | Choice |
|---|---|
| **Standalone version** | Vanilla JavaScript (ES2020+), zero npm dependencies |
| **React version** | React 18, hooks only (`useState`, `useEffect`, `useCallback`, `useContext`) |
| **Styling** | Plain CSS injected via `<style>` tag — no CSS framework |
| **Fonts** | DM Sans (UI), Space Mono (numbers/amounts) via Google Fonts |
| **HTTP** | Native `fetch()` API with token auth headers |
| **State management** | Simple module-level state object with manual re-render |
| **Build tool** | None (standalone) or Vite (React version) |
| **Backend** | Django REST Framework at `http://localhost:8000/api` |

---

## Project Structure

```
finledger-ui/
├── finledger_standalone.html    # Single-file standalone version (open in browser)
├── FinLedger_integrated.jsx     # React version (drop into any React project)
└── README.md
```

The standalone HTML file is entirely self-contained — all CSS, JavaScript, and HTML in one file (~89 KB). No build step, no npm, no bundler.

---

## Getting Started

### Prerequisites

The Django backend must be running before the frontend will work.

```bash
# In your backend directory
cd finledger_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data      # loads demo data
python manage.py runserver      # starts on http://localhost:8000
```

Default login credentials created by `seed_data`: **admin / admin123**

---

### Option A — Standalone HTML (no build tools)

The fastest way to get started. No installation required.

**1. Serve the file** (recommended — avoids browser CORS restrictions):

```bash
# Python 3 built-in server
python -m http.server 3000

# Then open:
# http://localhost:3000/finledger_standalone.html
```

**2. Or open directly in browser:**

```
Double-click finledger_standalone.html
```

> **Note:** Opening as a `file://` URL may trigger CORS errors when connecting to the Django API. Use a local server if you see network errors.

---

### Option B — React + Vite

**1. Create a new Vite project:**

```bash
npm create vite@latest finledger-ui -- --template react
cd finledger-ui
npm install
```

**2. Replace the App component:**

```bash
cp FinLedger_integrated.jsx src/App.jsx
```

**3. Start the dev server:**

```bash
npm run dev
# Opens at http://localhost:5173
```

---

## Configuration

The only configuration needed is the API base URL. It is defined at the top of both files:

**`finledger_standalone.html`** (line ~10):
```javascript
const API = 'http://localhost:8000/api';
```

**`FinLedger_integrated.jsx`** (line ~5):
```javascript
const API_BASE = "http://localhost:8000/api";
```

Change this to point to your deployed backend when going to production.

### Environment-based config (React version)

Create a `.env` file at the project root:

```env
VITE_API_BASE=http://localhost:8000/api
```

Then update `FinLedger_integrated.jsx`:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
```

---

## Pages & Modules

| Route (nav ID) | Component | API Endpoints Used |
|---|---|---|
| `dashboard` | Dashboard | `GET /dashboard/overview/`, `GET /dashboard/low-stock/` |
| `groups` | Groups & Subgroups | `GET/POST/PUT/DELETE /accounts/groups/` |
| `ledgers` | Ledgers | `GET/POST/PUT /accounts/ledgers/` |
| `entries` | Journal Entries | `GET/POST /accounts/entries/` |
| `quotation` | Quotations | `GET/POST /sales/documents/?doc_type=Quotation` |
| `proforma` | Proforma Invoice | `GET/POST /sales/documents/?doc_type=Proforma` |
| `order` | Sales Orders | `GET/POST /sales/documents/?doc_type=Order` |
| `challan` | Delivery Challan | `GET/POST /sales/documents/?doc_type=Challan` |
| `invoice` | Invoices | `GET/POST /sales/documents/?doc_type=Invoice` |
| `purchaseOrder` | Purchase Orders | `GET/POST /purchase/orders/` |
| `purchaseInvoice` | Purchase Invoices | `GET /purchase/invoices/` |
| `purchaseReturn` | Purchase Returns | `GET /purchase/returns/` |
| `products` | Products | `GET/POST /inventory/products/` |
| `categories` | Categories | `GET/POST /inventory/categories/` |
| `stock` | Stock Movements | `GET /inventory/movements/` |
| `company` | Company Settings | `GET/PATCH /company/` |
| `reports` | Reports | Various endpoints (on demand) |

---

## API Integration

All API calls follow this pattern:

```javascript
// GET
const data = await get('/accounts/ledgers/');

// POST
const result = await post('/sales/documents/', { ...payload });

// PUT (full update)
await put('/accounts/groups/1/', { ...updated });

// PATCH (partial update)
await patch('/company/1/', { name: 'New Name' });

// DELETE
await del('/accounts/groups/1/');
```

All responses are parsed as JSON. HTTP 401 triggers automatic logout. Errors are displayed as toast notifications.

### Response format

List endpoints return either a plain array or a paginated object:

```javascript
// Paginated (Django REST Framework default)
{ count: 42, next: "...", previous: null, results: [...] }

// The UI handles both:
const items = data?.results || data || [];
```

---

## Authentication

The app uses **Django REST Framework Token Authentication**.

**Flow:**
1. User enters credentials on the login screen
2. `POST /api/auth/login/` returns `{ "token": "abc123..." }`
3. Token is stored in `localStorage` under the key `fl_token`
4. Every subsequent API request includes the header:
   ```
   Authorization: Token abc123...
   ```
5. HTTP 401 responses automatically clear the token and redirect to login
6. The logout button calls `POST /api/auth/logout/` and clears localStorage

**Token persistence:** The token survives page refresh. Users stay logged in until they click "Out" or the token is invalidated server-side.

---

## Screenshots

The UI uses a dark color scheme throughout:

| Color | Usage |
|---|---|
| `#0A0E1A` | Page background |
| `#0D1220` | Sidebar, topbar |
| `#111827` | Cards |
| `#3B82F6` | Primary accent (blue) |
| `#10B981` | Success / Dr balance (green) |
| `#EF4444` | Danger / Cr balance / overdue (red) |
| `#F59E0B` | Warning / pending (amber) |
| `#8B5CF6` | Info / confirmed (purple) |

---

## Deployment

### Serve the standalone HTML

Upload `finledger_standalone.html` to any static host (Netlify, S3, Vercel, Nginx):

```nginx
# nginx example
server {
    listen 80;
    root /var/www/finledger;
    index finledger_standalone.html;
}
```

### Build the React version

```bash
npm run build
# Output in dist/ — deploy to any static host
```

### CORS configuration

The Django backend must allow requests from your frontend's origin. In `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",       # Vite dev server
    "http://localhost:3000",       # Standalone HTML server
    "https://your-domain.com",     # Production
]
```

For development only, you can set `CORS_ALLOW_ALL_ORIGINS = True`.

---

## Troubleshooting

**"Cannot connect to server"**
- Confirm Django is running: `python manage.py runserver`
- Check the API URL in the file matches your server address
- Make sure `django-cors-headers` is installed and configured

**"Invalid credentials"**
- Run `python manage.py seed_data` to create the admin user
- Default credentials: `admin` / `admin123`

**Blank dashboard / no data**
- Run `python manage.py seed_data` to populate demo data
- Check the browser console for network errors (F12 → Network tab)

**CORS errors in browser console**
- Don't open the HTML file directly as `file://` — use a local server (`python -m http.server 3000`)
- Add your frontend URL to `CORS_ALLOWED_ORIGINS` in Django settings

**`seed_data` command not found**
- Make sure `seed_data.py` is inside `company/management/commands/`, not inside `finledger_backend/management/commands/`
- Both `company/management/__init__.py` and `company/management/commands/__init__.py` must exist

---

## Related

- [Backend README](../finledger_backend/README.md) — Django REST API setup, all endpoint docs, database config