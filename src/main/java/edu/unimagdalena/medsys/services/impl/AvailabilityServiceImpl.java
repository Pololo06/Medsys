package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.api.dto.response.AvailabilitySlotResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.domain.repositories.AppointmentRepository;
import edu.unimagdalena.medsys.domain.repositories.DoctorRepository;
import edu.unimagdalena.medsys.domain.repositories.DoctorScheduleRepository;
import edu.unimagdalena.medsys.services.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AppointmentRepository appointmentRepository;

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

        // BUG FIX 6: Ordenar los schedules por startTime para evitar slots duplicados
        // cuando hay horarios adyacentes (ej. 08:00-12:00 y 12:00-16:00 producen
        // el slot 12:00 dos veces sin esta ordenación y deduplicación).
        var sortedSchedules = schedules.stream()
                .sorted(Comparator.comparing(s -> s.getStartTime()))
                .toList();

        List<AvailabilitySlotResponse> availableSlots = new ArrayList<>();
        // Rastreamos el último slotStart añadido para evitar duplicados exactos
        LocalDateTime lastAdded = null;

        for (var schedule : sortedSchedules) {
            var current = date.atTime(schedule.getStartTime());
            var scheduleEnd = date.atTime(schedule.getEndTime());

            while (!current.plusMinutes(durationMinutes).isAfter(scheduleEnd)) {
                var slotStart = current;
                var slotEnd = current.plusMinutes(durationMinutes);

                // Evitar slot duplicado si ya fue generado por un schedule adyacente anterior
                if (slotStart.equals(lastAdded)) {
                    current = current.plusMinutes(durationMinutes);
                    continue;
                }

                boolean isBooked = bookedAppointments.stream().anyMatch(a ->
                        a.getStartTime().isBefore(slotEnd) && a.getEndTime().isAfter(slotStart)
                );

                if (!isBooked) {
                    availableSlots.add(new AvailabilitySlotResponse(slotStart, slotEnd));
                    lastAdded = slotStart;
                }

                current = current.plusMinutes(durationMinutes);
            }
        }

        return availableSlots;
    }
}
