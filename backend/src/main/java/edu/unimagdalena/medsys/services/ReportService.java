package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.api.dto.response.DoctorProductivityResponse;
import edu.unimagdalena.medsys.api.dto.response.NoShowPatientResponse;
import edu.unimagdalena.medsys.api.dto.response.OfficeOccupancyResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    List<OfficeOccupancyResponse> getOfficeOccupancy(LocalDate from, LocalDate to);
    List<DoctorProductivityResponse> getDoctorProductivity();
    List<NoShowPatientResponse> getNoShowPatients(LocalDate from, LocalDate to);
}
