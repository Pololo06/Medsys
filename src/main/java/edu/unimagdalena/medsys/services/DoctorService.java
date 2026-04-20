package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.api.dto.request.CreateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.response.DoctorResponse;

import java.util.List;
import java.util.UUID;

public interface DoctorService {
    DoctorResponse create(CreateDoctorRequest req);
    DoctorResponse findById(UUID id);
    List<DoctorResponse> findAll();
    DoctorResponse update(UUID id, UpdateDoctorRequest req);
    List<DoctorResponse> findActiveBySpecialty(UUID specialtyId);
}
