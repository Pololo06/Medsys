package edu.unimagdalena.medsys.dto.response;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorScheduleResponse(
        UUID id,
        DayOfWeek day,
        LocalTime startTime,
        LocalTime endTime,
        UUID doctorId,
        String doctorName
) {}
