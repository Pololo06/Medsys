package edu.unimagdalena.medsys.api.dto.response;

import java.time.LocalDateTime;

public record AvailabilitySlotResponse(
        LocalDateTime startTime,
        LocalDateTime endTime
) {}
