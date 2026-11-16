package com.utaam.medical.repository;

import com.utaam.medical.entity.MedicineBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicineBatchRepository extends JpaRepository<MedicineBatch, Long> {
    Optional<MedicineBatch> findByInternalBarcode(String internalBarcode);
    List<MedicineBatch> findByMedicineIdOrderByExpiryDateAsc(Long medicineId);
}
