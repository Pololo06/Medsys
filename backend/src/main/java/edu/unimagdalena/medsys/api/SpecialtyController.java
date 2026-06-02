package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.request.CreateSpecialtyRequest;
import edu.unimagdalena.medsys.api.dto.response.SpecialtyResponse;
import edu.unimagdalena.medsys.services.SpecialtyService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
@Validated
public class SpecialtyController {

    private final SpecialtyService service;

    @PostMapping
    public ResponseEntity<SpecialtyResponse> create(
            @Valid @RequestBody CreateSpecialtyRequest request,
            UriComponentsBuilder uriBuilder) {

        var body = service.create(request);

        var location = uriBuilder
                .path("/api/specialties/{id}")
                .buildAndExpand(body.id())
                .toUri();

        return ResponseEntity.created(location).body(body);
    }

    @GetMapping
    public ResponseEntity<List<SpecialtyResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecialtyResponse> get(
            @PathVariable UUID id) {

        return ResponseEntity.ok(service.findById(id));
    }
}