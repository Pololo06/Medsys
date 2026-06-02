package edu.unimagdalena.medsys.domain.repositories;

import edu.unimagdalena.medsys.domain.entities.Patient;
import edu.unimagdalena.medsys.domain.enums.PatientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    List<Patient> findByFullName(String fullName);

    Optional<Patient> findByEmail(String email);

    List<Patient> findByStatus(PatientStatus status);
}
