package edu.unimagdalena.medsys.services.mappers;

import edu.unimagdalena.medsys.api.dto.request.CreateDoctorScheduleRequest;
import edu.unimagdalena.medsys.api.dto.response.DoctorScheduleResponse;
import edu.unimagdalena.medsys.domain.entities.DoctorSchedule;

public class DoctorScheduleMapper {

    private DoctorScheduleMapper() {}

    public static DoctorSchedule toEntity(CreateDoctorScheduleRequest request) {
        return DoctorSchedule.builder()
                .day(request.day())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .build();
    }

    public static DoctorScheduleResponse toResponse(DoctorSchedule schedule) {
        return new DoctorScheduleResponse(
                schedule.getId(),
                schedule.getDay(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getDoctor().getId(),
                schedule.getDoctor().getFullName()
        );
    }
}
