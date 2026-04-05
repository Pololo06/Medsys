package edu.unimagdalena.medsys.dto.response;

import edu.unimagdalena.medsys.enums.AppointmentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        LocalDateTime startTime,
        LocalDateTime endTime,
        AppointmentStatus status,
        UUID patientId,
        String patientName,
        UUID doctorId,
        String doctorName,
        UUID officeId,
        String officeName,
        UUID appointmentTypeId,
        String appointmentTypeName,
        String cancellationReason,
        String notes
) {}
