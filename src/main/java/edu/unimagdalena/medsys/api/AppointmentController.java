package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.request.CancelAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CompleteAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CreateAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.response.AppointmentResponse;
import edu.unimagdalena.medsys.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Validated
public class AppointmentController {

    private final AppointmentService service;

    @PostMapping
    public ResponseEntity<AppointmentResponse> create(
            @Valid @RequestBody CreateAppointmentRequest request,
            UriComponentsBuilder uriBuilder) {
        var body = service.create(request);
        var location = uriBuilder
                .path("/api/appointments/{id}")
                .buildAndExpand(body.id())
                .toUri();
        return ResponseEntity.created(location).body(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> get(
            @PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<AppointmentResponse> confirm(
            @PathVariable UUID id) {
        return ResponseEntity.ok(service.confirm(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancel(
            @PathVariable UUID id,
            @Valid @RequestBody CancelAppointmentRequest request) {
        return ResponseEntity.ok(service.cancel(id, request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<AppointmentResponse> complete(
            @PathVariable UUID id,
            @Valid @RequestBody CompleteAppointmentRequest request) {
        return ResponseEntity.ok(service.complete(id, request));
    }

    @PatchMapping("/{id}/no-show")
    public ResponseEntity<AppointmentResponse> markNoShow(
            @PathVariable UUID id) {
        return ResponseEntity.ok(service.markNoShow(id));
    }
}
