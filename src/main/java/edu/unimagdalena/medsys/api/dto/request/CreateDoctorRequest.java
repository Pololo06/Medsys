package edu.unimagdalena.medsys.api.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateDoctorRequest(

        @NotBlank String fullName,
        @NotNull UUID specialtyId
) {}
