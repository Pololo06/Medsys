package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.api.dto.request.CreatePatientRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdatePatientRequest;
import edu.unimagdalena.medsys.api.dto.response.PatientResponse;

import java.util.List;
import java.util.UUID;

public interface PatientService {
    PatientResponse create(CreatePatientRequest req);
    PatientResponse findById(UUID id);
    List<PatientResponse> findAll();
    PatientResponse update(UUID id, UpdatePatientRequest req);
}
