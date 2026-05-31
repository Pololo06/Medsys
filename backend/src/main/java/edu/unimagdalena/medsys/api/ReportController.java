package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.response.DoctorProductivityResponse;
import edu.unimagdalena.medsys.api.dto.response.NoShowPatientResponse;
import edu.unimagdalena.medsys.api.dto.response.OfficeOccupancyResponse;
import edu.unimagdalena.medsys.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService service;

    @GetMapping("/office-occupancy")
    public ResponseEntity<List<OfficeOccupancyResponse>> officeOccupancy(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(service.getOfficeOccupancy(from, to));
    }

    @GetMapping("/doctor-productivity")
    public ResponseEntity<List<DoctorProductivityResponse>> doctorProductivity() {
        return ResponseEntity.ok(service.getDoctorProductivity());
    }

    @GetMapping("/no-show-patients")
    public ResponseEntity<List<NoShowPatientResponse>> noShowPatients(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(service.getNoShowPatients(from, to));
    }
}
