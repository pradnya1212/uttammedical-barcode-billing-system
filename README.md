# UTAAM MEDICAL — Pharmacy Management Web System

A local-development web project with a React website, Spring Boot REST API, and PostgreSQL database.

## Project structure

```text
UTAAM-MEDICAL/
├── backend/          # Java 17 + Spring Boot REST API
├── web/              # React + Vite website (browser barcode scanner)
├── database/         # Database setup notes
├── sample-data/      # Sample medicines and batches SQL
├── docs/             # API and website quick-start notes
├── postman/          # API request collection
├── README.md
├── PROJECT_STATUS.md
└── start-windows.ps1
```

## Requirements

- Java 17
- Maven 3.9+ (or IntelliJ IDEA's bundled Maven)
- PostgreSQL 18 (or a compatible PostgreSQL version)
- Node.js 20+ and npm

## 1. Create the database

In pgAdmin, create a database named `utaam_medical`.

Or, from a PostgreSQL SQL prompt, run:

```sql
CREATE DATABASE utaam_medical;
```

The backend defaults are:
- URL: `jdbc:postgresql://localhost:5432/utaam_medical`
- Username: `postgres`
- Password: `root`

The username is set to `postgres` because this is the account confirmed to connect successfully in the supplied troubleshooting session. The password default is `root` based on the earlier local configuration; if your actual `postgres` password is different, set `DB_PASSWORD` before starting the backend:

```powershell
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "YOUR_ACTUAL_POSTGRES_PASSWORD"
```

You can also override the URL with `DB_URL`. Do not share or commit your real password.

**Data safety:** `spring.jpa.hibernate.ddl-auto` is `update`, not `create` or `create-drop`. It does not intentionally drop existing tables. Back up important data before schema changes.

## 2. Start the backend

Open PowerShell in the project folder and run:

```powershell
cd backend
mvn spring-boot:run
```

If Maven is not on PATH, use IntelliJ's bundled Maven (adjust the path if your IntelliJ version differs):

```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd" -f "$PWD\pom.xml" org.springframework.boot:spring-boot-maven-plugin:3.5.6:run
```

Backend URL: `http://localhost:8086`.

## 3. Start the website

Open a second PowerShell window:

```powershell
cd web
npm install
npm run dev
```

Open `http://localhost:5173`.

Camera scanning requires browser camera permission. `localhost` is a secure context in modern browsers. If camera access is unavailable, enter the barcode manually.

## 4. Sample data

Read `sample-data/README.md`, then import `sample-data/01_sample_medicines_and_batches.sql` into `utaam_medical` after the backend has created the tables. Do not import it repeatedly unless you have checked its insert behavior.

## Implemented API workflows in this source

- Medicine list, detail and creation.
- Medicine batch list and creation.
- Manufacturer barcode lookup.
- Internal batch barcode lookup.
- Code 128 barcode PNG generation.

The web interface also contains operational screens for suppliers, customers, purchasing, billing, returns, alerts and reports. Some of these screens are local-browser UI registers/placeholders and are **not yet fully backed by server-side APIs or PostgreSQL transactions**. Authentication and production-grade role-based access are also not complete. See `PROJECT_STATUS.md`.

## Important

This is a cleaned development package based on the project ZIP you supplied. It is not represented as a production-ready pharmacy system. Verify each workflow and back up your database before using real pharmacy records.
