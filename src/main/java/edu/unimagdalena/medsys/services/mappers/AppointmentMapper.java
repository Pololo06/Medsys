package edu.unimagdalena.medsys.services.mappers;

import edu.unimagdalena.medsys.api.dto.response.AppointmentResponse;
import edu.unimagdalena.medsys.domain.entities.Appointment;

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
                appointment.getObservation()
        );
    }
}
