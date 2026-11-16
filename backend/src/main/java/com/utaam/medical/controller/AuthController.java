package com.utaam.medical.controller;

import com.utaam.medical.dto.AuthRequest;
import com.utaam.medical.dto.AuthResponse;
import com.utaam.medical.entity.Customer;
import com.utaam.medical.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CustomerRepository customerRepository;

    public AuthController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email is required."));
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Password must be at least 6 characters."));
        }
        if (customerRepository.existsByEmail(req.getEmail().toLowerCase())) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "An account with this email already exists."));
        }

        Customer c = new Customer();
        c.setName(req.getName() != null ? req.getName().trim() : "");
        c.setEmail(req.getEmail().toLowerCase().trim());
        c.setPassword(req.getPassword()); // plain-text for local dev; use BCrypt in production
        c.setPhone(req.getPhone());
        c.setAddress(req.getAddress());
        Customer saved = customerRepository.save(c);

        AuthResponse resp = buildResponse(saved, "Account created successfully!");
        return ResponseEntity.ok(resp);
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email and password are required."));
        }
        Optional<Customer> opt = customerRepository.findByEmail(req.getEmail().toLowerCase().trim());
        if (opt.isEmpty() || !opt.get().getPassword().equals(req.getPassword())) {
            return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid email or password."));
        }
        AuthResponse resp = buildResponse(opt.get(), "Login successful!");
        return ResponseEntity.ok(resp);
    }

    private AuthResponse buildResponse(Customer c, String msg) {
        AuthResponse r = new AuthResponse(true, msg);
        r.setCustomerId(c.getId());
        r.setName(c.getName());
        r.setEmail(c.getEmail());
        r.setPhone(c.getPhone());
        r.setAddress(c.getAddress());
        return r;
    }
}

