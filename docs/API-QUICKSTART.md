# API quickstart

## Create medicine
`POST http://localhost:8086/api/medicines`
Content-Type: application/json

```json
{
  "medicineName": "Test Paracetamol",
  "genericName": "Paracetamol",
  "strength": "650 mg",
  "dosageForm": "TABLET",
  "manufacturer": "Example Pharma",
  "category": "Pain relief",
  "prescriptionRequired": false,
  "manufacturerBarcode": "8901234567890"
}
```

## Lookup barcode
`GET http://localhost:8086/api/barcode/8901234567890`

Found response includes `found: true` and a `medicine` object. Unknown response includes `found: false` and `medicine: null`.

## Notes
Use unique test barcodes. A unique barcode conflict returns HTTP 409. This starter does not perform external medicine database lookup and does not automatically create inventory batches or stock.

## Medicine batch + automatic barcode

Create a medicine master first (`POST /api/medicines`), then create one or more batches:

`POST http://localhost:8086/api/medicines/{medicineId}/batches`

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

The response includes a unique `internalBarcode` beginning with `UTB-`. Get its Code 128 PNG from:

`GET http://localhost:8086/api/barcode/image/{internalBarcode}`

Scan it in the Android app to retrieve medicine name, batch, MRP, manufacturing date, expiry date and quantity:

`GET http://localhost:8086/api/barcode/batch/{internalBarcode}`

The barcode encodes only the unique batch identifier. Human-readable details are printed beside it on the label and fetched from the database when scanned.
