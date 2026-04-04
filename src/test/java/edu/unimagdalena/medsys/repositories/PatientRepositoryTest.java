package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.Patient;
import edu.unimagdalena.medsys.enums.PatientStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class PatientRepositoryTest extends AbstractRepositoryIT {

    @Autowired
    PatientRepository patientRepository;

    @Test
    @DisplayName("Create a new patient")
    void shouldCreatePatient() {
        var patient = patientRepository.save(
                Patient.builder()
                        .fullName("Carlos Torres")
                        .email("carlos@gmail.com")
                        .phone("3001234567")
                        .status(PatientStatus.ACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        assertThat(patient.getId()).isNotNull();
        assertThat(patient.getEmail()).isEqualTo("carlos@gmail.com");
    }

    @Test
    @DisplayName("Find patient by email")
    void shouldFindPatientByEmail() {

        patientRepository.save(
                Patient.builder()
                        .fullName("Ana Lopez")
                        .email("ana@gmail.com")
                        .phone("3009876543")
                        .status(PatientStatus.ACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = patientRepository.findByEmail("ana@gmail.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("ana@gmail.com");
    }

    @Test
    @DisplayName("Find patients by full name")
    void shouldFindPatientsByFullName() {

        patientRepository.save(
                Patient.builder()
                        .fullName("Luis Perez")
                        .email("luis1@gmail.com")
                        .phone("3001111111")
                        .status(PatientStatus.ACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        patientRepository.save(
                Patient.builder()
                        .fullName("Luis Perez")
                        .email("luis2@gmail.com")
                        .phone("3002222222")
                        .status(PatientStatus.INACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = patientRepository.findByFullName("Luis Perez");

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Find patients by status")
    void shouldFindPatientsByStatus() {

        patientRepository.save(
                Patient.builder()
                        .fullName("Maria Diaz")
                        .email("maria@gmail.com")
                        .phone("123456789")
                        .status(PatientStatus.ACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        patientRepository.save(
                Patient.builder()
                        .fullName("Pedro Ruiz")
                        .email("pedro@gmail.com")
                        .phone("11223454565")
                        .status(PatientStatus.INACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = patientRepository.findByStatus(PatientStatus.ACTIVE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(PatientStatus.ACTIVE);
    }

    @Test
    @DisplayName("Update patient email")
    void shouldUpdatePatientEmail() {
        var patient = patientRepository.save(
                Patient.builder()
                        .fullName("Laura Gomez")
                        .email("laura@gmail.com")
                        .phone("3005555555")
                        .status(PatientStatus.ACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        patient.setEmail("lauragomez@gmail.com");
        patientRepository.save(patient);

        var updated = patientRepository.findById(patient.getId());

        assertThat(updated).isPresent();
        assertThat(updated.get().getEmail()).isEqualTo("lauragomez@gmail.com");
    }

    @Test
    @DisplayName("Delete patient by id")
    void shouldDeletePatient() {
        var patient = patientRepository.save(
                Patient.builder()
                        .fullName("Jorge Luis")
                        .email("jorge@gmail.com")
                        .phone("3006666666")
                        .status(PatientStatus.ACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        patientRepository.deleteById(patient.getId());

        var deleted = patientRepository.findById(patient.getId());

        assertThat(deleted).isNotPresent();
    }
}
