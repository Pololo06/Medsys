package edu.unimagdalena.medsys.dto.response;

import java.util.UUID;

public record DoctorResponse(
        UUID id,
        String fullName,
        boolean active,
        UUID specialtyId,
        String specialtyName
) {}
