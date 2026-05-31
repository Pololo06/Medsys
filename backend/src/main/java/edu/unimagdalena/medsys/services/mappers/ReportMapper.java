package edu.unimagdalena.medsys.services.mappers;

import edu.unimagdalena.medsys.api.dto.response.DoctorProductivityResponse;
import edu.unimagdalena.medsys.api.dto.response.NoShowPatientResponse;
import edu.unimagdalena.medsys.api.dto.response.OfficeOccupancyResponse;

import java.util.List;
import java.util.UUID;

public class ReportMapper {

    private ReportMapper() {}

    /**
     * Maps Object[] from countAppointmentsByOffice(start, end):
     * [0] = office.id (UUID), [1] = office.name (String), [2] = count (Long)
     */
    public static OfficeOccupancyResponse toOfficeOccupancy(Object[] row) {
        return new OfficeOccupancyResponse(
                (UUID) row[0],
                (String) row[1],
                ((Number) row[2]).longValue()
        );
    }

    public static List<OfficeOccupancyResponse> toOfficeOccupancyList(List<Object[]> rows) {
        return rows.stream().map(ReportMapper::toOfficeOccupancy).toList();
    }

    /**
     * Maps Object[] from doctorRanking():
     * [0] = doctor.id (UUID), [1] = doctor.fullName (String), [2] = count (Long)
     */
    public static DoctorProductivityResponse toDoctorProductivity(Object[] row) {
        return new DoctorProductivityResponse(
                (UUID) row[0],
                (String) row[1],
                ((Number) row[2]).longValue()
        );
    }

    public static List<DoctorProductivityResponse> toDoctorProductivityList(List<Object[]> rows) {
        return rows.stream().map(ReportMapper::toDoctorProductivity).toList();
    }

    /**
     * Maps Object[] from topNoShowPatients(start, end):
     * [0] = patient.id (UUID), [1] = patient.fullName (String), [2] = count (Long)
     */
    public static NoShowPatientResponse toNoShowPatient(Object[] row) {
        return new NoShowPatientResponse(
                (UUID) row[0],
                (String) row[1],
                ((Number) row[2]).longValue()
        );
    }

    public static List<NoShowPatientResponse> toNoShowPatientList(List<Object[]> rows) {
        return rows.stream().map(ReportMapper::toNoShowPatient).toList();
    }
}
