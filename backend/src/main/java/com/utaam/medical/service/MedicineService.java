package com.utaam.medical.service;

import com.utaam.medical.dto.MedicineRequest;
import com.utaam.medical.dto.MedicineResponse;
import com.utaam.medical.entity.Medicine;
import com.utaam.medical.repository.MedicineRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class MedicineService {
    private final MedicineRepository repository;

    public MedicineService(MedicineRepository repository) { this.repository = repository; }

    @Transactional
    public MedicineResponse create(MedicineRequest request) {
        String barcode = normalizeBarcode(request.manufacturerBarcode());
        if (barcode != null && repository.findByManufacturerBarcode(barcode).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Manufacturer barcode is already registered");
        }

        Medicine m = new Medicine();
        m.setMedicineCode(generateCode());
        m.setManufacturerBarcode(barcode);
        m.setMedicineName(request.medicineName().trim());
        m.setGenericName(clean(request.genericName()));
        m.setStrength(request.strength().trim());
        m.setDosageForm(request.dosageForm());
        m.setManufacturer(clean(request.manufacturer()));
        m.setCategory(clean(request.category()));
        m.setPrescriptionRequired(request.prescriptionRequired());
        m.setActive(true);
        try {
            return toResponse(repository.saveAndFlush(m));
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Medicine code, barcode, or medicine uniqueness constraint conflict");
        }
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> list() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MedicineResponse get(Long id) {
        return repository.findById(id).map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicine not found"));
    }

    private String generateCode() {
        // Safe for starter/single-user use; for multi-user production, use a DB sequence or dedicated counter.
        long candidate = 10001;
        while (repository.existsByMedicineCode("MED" + candidate)) candidate++;
        return "MED" + candidate;
    }

    private String normalizeBarcode(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private MedicineResponse toResponse(Medicine m) {
        return new MedicineResponse(m.getId(), m.getMedicineCode(), m.getManufacturerBarcode(),
            m.getMedicineName(), m.getGenericName(), m.getStrength(), m.getDosageForm(),
            m.getManufacturer(), m.getCategory(), m.isPrescriptionRequired(), m.isActive());
    }
}
