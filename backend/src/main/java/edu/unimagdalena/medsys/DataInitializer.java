package edu.unimagdalena.medsys;

import edu.unimagdalena.medsys.domain.entities.AppUser;
import edu.unimagdalena.medsys.domain.repositories.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Seeds a default ADMIN user on first startup if none exists.
 * Credentials: admin@medsys.edu / admin1234
 * ⚠️ Change the password immediately in production!
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail("admin@medsys.edu")) {
            var now = Instant.now();
            var admin = AppUser.builder()
                    .email("admin@medsys.edu")
                    .password(passwordEncoder.encode("admin1234"))
                    .fullName("Administrador")
                    .role(AppUser.Role.ADMIN)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            userRepository.save(admin);
            log.info("✅ Default ADMIN user created: admin@medsys.edu / admin1234 — CHANGE THIS PASSWORD!");
        }
    }
}
