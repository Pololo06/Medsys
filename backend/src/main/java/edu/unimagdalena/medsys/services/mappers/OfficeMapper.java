package edu.unimagdalena.medsys.services.mappers;

import edu.unimagdalena.medsys.api.dto.request.CreateOfficeRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateOfficeRequest;
import edu.unimagdalena.medsys.api.dto.response.OfficeResponse;
import edu.unimagdalena.medsys.domain.entities.Office;

public class OfficeMapper {

    private OfficeMapper() {}

    public static Office toEntity(CreateOfficeRequest request) {
        return Office.builder()
                .name(request.name())
                .location(request.location())
                .build();
    }

    public static Office toEntity(UpdateOfficeRequest request) {
        return Office.builder()
                .name(request.name())
                .location(request.location())
                .status(request.status())
                .build();
    }

    public static OfficeResponse toResponse(Office office) {
        return new OfficeResponse(
                office.getId(),
                office.getName(),
                office.getLocation(),
                office.getStatus()
        );
    }
}
