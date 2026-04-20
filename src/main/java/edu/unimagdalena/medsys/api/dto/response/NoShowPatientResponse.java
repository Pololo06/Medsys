package edu.unimagdalena.medsys.api.dto.response;

import java.util.UUID;

public record NoShowPatientResponse(
        UUID patientId,
        String patientName,
        long noShowCount
) {}
