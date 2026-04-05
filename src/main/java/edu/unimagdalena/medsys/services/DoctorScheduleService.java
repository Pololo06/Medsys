package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.dto.request.CreateDoctorScheduleRequest;
import edu.unimagdalena.medsys.dto.response.DoctorScheduleResponse;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

public interface DoctorScheduleService {
    DoctorScheduleResponse create(UUID doctorId, CreateDoctorScheduleRequest req);
    List<DoctorScheduleResponse> findByDoctor(UUID doctorId);
    List<DoctorScheduleResponse> findByDoctorAndDay(UUID doctorId, DayOfWeek day);
}
