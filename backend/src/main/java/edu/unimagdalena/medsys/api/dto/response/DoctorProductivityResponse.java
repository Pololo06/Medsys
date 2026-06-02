package edu.unimagdalena.medsys.api.dto.response;

import java.util.UUID;

public record DoctorProductivityResponse(
        UUID doctorId,
        String doctorName,
        long completedAppointments
) {}
