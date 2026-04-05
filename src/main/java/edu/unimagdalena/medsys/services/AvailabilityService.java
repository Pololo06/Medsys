package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.dto.response.AvailabilitySlotResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AvailabilityService {
    List<AvailabilitySlotResponse> getAvailableSlots(UUID doctorId, LocalDate date, int durationMinutes);
}
