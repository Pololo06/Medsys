package edu.unimagdalena.medsys.mappers;

import edu.unimagdalena.medsys.dto.request.CreateAppointmentTypeRequest;
import edu.unimagdalena.medsys.dto.response.AppointmentTypeResponse;
import edu.unimagdalena.medsys.entities.AppointmentType;

public class AppointmentTypeMapper {

    private AppointmentTypeMapper() {}

    public static AppointmentType toEntity(CreateAppointmentTypeRequest request) {
        return AppointmentType.builder()
                .name(request.name())
                .durationMinutes(request.durationMinutes())
                .build();
    }

    public static AppointmentTypeResponse toResponse(AppointmentType appointmentType) {
        return new AppointmentTypeResponse(
                appointmentType.getId(),
                appointmentType.getName(),
                appointmentType.getDurationMinutes()
        );
    }
}
