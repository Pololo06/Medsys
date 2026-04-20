package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.domain.entities.Specialty;
import edu.unimagdalena.medsys.domain.repositories.SpecialtyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class SpecialtyRepositoryTest extends AbstractRepositoryIT {

    @Autowired
    SpecialtyRepository specialtyRepository;

    @Test
    @DisplayName("Create specialty")
    void shouldCreateSpecialty() {
        var specialty = specialtyRepository.save(
                Specialty.builder()
                        .name("Cardiology")
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        assertThat(specialty.getId()).isNotNull();
        assertThat(specialty.getName()).isEqualTo("Cardiology");
    }

    @Test
    @DisplayName("Find specialties by name")
    void shouldFindByName() {

        specialtyRepository.save(
                Specialty.builder()
                        .name("Dermatology")
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        specialtyRepository.save(
                Specialty.builder()
                        .name("Dermatology")
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = specialtyRepository.findByName("Dermatology");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Dermatology");
    }

    @Test
    @DisplayName("Update specialty")
    void shouldUpdateSpecialty() {
        var specialty = specialtyRepository.save(
                Specialty.builder()
                        .name("Pediatrics")
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        specialty.setName("Pediatric Medicine");
        specialtyRepository.save(specialty);

        var updated = specialtyRepository.findById(specialty.getId());

        assertThat(updated).isPresent();
        assertThat(updated.get().getName()).isEqualTo("Pediatric Medicine");
    }

    @Test
    @DisplayName("Delete specialty")
    void shouldDeleteSpecialty() {
        var specialty = specialtyRepository.save(
                Specialty.builder()
                        .name("Oncology")
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        specialtyRepository.deleteById(specialty.getId());

        var deleted = specialtyRepository.findById(specialty.getId());

        assertThat(deleted).isNotPresent();
    }
}
