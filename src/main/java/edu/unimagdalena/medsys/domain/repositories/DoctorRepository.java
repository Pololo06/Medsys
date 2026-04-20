package edu.unimagdalena.medsys.domain.repositories;


import edu.unimagdalena.medsys.domain.entities.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    List<Doctor> findByFullName(String fullName);

    List<Doctor> findBySpecialtyIdAndActiveTrue(UUID specialtyId);

    List<Doctor> findBySpecialtyIdAndActiveFalse(UUID specialtyId);


}
