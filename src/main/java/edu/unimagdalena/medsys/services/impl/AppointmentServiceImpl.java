package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.api.dto.request.CancelAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CompleteAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CreateAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.response.AppointmentResponse;
import edu.unimagdalena.medsys.domain.entities.Appointment;
import edu.unimagdalena.medsys.domain.entities.DoctorSchedule;
import edu.unimagdalena.medsys.domain.repositories.*;
import edu.unimagdalena.medsys.domain.enums.AppointmentStatus;
import edu.unimagdalena.medsys.domain.enums.OfficeStatus;
import edu.unimagdalena.medsys.domain.enums.PatientStatus;
import edu.unimagdalena.medsys.exceptions.BusinessException;
import edu.unimagdalena.medsys.exceptions.ConflictException;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.mappers.AppointmentMapper;
import edu.unimagdalena.medsys.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final OfficeRepository officeRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;

    @Override
    public AppointmentResponse create(CreateAppointmentRequest req) {
        var patient = patientRepository.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + req.patientId()));
        if (patient.getStatus() != PatientStatus.ACTIVE) {
            throw new BusinessException("El paciente no está activo");
        }

        var doctor = doctorRepository.findById(req.doctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + req.doctorId()));
        if (!doctor.isActive()) {
            throw new BusinessException("El médico no está activo");
        }

        var office = officeRepository.findById(req.officeId())
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with id: " + req.officeId()));
        if (office.getStatus() != OfficeStatus.AVAILABLE) {
            throw new BusinessException("El consultorio no está disponible");
        }

        var appointmentType = appointmentTypeRepository.findById(req.appointmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentType not found with id: " + req.appointmentTypeId()));

        var startTime = req.startTime();
        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new BusinessException("No se puede agendar una cita en el pasado");
        }

        var endTime = startTime.plusMinutes(appointmentType.getDurationMinutes());

        var schedules = doctorScheduleRepository.findByDoctorIdAndDay(req.doctorId(), startTime.getDayOfWeek());
        if (schedules.isEmpty()) {
            throw new BusinessException("El médico no tiene horario configurado para el día " + startTime.getDayOfWeek());
        }

        boolean withinSchedule = schedules.stream().anyMatch(s -> fitsInSchedule(s, startTime.toLocalTime(), endTime.toLocalTime()));
        if (!withinSchedule) {
            throw new BusinessException("La cita está fuera del horario de atención del médico");
        }

        if (appointmentRepository.existsDoctorOverlap(req.doctorId(), startTime, endTime)) {
            throw new ConflictException("El médico ya tiene una cita en ese horario");
        }

        if (appointmentRepository.existsOfficeOverlap(req.officeId(), startTime, endTime)) {
            throw new ConflictException("El consultorio ya está ocupado en ese horario");
        }

        if (appointmentRepository.existsPatientOverlap(req.patientId(), startTime, endTime)) {
            throw new ConflictException("El paciente ya tiene una cita en ese horario");
        }

        var appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .office(office)
                .appointmentType(appointmentType)
                .startTime(startTime)
                .endTime(endTime)
                .status(AppointmentStatus.SCHEDULED)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse findById(UUID id) {
        return appointmentRepository.findByIdWithJoins(id)
                .map(AppointmentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAll() {
        return appointmentRepository.findAllWithJoins().stream()
                .map(AppointmentMapper::toResponse)
                .toList();
    }

    @Override
    public AppointmentResponse confirm(UUID id) {
        var appointment = appointmentRepository.findByIdWithJoins(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new BusinessException("Solo se pueden confirmar citas en estado SCHEDULED. Estado actual: " + appointment.getStatus());
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setUpdatedAt(Instant.now());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse cancel(UUID id, CancelAppointmentRequest req) {
        if (req.reason() == null || req.reason().isBlank()) {
            throw new BusinessException("El motivo de cancelación es obligatorio");
        }
        var appointment = appointmentRepository.findByIdWithJoins(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Solo se pueden cancelar citas en estado SCHEDULED o CONFIRMED. Estado actual: " + appointment.getStatus());
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(req.reason());
        appointment.setUpdatedAt(Instant.now());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse complete(UUID id, CompleteAppointmentRequest req) {
        var appointment = appointmentRepository.findByIdWithJoins(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Solo se pueden completar citas en estado CONFIRMED. Estado actual: " + appointment.getStatus());
        }
        if (LocalDateTime.now().isBefore(appointment.getStartTime())) {
            throw new BusinessException("No se puede completar una cita antes de su hora de inicio");
        }
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setObservation(req.notes());
        appointment.setUpdatedAt(Instant.now());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse markNoShow(UUID id) {
        var appointment = appointmentRepository.findByIdWithJoins(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Solo se pueden marcar como NO_SHOW citas en estado CONFIRMED. Estado actual: " + appointment.getStatus());
        }
        if (LocalDateTime.now().isBefore(appointment.getStartTime())) {
            throw new BusinessException("No se puede marcar como NO_SHOW antes de la hora de inicio de la cita");
        }
        appointment.setStatus(AppointmentStatus.NO_SHOW);
        appointment.setUpdatedAt(Instant.now());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    private boolean fitsInSchedule(DoctorSchedule schedule, LocalTime start, LocalTime end) {
        return !start.isBefore(schedule.getStartTime()) && !end.isAfter(schedule.getEndTime());
    }
}
