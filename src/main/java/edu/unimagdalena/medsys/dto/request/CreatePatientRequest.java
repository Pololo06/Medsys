package edu.unimagdalena.medsys.dto.request;

public record CreatePatientRequest(
        String fullName,
        String email,
        String phone
) {}
