package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.request.CreateOfficeRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateOfficeRequest;
import edu.unimagdalena.medsys.api.dto.response.OfficeResponse;
import edu.unimagdalena.medsys.services.OfficeService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/offices")
@RequiredArgsConstructor
@Validated
public class OfficeController {

    private final OfficeService service;

    @PostMapping
    public ResponseEntity<OfficeResponse> create(
            @Valid @RequestBody CreateOfficeRequest request,
            UriComponentsBuilder uriBuilder) {

        var body = service.create(request);

        var location = uriBuilder
                .path("/api/offices/{id}")
                .buildAndExpand(body.id())
                .toUri();

        return ResponseEntity.created(location).body(body);
    }

    @GetMapping
    public ResponseEntity<List<OfficeResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficeResponse> get(
            @PathVariable UUID id) {

        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfficeResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOfficeRequest request) {

        return ResponseEntity.ok(service.update(id, request));
    }
}
