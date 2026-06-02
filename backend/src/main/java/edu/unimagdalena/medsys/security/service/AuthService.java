package edu.unimagdalena.medsys.security.service;

import edu.unimagdalena.medsys.api.auth.dto.AuthRequest;
import edu.unimagdalena.medsys.api.auth.dto.AuthResponse;
import edu.unimagdalena.medsys.api.auth.dto.RegisterRequest;
import edu.unimagdalena.medsys.domain.entities.AppUser;
import edu.unimagdalena.medsys.domain.repositories.AppUserRepository;
import edu.unimagdalena.medsys.exceptions.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var user = userRepository.findByEmail(request.email())
                .orElseThrow();
        var token = jwtService.generateToken(user);
        return buildResponse(user, token);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("El correo ya está registrado.");
        }
        var now = Instant.now();
        var user = AppUser.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(request.role() != null ? request.role() : AppUser.Role.RECEPTIONIST)
                .createdAt(now)
                .updatedAt(now)
                .build();
        userRepository.save(user);
        var token = jwtService.generateToken(user);
        return buildResponse(user, token);
    }

    private AuthResponse buildResponse(AppUser user, String token) {
        return new AuthResponse(
                token,
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }
}
