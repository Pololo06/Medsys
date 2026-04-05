package edu.unimagdalena.medsys.mappers;

import edu.unimagdalena.medsys.dto.response.AppointmentResponse;
import edu.unimagdalena.medsys.entities.Appointment;

public class AppointmentMapper {

    private AppointmentMapper() {}

    public static AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getStatus(),
                appointment.getPatient().getId(),
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getFullName(),
                appointment.getOffice().getId(),
                appointment.getOffice().getName(),
                appointment.getAppointmentType().getId(),
                appointment.getAppointmentType().getName(),
                appointment.getCancellationReason(),
                appointment.getNotes()
        );
    }
}
