package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.Office;
import edu.unimagdalena.medsys.enums.OfficeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfficeRepository extends JpaRepository<Office, UUID> {
    List<Office> findByName(String name);

    List<Office> findByStatus(OfficeStatus status);

}
