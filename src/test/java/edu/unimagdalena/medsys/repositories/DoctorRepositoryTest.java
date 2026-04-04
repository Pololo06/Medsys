package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.Doctor;
import edu.unimagdalena.medsys.entities.Specialty;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class DoctorRepositoryTest extends AbstractRepositoryIT {

    @Autowired
    DoctorRepository doctorRepository;
    @Autowired
    SpecialtyRepository specialtyRepository;

    private Specialty createSpecialty(String name) {
        return specialtyRepository.save(
                Specialty.builder()
                        .name(name)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );
    }

    @Test
    @DisplayName("Create doctor")
    void shouldCreateDoctor() {
        var specialty = createSpecialty("Cardiology");

        var doctor = doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Yang")
                        .active(true)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        assertThat(doctor.getId()).isNotNull();
        assertThat(doctor.isActive()).isTrue();
    }

    @Test
    @DisplayName("Find doctors by full name")
    void shouldFindByFullName() {
        var specialty = createSpecialty("Neurology");

        doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Shepard")
                        .active(true)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Shepard")
                        .active(false)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = doctorRepository.findByFullName("Dr. Shepard");

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Find active doctors by specialty")
    void shouldFindActiveDoctorsBySpecialty() {
        var specialty = createSpecialty("Gynecology");

        doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Montgomery")
                        .active(true)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Heist")
                        .active(false)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = doctorRepository.findBySpecialtyIdAndActiveTrue(specialty.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isActive()).isTrue();
    }

    @Test
    @DisplayName("Find inactive doctors by specialty")
    void shouldFindInactiveDoctorsBySpecialty() {
        var specialty = createSpecialty("Pediatrics");

        doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Jhonson")
                        .active(true)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Grey")
                        .active(false)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = doctorRepository.findBySpecialtyIdAndActiveFalse(specialty.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isActive()).isFalse();
    }

    @Test
    @DisplayName("Update doctor status")
    void shouldUpdateDoctorStatus() {
        var specialty = createSpecialty("Oncology");

        var doctor = doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Izzy")
                        .active(true)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        doctor.setActive(false);
        doctorRepository.save(doctor);

        var updated = doctorRepository.findById(doctor.getId());

        assertThat(updated).isPresent();
        assertThat(updated.get().isActive()).isFalse();
    }

    @Test
    @DisplayName("Delete doctor")
    void shouldDeleteDoctor() {
        var specialty = createSpecialty("Radiology");

        var doctor = doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Lex")
                        .active(true)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        doctorRepository.deleteById(doctor.getId());

        var deleted = doctorRepository.findById(doctor.getId());

        assertThat(deleted).isNotPresent();
    }
}