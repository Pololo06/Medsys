package edu.unimagdalena.medsys.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Future;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateAppointmentRequest(

        @NotNull UUID patientId,
        @NotNull UUID doctorId,
        @NotNull UUID officeId,
        @NotNull UUID appointmentTypeId,

        @NotNull
        @Future
        LocalDateTime startTime
) {}