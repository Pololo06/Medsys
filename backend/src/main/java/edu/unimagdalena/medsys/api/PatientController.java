package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.request.CreatePatientRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdatePatientRequest;
import edu.unimagdalena.medsys.api.dto.response.PatientResponse;
import edu.unimagdalena.medsys.services.PatientService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Validated
public class PatientController {

    private final PatientService service;

    @PostMapping
    public ResponseEntity<PatientResponse> create(
            @Valid @RequestBody CreatePatientRequest request,
            UriComponentsBuilder uriBuilder) {

        var body = service.create(request);

        var location = uriBuilder
                .path("/api/patients/{id}")
                .buildAndExpand(body.id())
                .toUri();

        return ResponseEntity.created(location).body(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> get(
            @PathVariable UUID id) {

        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<PatientResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePatientRequest request) {

        return ResponseEntity.ok(service.update(id, request));
    }
}
