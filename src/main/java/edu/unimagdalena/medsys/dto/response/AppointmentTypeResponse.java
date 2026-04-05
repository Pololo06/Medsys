package edu.unimagdalena.medsys.dto.response;

import java.util.UUID;

public record AppointmentTypeResponse(
        UUID id,
        String name,
        int durationMinutes
) {}
