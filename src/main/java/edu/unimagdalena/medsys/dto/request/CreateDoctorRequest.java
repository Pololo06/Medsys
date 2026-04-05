package edu.unimagdalena.medsys.dto.request;

import java.util.UUID;

public record CreateDoctorRequest(
        String fullName,
        UUID specialtyId
) {}
