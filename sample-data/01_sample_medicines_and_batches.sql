-- UTAAM MEDICAL sample data for local development only.
-- Run this AFTER the Spring Boot backend has started once and Hibernate
-- has created the medicines and medicine_batches tables.
-- This script is safe to re-run: it skips medicine codes already present.
-- Do not use these fictional records in a live pharmacy database.

INSERT INTO medicines
(medicine_code, manufacturer_barcode, medicine_name, generic_name, strength,
 dosage_form, manufacturer, category, prescription_required, active)
VALUES
('UTAAM-DEMO-001', '8901234567001', 'Paracetamol', 'Paracetamol', '500 mg', 'TABLET', 'Demo Pharma', 'Pain relief', false, true),
('UTAAM-DEMO-002', '8901234567002', 'Cetirizine', 'Cetirizine Hydrochloride', '10 mg', 'TABLET', 'Demo Pharma', 'Allergy', false, true),
('UTAAM-DEMO-003', '8901234567003', 'Amoxicillin', 'Amoxicillin', '250 mg', 'CAPSULE', 'Sample Labs', 'Antibiotic', true, true),
('UTAAM-DEMO-004', '8901234567004', 'ORS Powder', 'Oral Rehydration Salts', '21.8 g', 'POWDER', 'Health Demo', 'Rehydration', false, true),
('UTAAM-DEMO-005', '8901234567005', 'Cough Syrup', 'Dextromethorphan combination', '100 ml', 'SYRUP', 'Sample Labs', 'Cough and cold', false, true)
ON CONFLICT (medicine_code) DO NOTHING;

-- Add one illustrative batch for each demo medicine. Barcode values are
-- unique demo identifiers; production batches should be created through UI/API.
INSERT INTO medicine_batches
(medicine_id, batch_number, internal_barcode, mrp, purchase_price,
 manufacturing_date, expiry_date, quantity)
SELECT m.id, v.batch_number, v.internal_barcode, v.mrp, v.purchase_price,
       v.manufacturing_date::date, v.expiry_date::date, v.quantity
FROM (VALUES
 ('UTAAM-DEMO-001','DEMO-PARA-01','UTB-DEMO-PARA-0001',25.00,18.00,'2026-01-15','2027-12-31',120),
 ('UTAAM-DEMO-002','DEMO-CET-01','UTB-DEMO-CETI-0002',35.00,24.00,'2026-02-01','2027-11-30',80),
 ('UTAAM-DEMO-003','DEMO-AMOX-01','UTB-DEMO-AMOX-0003',72.00,55.00,'2026-01-10','2027-06-30',45),
 ('UTAAM-DEMO-004','DEMO-ORS-01','UTB-DEMO-ORS-0004',22.00,14.00,'2026-03-01','2027-08-31',60),
 ('UTAAM-DEMO-005','DEMO-COUGH-01','UTB-DEMO-COUG-0005',95.00,68.00,'2026-02-15','2027-09-30',30)
) AS v(medicine_code,batch_number,internal_barcode,mrp,purchase_price,manufacturing_date,expiry_date,quantity)
JOIN medicines m ON m.medicine_code = v.medicine_code
ON CONFLICT (internal_barcode) DO NOTHING;

-- Keep PostgreSQL identity sequences aligned after explicit sample imports
SELECT setval(pg_get_serial_sequence('medicines','id'), COALESCE((SELECT MAX(id) FROM medicines),1), true);
SELECT setval(pg_get_serial_sequence('medicine_batches','id'), COALESCE((SELECT MAX(id) FROM medicine_batches),1), true);
