package com.utaam.medical.repository;

import com.utaam.medical.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByManufacturerBarcode(String manufacturerBarcode);
    boolean existsByMedicineCode(String medicineCode);
    List<Medicine> findByActiveTrueOrderByMedicineNameAsc();
}
