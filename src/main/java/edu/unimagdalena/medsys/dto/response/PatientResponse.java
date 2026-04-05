package edu.unimagdalena.medsys.dto.response;

import edu.unimagdalena.medsys.enums.PatientStatus;

import java.util.UUID;

public record PatientResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        PatientStatus status
) {}
