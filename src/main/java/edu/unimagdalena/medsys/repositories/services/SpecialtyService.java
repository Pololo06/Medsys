package edu.unimagdalena.medsys.repositories.services;

import edu.unimagdalena.medsys.dto.request.CreateSpecialtyRequest;
import edu.unimagdalena.medsys.dto.response.SpecialtyResponse;

import java.util.List;
import java.util.UUID;

public interface SpecialtyService {
    SpecialtyResponse create(CreateSpecialtyRequest req);
    List<SpecialtyResponse> findAll();
    SpecialtyResponse findById(UUID id);
}
