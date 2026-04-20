package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.api.dto.request.CreateOfficeRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateOfficeRequest;
import edu.unimagdalena.medsys.api.dto.response.OfficeResponse;

import java.util.List;
import java.util.UUID;

public interface OfficeService {
    OfficeResponse create(CreateOfficeRequest req);
    List<OfficeResponse> findAll();
    OfficeResponse findById(UUID id);
    OfficeResponse update(UUID id, UpdateOfficeRequest req);
}
