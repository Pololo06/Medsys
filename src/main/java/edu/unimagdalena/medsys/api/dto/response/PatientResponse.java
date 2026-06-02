package edu.unimagdalena.medsys.api.dto.response;

import edu.unimagdalena.medsys.domain.enums.PatientStatus;

import java.util.UUID;

public record PatientResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String documentId,
        PatientStatus status
) {}
