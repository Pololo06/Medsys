package edu.unimagdalena.medsys.api.dto.response;

import java.util.UUID;

public record AppointmentTypeResponse(
        UUID id,
        String name,
        int durationMinutes
) {}
