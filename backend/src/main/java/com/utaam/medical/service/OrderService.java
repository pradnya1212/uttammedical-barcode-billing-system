
package com.utaam.medical.service;

import com.utaam.medical.dto.OrderCreateRequest;
import com.utaam.medical.dto.OrderResponse;
import com.utaam.medical.dto.OrderStatusUpdateRequest;

import com.utaam.medical.entity.CustomerOrder;
import com.utaam.medical.entity.CustomerOrderItem;
import com.utaam.medical.entity.MedicineBatch;
import com.utaam.medical.entity.OrderStatusHistory;

import com.utaam.medical.repository.CustomerOrderRepository;
import com.utaam.medical.repository.MedicineBatchRepository;
import com.utaam.medical.repository.OrderStatusHistoryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final MedicineBatchRepository batchRepository;
    private final OrderStatusHistoryRepository historyRepository;

    private static final Set<String> VALID_STATUSES = Set.of(
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED"
    );

    public OrderService(
            CustomerOrderRepository orderRepository,
            MedicineBatchRepository batchRepository,
            OrderStatusHistoryRepository historyRepository
    ) {
        this.orderRepository = orderRepository;
        this.batchRepository = batchRepository;
        this.historyRepository = historyRepository;
    }

    // CREATE ORDER
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order must contain at least one medicine"
            );
        }

        CustomerOrder order = new CustomerOrder();

        String datePart = LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyyMMdd")
        );

        order.setOrderNumber(
                "ORD-" + datePart + "-"
                        + ThreadLocalRandom.current().nextInt(1000, 10000)
        );

        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());

        order.setPaymentMethod(
                request.getPaymentMethod() != null
                        ? request.getPaymentMethod()
                        : "CASH_ON_DELIVERY"
        );

        order.setOrderStatus("CONFIRMED");
        order.setCreatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;

        List<CustomerOrderItem> orderItems = new ArrayList<>();

        // STEP 1: Validate all requested quantities before stock deduction.
        Map<Long, Integer> reservedQuantities = new HashMap<>();

        for (OrderCreateRequest.OrderItemRequest itemReq : request.getItems()) {

            if (itemReq.getMedicineId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Medicine ID is required"
                );
            }

            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid medicine quantity"
                );
            }

            if (itemReq.getUnitPrice() == null ||
                    itemReq.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid medicine price"
                );
            }

            List<MedicineBatch> batches =
                    batchRepository.findByMedicineIdOrderByExpiryDateAsc(
                            itemReq.getMedicineId()
                    );

            int availableStock = batches.stream()
                    .mapToInt(batch -> Math.max(0, batch.getQuantity()))
                    .sum();

            int alreadyReserved = reservedQuantities.getOrDefault(
                    itemReq.getMedicineId(), 0
            );

            if (availableStock - alreadyReserved < itemReq.getQuantity()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for "
                                + itemReq.getMedicineName()
                );
            }

            reservedQuantities.merge(
                    itemReq.getMedicineId(),
                    itemReq.getQuantity(),
                    Integer::sum
            );
        }

        // STEP 2: Create order items and deduct stock.
        for (OrderCreateRequest.OrderItemRequest itemReq : request.getItems()) {

            CustomerOrderItem item = new CustomerOrderItem();

            item.setOrder(order);
            item.setMedicineId(itemReq.getMedicineId());
            item.setMedicineName(itemReq.getMedicineName());
            item.setDosageForm(itemReq.getDosageForm());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());

            BigDecimal subtotal = itemReq.getUnitPrice().multiply(
                    BigDecimal.valueOf(itemReq.getQuantity())
            );

            item.setSubtotal(subtotal);
            total = total.add(subtotal);

            List<MedicineBatch> batches =
                    batchRepository.findByMedicineIdOrderByExpiryDateAsc(
                            itemReq.getMedicineId()
                    );

            int remaining = itemReq.getQuantity();

            for (MedicineBatch batch : batches) {

                if (batch.getQuantity() <= 0 || remaining <= 0) {
                    continue;
                }

                int deduct = Math.min(batch.getQuantity(), remaining);

                if (item.getBatchNumber() == null) {
                    item.setBatchNumber(batch.getBatchNumber());
                }

                batch.setQuantity(batch.getQuantity() - deduct);
                batchRepository.save(batch);

                remaining -= deduct;
            }

            if (remaining > 0) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stock changed during order processing. Please retry."
                );
            }

            orderItems.add(item);
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);

        CustomerOrder savedOrder = orderRepository.save(order);

        // STEP 3: Save initial tracking history.
        OrderStatusHistory history = new OrderStatusHistory(
                savedOrder,
                "CONFIRMED",
                "Your order has been confirmed by the pharmacy."
        );

        historyRepository.save(history);

        return mapToResponse(savedOrder);
    }

    // ADMIN: GET ALL ORDERS
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // CUSTOMER: GET ALL ORDERS FOR CUSTOMER PROFILE
    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(String email, String phone) {
        if ((email == null || email.isBlank()) && (phone == null || phone.isBlank())) {
            return Collections.emptyList();
        }

        String searchEmail = email != null ? email.trim() : "";
        String searchPhone = phone != null ? phone.trim() : "";

        List<CustomerOrder> orders = orderRepository.findByCustomerEmailOrPhone(searchEmail, searchPhone);
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // CUSTOMER: TRACK ORDER
    @Transactional(readOnly = true)
    public OrderResponse trackOrder(String orderNumber, String phone) {

        CustomerOrder order = orderRepository
                .findByOrderNumber(orderNumber.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found for order number " + orderNumber
                ));

        if (phone != null && !phone.isBlank()) {
            String cleanPhone = phone.replaceAll("[\\s\\-\\(\\)]", "");
            String orderPhone = order.getCustomerPhone() != null ? order.getCustomerPhone().replaceAll("[\\s\\-\\(\\)]", "") : "";
            if (!orderPhone.endsWith(cleanPhone) && !cleanPhone.endsWith(orderPhone)) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Phone number does not match registered order details"
                );
            }
        }

        return mapToResponse(order);
    }

    // ADMIN: UPDATE ORDER STATUS
    @Transactional
    public OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatusUpdateRequest request
    ) {

        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"
                ));

        if (request.getStatus() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order status is required"
            );
        }

        String newStatus = request.getStatus()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!VALID_STATUSES.contains(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order status"
            );
        }

        String currentStatus = order.getOrderStatus();

        if ("DELIVERED".equals(currentStatus) ||
                "CANCELLED".equals(currentStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This order is already closed"
            );
        }

        // Prevent moving backwards in the order lifecycle.
        List<String> progression = Arrays.asList(
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED",
                "OUT_FOR_DELIVERY",
                "DELIVERED"
        );

        int currentIndex = progression.indexOf(currentStatus);
        int newIndex = progression.indexOf(newStatus);

        if (newIndex < 0 || newIndex <= currentIndex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invalid status transition"
            );
        }

        order.setOrderStatus(newStatus);

        CustomerOrder savedOrder = orderRepository.save(order);

        historyRepository.save(
                new OrderStatusHistory(
                        savedOrder,
                        newStatus,
                        request.getNote()
                )
        );

        return mapToResponse(savedOrder);
    }

    // MAP ORDER ENTITY TO RESPONSE DTO
    private OrderResponse mapToResponse(CustomerOrder order) {

        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerEmail(order.getCustomerEmail());
        response.setCustomerPhone(order.getCustomerPhone());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setOrderStatus(order.getOrderStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {

            response.setItems(
                    order.getItems().stream().map(item -> {

                        OrderResponse.OrderItemDto dto =
                                new OrderResponse.OrderItemDto();

                        dto.setId(item.getId());
                        dto.setMedicineId(item.getMedicineId());
                        dto.setMedicineName(item.getMedicineName());
                        dto.setDosageForm(item.getDosageForm());
                        dto.setBatchNumber(item.getBatchNumber());
                        dto.setUnitPrice(item.getUnitPrice());
                        dto.setQuantity(item.getQuantity());
                        dto.setSubtotal(item.getSubtotal());

                        return dto;

                    }).collect(Collectors.toList())
            );
        }

        List<OrderResponse.StatusHistoryDto> history =
                historyRepository
                        .findByOrder_IdOrderByUpdatedAtAsc(order.getId())
                        .stream()
                        .map(entry -> new OrderResponse.StatusHistoryDto(
                                entry.getStatus(),
                                entry.getNote(),
                                entry.getUpdatedAt()
                        ))
                        .collect(Collectors.toList());

        response.setStatusHistory(history);

        return response;
    }
}
