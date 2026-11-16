package com.utaam.medical.dto;

import com.utaam.medical.entity.DosageForm;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MedicineRequest(
    @NotBlank @Size(max = 150) String medicineName,
    @Size(max = 150) String genericName,
    @NotBlank @Size(max = 50) String strength,
    @NotNull DosageForm dosageForm,
    @Size(max = 150) String manufacturer,
    @Size(max = 100) String category,
    boolean prescriptionRequired,
    @Size(max = 80) String manufacturerBarcode
) {}
