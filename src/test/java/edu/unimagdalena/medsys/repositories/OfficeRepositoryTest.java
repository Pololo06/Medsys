package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.Office;
import edu.unimagdalena.medsys.enums.OfficeStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class OfficeRepositoryTest extends AbstractRepositoryIT {

    @Autowired
    OfficeRepository officeRepository;

    @Test
    @DisplayName("Create office")
    void shouldCreateOffice() {
        var office = officeRepository.save(
                Office.builder()
                        .name("Consultorio 101")
                        .location("Primer piso")
                        .status(OfficeStatus.AVAILABLE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        assertThat(office.getId()).isNotNull();
        assertThat(office.getStatus()).isEqualTo(OfficeStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Find offices by name")
    void shouldFindByName() {

        officeRepository.save(
                Office.builder()
                        .name("Consultorio A")
                        .location("Piso 1")
                        .status(OfficeStatus.AVAILABLE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        officeRepository.save(
                Office.builder()
                        .name("Consultorio A")
                        .location("Piso 2")
                        .status(OfficeStatus.OCCUPIED)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = officeRepository.findByName("Consultorio A");

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Find offices by status")
    void shouldFindByStatus() {

        officeRepository.save(
                Office.builder()
                        .name("Office 1")
                        .location("Floor 1")
                        .status(OfficeStatus.AVAILABLE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        officeRepository.save(
                Office.builder()
                        .name("Office 2")
                        .location("Floor 2")
                        .status(OfficeStatus.MAINTENANCE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = officeRepository.findByStatus(OfficeStatus.AVAILABLE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(OfficeStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Update office status")
    void shouldUpdateOffice() {
        var office = officeRepository.save(
                Office.builder()
                        .name("Consultorio B")
                        .location("Piso 3")
                        .status(OfficeStatus.AVAILABLE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        office.setStatus(OfficeStatus.OUT_OF_SERVICE);
        officeRepository.save(office);

        var updated = officeRepository.findById(office.getId());

        assertThat(updated).isPresent();
        assertThat(updated.get().getStatus()).isEqualTo(OfficeStatus.OUT_OF_SERVICE);
    }

    @Test
    @DisplayName("Delete office")
    void shouldDeleteOffice() {
        var office = officeRepository.save(
                Office.builder()
                        .name("Consultorio ABC")
                        .location("Piso 4")
                        .status(OfficeStatus.AVAILABLE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        officeRepository.deleteById(office.getId());

        var deleted = officeRepository.findById(office.getId());

        assertThat(deleted).isNotPresent();
    }
}
