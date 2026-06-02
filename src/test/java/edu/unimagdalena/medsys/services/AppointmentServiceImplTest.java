package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.api.dto.request.CancelAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CompleteAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CreateAppointmentRequest;
import edu.unimagdalena.medsys.domain.entities.*;
import edu.unimagdalena.medsys.domain.repositories.*;
import edu.unimagdalena.medsys.domain.enums.AppointmentStatus;
import edu.unimagdalena.medsys.domain.enums.OfficeStatus;
import edu.unimagdalena.medsys.domain.enums.PatientStatus;
import edu.unimagdalena.medsys.exceptions.BusinessException;
import edu.unimagdalena.medsys.exceptions.ConflictException;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    AppointmentRepository appointmentRepository;
    @Mock
    PatientRepository patientRepository;
    @Mock
    DoctorRepository doctorRepository;
    @Mock
    OfficeRepository officeRepository;
    @Mock
    AppointmentTypeRepository appointmentTypeRepository;
    @Mock DoctorScheduleRepository doctorScheduleRepository;

    @InjectMocks
    AppointmentServiceImpl appointmentService;

    UUID patientId, doctorId, officeId, typeId;
    Patient patient;
    Doctor doctor;
    Office office;
    AppointmentType appointmentType;
    DoctorSchedule schedule;
    LocalDateTime futureStart;

    @BeforeEach
    void setUp() {
        patientId = UUID.randomUUID();
        doctorId  = UUID.randomUUID();
        officeId  = UUID.randomUUID();
        typeId    = UUID.randomUUID();

        patient = Patient.builder()
                .id(patientId).fullName("Carlos Torres").email("c@test.com").phone("300")
                .status(PatientStatus.ACTIVE).createdAt(Instant.now()).updatedAt(Instant.now())
                .build();

        var specialty = Specialty.builder()
                .id(UUID.randomUUID()).name("General")
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        doctor = Doctor.builder()
                .id(doctorId).fullName("Dr. Grey").active(true).specialty(specialty)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        office = Office.builder()
                .id(officeId).name("Consultorio 1").location("Piso 2")
                .status(OfficeStatus.AVAILABLE).createdAt(Instant.now()).updatedAt(Instant.now())
                .build();

        appointmentType = AppointmentType.builder()
                .id(typeId).name("Consulta General").durationMinutes(30)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        // Next Monday 09:00 — always in future and known day of week
        var nextMonday = LocalDate.now().with(java.time.temporal.TemporalAdjusters.next(DayOfWeek.MONDAY));
        futureStart = nextMonday.atTime(9, 0);

        schedule = DoctorSchedule.builder()
                .id(UUID.randomUUID()).doctor(doctor).day(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(8, 0)).endTime(LocalTime.of(17, 0))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();
    }

    // ── helper: configura todos los mocks para el camino feliz ────────────────
    private void mockHappyPath() {
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(officeRepository.findById(officeId)).thenReturn(Optional.of(office));
        when(appointmentTypeRepository.findById(typeId)).thenReturn(Optional.of(appointmentType));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule));
        when(appointmentRepository.existsDoctorOverlap(any(), any(), any())).thenReturn(false);
        when(appointmentRepository.existsOfficeOverlap(any(), any(), any())).thenReturn(false);
        when(appointmentRepository.existsPatientOverlap(any(), any(), any())).thenReturn(false);
        when(appointmentRepository.save(any())).thenAnswer(inv -> {
            Appointment a = inv.getArgument(0);
            return Appointment.builder()
                    .id(UUID.randomUUID())
                    .patient(a.getPatient()).doctor(a.getDoctor())
                    .office(a.getOffice()).appointmentType(a.getAppointmentType())
                    .startTime(a.getStartTime()).endTime(a.getEndTime())
                    .status(a.getStatus()).observation(a.getObservation())
                    .createdAt(Instant.now()).updatedAt(Instant.now())
                    .build();
        });
    }

    private CreateAppointmentRequest req(LocalDateTime start) {
        return new CreateAppointmentRequest(patientId, doctorId, officeId, typeId, start);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6.1 Creación de citas
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("Crear cita — camino feliz: estado SCHEDULED y endAt calculado")
    void create_happyPath_scheduledAndEndTimeCalculated() {
        mockHappyPath();

        var result = appointmentService.create(req(futureStart));

        assertThat(result.id()).isNotNull();
        assertThat(result.status()).isEqualTo(AppointmentStatus.SCHEDULED);
        assertThat(result.endTime()).isEqualTo(futureStart.plusMinutes(30));
        verify(appointmentRepository).save(any());
    }

    @Test
    @DisplayName("endAt lo calcula el servicio con la duración del tipo — no lo provee el cliente")
    void create_endTimeCalculatedFromDuration() {
        mockHappyPath();

        var result = appointmentService.create(req(futureStart));

        assertThat(result.endTime()).isEqualTo(futureStart.plusMinutes(appointmentType.getDurationMinutes()));
    }

    @Test
    @DisplayName("No se puede crear cita si el paciente está inactivo")
    void create_inactivePatient_throwsBusiness() {
        patient.setStatus(PatientStatus.INACTIVE);

        when(patientRepository.findById(patientId))
                .thenReturn(Optional.of(patient));

        assertThatThrownBy(() -> appointmentService.create(req(futureStart)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("active");
    }

    @Test
    @DisplayName("No se puede crear cita si el doctor está inactivo")
    void create_inactiveDoctor_throwsBusiness() {
        doctor.setActive(false);

        when(patientRepository.findById(patientId))
                .thenReturn(Optional.of(patient));

        when(doctorRepository.findById(doctorId))
                .thenReturn(Optional.of(doctor));

        assertThatThrownBy(() -> appointmentService.create(req(futureStart)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("active");
    }
    @Test
    @DisplayName("No se puede crear cita si el consultorio no está disponible")
    void create_unavailableOffice_throwsBusiness() {
        office.setStatus(OfficeStatus.MAINTENANCE);

        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(officeRepository.findById(officeId)).thenReturn(Optional.of(office));

        assertThatThrownBy(() -> appointmentService.create(req(futureStart)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("available");
    }

    @Test
    @DisplayName("No se puede crear cita en fecha y hora pasada")
    void create_pastStartTime_throwsBusiness() {
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(officeRepository.findById(officeId)).thenReturn(Optional.of(office));
        when(appointmentTypeRepository.findById(typeId)).thenReturn(Optional.of(appointmentType));

        assertThatThrownBy(() -> appointmentService.create(req(LocalDateTime.now().minusHours(1))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("past");
    }

    @Test
    @DisplayName("La cita debe quedar dentro del horario laboral del doctor")
    void create_outsideDoctorSchedule_throwsBusiness() {
        // Schedule ends at 09:00, slot de 30 min a partir de 09:00 termina a 09:30 → fuera
        var tightSchedule = DoctorSchedule.builder()
                .id(UUID.randomUUID()).doctor(doctor).day(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(8, 0)).endTime(LocalTime.of(9, 0))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(officeRepository.findById(officeId)).thenReturn(Optional.of(office));
        when(appointmentTypeRepository.findById(typeId)).thenReturn(Optional.of(appointmentType));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(tightSchedule));

        assertThatThrownBy(() -> appointmentService.create(req(futureStart)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("working hours");
    }

    @Test
    @DisplayName("No puede existir traslape de horario para el doctor")
    void create_doctorOverlap_throwsConflict() {
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(officeRepository.findById(officeId)).thenReturn(Optional.of(office));
        when(appointmentTypeRepository.findById(typeId)).thenReturn(Optional.of(appointmentType));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule));
        when(appointmentRepository.existsDoctorOverlap(any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> appointmentService.create(req(futureStart)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Doctor");
    }

    @Test
    @DisplayName("No puede existir traslape de horario para el consultorio")
    void create_officeOverlap_throwsConflict() {
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(officeRepository.findById(officeId)).thenReturn(Optional.of(office));
        when(appointmentTypeRepository.findById(typeId)).thenReturn(Optional.of(appointmentType));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule));
        when(appointmentRepository.existsDoctorOverlap(any(), any(), any())).thenReturn(false);
        when(appointmentRepository.existsOfficeOverlap(any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> appointmentService.create(req(futureStart)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Office");
    }

    @Test
    @DisplayName("Un paciente no puede tener dos citas activas que se crucen en el tiempo")
    void create_patientOverlap_throwsConflict() {
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(officeRepository.findById(officeId)).thenReturn(Optional.of(office));
        when(appointmentTypeRepository.findById(typeId)).thenReturn(Optional.of(appointmentType));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule));
        when(appointmentRepository.existsDoctorOverlap(any(), any(), any())).thenReturn(false);
        when(appointmentRepository.existsOfficeOverlap(any(), any(), any())).thenReturn(false);
        when(appointmentRepository.existsPatientOverlap(any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> appointmentService.create(req(futureStart)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Patient");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6.2 Confirmación
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("Solo una cita SCHEDULED puede pasar a CONFIRMED")
    void confirm_scheduledToConfirmed() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.SCHEDULED)
                .patient(patient).doctor(doctor).office(office).appointmentType(appointmentType)
                .startTime(futureStart).endTime(futureStart.plusMinutes(30))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));
        when(appointmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = appointmentService.confirm(apptId);

        assertThat(result.status()).isEqualTo(AppointmentStatus.CONFIRMED);
    }

    @Test
    @DisplayName("No se puede confirmar una cita CANCELLED")
    void confirm_cancelled_throwsBusiness() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.CANCELLED)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.confirm(apptId))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("No se puede confirmar una cita COMPLETED")
    void confirm_completed_throwsBusiness() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.COMPLETED)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.confirm(apptId))
                .isInstanceOf(BusinessException.class);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6.3 Cancelación
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("Cancelar cita CONFIRMED con motivo — pasa a CANCELLED")
    void cancel_confirmedWithReason_cancelled() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.CONFIRMED)
                .patient(patient).doctor(doctor).office(office).appointmentType(appointmentType)
                .startTime(futureStart).endTime(futureStart.plusMinutes(30))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));
        when(appointmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = appointmentService.cancel(apptId, new CancelAppointmentRequest("Paciente no puede asistir"));

        assertThat(result.status()).isEqualTo(AppointmentStatus.CANCELLED);
        assertThat(result.cancellationReason()).isEqualTo("Paciente no puede asistir");
    }

    @Test
    @DisplayName("Cancelar cita SCHEDULED con motivo — pasa a CANCELLED")
    void cancel_scheduledWithReason_cancelled() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.SCHEDULED)
                .patient(patient).doctor(doctor).office(office).appointmentType(appointmentType)
                .startTime(futureStart).endTime(futureStart.plusMinutes(30))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));
        when(appointmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = appointmentService.cancel(apptId, new CancelAppointmentRequest("Reagendar"));

        assertThat(result.status()).isEqualTo(AppointmentStatus.CANCELLED);
    }

    @Test
    @DisplayName("La cancelación requiere motivo obligatorio")
    void cancel_blankReason_throwsBusiness() {
        var apptId = UUID.randomUUID();

        assertThatThrownBy(() -> appointmentService.cancel(apptId, new CancelAppointmentRequest("")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("reason");
    }
    @Test
    @DisplayName("No se puede cancelar una cita COMPLETED")
    void cancel_completed_throwsBusiness() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.COMPLETED)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.cancel(apptId, new CancelAppointmentRequest("motivo")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("No se puede cancelar una cita NO_SHOW")
    void cancel_noShow_throwsBusiness() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.NO_SHOW)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.cancel(apptId, new CancelAppointmentRequest("motivo")))
                .isInstanceOf(BusinessException.class);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6.4 Finalización
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("Solo una cita CONFIRMED puede pasar a COMPLETED, registrando observaciones")
    void complete_confirmedAfterStart_completedWithNotes() {
        var apptId = UUID.randomUUID();
        var pastStart = LocalDateTime.now().minusMinutes(30);
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.CONFIRMED)
                .patient(patient).doctor(doctor).office(office).appointmentType(appointmentType)
                .startTime(pastStart).endTime(pastStart.plusMinutes(30))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));
        when(appointmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = appointmentService.complete(apptId, new CompleteAppointmentRequest("Atención sin novedades"));

        assertThat(result.status()).isEqualTo(AppointmentStatus.COMPLETED);
        assertThat(result.notes()).isEqualTo("Atención sin novedades");
    }

    @Test
    @DisplayName("No se puede completar una cita antes de su hora de inicio")
    void complete_beforeStartTime_throwsBusiness() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.CONFIRMED)
                .startTime(LocalDateTime.now().plusHours(2))
                .endTime(LocalDateTime.now().plusHours(3))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.complete(apptId, new CompleteAppointmentRequest(null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("before");
    }

    @Test
    @DisplayName("No se puede completar una cita que no esté CONFIRMED")
    void complete_scheduledStatus_throwsBusiness() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.SCHEDULED)
                .startTime(LocalDateTime.now().minusMinutes(10))
                .endTime(LocalDateTime.now().plusMinutes(20))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.complete(apptId, new CompleteAppointmentRequest(null)))
                .isInstanceOf(BusinessException.class);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6.5 No asistencia
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("Solo una cita CONFIRMED puede pasar a NO_SHOW después de su hora de inicio")
    void markNoShow_confirmedAfterStart_noShow() {
        var apptId = UUID.randomUUID();
        var pastStart = LocalDateTime.now().minusMinutes(10);
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.CONFIRMED)
                .patient(patient).doctor(doctor).office(office).appointmentType(appointmentType)
                .startTime(pastStart).endTime(pastStart.plusMinutes(30))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));
        when(appointmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = appointmentService.markNoShow(apptId);

        assertThat(result.status()).isEqualTo(AppointmentStatus.NO_SHOW);
    }

    @Test
    @DisplayName("No se puede marcar NO_SHOW antes de la hora de inicio")
    void markNoShow_beforeStartTime_throwsBusiness() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.CONFIRMED)
                .startTime(LocalDateTime.now().plusHours(1))
                .endTime(LocalDateTime.now().plusHours(2))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.markNoShow(apptId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("before");
    }

    @Test
    @DisplayName("No se puede marcar NO_SHOW si la cita no está CONFIRMED")
    void markNoShow_scheduledStatus_throwsBusiness() {
        var apptId = UUID.randomUUID();
        var appt = Appointment.builder().id(apptId).status(AppointmentStatus.SCHEDULED)
                .startTime(LocalDateTime.now().minusMinutes(5))
                .endTime(LocalDateTime.now().plusMinutes(25))
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(appointmentRepository.findByIdWithJoins(apptId)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.markNoShow(apptId))
                .isInstanceOf(BusinessException.class);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Consultas básicas
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("findById lanza ResourceNotFoundException si la cita no existe")
    void findById_notFound_throwsResourceNotFound() {
        var unknownId = UUID.randomUUID();
        when(appointmentRepository.findByIdWithJoins(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.findById(unknownId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
