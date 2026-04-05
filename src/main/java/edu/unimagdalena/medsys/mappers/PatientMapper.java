package edu.unimagdalena.medsys.mappers;

import edu.unimagdalena.medsys.dto.request.CreatePatientRequest;
import edu.unimagdalena.medsys.dto.request.UpdatePatientRequest;
import edu.unimagdalena.medsys.dto.response.PatientResponse;
import edu.unimagdalena.medsys.entities.Patient;

public class PatientMapper {

    private PatientMapper() {}

    public static Patient toEntity(CreatePatientRequest request) {
        return Patient.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .build();
    }

    public static Patient toEntity(UpdatePatientRequest request) {
        return Patient.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .status(request.status())
                .build();
    }

    public static PatientResponse toResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getFullName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getStatus()
        );
    }
}
