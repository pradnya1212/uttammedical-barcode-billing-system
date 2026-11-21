package com.utaam.medical.repository;

import com.utaam.medical.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    List<CustomerOrder> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);

    List<CustomerOrder> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);

    @Query("SELECT DISTINCT o FROM CustomerOrder o WHERE " +
           "(:email IS NOT NULL AND :email != '' AND LOWER(o.customerEmail) = LOWER(:email)) OR " +
           "(:phone IS NOT NULL AND :phone != '' AND o.customerPhone = :phone) " +
           "ORDER BY o.createdAt DESC")
    List<CustomerOrder> findByCustomerEmailOrPhone(@Param("email") String email, @Param("phone") String phone);
}
