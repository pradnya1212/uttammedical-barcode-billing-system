package com.utaam.medical.controller;

import com.utaam.medical.dto.*;
import com.utaam.medical.service.MedicineBatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicines/{medicineId}/batches")
public class MedicineBatchController {
    private final MedicineBatchService service;
    public MedicineBatchController(MedicineBatchService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public MedicineBatchResponse create(@PathVariable Long medicineId, @Valid @RequestBody MedicineBatchRequest request) { return service.create(medicineId, request); }
    @GetMapping public List<MedicineBatchResponse> list(@PathVariable Long medicineId) { return service.list(medicineId); }
}
