package edu.unimagdalena.medsys.domain.repositories;

import edu.unimagdalena.medsys.domain.entities.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID> {
    List<DoctorSchedule> findByDoctorIdAndDay(UUID doctorId, DayOfWeek day);
    List<DoctorSchedule> findByDoctorId(UUID doctorId);
}
