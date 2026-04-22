package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.api.dto.response.DoctorProductivityResponse;
import edu.unimagdalena.medsys.api.dto.response.NoShowPatientResponse;
import edu.unimagdalena.medsys.api.dto.response.OfficeOccupancyResponse;
import edu.unimagdalena.medsys.domain.repositories.AppointmentRepository;
import edu.unimagdalena.medsys.domain.repositories.DoctorRepository;
import edu.unimagdalena.medsys.domain.repositories.OfficeRepository;
import edu.unimagdalena.medsys.domain.repositories.PatientRepository;
import edu.unimagdalena.medsys.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final AppointmentRepository appointmentRepository;
    private final OfficeRepository officeRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Override
    public List<OfficeOccupancyResponse> getOfficeOccupancy(LocalDate from, LocalDate to) {
        var start = from.atStartOfDay();
        var end   = to.atTime(LocalTime.MAX);

        return appointmentRepository.countAppointmentsByOffice(start, end).stream()
                .map(row -> {
                    var officeId = (UUID) row[0];
                    var count    = (Long)  row[1];
                    var office   = officeRepository.findById(officeId).orElseThrow();
                    return new OfficeOccupancyResponse(officeId, office.getName(), count);
                })
                .toList();
    }

    @Override
    public List<DoctorProductivityResponse> getDoctorProductivity() {
        return appointmentRepository.doctorRanking().stream()
                .map(row -> {
                    var doctorId = (UUID) row[0];
                    var count    = (Long) row[1];
                    var doctor   = doctorRepository.findById(doctorId).orElseThrow();
                    return new DoctorProductivityResponse(doctorId, doctor.getFullName(), count);
                })
                .toList();
    }

    @Override
    public List<NoShowPatientResponse> getNoShowPatients(LocalDate from, LocalDate to) {
        var start = from.atStartOfDay();
        var end   = to.atTime(LocalTime.MAX);

        return appointmentRepository.topNoShowPatients(start, end).stream()
                .map(row -> {
                    var patientId = (UUID) row[0];
                    var count     = (Long) row[1];
                    var patient   = patientRepository.findById(patientId).orElseThrow();
                    return new NoShowPatientResponse(patientId, patient.getFullName(), count);
                })
                .toList();
    }
}
