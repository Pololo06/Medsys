package edu.unimagdalena.medsys.repositories;


import edu.unimagdalena.medsys.entities.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpecialtyRepository extends JpaRepository<Specialty, UUID> {
    List<Specialty> findByName(String name);

}
