package edu.unimagdalena.medsys.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CancelAppointmentRequest(
        @NotBlank String reason
) {}