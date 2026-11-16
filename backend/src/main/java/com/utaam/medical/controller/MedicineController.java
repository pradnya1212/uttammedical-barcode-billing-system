package com.utaam.medical.controller;

import com.utaam.medical.dto.MedicineRequest;
import com.utaam.medical.dto.MedicineResponse;
import com.utaam.medical.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {
    private final MedicineService service;
    public MedicineController(MedicineService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicineResponse create(@Valid @RequestBody MedicineRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<MedicineResponse> list() { return service.list(); }

    @GetMapping("/{id}")
    public MedicineResponse get(@PathVariable Long id) { return service.get(id); }
}
