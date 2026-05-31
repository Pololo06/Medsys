package edu.unimagdalena.medsys.api.auth;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import edu.unimagdalena.medsys.api.auth.dto.AuthRequest;
import edu.unimagdalena.medsys.api.auth.dto.AuthResponse;
import edu.unimagdalena.medsys.api.auth.dto.RegisterRequest;
import edu.unimagdalena.medsys.security.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Registro inicial / auto-registro (por defecto RECEPTIONIST).
     * En producción, este endpoint debería estar deshabilitado o protegido.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * Solo ADMIN puede crear staff con roles específicos.
     */
    @PostMapping("/create-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createStaff(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<String> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userDetails.getUsername());
    }
}
