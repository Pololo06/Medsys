package edu.unimagdalena.medsys.api.dto.response;

import edu.unimagdalena.medsys.domain.enums.OfficeStatus;

import java.util.UUID;

public record OfficeResponse(
        UUID id,
        String name,
        String location,
        OfficeStatus status
) {}
