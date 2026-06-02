package edu.unimagdalena.medsys.services.mappers;

import edu.unimagdalena.medsys.api.dto.request.CreatePatientRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdatePatientRequest;
import edu.unimagdalena.medsys.api.dto.response.PatientResponse;
import edu.unimagdalena.medsys.domain.entities.Patient;

public class PatientMapper {

    private PatientMapper() {}

    public static Patient toEntity(CreatePatientRequest request) {
        return Patient.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .documentId(request.documentId())
                .build();
    }

    public static Patient toEntity(UpdatePatientRequest request) {
        return Patient.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .documentId(request.documentId())
                .status(request.status())
                .build();
    }

    public static PatientResponse toResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getFullName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getDocumentId(),
                patient.getStatus()
        );
    }
}
