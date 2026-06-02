package edu.unimagdalena.medsys.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateAppointmentTypeRequest(
        @NotBlank(message = "El nombre del tipo de cita es obligatorio") String name,
        @Min(value = 1, message = "La duración debe ser de al menos 1 minuto") int durationMinutes
) {}
