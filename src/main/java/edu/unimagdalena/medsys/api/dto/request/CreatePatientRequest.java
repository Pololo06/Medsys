package edu.unimagdalena.medsys.api.dto.request;

public record CreatePatientRequest(
        String fullName,
        String email,
        String phone
) {}
