package edu.unimagdalena.medsys.dto.request;

import edu.unimagdalena.medsys.enums.PatientStatus;

public record UpdatePatientRequest(
        String fullName,
        String email,
        String phone,
        PatientStatus status
) {}
