package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.AppointmentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppointmentTypeRepository extends JpaRepository<AppointmentType, UUID> {
    List<AppointmentType> findByName(String name);
}
