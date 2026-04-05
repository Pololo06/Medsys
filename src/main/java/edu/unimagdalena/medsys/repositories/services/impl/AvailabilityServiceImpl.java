package edu.unimagdalena.medsys.repositories.services.impl;

import edu.unimagdalena.medsys.dto.response.AvailabilitySlotResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.repositories.AppointmentRepository;
import edu.unimagdalena.medsys.repositories.DoctorRepository;
import edu.unimagdalena.medsys.repositories.DoctorScheduleRepository;
import edu.unimagdalena.medsys.services.AvailabilityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AvailabilityServiceImpl implements AvailabilityService {

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AppointmentRepository appointmentRepository;

    public AvailabilityServiceImpl(DoctorRepository doctorRepository,
                                   DoctorScheduleRepository doctorScheduleRepository,
                                   AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public List<AvailabilitySlotResponse> getAvailableSlots(UUID doctorId, LocalDate date, int durationMinutes) {
        doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        var schedules = doctorScheduleRepository.findByDoctorIdAndDay(doctorId, date.getDayOfWeek());
        if (schedules.isEmpty()) {
            return List.of();
        }

        var dayStart = date.atStartOfDay();
        var dayEnd = date.atTime(LocalTime.MAX);
        var bookedAppointments = appointmentRepository.findActiveAppointmentsByDoctorAndDay(
                doctorId, dayStart, dayEnd);

        List<AvailabilitySlotResponse> availableSlots = new ArrayList<>();

        for (var schedule : schedules) {
            var current = date.atTime(schedule.getStartTime());
            var scheduleEnd = date.atTime(schedule.getEndTime());

            while (!current.plusMinutes(durationMinutes).isAfter(scheduleEnd)) {
                var slotStart = current;
                var slotEnd = current.plusMinutes(durationMinutes);

                boolean isBooked = bookedAppointments.stream().anyMatch(a ->
                        a.getStartTime().isBefore(slotEnd) && a.getEndTime().isAfter(slotStart)
                );

                if (!isBooked) {
                    availableSlots.add(new AvailabilitySlotResponse(slotStart, slotEnd));
                }

                current = current.plusMinutes(durationMinutes);
            }
        }

        return availableSlots;
    }
}
