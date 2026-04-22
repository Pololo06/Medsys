package edu.unimagdalena.medsys.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateOfficeRequest(

        @NotBlank String name,
        @NotBlank String location
) {}