package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.api.dto.request.CancelAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CompleteAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CreateAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.response.AppointmentResponse;

import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    AppointmentResponse create(CreateAppointmentRequest req);
    AppointmentResponse findById(UUID id);
    List<AppointmentResponse> findAll();
    AppointmentResponse confirm(UUID id);
    AppointmentResponse cancel(UUID id, CancelAppointmentRequest req);
    AppointmentResponse complete(UUID id, CompleteAppointmentRequest req);
    AppointmentResponse markNoShow(UUID id);
}
