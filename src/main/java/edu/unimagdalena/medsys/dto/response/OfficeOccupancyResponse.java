package edu.unimagdalena.medsys.dto.response;

import java.util.UUID;

public record OfficeOccupancyResponse(
        UUID officeId,
        String officeName,
        long appointmentCount
) {}
