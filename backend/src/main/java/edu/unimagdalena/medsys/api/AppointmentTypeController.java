package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.request.CreateAppointmentTypeRequest;
import edu.unimagdalena.medsys.api.dto.response.AppointmentTypeResponse;
import edu.unimagdalena.medsys.services.AppointmentTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/appointment-types")
@RequiredArgsConstructor
@Validated
public class AppointmentTypeController {

    private final AppointmentTypeService service;

    @PostMapping
    public ResponseEntity<AppointmentTypeResponse> create(
            @Valid @RequestBody CreateAppointmentTypeRequest request,
            UriComponentsBuilder uriBuilder) {

        var body = service.create(request);

        var location = uriBuilder
                .path("/api/appointment-types/{id}")
                .buildAndExpand(body.id())
                .toUri();

        return ResponseEntity.created(location).body(body);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentTypeResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }
}
