package com.utaam.medical.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "medicines",
       indexes = @Index(name = "idx_medicine_name", columnList = "medicine_name"))
public class Medicine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medicine_code", nullable = false, unique = true, length = 30)
    private String medicineCode;

    @Column(name = "manufacturer_barcode", unique = true, length = 80)
    private String manufacturerBarcode;

    @Column(name = "medicine_name", nullable = false, length = 150)
    private String medicineName;

    @Column(name = "generic_name", length = 150)
    private String genericName;

    @Column(nullable = false, length = 50)
    private String strength;

    @Enumerated(EnumType.STRING)
    @Column(name = "dosage_form", nullable = false, length = 30)
    private DosageForm dosageForm;

    @Column(length = 150)
    private String manufacturer;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    private boolean prescriptionRequired;

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public String getMedicineCode() { return medicineCode; }
    public void setMedicineCode(String medicineCode) { this.medicineCode = medicineCode; }
    public String getManufacturerBarcode() { return manufacturerBarcode; }
    public void setManufacturerBarcode(String manufacturerBarcode) { this.manufacturerBarcode = manufacturerBarcode; }
    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }
    public String getStrength() { return strength; }
    public void setStrength(String strength) { this.strength = strength; }
    public DosageForm getDosageForm() { return dosageForm; }
    public void setDosageForm(DosageForm dosageForm) { this.dosageForm = dosageForm; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isPrescriptionRequired() { return prescriptionRequired; }
    public void setPrescriptionRequired(boolean prescriptionRequired) { this.prescriptionRequired = prescriptionRequired; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
