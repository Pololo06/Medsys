package edu.unimagdalena.medsys.api.dto.request;

import edu.unimagdalena.medsys.domain.enums.PatientStatus;

public record UpdatePatientRequest(
        String fullName,
        String email,
        String phone,
        PatientStatus status
) {}
