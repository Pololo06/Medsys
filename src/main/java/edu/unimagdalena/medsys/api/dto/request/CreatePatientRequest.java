package edu.unimagdalena.medsys.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreatePatientRequest(
        @NotBlank String fullName,
        @NotBlank String email,
        @NotBlank String phone,
        @NotBlank String documentId
) {}
