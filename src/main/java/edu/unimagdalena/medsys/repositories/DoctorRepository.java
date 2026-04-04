package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.Appointment;
import edu.unimagdalena.medsys.entities.Doctor;
import edu.unimagdalena.medsys.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    List<Doctor> findByFullName(String fullName);

    List<Doctor> findBySpecialtyIdAndActiveTrue(UUID specialtyId);

    List<Doctor> findBySpecialtyIdAndActiveFalse(UUID specialtyId);


}
