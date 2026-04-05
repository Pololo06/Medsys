package edu.unimagdalena.medsys.dto.response;

import edu.unimagdalena.medsys.enums.OfficeStatus;

import java.util.UUID;

public record OfficeResponse(
        UUID id,
        String name,
        String location,
        OfficeStatus status
) {}
