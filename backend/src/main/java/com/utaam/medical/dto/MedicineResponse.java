package com.utaam.medical.dto;

import com.utaam.medical.entity.DosageForm;

public record MedicineResponse(
    Long id, String medicineCode, String manufacturerBarcode,
    String medicineName, String genericName, String strength,
    DosageForm dosageForm, String manufacturer, String category,
    boolean prescriptionRequired, boolean active
) {}
