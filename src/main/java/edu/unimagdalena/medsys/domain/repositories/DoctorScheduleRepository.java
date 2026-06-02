package edu.unimagdalena.medsys.domain.repositories;

import edu.unimagdalena.medsys.domain.entities.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID> {
    List<DoctorSchedule> findByDoctorIdAndDay(UUID doctorId, DayOfWeek day);
    List<DoctorSchedule> findByDoctorId(UUID doctorId);

    /**
     * Verifica si ya existe un horario para el doctor en ese día que se solape
     * con el intervalo [startTime, endTime).
     * Dos intervalos se solapan cuando: inicio1 < fin2 AND fin1 > inicio2
     */
    @Query("""
    SELECT COUNT(s) > 0
    FROM DoctorSchedule s
    WHERE s.doctor.id = :doctorId
    AND s.day = :day
    AND s.startTime < :endTime
    AND s.endTime > :startTime
    """)
    boolean existsOverlap(UUID doctorId, DayOfWeek day, LocalTime startTime, LocalTime endTime);

    /**
     * Igual que existsOverlap pero excluye el schedule con el id dado (para futuras ediciones).
     */
    @Query("""
    SELECT COUNT(s) > 0
    FROM DoctorSchedule s
    WHERE s.doctor.id = :doctorId
    AND s.day = :day
    AND s.id <> :excludeId
    AND s.startTime < :endTime
    AND s.endTime > :startTime
    """)
    boolean existsOverlapExcluding(UUID doctorId, DayOfWeek day, LocalTime startTime, LocalTime endTime, UUID excludeId);
}
