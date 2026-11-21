

package com.utaam.medical.controller;

import com.utaam.medical.dto.AuthRequest;
import com.utaam.medical.dto.AuthResponse;
import com.utaam.medical.entity.Customer;
import com.utaam.medical.repository.CustomerRepository;
import com.utaam.medical.security.PasswordSecurity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CustomerRepository customerRepository;
    private final SecureRandom random = new SecureRandom();

    // In-memory token cache for admin sessions with 8-hour TTL
    private static final ConcurrentHashMap<String, Long> ADMIN_TOKENS = new ConcurrentHashMap<>();
    private static final long ADMIN_TOKEN_TTL_MS = 8L * 60 * 60 * 1000; // 8 hours

    // Standard RFC-compliant email regex
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    // Real mobile phone validation: 10-digit number (e.g., 6-9 followed by 9 digits) or with country code
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^(?:\\+?91|0)?[6-9]\\d{9}$"
    );

    public AuthController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest req) {
        if (req.getName() == null || req.getName().trim().length() < 2) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Please enter your full name (at least 2 characters)."));
        }

        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Please enter a valid email address (e.g., name@gmail.com)."));
        }

        String rawPhone = req.getPhone() != null ? req.getPhone().replaceAll("[\\s\\-\\(\\)]", "") : "";
        if (!PHONE_PATTERN.matcher(rawPhone).matches()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Please enter a valid 10-digit mobile number (e.g., 9876543210)."));
        }
        // Normalize to 10 digits
        String normalizedPhone = rawPhone.length() > 10 ? rawPhone.substring(rawPhone.length() - 10) : rawPhone;

        if (req.getPassword() == null || req.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Password must be at least 6 characters long for security."));
        }

        if (customerRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "An account with email " + email + " already exists. Please sign in."));
        }

        // Generate 6-digit verification code
        String verificationCode = String.format("%06d", random.nextInt(900000) + 100000);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        Customer c = new Customer();
        c.setName(req.getName().trim());
        c.setEmail(email);
        c.setPassword(PasswordSecurity.hashPassword(req.getPassword()));
        c.setPhone(normalizedPhone);
        c.setAddress(req.getAddress() != null ? req.getAddress().trim() : "");
        c.setEmailVerified(false);
        c.setVerificationCode(verificationCode);
        c.setCodeExpiry(expiry);
        c.setAuthToken(UUID.randomUUID().toString());

        Customer saved = customerRepository.save(c);

        AuthResponse resp = buildResponse(saved, "Registration successful! A 6-digit verification code has been sent to your email.");
        resp.setVerificationCode(verificationCode); // returned so user can verify in local UI
        return ResponseEntity.ok(resp);
    }

    /** POST /api/auth/verify-email */
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestBody AuthRequest req) {
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
        String code = req.getCode() != null ? req.getCode().trim() : "";

        if (email.isBlank() || code.isBlank()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email and 6-digit verification code are required."));
        }

        Optional<Customer> opt = customerRepository.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(new AuthResponse(false, "Customer account not found."));
        }

        Customer c = opt.get();
        if (c.getEmailVerified()) {
            AuthResponse resp = buildResponse(c, "Email is already verified!");
            return ResponseEntity.ok(resp);
        }

        if (c.getVerificationCode() == null || !c.getVerificationCode().equals(code)) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid verification code. Please check your code and try again."));
        }

        if (c.getCodeExpiry() != null && LocalDateTime.now().isAfter(c.getCodeExpiry())) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Verification code has expired. Please request a new code."));
        }

        // Mark as verified
        c.setEmailVerified(true);
        c.setVerificationCode(null);
        c.setCodeExpiry(null);
        c.setAuthToken(UUID.randomUUID().toString());
        Customer saved = customerRepository.save(c);

        AuthResponse resp = buildResponse(saved, "Email verified successfully! You are now logged in.");
        return ResponseEntity.ok(resp);
    }

    /** POST /api/auth/resend-code */
    @PostMapping("/resend-code")
    public ResponseEntity<AuthResponse> resendCode(@RequestBody AuthRequest req) {
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
        if (email.isBlank()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email is required."));
        }

        Optional<Customer> opt = customerRepository.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(new AuthResponse(false, "Customer account not found."));
        }

        Customer c = opt.get();
        if (c.getEmailVerified()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email is already verified."));
        }

        String newCode = String.format("%06d", random.nextInt(900000) + 100000);
        c.setVerificationCode(newCode);
        c.setCodeExpiry(LocalDateTime.now().plusMinutes(15));
        customerRepository.save(c);

        AuthResponse resp = new AuthResponse(true, "A new 6-digit verification code has been sent.");
        resp.setVerificationCode(newCode);
        resp.setEmail(email);
        return ResponseEntity.ok(resp);
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
        String password = req.getPassword();

        if (email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email and password are required."));
        }

        Optional<Customer> opt = customerRepository.findByEmail(email);
        if (opt.isEmpty() || !PasswordSecurity.verifyPassword(password, opt.get().getPassword())) {
            return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid email or password. Please try again."));
        }

        Customer c = opt.get();

        // Check email verification status
        if (!c.getEmailVerified()) {
            // Generate a fresh code so they can verify easily
            String code = String.format("%06d", random.nextInt(900000) + 100000);
            c.setVerificationCode(code);
            c.setCodeExpiry(LocalDateTime.now().plusMinutes(15));
            customerRepository.save(c);

            AuthResponse resp = buildResponse(c, "Please verify your email to continue.");
            resp.setSuccess(false);
            resp.setEmailVerified(false);
            resp.setVerificationCode(code);
            return ResponseEntity.status(403).body(resp);
        }

        // Refresh auth token
        c.setAuthToken(UUID.randomUUID().toString());
        Customer saved = customerRepository.save(c);

        AuthResponse resp = buildResponse(saved, "Login successful!");
        return ResponseEntity.ok(resp);
    }

    /** GET /api/auth/me */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getProfile(@RequestParam(required = false) String email,
                                                   @RequestParam(required = false) String token) {
        Optional<Customer> opt = Optional.empty();
        if (token != null && !token.isBlank()) {
            opt = customerRepository.findByAuthToken(token.trim());
        } else if (email != null && !email.isBlank()) {
            opt = customerRepository.findByEmail(email.trim().toLowerCase());
        }

        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(new AuthResponse(false, "User not found"));
        }

        return ResponseEntity.ok(buildResponse(opt.get(), "Profile retrieved successfully"));
    }

    /** GET /api/auth/verify-token - Customer Token Verification */
    @GetMapping("/verify-token")
    public ResponseEntity<?> verifyToken(
            @RequestParam(required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String tokenToVerify = token;
        if ((tokenToVerify == null || tokenToVerify.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenToVerify = authHeader.substring(7).trim();
        }

        if (tokenToVerify == null || tokenToVerify.isBlank()) {
            return ResponseEntity.status(401).body(Map.of(
                    "valid", false,
                    "message", "Authentication token is missing"
            ));
        }

        Optional<Customer> opt = customerRepository.findByAuthToken(tokenToVerify.trim());
        if (opt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                    "valid", false,
                    "message", "Invalid or expired customer session token"
            ));
        }

        Customer c = opt.get();
        if (!Boolean.TRUE.equals(c.getEmailVerified())) {
            return ResponseEntity.status(403).body(Map.of(
                    "valid", false,
                    "emailVerified", false,
                    "message", "Customer account email is not verified"
            ));
        }

        AuthResponse resp = buildResponse(c, "Session token verified successfully");
        return ResponseEntity.ok(resp);
    }

    /** POST /api/auth/verify-token */
    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyTokenPost(
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String token = body != null ? body.get("token") : null;
        return verifyToken(token, authHeader);
    }

    /** POST /api/auth/admin/login - Authenticate Admin / Staff */
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body) {
        String username = body != null ? body.get("username") : null;
        String password = body != null ? body.get("password") : null;

        if ("admin".equalsIgnoreCase(username != null ? username.trim() : "") && "utaam123".equals(password)) {
            String adminToken = "ADM-" + UUID.randomUUID().toString();
            long expiryTime = System.currentTimeMillis() + ADMIN_TOKEN_TTL_MS;
            ADMIN_TOKENS.put(adminToken, expiryTime);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "adminToken", adminToken,
                    "role", "ADMIN",
                    "user", "Administrator",
                    "expiresIn", ADMIN_TOKEN_TTL_MS / 1000
            ));
        }

        return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Invalid administrator credentials"
        ));
    }

    /** GET /api/auth/admin/verify-token - Admin Token Verification */
    @GetMapping("/admin/verify-token")
    public ResponseEntity<?> verifyAdminToken(
            @RequestParam(required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String tokenToVerify = token;
        if ((tokenToVerify == null || tokenToVerify.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenToVerify = authHeader.substring(7).trim();
        }

        if (tokenToVerify == null || tokenToVerify.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Admin session token is required"));
        }

        Long expiry = ADMIN_TOKENS.get(tokenToVerify.trim());
        if (expiry == null || System.currentTimeMillis() > expiry) {
            ADMIN_TOKENS.remove(tokenToVerify.trim());
            return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Admin session is invalid or expired. Please sign in again."));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "role", "ADMIN",
                "user", "Administrator",
                "remainingSeconds", (expiry - System.currentTimeMillis()) / 1000
        ));
    }

    /** POST /api/auth/admin/logout */
    @PostMapping("/admin/logout")
    public ResponseEntity<?> adminLogout(
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String token = body != null ? body.get("token") : null;
        if ((token == null || token.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        }
        if (token != null) {
            ADMIN_TOKENS.remove(token.trim());
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Admin session logged out successfully"));
    }

    private AuthResponse buildResponse(Customer c, String msg) {
        AuthResponse r = new AuthResponse(true, msg);
        r.setCustomerId(c.getId());
        r.setName(c.getName());
        r.setEmail(c.getEmail());
        r.setPhone(c.getPhone());
        r.setAddress(c.getAddress());
        r.setEmailVerified(c.getEmailVerified());
        r.setAuthToken(c.getAuthToken());
        return r;
    }
}
