# Wolf ERP — Procurement Management

A full-stack procurement platform where **vendors, RFQs, quotations, purchase
orders, approvals and invoices are all connected**. A decision in one module
flows through the others:

```
Vendor ─▶ RFQ ─▶ Quotations ─▶ (compare → award) ─▶ Purchase Order
                                                        │
                                          submit ─▶ Approval ──(approve)──▶ PO Approved
                                                        │
                                                   Invoice ─▶ paid / sent
```

- **Backend** — Node.js + Express + MongoDB (Mongoose), JWT auth, role-based
  access, an approval engine that pushes decisions back onto the underlying
  PO/Invoice/RFQ, quotation comparison, and best-effort email/PDF.
- **Frontend** — Next.js 15 (App Router) + React 18 + Tailwind CSS. Fully
  responsive, every screen talks to the real API.

---

## Quick start

You need **Node.js 18+**. MongoDB is optional — if it isn't running, the server
automatically falls back to an in-memory database and seeds demo data, so it
"just runs". (Install/run MongoDB or set `MONGO_URI` for permanent storage.)

Open **two terminals**.

### 1. Backend (terminal 1)

```bash
cd server
npm install
npm run seed     # optional: load demo data into a real MongoDB
npm run dev      # starts the API on http://localhost:5000
```

> If you have MongoDB running locally, data persists and `npm run seed` loads the
> demo data. If you don't, the server starts an in-memory MongoDB and seeds it
> automatically on every boot (data resets when you stop the server).

### 2. Frontend (terminal 2)

```bash
cd client
npm install
npm run dev      # starts the app on http://localhost:3000
```

Open **http://localhost:3000** and sign in.

### Demo accounts

| Email                | Password     | Role     |
| -------------------- | ------------ | -------- |
| admin@wolferp.in     | admin123     | admin    |
| manager@wolferp.in   | manager123   | manager  |
| approver@wolferp.in  | approver123  | approver |

You can also register a brand-new account from the sign-up page.

---

## Try the connected flow

1. **Vendors** → *Add Vendor* (auto-assigned code like `V-1009`).
2. **RFQs** → *Create RFQ*, invite vendors, publish.
3. **Quotations** → submit quotes, then **Compare** them and **Award** the best
   one. Awarding rejects the other quotes, marks the RFQ *Awarded*, and **drafts
   a Purchase Order** automatically.
4. **Purchase Orders** → open the drafted PO → *Submit for approval*. This
   creates an item in **Approvals** (watch the sidebar badge update).
5. **Approvals** → *Approve* it. The PO flips to *Approved* automatically.
6. **Purchase Orders** → *Send to vendor*, then *Create invoice* (pre-filled from
   the PO).
7. **Invoices** → *Mark paid* / *Send*. The **Vendor** detail page and
   **Reports** now reflect the new spend.

---

## Configuration

`server/.env` (created for you, safe defaults):

| Variable        | Default                                  | Notes                                  |
| --------------- | ---------------------------------------- | -------------------------------------- |
| `MONGO_URI`     | `mongodb://127.0.0.1:27017/wolf_erp`     | Local Mongo, or paste an Atlas string. |
| `PORT`          | `5000`                                   | API port.                              |
| `JWT_SECRET`    | dev value — change for production        | Token signing secret.                  |
| `CLIENT_URL`    | `http://localhost:3000`                  | Allowed CORS origin.                   |
| `SMTP_*`        | blank                                    | Optional. Blank = emails logged to console. |

`client/.env.local`:

| Variable               | Default                       |
| ---------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:5000/api`   |

---

## Project structure

```
server/
  src/
    config/      env, db (with in-memory fallback), email
    models/      User, Vendor, RFQ, Quotation, PurchaseOrder, Invoice, Approval, ActivityLog
    controllers/ one per module
    routes/      REST routes mounted under /api
    services/    approvalEngine, comparisonService, email/notification/pdf
    middleware/  auth (JWT), role (RBAC), validate, errorHandler
    seed.js      demo data + `npm run seed`
client/
  src/
    app/         App Router pages: (auth), (dashboard), (marketing)
    components/  shared UI kit
    context/     AuthContext (JWT session)
    hooks/       useAuth, useFetch, useVendors
    lib/         api (fetch wrapper), constants, format, utils
```

See [docs/API.md](docs/API.md) for the endpoint reference and
[docs/SCHEMA.md](docs/SCHEMA.md) for the data model.
