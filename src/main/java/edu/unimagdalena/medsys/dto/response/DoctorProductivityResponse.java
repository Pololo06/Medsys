package edu.unimagdalena.medsys.dto.response;

import java.util.UUID;

public record DoctorProductivityResponse(
        UUID doctorId,
        String doctorName,
        long completedAppointments
) {}
