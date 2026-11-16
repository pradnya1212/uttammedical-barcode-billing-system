package com.utaam.medical.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MedicineBatchRequest(
    @NotBlank @Size(max = 80) String batchNumber,
    @NotNull @DecimalMin("0.01") BigDecimal mrp,
    @DecimalMin("0.00") BigDecimal purchasePrice,
    @NotNull LocalDate manufacturingDate,
    @NotNull LocalDate expiryDate,
    @NotNull @Min(0) Integer quantity
) {}
