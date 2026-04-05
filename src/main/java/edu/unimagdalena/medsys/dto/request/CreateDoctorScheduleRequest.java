package edu.unimagdalena.medsys.dto.request;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record CreateDoctorScheduleRequest(
        DayOfWeek day,
        LocalTime startTime,
        LocalTime endTime
) {}
