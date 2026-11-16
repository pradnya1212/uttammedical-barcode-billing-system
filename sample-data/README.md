# Sample pharmacy data

These are fictional demo records for local development. They must not be used as real medicine, batch, stock, prescription or patient information.

## Import

1. Start PostgreSQL and confirm the `utaam_medical` database exists.
2. Start the Spring Boot backend once so Hibernate creates the tables.
3. Open pgAdmin Query Tool for `utaam_medical`, or use `psql`.
4. Run `01_sample_medicines_and_batches.sql`.
5. Refresh the web app at `http://localhost:5173`.

The script is re-runnable and skips existing demo medicine codes and barcode values. It only seeds the backend tables currently present in this project (`medicines` and `medicine_batches`). Suppliers, customers, purchases, sales and returns remain browser-local registers/placeholders in this codebase; they are not represented as database-integrated modules yet.
