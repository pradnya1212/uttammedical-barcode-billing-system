
package com.utaam.medical.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String deliveryAddress;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private String orderStatus;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal discountAmount;
    private String deliveryStaffName;
    private String deliveryStaffPhone;
    private String expectedDeliveryDate;
    private String deliveryTimeSlot;
    private String deliveryInstructions;
    private String deliveryOtp;
    private Boolean prescriptionRequired;
    private Boolean prescriptionVerified;
    private String prescriptionRemarks;
    private String internalNotes;
    private String cancellationReason;
    private String rejectionReason;
    private LocalDateTime createdAt;

    private List<OrderItemDto> items = new ArrayList<>();
    private List<StatusHistoryDto> statusHistory = new ArrayList<>();

    public OrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(BigDecimal deliveryCharge) { this.deliveryCharge = deliveryCharge; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public String getDeliveryStaffName() { return deliveryStaffName; }
    public void setDeliveryStaffName(String deliveryStaffName) { this.deliveryStaffName = deliveryStaffName; }

    public String getDeliveryStaffPhone() { return deliveryStaffPhone; }
    public void setDeliveryStaffPhone(String deliveryStaffPhone) { this.deliveryStaffPhone = deliveryStaffPhone; }

    public String getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(String expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public String getDeliveryTimeSlot() { return deliveryTimeSlot; }
    public void setDeliveryTimeSlot(String deliveryTimeSlot) { this.deliveryTimeSlot = deliveryTimeSlot; }

    public String getDeliveryInstructions() { return deliveryInstructions; }
    public void setDeliveryInstructions(String deliveryInstructions) { this.deliveryInstructions = deliveryInstructions; }

    public String getDeliveryOtp() { return deliveryOtp; }
    public void setDeliveryOtp(String deliveryOtp) { this.deliveryOtp = deliveryOtp; }

    public Boolean getPrescriptionRequired() { return prescriptionRequired; }
    public void setPrescriptionRequired(Boolean prescriptionRequired) { this.prescriptionRequired = prescriptionRequired; }

    public Boolean getPrescriptionVerified() { return prescriptionVerified; }
    public void setPrescriptionVerified(Boolean prescriptionVerified) { this.prescriptionVerified = prescriptionVerified; }

    public String getPrescriptionRemarks() { return prescriptionRemarks; }
    public void setPrescriptionRemarks(String prescriptionRemarks) { this.prescriptionRemarks = prescriptionRemarks; }

    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }

    public List<StatusHistoryDto> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<StatusHistoryDto> statusHistory) {
        this.statusHistory = statusHistory;
    }

    // Order medicine details
    public static class OrderItemDto {

        private Long id;
        private Long medicineId;
        private String medicineName;
        private String dosageForm;
        private String batchNumber;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;

        public OrderItemDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getMedicineId() { return medicineId; }
        public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

        public String getMedicineName() { return medicineName; }
        public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

        public String getDosageForm() { return dosageForm; }
        public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }

        public String getBatchNumber() { return batchNumber; }
        public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    }

    // Order tracking history
    public static class StatusHistoryDto {

        private String status;
        private String note;
        private LocalDateTime updatedAt;

        public StatusHistoryDto() {}

        public StatusHistoryDto(
                String status,
                String note,
                LocalDateTime updatedAt
        ) {
            this.status = status;
            this.note = note;
            this.updatedAt = updatedAt;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }
    }
}
