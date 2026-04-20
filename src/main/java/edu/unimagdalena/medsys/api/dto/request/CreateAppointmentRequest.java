package edu.unimagdalena.medsys.api.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateAppointmentRequest(
        UUID patientId,
        UUID doctorId,
        UUID officeId,
        UUID appointmentTypeId,
        LocalDateTime startTime
) {}
