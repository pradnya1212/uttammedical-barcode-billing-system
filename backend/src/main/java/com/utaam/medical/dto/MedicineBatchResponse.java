package com.utaam.medical.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MedicineBatchResponse(
    Long id, Long medicineId, String medicineCode, String medicineName, String batchNumber,
    String internalBarcode, BigDecimal mrp, BigDecimal purchasePrice,
    LocalDate manufacturingDate, LocalDate expiryDate, Integer quantity
) {}
