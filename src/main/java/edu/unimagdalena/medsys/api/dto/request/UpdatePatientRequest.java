package edu.unimagdalena.medsys.api.dto.request;

import edu.unimagdalena.medsys.domain.enums.PatientStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdatePatientRequest(
        @NotBlank(message = "El nombre completo es obligatorio") String fullName,
        @NotBlank(message = "El correo electrónico es obligatorio") String email,
        @NotBlank(message = "El teléfono es obligatorio") String phone,
        @NotBlank(message = "El número de documento es obligatorio") String documentId,
        @NotNull(message = "El estado del paciente es obligatorio") PatientStatus status
) {}
