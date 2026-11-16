package com.utaam.medical.service;

import com.utaam.medical.dto.*;
import com.utaam.medical.entity.Medicine;
import com.utaam.medical.entity.MedicineBatch;
import com.utaam.medical.repository.MedicineBatchRepository;
import com.utaam.medical.repository.MedicineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class MedicineBatchService {
    private final MedicineRepository medicines;
    private final MedicineBatchRepository batches;
    private final MedicineService medicineService;
    public MedicineBatchService(MedicineRepository medicines, MedicineBatchRepository batches, MedicineService medicineService) {
        this.medicines = medicines; this.batches = batches; this.medicineService = medicineService;
    }
    @Transactional
    public MedicineBatchResponse create(Long medicineId, MedicineBatchRequest request) {
        Medicine medicine = medicines.findById(medicineId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicine not found"));
        if (request.expiryDate().isBefore(request.manufacturingDate())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry date must be after manufacturing date");
        if (request.manufacturingDate().isAfter(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Manufacturing date cannot be in the future");
        MedicineBatch batch = new MedicineBatch();
        batch.setMedicine(medicine); batch.setBatchNumber(request.batchNumber().trim());
        batch.setInternalBarcode("UTB-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase());
        batch.setMrp(request.mrp()); batch.setPurchasePrice(request.purchasePrice());
        batch.setManufacturingDate(request.manufacturingDate()); batch.setExpiryDate(request.expiryDate()); batch.setQuantity(request.quantity());
        return toResponse(batches.save(batch));
    }
    @Transactional(readOnly = true)
    public List<MedicineBatchResponse> list(Long medicineId) {
        if (!medicines.existsById(medicineId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicine not found");
        return batches.findByMedicineIdOrderByExpiryDateAsc(medicineId).stream().map(this::toResponse).toList();
    }
    @Transactional(readOnly = true)
    public BatchBarcodeLookupResponse lookup(String barcode) {
        MedicineBatch b = batches.findByInternalBarcode(barcode.trim()).orElse(null);
        return b == null ? new BatchBarcodeLookupResponse(false, null, null)
            : new BatchBarcodeLookupResponse(true, medicineService.get(b.getMedicine().getId()), toResponse(b));
    }
    private MedicineBatchResponse toResponse(MedicineBatch b) {
        return new MedicineBatchResponse(b.getId(), b.getMedicine().getId(), b.getMedicine().getMedicineCode(),
            b.getMedicine().getMedicineName(), b.getBatchNumber(), b.getInternalBarcode(), b.getMrp(), b.getPurchasePrice(),
            b.getManufacturingDate(), b.getExpiryDate(), b.getQuantity());
    }
}
