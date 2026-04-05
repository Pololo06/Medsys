package edu.unimagdalena.medsys.dto.response;

import java.time.LocalDateTime;

public record AvailabilitySlotResponse(
        LocalDateTime startTime,
        LocalDateTime endTime
) {}
