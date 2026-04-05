package edu.unimagdalena.medsys.dto.request;

import edu.unimagdalena.medsys.enums.OfficeStatus;

public record UpdateOfficeRequest(
        String name,
        String location,
        OfficeStatus status
) {}
