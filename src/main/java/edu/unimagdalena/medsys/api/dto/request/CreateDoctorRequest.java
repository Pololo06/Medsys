package edu.unimagdalena.medsys.api.dto.request;

import java.util.UUID;

public record CreateDoctorRequest(
        String fullName,
        UUID specialtyId
) {}
