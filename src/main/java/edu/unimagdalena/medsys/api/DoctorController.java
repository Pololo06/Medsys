package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.request.CreateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.response.DoctorResponse;
import edu.unimagdalena.medsys.services.DoctorService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Validated
public class DoctorController {

    private final DoctorService service;

    @PostMapping
    public ResponseEntity<DoctorResponse> create(
            @Valid @RequestBody CreateDoctorRequest request,
            UriComponentsBuilder uriBuilder) {

        var body = service.create(request);

        var location = uriBuilder
                .path("/api/doctors/{id}")
                .buildAndExpand(body.id())
                .toUri();

        return ResponseEntity.created(location).body(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> get(
            @PathVariable UUID id) {

        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDoctorRequest request) {

        return ResponseEntity.ok(service.update(id, request));
    }

    @GetMapping("/specialty/{specialtyId}/active")
    public ResponseEntity<List<DoctorResponse>> findActiveBySpecialty(
            @PathVariable UUID specialtyId) {

        return ResponseEntity.ok(service.findActiveBySpecialty(specialtyId));
    }
}
