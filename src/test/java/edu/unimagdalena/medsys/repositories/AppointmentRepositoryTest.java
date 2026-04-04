package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.*;
import edu.unimagdalena.medsys.enums.AppointmentStatus;
import edu.unimagdalena.medsys.enums.OfficeStatus;
import edu.unimagdalena.medsys.enums.PatientStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class AppointmentRepositoryTest extends AbstractRepositoryIT {

    @Autowired
    AppointmentRepository appointmentRepository;
    @Autowired
    PatientRepository patientRepository;
    @Autowired
    DoctorRepository doctorRepository;
    @Autowired
    OfficeRepository officeRepository;
    @Autowired
    SpecialtyRepository specialtyRepository;
    @Autowired
    AppointmentTypeRepository appointmentTypeRepository;

    private Appointment createAppointment(AppointmentStatus status, LocalDateTime start, LocalDateTime end) {

        var specialty = specialtyRepository.save(
                Specialty.builder()
                        .name("Cardiology")
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var doctor = doctorRepository.save(
                Doctor.builder()
                        .fullName("Preston Burke")
                        .active(true)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var patient = patientRepository.save(
                Patient.builder()
                        .fullName("Carlos Torres")
                        .email("test" + Math.random() + "@gmail.com")
                        .phone("3000000000")
                        .status(PatientStatus.ACTIVE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var office = officeRepository.save(
                Office.builder()
                        .name("Office 1")
                        .location("Floor 2")
                        .status(OfficeStatus.AVAILABLE)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var type = appointmentTypeRepository.save(
                AppointmentType.builder()
                        .name("Consulta")
                        .durationMinutes(30)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        return appointmentRepository.save(
                Appointment.builder()
                        .startTime(start)
                        .endTime(end)
                        .status(status)
                        .doctor(doctor)
                        .patient(patient)
                        .office(office)
                        .appointmentType(type)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );
    }

    @Test
    @DisplayName("Find appointments by date range")
    void shouldFindByStartTimeBetween() {
        var now = LocalDateTime.now();
        createAppointment(AppointmentStatus.SCHEDULED, now, now.plusMinutes(30));

        var result = appointmentRepository.findByStartTimeBetween(
                now.minusHours(1), now.plusHours(1)
        );

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Create appointment")
    void shouldCreateAppointment() {
        var now = LocalDateTime.now();

        var appointment = createAppointment(
                AppointmentStatus.SCHEDULED,
                now,
                now.plusMinutes(30)
        );

        assertThat(appointment.getId()).isNotNull();
    }

    @Test
    @DisplayName("Find appointments by patient and status")
    void shouldFindByPatientAndStatus() {
        var now = LocalDateTime.now();

        var appointment = createAppointment(
                AppointmentStatus.CONFIRMED,
                now,
                now.plusMinutes(30)
        );

        var result = appointmentRepository.findByPatientIdAndStatus(
                appointment.getPatient().getId(),
                AppointmentStatus.CONFIRMED
        );

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Validate doctor overlap")
    void shouldDetectDoctorOverlap() {
        var now = LocalDateTime.now();

        var appointment = createAppointment(
                AppointmentStatus.SCHEDULED,
                now,
                now.plusMinutes(30)
        );

        boolean overlap = appointmentRepository.existsDoctorOverlap(
                appointment.getDoctor().getId(),
                now.plusMinutes(10),
                now.plusMinutes(40)
        );

        assertThat(overlap).isTrue();
    }

    @Test
    @DisplayName("Validate office overlap")
    void shouldDetectOfficeOverlap() {
        var now = LocalDateTime.now();

        var appointment = createAppointment(
                AppointmentStatus.SCHEDULED,
                now,
                now.plusMinutes(30)
        );

        boolean overlap = appointmentRepository.existsOfficeOverlap(
                appointment.getOffice().getId(),
                now.plusMinutes(5),
                now.plusMinutes(35)
        );

        assertThat(overlap).isTrue();
    }

    @Test
    @DisplayName("Find appointments by doctor and day")
    void shouldFindAppointmentsByDoctorAndDay() {
        var now = LocalDateTime.now();

        var appointment = createAppointment(
                AppointmentStatus.SCHEDULED,
                now,
                now.plusMinutes(30)
        );

        var result = appointmentRepository.findAppointmentsByDoctorAndDay(
                appointment.getDoctor().getId(),
                now.minusHours(1),
                now.plusHours(1)
        );

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Count appointments by office")
    void shouldCountAppointmentsByOffice() {
        var now = LocalDateTime.now();

        createAppointment(AppointmentStatus.SCHEDULED, now, now.plusMinutes(30));

        var result = appointmentRepository.countAppointmentsByOffice(
                now.minusHours(1),
                now.plusHours(1)
        );

        assertThat(result).isNotEmpty();
    }

    @Test
    @DisplayName("Doctor ranking by completed appointments")
    void shouldGetDoctorRanking() {
        var now = LocalDateTime.now();

        createAppointment(AppointmentStatus.COMPLETED, now, now.plusMinutes(30));

        var result = appointmentRepository.doctorRanking();

        assertThat(result).isNotEmpty();
    }

    @Test
    @DisplayName("Top patients with no show")
    void shouldGetTopNoShowPatients() {
        var now = LocalDateTime.now();

        createAppointment(AppointmentStatus.NO_SHOW, now, now.plusMinutes(30));

        var result = appointmentRepository.topNoShowPatients(
                now.minusHours(1),
                now.plusHours(1)
        );

        assertThat(result).isNotEmpty();
    }

    @Test
    @DisplayName("Count cancelled and no show by specialty")
    void shouldCountCancelledAndNoShowBySpecialty() {
        var now = LocalDateTime.now();

        createAppointment(AppointmentStatus.CANCELLED, now, now.plusMinutes(30));

        var result = appointmentRepository.countCancelledAndNoShowBySpecialty();

        assertThat(result).isNotEmpty();
    }
}
