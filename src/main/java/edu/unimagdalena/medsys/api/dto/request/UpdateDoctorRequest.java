package edu.unimagdalena.medsys.api.dto.request;

public record UpdateDoctorRequest(
        String fullName,
        boolean active
) {}
