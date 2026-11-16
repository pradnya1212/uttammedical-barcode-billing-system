package com.utaam.medical.dto;

public record BatchBarcodeLookupResponse(boolean found, MedicineResponse medicine, MedicineBatchResponse batch) {}
