package edu.unimagdalena.medsys.api.dto.request;

import edu.unimagdalena.medsys.domain.enums.OfficeStatus;

public record UpdateOfficeRequest(
        String name,
        String location,
        OfficeStatus status
) {}
