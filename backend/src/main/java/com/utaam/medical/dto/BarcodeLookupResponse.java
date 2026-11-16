package com.utaam.medical.dto;

public record BarcodeLookupResponse(boolean found, String manufacturerBarcode, MedicineResponse medicine) {}
