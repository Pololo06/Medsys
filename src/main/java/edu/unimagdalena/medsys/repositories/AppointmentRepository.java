package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.Appointment;
import edu.unimagdalena.medsys.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientIdAndStatus(UUID patientId, AppointmentStatus status);

    List<Appointment> findByStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    @Query("""
    SELECT a.doctor.specialty.id, COUNT(a)
    FROM Appointment a
    WHERE a.status IN ('CANCELLED', 'NO_SHOW')
    GROUP BY a.doctor.specialty.id
    """)
    List<Object[]> countCancelledAndNoShowBySpecialty();

    @Query("""
    SELECT a.doctor.id, COUNT(a)
    FROM Appointment a
    WHERE a.status = 'COMPLETED'
    GROUP BY a.doctor.id
    ORDER BY COUNT(a) DESC
    """)
    List<Object[]> doctorRanking();

    @Query("""
    SELECT a.patient.id, COUNT(a)
    FROM Appointment a
    WHERE a.status = 'NO_SHOW'
    AND a.startTime BETWEEN :start AND :end
    GROUP BY a.patient.id
    ORDER BY COUNT(a) DESC
    """)
    List<Object[]> topNoShowPatients(LocalDateTime start, LocalDateTime end);

    @Query("""
    SELECT COUNT(a) > 0 
    FROM Appointment a
    WHERE a.doctor.id = :doctorId
    AND a.startTime < :end
    AND a.endTime > :start
    """)
    boolean existsDoctorOverlap(UUID doctorId, LocalDateTime start, LocalDateTime end);

    @Query("""
    SELECT COUNT(a) > 0 
    FROM Appointment a
    WHERE a.office.id = :officeId
    AND a.startTime < :end
    AND a.endTime > :start
    """)
    boolean existsOfficeOverlap(UUID officeId, LocalDateTime start, LocalDateTime end);

    @Query("""
    SELECT a.office.id, COUNT(a)
    FROM Appointment a
    WHERE a.startTime BETWEEN :start AND :end
    GROUP BY a.office.id
    """)
    List<Object[]> countAppointmentsByOffice(LocalDateTime start, LocalDateTime end);

    @Query("""
    SELECT a FROM Appointment a
    WHERE a.doctor.id = :doctorId
    AND a.startTime BETWEEN :start AND :end
    """)
    List<Appointment> findAppointmentsByDoctorAndDay(UUID doctorId, LocalDateTime start, LocalDateTime end);
}
