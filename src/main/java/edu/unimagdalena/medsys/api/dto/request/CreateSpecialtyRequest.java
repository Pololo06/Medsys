package edu.unimagdalena.medsys.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateSpecialtyRequest(
        @NotBlank(message = "El nombre de la especialidad es obligatorio") String name
) {}
