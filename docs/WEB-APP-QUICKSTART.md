# UTAAM MEDICAL Web App Quick Start

1. Start PostgreSQL and create database `utaam_medical`.
2. Start Spring Boot from `backend/` on port 8086.
3. Open a terminal in `web/` and run `npm install` then `npm run dev`.
4. Open `http://localhost:5173`.
5. Add a medicine master record, then open it and add one or more batches. The backend generates a unique internal batch barcode for each batch.
6. Use Barcode lookup to search a manufacturer barcode or internal `UTB-...` batch barcode. Batch details include MRP, manufacturing date, expiry date and quantity.

If the web page reports a network/CORS error, confirm backend is running and that the browser URL is `http://localhost:5173`. The backend CORS configuration allows localhost port 5173.
