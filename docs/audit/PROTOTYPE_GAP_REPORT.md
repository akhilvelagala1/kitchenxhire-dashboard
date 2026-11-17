# Prototype gap report: super-admin console

Source: [SuryaVirata/kitchenxhire-prototype](https://github.com/SuryaVirata/kitchenxhire-prototype) at the November 2026 head, hosted at <https://suryavirata.github.io/kitchenxhire-prototype/kitchenxhire-v2.html>. Line numbers refer to files in that repository. This audit reads `admin.html`, `finance.html`, `technical.html`, `rm.html`, `warehouse.html`, `admin-login.html` and `assets/kx-dropdown.js`.

**Bar.** Production super admin at launch scale: 400 to 500 products growing to 3,000 to 4,000, with a similar number of categories. Every list is paginated on the server, and every entity dropdown is searched through the API. The checklist each page is measured against is §3, and `src/modules/*/page.contract.json` enforces it.

## 0. Headline findings

1. **Nothing talks to a server.** There is no `fetch` or XHR anywhere. Every save is a toast: the product, category, brand, add-on, supplier, PO and GRN forms all stop at `toast('… saved')` (admin.html:2235-2241). The only persistence is localStorage: `kxCreditApps` (:2048, :2106) and `kx-starter-leads` (:2557).
2. **The catalogue has no list pages.** Products, Categories, Brands, Add-ons and Suppliers are each a single "Add New" form. Their breadcrumbs point back to the same form (:708, :848). Nobody can view, edit or delete an existing record.
3. **Pagination is fake.** The pager buttons only move the highlight (:2372-2379). The totals are hardcoded text, e.g. "Showing 1-6 of 1,230 products" (:1369). Search and filters run in the browser over arrays of 6 rows (:2350, :2430).
4. **Every dropdown is a hardcoded `<select>`**, including those that will hold thousands of entities:
   - Category (:726), Brand (:738) and Parent category (:862)
   - Supplier (:1207) and the Orders customer filter (:1537)
   - Stock product (:1486), GRN PO (:1402) and new-order customer (:1764)

   `kx-dropdown.js` only restyles the native select. It has no type-to-search and no async loading.

5. **Auth and roles are client-side only.** Plaintext credentials sit in `admin-login.html:120-125` and `credentials.md`. The guard is `sessionStorage.kxRole === 'admin'` (:1940-1947). Role checks are `data-roles` attributes hidden with `display:none` (:358-366, :1971-1974).
6. **Four nav items lead nowhere.** Sellers/Partners, Price Lists & Offers, Content & CMS and Notifications all render a placeholder (`pageView`, :1906-1909). The dashboard's "Create Offer" quick action (:566) therefore opens an empty page.
7. **Admin is not actually the superset.** Some features exist only in the role consoles:
   - Credit cases with limit setting (finance)
   - Delivery zones (technical)
   - Tickets (rm)
   - The whole warehouse floor (warehouse)
8. **The mock data contradicts itself.**
   - Admin shows Delhi, Mumbai and Bengaluru warehouses, while the role pages show a single Hyderabad hub.
   - Products are listed as 12,340 (:504) on one page and 1,230 (:1315) on another.
   - Users & Roles appears twice, with different role names (:1717 vs :1887).
9. **Global header search does nothing** (`#adminSearch`, :428).

## 1. admin.html page by page

Legend: Y = present, P = partial or fake, N = absent. "Client" = filtering in the browser over mock data.

### 1a. List-style pages

| Capability                     | Inventory :1301                                | Orders :1512                                | Delivery :1554                 | Returns :1596                     |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------- | ------------------------------ | --------------------------------- |
| Search                         | Client                                         | Client                                      | Client                         | Client                            |
| Filters                        | Client (category, location, status)            | Client (status, customer); location unwired | Client                         | Client                            |
| Date range                     | N                                              | Fake select (:1520)                         | Fake (:1580)                   | Fake (:1616)                      |
| Sort                           | N                                              | N                                           | N                              | N                                 |
| Pagination                     | Fake (:1370)                                   | Fake (:1549)                                | Fake (:1591)                   | Fake (:1627)                      |
| Detail view                    | N (⋯ menu dead, :2361)                         | N (:2436)                                   | P: static Track modal (:1788)  | P: one-line modal (:1799)         |
| Create                         | P: Add Stock modal, hardcoded products (:1480) | P: no line items (:1760)                    | P: driver as free text (:1779) | N                                 |
| Edit / status change           | N                                              | N                                           | N                              | N (no approve, refund or resolve) |
| Soft delete / restore          | N                                              | N                                           | N                              | N                                 |
| Bulk select / actions          | P: select-all with no actions (:1361)          | N                                           | N                              | N                                 |
| Import CSV/XLSX                | N                                              | N                                           | N                              | N                                 |
| Export                         | P: toast only (:2371)                          | P: toast                                    | P: toast                       | P: toast                          |
| Audit / history                | N (no stock ledger)                            | N                                           | N                              | N                                 |
| Empty / loading / error states | N                                              | N                                           | N                              | N                                 |
| Confirmations                  | N                                              | N                                           | N                              | N                                 |

### 1b. Form-only and static pages

| Page (line)                                       | Entity      | What it does now                                                                                                                                       | Main gaps                                                                                                                                                                                                          |
| ------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dashboard (:453)                                  | KPIs        | Static cards, chart and tables. Location and date controls are not wired.                                                                              | No live data, drill-down or date range.                                                                                                                                                                            |
| Products (:707)                                   | Product     | Add form: name, SKU, static selects, weight, barcode, optional HSN, image preview (:2192), prices, opening stock.                                      | No list, edit, delete, search or import/export. No variants or pack sizes, no UOM conversion, no tiered pricing, no GST rate, no SKU uniqueness check, no draft/publish, no image ordering. Selects must be async. |
| Categories (:847)                                 | Category    | Add form with a flat 4-option parent select, image, sort order, preview (:2214).                                                                       | No tree, drag reorder, bulk move, merge, product counts or depth limit.                                                                                                                                            |
| Brands (:924)                                     | Brand       | Add form.                                                                                                                                              | No list, edit or delete; no duplicate check.                                                                                                                                                                       |
| Menu Add-ons (:989)                               | Add-on      | Add form with a static tax select.                                                                                                                     | No mapping to menu items (static preview, :1078); no list.                                                                                                                                                         |
| Suppliers (:1095)                                 | Supplier    | Add form; supply categories is a **single** select (:1172).                                                                                            | No list or detail, no GSTIN validation, no bank/KYC, no supplier price list.                                                                                                                                       |
| Purchase Orders (:1198)                           | PO          | Create form. A supplier map auto-fills details (:2318); Add Item cycles a hardcoded array (:2269). Flat 5% GST (:1289); the date is free text (:1225). | No PO list or lifecycle, no approvals, no per-line tax, no product search picker, no PDF/email. Deleting a line has no confirmation (:2297).                                                                       |
| Goods Receiving (:1385)                           | GRN         | Form with a hardcoded PO select and receive-qty inputs.                                                                                                | No batch/expiry, QC reject or short/excess handling, no GRN list, no stock-ledger posting.                                                                                                                         |
| Customers (:1813)                                 | B2B kitchen | Static 5-row table.                                                                                                                                    | Everything: search, filters, detail (outlets, GST, credit, RM), edit, block, export.                                                                                                                               |
| Credit applications (:1807)                       | Credit      | **The only real workflow.** Backed by localStorage, with a visit-before-finance guard (:2098) and an empty state (:2050).                              | No filters, document viewer, audit or rejection path.                                                                                                                                                              |
| Onboarding (:1830)                                | Signup      | Two static cards; approve/reject only toast (:2537).                                                                                                   | No queue, KYC viewer, rejection reason or RM picker.                                                                                                                                                               |
| Consulting leads (:1845)                          | Lead        | Static table plus localStorage (:2552).                                                                                                                | No assignment, stages, filters or notes.                                                                                                                                                                           |
| Sellers, Price Lists & Offers, CMS, Notifications | —           | Placeholder (:1906).                                                                                                                                   | Entire pages missing. Price lists and offers matter most for B2B.                                                                                                                                                  |
| Payments & Finance (:1860)                        | Settlement  | Static KPIs and 3 rows; buttons toast (:2539).                                                                                                         | No reconciliation, date range, export, payout ledger or invoices.                                                                                                                                                  |
| Reports (:1898)                                   | —           | Two static cards.                                                                                                                                      | No catalogue, filters, schedule or export.                                                                                                                                                                         |
| Users & Roles (:1880)                             | Staff       | Static table, duplicated in Settings (:1717).                                                                                                          | No invite, edit, deactivate, permission matrix, location scope, 2FA or audit.                                                                                                                                      |
| Settings (:1632)                                  | Config      | Six tabs; Save toasts.                                                                                                                                 | No warehouse, tax/HSN, UOM or delivery-slot masters; integration credentials not handled.                                                                                                                          |

## 2. Role consoles

In all four, every table is static HTML and most buttons only show a toast. None has search, filters, pagination, export or a detail view. The guard is `sessionStorage` (finance.html:568, technical.html:585, rm.html:575, warehouse.html:442).

| File           | Page                                                                 | Relation to admin                    | Notes                                     |
| -------------- | -------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------- |
| finance.html   | Payments & Finance (:463)                                            | Same as admin                        | Toasts only                               |
|                | **Credit cases** (:483)                                              | **Missing from admin**               | Sets the approved limit; no maker-checker |
|                | Returns & refunds (:503)                                             | Adds Release / Hold refund           | Admin has no refund actions               |
|                | **Customer ledgers** (:516)                                          | **Missing from admin**               | Prepaid wallet, COD due                   |
| technical.html | **CMS** (:458), **Notifications** (:473)                             | Admin shows placeholders             | Toggles only                              |
|                | **Delivery zones** (:500)                                            | **Missing from admin**               | Pincode, route, cutoff; read-only         |
|                | Settings (:514)                                                      | Adds integration health              | Richer than admin                         |
| rm.html        | Your kitchens (:463), Leads (:478)                                   | Assigned-only subsets                | Static                                    |
|                | **Tickets** (:492)                                                   | **Missing from admin**               | Toasts                                    |
| warehouse.html | Receive, Pick, Pack & dispatch, Offline sale, Stock count (:271-344) | **Missing from admin**               | Floor UI                                  |
|                | Approvals, Racks & bins, Near expiry, Routing (:359-411)             | **Missing from admin**, manager-only | Client `mgr-only` class (:445)            |

**Decision for the React build.** There is one set of modules. Each role console is the same module rendered with fewer permissions. It is not a separate HTML page. Every feature unique to a role console above becomes a module that the Platform Admin can also see.

## 3. Super-admin superset

### 3a. Checklist for every entity page (encoded in `page-contract`)

- [ ] Server pagination with a real total, and a page-size choice.
- [ ] Debounced server search (name, SKU, code, phone).
- [ ] Filters and date range kept in the URL.
- [ ] Server sort.
- [ ] Detail page with a deep link: overview, related records, history.
- [ ] Create and edit forms with client and server validation, and a `version` conflict check.
- [ ] Archive (soft delete) with a reason, restore, and a "show archived" filter. Hard delete is super-admin only and blocked when references exist.
- [ ] Status lifecycle with only the allowed transitions.
- [ ] Bulk select with bulk status change, assign, archive and export.
- [ ] Bulk import (CSV/XLSX):
  - template download
  - column mapping
  - references matched by code or name
  - dry-run validation
  - row-error report
  - async job
  - upsert
- [ ] Export of the filtered view, run as an async job.
- [ ] Async searchable combobox for every entity reference. A static `<select>` is only for small enums.
- [ ] Audit trail: who, when, before and after, reason.
- [ ] Empty, loading, error-with-retry and no-results states.
- [ ] Confirmation for destructive actions, with a reason for reject and cancel.
- [ ] RBAC per action, enforced on the server, with optional scope by warehouse, city or account.
- [ ] Phone-usable list and detail layouts.

Later, per user: a column chooser and saved views. Both are not in the contract yet.

### 3b. Extra needs per entity

| Entity              | Beyond the checklist                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Products            | Variants or pack sizes, each with its own SKU and barcode. A UOM master with conversions. An HSN master with GST rate and cess. MRP, cost and selling price. Price tiers by segment, quantity slab and city. MOQ and step quantity. Ordered images. Shelf life, batch and expiry tracking. Storage type. Substitutes. Supplier mapping. Draft, published and archived states. Per-city availability. |
| Categories          | Tree with expand and collapse. Drag reorder and re-parent. Bulk move of products. Merge. Depth limit. Product counts. Per-city visibility.                                                                                                                                                                                                                                                           |
| Brands / Add-ons    | Dedupe and merge. Add-on groups with min/max rules, mapped to items.                                                                                                                                                                                                                                                                                                                                 |
| Suppliers           | GSTIN and PAN validation. Bank and KYC documents. Multiple categories. Supplier price list with validity dates. Lead time. Rating and fill rate. Ledger.                                                                                                                                                                                                                                             |
| PO / GRN            | Lifecycle with approval thresholds. Product picker. Per-line tax. PDF and email. Partial receipts. Batch and expiry at GRN. QC reject. Stock-ledger posting. Three-way match (PO, GRN, invoice).                                                                                                                                                                                                     |
| Inventory           | Stock by warehouse and bin. An immutable movement ledger. Adjustments with approval. Transfers. Cycle counts with variance approval. Reorder points. FEFO. Reservations.                                                                                                                                                                                                                             |
| Orders              | Order builder on behalf of a customer, with a credit check. Status timeline. Edit and cancel before pick. Partial fulfilment and substitution. Invoices and credit notes. Payment mode. Delivery slot. SLA flags.                                                                                                                                                                                    |
| Delivery            | Routes and trips. Vehicle and driver masters. Courier status. Proof of delivery. Failed-attempt reasons. Zones and pincodes with cutoffs.                                                                                                                                                                                                                                                            |
| Returns / Tickets   | Approve, reject, refund and replace. Photos. SLA. Assignment. Refund through finance.                                                                                                                                                                                                                                                                                                                |
| Customers / Outlets | Organisation → outlets hierarchy. Multiple addresses and GSTINs. KYC. Assigned RM. Customer price list. Credit limit and ledger. Block. Onboarding queue with a document viewer.                                                                                                                                                                                                                     |
| Credit              | Application → visit → limit → active, with maker-checker, limit history and audit.                                                                                                                                                                                                                                                                                                                   |
| Pricing & Offers    | Price lists by segment and city. Validity windows. Quantity slabs. Coupons with eligibility rules. Approval. Bulk price update by import.                                                                                                                                                                                                                                                            |
| Users & Roles       | Invite and deactivate. Role builder with a permission matrix. Scope by warehouse, city or account. 2FA. Sessions. Login audit.                                                                                                                                                                                                                                                                       |
| CMS / Notifications | Scheduled, city-targeted banners. Template editor with variables, test send and delivery logs.                                                                                                                                                                                                                                                                                                       |
| Settings / Masters  | Warehouses, tax/HSN, UOM, delivery slots, invoice numbering. Integration credentials stored on the server.                                                                                                                                                                                                                                                                                           |
| Reports             | Standard reports (sales, GMV, fill rate, OTIF, stock ageing, receivables). Filters. Scheduled email. Async export.                                                                                                                                                                                                                                                                                   |

## 4. Suggested build order

1. **Masters.** Categories (reference module, done in this PR), UOM, HSN/tax, Brands, Warehouses. Products depend on all of them.
2. **Products** with variants, pricing and import. This is the largest page and the most important one for scale.
3. **Customers / Outlets**, plus Users & Roles with real auth (this replaces the prototype's client-side guard).
4. **Orders → Inventory ledger → PO/GRN → Delivery → Returns.**
5. **Finance**: credit, ledgers, settlements. Then **Pricing & Offers**, **CMS**, **Notifications**, **Reports**.
