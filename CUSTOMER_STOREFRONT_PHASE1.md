# Phase 1 — Customer storefront

This update adds a separate customer-facing storefront while preserving the existing UTAAM admin workspace.

## URLs
- Admin workspace: `http://localhost:5173/`
- Customer storefront: `http://localhost:5173/store.html`

The admin header now has a **Customer store** shortcut. The storefront header has an **Admin** shortcut.

## Connection to the existing backend
The storefront reads:
- `GET /api/medicines`
- `GET /api/medicines/{id}/batches`

It displays active medicines and derives available quantity and the lowest available batch MRP. It does not create orders or deduct stock yet. It hides Add buttons when a medicine has no priced available batch, is out of stock, or requires a prescription.

The category tabs use horizontal touch scrolling on mobile. The cart and wishlist are currently browser-session UI only.

## Run on Windows
1. Start PostgreSQL and the Spring Boot backend as described in `RUN_PROJECT_WINDOWS.md`.
2. In a second terminal:
   ```powershell
   cd .\web
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173/store.html`.

## PayPal status — not enabled in this phase
The checkout is deliberately a non-payment preview. It does not collect or store card data and does not claim a payment was made.

To add real PayPal in the next phase:
1. Create a PayPal Developer account and create Sandbox REST app credentials.
2. Keep the Client Secret only in backend environment variables; never put it in React/Vite code.
3. Add backend endpoints to create an order and capture/verify the approved order using PayPal's server API.
4. Create the pharmacy sale and deduct stock in one database transaction only after verified capture.
5. Verify PayPal webhooks server-side and test with Sandbox buyer/seller accounts before enabling Live credentials.

## Scope intentionally left for the next step
- Persistent customer accounts and wishlist.
- Backend cart/order creation and transactional stock deduction.
- Prescription upload and pharmacist approval workflow.
- Shipping, tax/GST, refunds and order tracking.
- PayPal Sandbox and Live integration.

Do not use this starter checkout for real customer payments until those backend workflows are implemented and tested.
