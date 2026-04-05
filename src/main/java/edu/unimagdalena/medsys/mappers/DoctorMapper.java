package edu.unimagdalena.medsys.mappers;

import edu.unimagdalena.medsys.dto.request.CreateDoctorRequest;
import edu.unimagdalena.medsys.dto.request.UpdateDoctorRequest;
import edu.unimagdalena.medsys.dto.response.DoctorResponse;
import edu.unimagdalena.medsys.entities.Doctor;
import edu.unimagdalena.medsys.entities.Specialty;

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
