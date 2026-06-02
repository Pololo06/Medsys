package edu.unimagdalena.medsys.domain.repositories;

import edu.unimagdalena.medsys.domain.entities.Office;
import edu.unimagdalena.medsys.domain.enums.OfficeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfficeRepository extends JpaRepository<Office, UUID> {
    List<Office> findByName(String name);

    List<Office> findByStatus(OfficeStatus status);

}
