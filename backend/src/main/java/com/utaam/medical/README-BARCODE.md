# UTAAM MEDICAL - Medicine and batch barcode workflow

## Barcode design
- Manufacturer barcode is stored on the medicine master (`manufacturerBarcode`) and is never overwritten.
- Every medicine receives a UTAAM medicine code (`MED...`) on registration.
- Every stock batch receives a unique internal Code 128 value (`UTB-...`). The batch barcode resolves to medicine + batch + MRP + manufacturing date + expiry date + quantity.
- A barcode contains an identifier, not all human-readable medicine data. The printed label should show the details beside the barcode; scanning fetches current details from the API.

## APIs (backend port 8086)
1. `POST /api/medicines` - create medicine master.
2. `GET /api/medicines` - list medicines.
3. `POST /api/medicines/{medicineId}/batches` - create batch; internal barcode is generated automatically.
4. `GET /api/medicines/{medicineId}/batches` - list batches.
5. `GET /api/barcode/batch/{internalBarcode}` - lookup batch barcode.
6. `GET /api/barcode/image/{internalBarcode}` - Code 128 PNG.
7. `GET /api/barcode/{manufacturerBarcode}` - manufacturer barcode lookup.

### Example batch JSON
```json
{
  "batchNumber": "BATCH1025",
  "mrp": 25.00,
  "purchasePrice": 18.50,
  "manufacturingDate": "2026-10-01",
  "expiryDate": "2028-09-30",
  "quantity": 100
}
```

## Android
The Android app currently scans manufacturer barcodes using CameraX + ML Kit and calls `/api/barcode/{barcode}`. To test on emulator, `10.0.2.2` points to the host machine. For a physical phone, set `API_BASE_URL` in `MainActivity.java` to the development computer's LAN IP and ensure both devices share the network.

## Database note
This starter uses Hibernate `ddl-auto: update` for local development. Back up your database before running against existing data. For production, use Flyway/Liquibase migrations and secure DB credentials via environment variables.
