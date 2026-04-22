package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.api.dto.response.DoctorProductivityResponse;
import edu.unimagdalena.medsys.api.dto.response.NoShowPatientResponse;
import edu.unimagdalena.medsys.api.dto.response.OfficeOccupancyResponse;
import edu.unimagdalena.medsys.domain.repositories.AppointmentRepository;
import edu.unimagdalena.medsys.services.ReportService;
import edu.unimagdalena.medsys.services.mappers.ReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final AppointmentRepository appointmentRepository;

    @Override
    public List<OfficeOccupancyResponse> getOfficeOccupancy(LocalDate from, LocalDate to) {
        var start = from.atStartOfDay();
        var end   = to.atTime(LocalTime.MAX);
        return ReportMapper.toOfficeOccupancyList(
                appointmentRepository.countAppointmentsByOffice(start, end));
    }

    @Override
    public List<DoctorProductivityResponse> getDoctorProductivity() {
        return ReportMapper.toDoctorProductivityList(
                appointmentRepository.doctorRanking());
    }

    @Override
    public List<NoShowPatientResponse> getNoShowPatients(LocalDate from, LocalDate to) {
        var start = from.atStartOfDay();
        var end   = to.atTime(LocalTime.MAX);
        return ReportMapper.toNoShowPatientList(
                appointmentRepository.topNoShowPatients(start, end));
    }
}
