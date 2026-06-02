package edu.unimagdalena.medsys.domain.repositories;


import edu.unimagdalena.medsys.domain.entities.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpecialtyRepository extends JpaRepository<Specialty, UUID> {
    List<Specialty> findByName(String name);

}
