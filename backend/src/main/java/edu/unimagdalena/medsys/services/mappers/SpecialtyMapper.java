package edu.unimagdalena.medsys.services.mappers;

import edu.unimagdalena.medsys.api.dto.request.CreateSpecialtyRequest;
import edu.unimagdalena.medsys.api.dto.response.SpecialtyResponse;
import edu.unimagdalena.medsys.domain.entities.Specialty;

public class SpecialtyMapper {

    private SpecialtyMapper() {}

    public static Specialty toEntity(CreateSpecialtyRequest request) {
        return Specialty.builder()
                .name(request.name())
                .build();
    }

    public static SpecialtyResponse toResponse(Specialty specialty) {
        return new SpecialtyResponse(
                specialty.getId(),
                specialty.getName()
        );
    }
}
