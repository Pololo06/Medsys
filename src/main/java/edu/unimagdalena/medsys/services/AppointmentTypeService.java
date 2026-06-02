package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.api.dto.request.CreateAppointmentTypeRequest;
import edu.unimagdalena.medsys.api.dto.response.AppointmentTypeResponse;

import java.util.List;
import java.util.UUID;

public interface AppointmentTypeService {
    AppointmentTypeResponse create(CreateAppointmentTypeRequest req);
    List<AppointmentTypeResponse> findAll();
    AppointmentTypeResponse findById(UUID id);
    void delete(UUID id);
}
