# Project status

## Included and connected to PostgreSQL through the Spring Boot API
- Medicine master list, detail and creation endpoints.
- Medicine batch listing and creation endpoints.
- Internal batch barcode generation.
- Code 128 barcode image endpoint.
- Manufacturer barcode and internal batch barcode lookup endpoints.
- React website with browser barcode scanning integration.

## Website screens that still need complete backend workflows
- Suppliers and customers.
- Purchase orders and receiving.
- POS sales, invoices and atomic stock deduction.
- Returns.
- Database-backed stock alerts and reports.
- Persistent user profiles, authentication and role-based access.

These screens must not be treated as fully persistent merely because they appear in the website. Some currently use browser-local state/placeholders.

## Before production
- Implement authentication, authorization and audit logging.
- Add database migrations (Flyway or Liquibase).
- Add transactional sales/returns and stock validation.
- Add automated backend and browser end-to-end tests.
- Configure HTTPS, secrets management, backups and deployment hardening.
