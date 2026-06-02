package edu.unimagdalena.medsys.services.mappers;

import edu.unimagdalena.medsys.api.dto.request.CreateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.response.DoctorResponse;
import edu.unimagdalena.medsys.domain.entities.Doctor;
import edu.unimagdalena.medsys.domain.entities.Specialty;

public class DoctorMapper {

    private DoctorMapper() {}

    public static Doctor toEntity(CreateDoctorRequest request) {
        return Doctor.builder()
                .fullName(request.fullName())
                .specialty(Specialty.builder().id(request.specialtyId()).build())
                .build();
    }

    public static Doctor toEntity(UpdateDoctorRequest request) {
        return Doctor.builder()
                .fullName(request.fullName())
                .active(request.active())
                .build();
    }

    public static DoctorResponse toResponse(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getFullName(),
                doctor.isActive(),
                doctor.getSpecialty().getId(),
                doctor.getSpecialty().getName()
        );
    }
}
