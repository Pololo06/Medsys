package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.api.dto.request.CreateSpecialtyRequest;
import edu.unimagdalena.medsys.api.dto.response.SpecialtyResponse;

import java.util.List;
import java.util.UUID;

public interface SpecialtyService {
    SpecialtyResponse create(CreateSpecialtyRequest req);
    List<SpecialtyResponse> findAll();
    SpecialtyResponse findById(UUID id);
    void delete(UUID id);
}
