package edu.unimagdalena.medsys.mappers;

import edu.unimagdalena.medsys.dto.request.CreateSpecialtyRequest;
import edu.unimagdalena.medsys.dto.response.SpecialtyResponse;
import edu.unimagdalena.medsys.entities.Specialty;

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
