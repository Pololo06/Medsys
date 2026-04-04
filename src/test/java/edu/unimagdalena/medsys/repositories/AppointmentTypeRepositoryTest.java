package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.AppointmentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class AppointmentTypeRepositoryTest extends AbstractRepositoryIT {

    @Autowired
    AppointmentTypeRepository appointmentTypeRepository;

    @Test
    @DisplayName("Create appointment type")
    void shouldCreateAppointmentType() {
        var type = appointmentTypeRepository.save(
                AppointmentType.builder()
                        .name("Consulta General")
                        .durationMinutes(30)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        assertThat(type.getId()).isNotNull();
        assertThat(type.getName()).isEqualTo("Consulta General");
    }

    @Test
    @DisplayName("Find appointment types by name")
    void shouldFindByName() {

        appointmentTypeRepository.save(
                AppointmentType.builder()
                        .name("Odontología")
                        .durationMinutes(40)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        appointmentTypeRepository.save(
                AppointmentType.builder()
                        .name("Odontología")
                        .durationMinutes(60)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = appointmentTypeRepository.findByName("Odontología");

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Update appointment type")
    void shouldUpdateAppointmentType() {
        var type = appointmentTypeRepository.save(
                AppointmentType.builder()
                        .name("Consulta")
                        .durationMinutes(20)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        type.setDurationMinutes(45);
        appointmentTypeRepository.save(type);

        var updated = appointmentTypeRepository.findById(type.getId());

        assertThat(updated).isPresent();
        assertThat(updated.get().getDurationMinutes()).isEqualTo(45);
    }

    @Test
    @DisplayName("Delete appointment type")
    void shouldDeleteAppointmentType() {
        var type = appointmentTypeRepository.save(
                AppointmentType.builder()
                        .name("Fisioterapia")
                        .durationMinutes(50)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        appointmentTypeRepository.deleteById(type.getId());

        var deleted = appointmentTypeRepository.findById(type.getId());

        assertThat(deleted).isNotPresent();
    }
}