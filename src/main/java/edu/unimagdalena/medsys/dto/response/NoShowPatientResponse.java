package edu.unimagdalena.medsys.dto.response;

import java.util.UUID;

public record NoShowPatientResponse(
        UUID patientId,
        String patientName,
        long noShowCount
) {}
