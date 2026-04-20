package edu.unimagdalena.medsys.api.dto.request;

public record CreateAppointmentTypeRequest(
        String name,
        int durationMinutes
) {}
