package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.request.CreateDoctorScheduleRequest;
import edu.unimagdalena.medsys.api.dto.response.DoctorScheduleResponse;
import edu.unimagdalena.medsys.services.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors/{doctorId}/schedules")
@RequiredArgsConstructor
@Validated
public class DoctorScheduleController {

    private final DoctorScheduleService service;

    @PostMapping
    public ResponseEntity<DoctorScheduleResponse> create(
            @PathVariable UUID doctorId,
            @Valid @RequestBody CreateDoctorScheduleRequest request,
            UriComponentsBuilder uriBuilder) {

        var body = service.create(doctorId, request);

        var location = uriBuilder
                .path("/api/doctors/{doctorId}/schedules/{id}")
                .buildAndExpand(doctorId, body.id())
                .toUri();

        return ResponseEntity.created(location).body(body);
    }

    @GetMapping
    public ResponseEntity<List<DoctorScheduleResponse>> list(
            @PathVariable UUID doctorId) {
        return ResponseEntity.ok(service.findByDoctor(doctorId));
    }
}
