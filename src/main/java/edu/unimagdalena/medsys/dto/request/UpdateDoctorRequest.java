package edu.unimagdalena.medsys.dto.request;

public record UpdateDoctorRequest(
        String fullName,
        boolean active
) {}
