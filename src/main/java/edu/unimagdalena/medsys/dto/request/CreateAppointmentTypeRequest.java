package edu.unimagdalena.medsys.dto.request;

public record CreateAppointmentTypeRequest(
        String name,
        int durationMinutes
) {}
