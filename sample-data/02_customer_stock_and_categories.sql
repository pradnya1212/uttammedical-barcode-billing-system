-- Customer Stock and Categorized Inventory for UTAAM Medical Storefront
-- Adds Syrups, Medicines, Drops, Ointments, and Wellness products with full batches and stock.

-- 1. Update existing demo items with standardized categories
UPDATE medicines SET category = 'Medicines & Pain Relief' WHERE medicine_code = 'UTAAM-DEMO-001';
UPDATE medicines SET category = 'Medicines & Allergy' WHERE medicine_code = 'UTAAM-DEMO-002';
UPDATE medicines SET category = 'Medicines & Antibiotics' WHERE medicine_code = 'UTAAM-DEMO-003';
UPDATE medicines SET category = 'Wellness & Supplements' WHERE medicine_code = 'UTAAM-DEMO-004';
UPDATE medicines SET category = 'Syrup & Cough Relief' WHERE medicine_code = 'UTAAM-DEMO-005';

-- 2. Insert new diverse medicines and syrups
INSERT INTO medicines
(medicine_code, manufacturer_barcode, medicine_name, generic_name, strength,
 dosage_form, manufacturer, category, prescription_required, active)
VALUES
-- Syrups & Suspensions ("seroupp")
('UTAAM-SYR-001', '8901234568001', 'Benadryl Cough Relief Syrup', 'Diphenhydramine + Ammonium Chloride', '100 ml', 'SYRUP', 'Johnson & Johnson', 'Syrup & Cough Relief', false, true),
('UTAAM-SYR-002', '8901234568002', 'Ascoril-D Cough & Cold Syrup', 'Dextromethorphan + Phenylephrine', '100 ml', 'SYRUP', 'Glenmark Pharma', 'Syrup & Cough Relief', false, true),
('UTAAM-SYR-003', '8901234568003', 'Calpol Pediatric Fever Syrup', 'Paracetamol Paediatric Suspension', '60 ml', 'SYRUP', 'GSK Healthcare', 'Syrup & Fever Care', false, true),
('UTAAM-SYR-004', '8901234568004', 'Gelusil MPS Antacid Suspension', 'Magnesium + Aluminium Hydroxide + Simethicone', '200 ml', 'SUSPENSION', 'Pfizer Healthcare', 'Syrup & Digestion', false, true),
('UTAAM-SYR-005', '8901234568005', 'Becozym C Forte Tonic Syrup', 'Vitamin B-Complex with Zinc', '225 ml', 'SYRUP', 'Bayer Healthcare', 'Syrup & Immunity', false, true),
('UTAAM-SYR-006', '8901234568006', 'Cremaffin Gentle Relief Emulsion', 'Liquid Paraffin + Milk of Magnesia', '225 ml', 'SUSPENSION', 'Abbott Healthcare', 'Syrup & Digestion', false, true),

-- Medicines (Tablets & Capsules)
('UTAAM-MED-001', '8901234568010', 'Dolo 650 Tablets', 'Paracetamol', '650 mg (15 tabs)', 'TABLET', 'Micro Labs', 'Medicines & Pain Relief', false, true),
('UTAAM-MED-002', '8901234568011', 'Brufen 400 Pain Relief', 'Ibuprofen', '400 mg (15 tabs)', 'TABLET', 'Abbott Healthcare', 'Medicines & Pain Relief', false, true),
('UTAAM-MED-003', '8901234568012', 'Pan-40 Antacid Tablets', 'Pantoprazole Sodium', '40 mg (15 tabs)', 'TABLET', 'Alkem Laboratories', 'Medicines & Gastro Care', false, true),
('UTAAM-MED-004', '8901234568013', 'Augmentin 625 Duo', 'Amoxicillin & Clavulanate', '625 mg (10 tabs)', 'TABLET', 'GSK Healthcare', 'Medicines & Antibiotics', true, true),
('UTAAM-MED-005', '8901234568014', 'Omez 20 Acid Reflux Care', 'Omeprazole', '20 mg (20 caps)', 'CAPSULE', 'Dr. Reddy''s Labs', 'Medicines & Gastro Care', false, true),
('UTAAM-MED-006', '8901234568015', 'Glycomet 500 SR', 'Metformin Hydrochloride', '500 mg (20 tabs)', 'TABLET', 'USV Private Ltd', 'Medicines & Diabetes Care', true, true),

-- Drops & Inhalers
('UTAAM-DRP-001', '8901234568020', 'Otrivin Decongestant Spray', 'Oxymetazoline Hydrochloride', '10 ml', 'DROPS', 'GSK Consumer', 'Drops & Inhalers', false, true),
('UTAAM-DRP-002', '8901234568021', 'Ciplox Eye / Ear Drops', 'Ciprofloxacin 0.3% w/v', '10 ml', 'DROPS', 'Cipla Healthcare', 'Drops & Inhalers', false, true),
('UTAAM-DRP-003', '8901234568022', 'Asthalin Inhaler', 'Salbutamol Inhalation Aerosol', '100 mcg (200 doses)', 'INHALER', 'Cipla Healthcare', 'Drops & Inhalers', true, true),

-- Ointments & Creams
('UTAAM-OIN-001', '8901234568030', 'Volini Maxx Pain Relief Gel', 'Diclofenac Diethylamine', '50 g', 'CREAM', 'Sun Pharma', 'Ointments & Creams', false, true),
('UTAAM-OIN-002', '8901234568031', 'Betadine 5% Antiseptic Ointment', 'Povidone-Iodine 5% w/w', '20 g', 'OINTMENT', 'Win-Medicare', 'Ointments & Creams', false, true),
('UTAAM-OIN-003', '8901234568032', 'Burnol Antiseptic First Aid Cream', 'Aminacrine HCL & Cetrimide', '25 g', 'CREAM', 'Morepen Labs', 'Ointments & Creams', false, true),

-- Wellness & Supplements
('UTAAM-WEL-001', '8901234568040', 'Limcee Vitamin C Chewables', 'Ascorbic Acid & Sodium Ascorbate', '500 mg (15 tabs)', 'TABLET', 'Abbott Healthcare', 'Wellness & Supplements', false, true),
('UTAAM-WEL-002', '8901234568041', 'Shelcal 500 Calcium & D3', 'Elemental Calcium + Vitamin D3', '15 tabs', 'TABLET', 'Torrent Pharma', 'Wellness & Supplements', false, true),
('UTAAM-WEL-003', '8901234568042', 'Electral WHO ORS Sachet', 'Oral Rehydration Salts Formula', '21.8 g', 'POWDER', 'FDC Limited', 'Wellness & Supplements', false, true)
ON CONFLICT (medicine_code) DO NOTHING;

-- 3. Insert Available Stock Batches
INSERT INTO medicine_batches
(medicine_id, batch_number, internal_barcode, mrp, purchase_price,
 manufacturing_date, expiry_date, quantity)
SELECT m.id, v.batch_number, v.internal_barcode, v.mrp, v.purchase_price,
       v.manufacturing_date::date, v.expiry_date::date, v.quantity
FROM (VALUES
 -- Syrups
 ('UTAAM-SYR-001', 'BAT-BEN-01', 'UTB-BEN-0001', 135.00, 95.00, '2026-01-10', '2027-12-31', 45),
 ('UTAAM-SYR-002', 'BAT-ASC-01', 'UTB-ASC-0002', 128.00, 88.00, '2026-02-05', '2027-11-30', 60),
 ('UTAAM-SYR-003', 'BAT-CAL-01', 'UTB-CAL-0003', 82.00, 54.00, '2026-03-01', '2028-02-28', 75),
 ('UTAAM-SYR-004', 'BAT-GEL-01', 'UTB-GEL-0004', 145.00, 102.00, '2026-01-20', '2027-10-31', 50),
 ('UTAAM-SYR-005', 'BAT-BEC-01', 'UTB-BEC-0005', 165.00, 115.00, '2026-02-15', '2027-08-31', 40),
 ('UTAAM-SYR-006', 'BAT-CRM-01', 'UTB-CRM-0006', 210.00, 155.00, '2026-01-18', '2027-09-30', 35),

 -- Medicines
 ('UTAAM-MED-001', 'BAT-DOLO-01', 'UTB-DOLO-0010', 34.00, 22.00, '2026-02-01', '2028-01-31', 150),
 ('UTAAM-MED-002', 'BAT-BRU-01', 'UTB-BRU-0011', 48.00, 32.00, '2026-01-25', '2027-12-31', 90),
 ('UTAAM-MED-003', 'BAT-PAN-01', 'UTB-PAN-0012', 155.00, 110.00, '2026-02-10', '2028-01-31', 80),
 ('UTAAM-MED-004', 'BAT-AUG-01', 'UTB-AUG-0013', 205.00, 160.00, '2026-03-01', '2027-08-31', 40),
 ('UTAAM-MED-005', 'BAT-OME-01', 'UTB-OME-0014', 110.00, 78.00, '2026-01-15', '2027-11-30', 85),
 ('UTAAM-MED-006', 'BAT-GLY-01', 'UTB-GLY-0015', 45.00, 30.00, '2026-02-20', '2028-02-28', 100),

 -- Drops & Inhalers
 ('UTAAM-DRP-001', 'BAT-OTR-01', 'UTB-OTR-0020', 115.00, 80.00, '2026-01-12', '2027-12-31', 55),
 ('UTAAM-DRP-002', 'BAT-CIP-01', 'UTB-CIP-0021', 24.00, 15.00, '2026-02-08', '2027-10-31', 90),
 ('UTAAM-DRP-003', 'BAT-AST-01', 'UTB-AST-0022', 165.00, 125.00, '2026-01-30', '2028-01-31', 40),

 -- Ointments & Creams
 ('UTAAM-OIN-001', 'BAT-VOL-01', 'UTB-VOL-0030', 175.00, 120.00, '2026-02-12', '2028-01-31', 65),
 ('UTAAM-OIN-002', 'BAT-BET-01', 'UTB-BET-0031', 78.00, 52.00, '2026-01-15', '2028-06-30', 70),
 ('UTAAM-OIN-003', 'BAT-BUR-01', 'UTB-BUR-0032', 85.00, 58.00, '2026-02-01', '2027-12-31', 60),

 -- Wellness & Supplements
 ('UTAAM-WEL-001', 'BAT-LIM-01', 'UTB-LIM-0040', 32.00, 20.00, '2026-03-01', '2028-02-28', 120),
 ('UTAAM-WEL-002', 'BAT-SHE-01', 'UTB-SHE-0041', 132.00, 92.00, '2026-01-10', '2028-01-31', 80),
 ('UTAAM-WEL-003', 'BAT-ELE-01', 'UTB-ELE-0042', 24.50, 16.00, '2026-02-15', '2028-02-28', 140)
) AS v(medicine_code,batch_number,internal_barcode,mrp,purchase_price,manufacturing_date,expiry_date,quantity)
JOIN medicines m ON m.medicine_code = v.medicine_code
ON CONFLICT (internal_barcode) DO NOTHING;

-- Keep sequences aligned
SELECT setval(pg_get_serial_sequence('medicines','id'), COALESCE((SELECT MAX(id) FROM medicines),1), true);
SELECT setval(pg_get_serial_sequence('medicine_batches','id'), COALESCE((SELECT MAX(id) FROM medicine_batches),1), true);

