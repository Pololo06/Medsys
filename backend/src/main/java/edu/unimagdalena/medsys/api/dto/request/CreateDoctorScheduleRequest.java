package edu.unimagdalena.medsys.api.dto.request;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record CreateDoctorScheduleRequest(
        DayOfWeek day,
        LocalTime startTime,
        LocalTime endTime
) {}
