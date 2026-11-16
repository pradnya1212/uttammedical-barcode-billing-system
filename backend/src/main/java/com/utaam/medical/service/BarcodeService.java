package com.utaam.medical.service;

import com.utaam.medical.dto.BarcodeLookupResponse;
import com.utaam.medical.dto.MedicineResponse;
import com.utaam.medical.entity.Medicine;
import com.utaam.medical.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BarcodeService {
    private final MedicineRepository repository;
    private final MedicineService medicineService;

    public BarcodeService(MedicineRepository repository, MedicineService medicineService) {
        this.repository = repository;
        this.medicineService = medicineService;
    }

    @Transactional(readOnly = true)
    public BarcodeLookupResponse lookup(String rawBarcode) {
        String barcode = rawBarcode == null ? "" : rawBarcode.trim();
        Medicine medicine = repository.findByManufacturerBarcode(barcode).orElse(null);
        MedicineResponse response = medicine == null ? null : medicineService.get(medicine.getId());
        return new BarcodeLookupResponse(medicine != null, barcode, response);
    }
}
