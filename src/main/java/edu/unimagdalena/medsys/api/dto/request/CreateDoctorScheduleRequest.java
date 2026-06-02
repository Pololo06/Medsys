package edu.unimagdalena.medsys.api.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record CreateDoctorScheduleRequest(
        @NotNull(message = "El día de la semana es obligatorio") DayOfWeek day,
        @NotNull(message = "La hora de inicio es obligatoria") LocalTime startTime,
        @NotNull(message = "La hora de fin es obligatoria") LocalTime endTime
) {}
