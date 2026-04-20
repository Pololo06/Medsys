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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final OfficeRepository officeRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  DoctorRepository doctorRepository,
                                  OfficeRepository officeRepository,
                                  AppointmentTypeRepository appointmentTypeRepository,
                                  DoctorScheduleRepository doctorScheduleRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.officeRepository = officeRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
    }

    @Override
    public AppointmentResponse create(CreateAppointmentRequest req) {
        var patient = patientRepository.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + req.patientId()));
        if (patient.getStatus() != PatientStatus.ACTIVE) {
            throw new BusinessException("Patient is not active");
        }

        var doctor = doctorRepository.findById(req.doctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + req.doctorId()));
        if (!doctor.isActive()) {
            throw new BusinessException("Doctor is not active");
        }

        var office = officeRepository.findById(req.officeId())
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with id: " + req.officeId()));
        if (office.getStatus() != OfficeStatus.AVAILABLE) {
            throw new BusinessException("Office is not available");
        }

        var appointmentType = appointmentTypeRepository.findById(req.appointmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentType not found with id: " + req.appointmentTypeId()));

        var startTime = req.startTime();
        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new BusinessException("Appointment cannot be scheduled in the past");
        }

        var endTime = startTime.plusMinutes(appointmentType.getDurationMinutes());

        var schedules = doctorScheduleRepository.findByDoctorIdAndDay(req.doctorId(), startTime.getDayOfWeek());
        if (schedules.isEmpty()) {
            throw new BusinessException("Doctor has no schedule configured for " + startTime.getDayOfWeek());
        }

        boolean withinSchedule = schedules.stream().anyMatch(s -> fitsInSchedule(s, startTime.toLocalTime(), endTime.toLocalTime()));
        if (!withinSchedule) {
            throw new BusinessException("Appointment is outside the doctor's working hours");
        }

        if (appointmentRepository.existsDoctorOverlap(req.doctorId(), startTime, endTime)) {
            throw new ConflictException("Doctor already has an appointment in that time slot");
        }

        if (appointmentRepository.existsOfficeOverlap(req.officeId(), startTime, endTime)) {
            throw new ConflictException("Office is already occupied in that time slot");
        }

        if (appointmentRepository.existsPatientOverlap(req.patientId(), startTime, endTime)) {
            throw new ConflictException("Patient already has an appointment in that time slot");
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
        return appointmentRepository.findById(id)
                .map(AppointmentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAll() {
        return appointmentRepository.findAll().stream()
                .map(AppointmentMapper::toResponse)
                .toList();
    }

    @Override
    public AppointmentResponse confirm(UUID id) {
        var appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new BusinessException("Only SCHEDULED appointments can be confirmed. Current status: " + appointment.getStatus());
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setUpdatedAt(Instant.now());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse cancel(UUID id, CancelAppointmentRequest req) {
        if (req.reason() == null || req.reason().isBlank()) {
            throw new BusinessException("Cancellation reason is required");
        }
        var appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Only SCHEDULED or CONFIRMED appointments can be cancelled. Current status: " + appointment.getStatus());
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(req.reason());
        appointment.setUpdatedAt(Instant.now());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse complete(UUID id, CompleteAppointmentRequest req) {
        var appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Only CONFIRMED appointments can be completed. Current status: " + appointment.getStatus());
        }
        if (LocalDateTime.now().isBefore(appointment.getStartTime())) {
            throw new BusinessException("Cannot complete an appointment before its scheduled start time");
        }
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setObservation(req.notes());
        appointment.setUpdatedAt(Instant.now());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse markNoShow(UUID id) {
        var appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Only CONFIRMED appointments can be marked as NO_SHOW. Current status: " + appointment.getStatus());
        }
        if (LocalDateTime.now().isBefore(appointment.getStartTime())) {
            throw new BusinessException("Cannot mark as NO_SHOW before the appointment's scheduled start time");
        }
        appointment.setStatus(AppointmentStatus.NO_SHOW);
        appointment.setUpdatedAt(Instant.now());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    private boolean fitsInSchedule(DoctorSchedule schedule, LocalTime start, LocalTime end) {
        return !start.isBefore(schedule.getStartTime()) && !end.isAfter(schedule.getEndTime());
    }
}
