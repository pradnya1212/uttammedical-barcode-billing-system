package com.utaam.medical.controller;

import com.utaam.medical.dto.OrderCreateRequest;
import com.utaam.medical.dto.OrderResponse;
import com.utaam.medical.dto.OrderStatusUpdateRequest;
import com.utaam.medical.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<OrderResponse> trackOrder(
            @PathVariable String orderNumber,
            @RequestParam(required = false) String phone
    ) {
        return ResponseEntity.ok(orderService.trackOrder(orderNumber, phone));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone
    ) {
        return ResponseEntity.ok(orderService.getCustomerOrders(email, phone));
    }

    @RequestMapping(value = "/{orderId}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request));
    }
}
