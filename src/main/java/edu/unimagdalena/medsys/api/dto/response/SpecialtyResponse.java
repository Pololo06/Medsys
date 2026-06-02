package edu.unimagdalena.medsys.api.dto.response;

import java.util.UUID;

public record SpecialtyResponse(
        UUID id,
        String name
) {}
