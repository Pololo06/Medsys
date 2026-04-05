package edu.unimagdalena.medsys.repositories.services.impl;

import edu.unimagdalena.medsys.dto.request.CreateOfficeRequest;
import edu.unimagdalena.medsys.dto.request.UpdateOfficeRequest;
import edu.unimagdalena.medsys.dto.response.OfficeResponse;
import edu.unimagdalena.medsys.enums.OfficeStatus;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.mappers.OfficeMapper;
import edu.unimagdalena.medsys.repositories.OfficeRepository;
import edu.unimagdalena.medsys.services.OfficeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OfficeServiceImpl implements OfficeService {

    private final OfficeRepository officeRepository;

    public OfficeServiceImpl(OfficeRepository officeRepository) {
        this.officeRepository = officeRepository;
    }

    @Override
    public OfficeResponse create(CreateOfficeRequest req) {
        var office = OfficeMapper.toEntity(req);
        office.setStatus(OfficeStatus.AVAILABLE);
        office.setCreatedAt(Instant.now());
        office.setUpdatedAt(Instant.now());
        return OfficeMapper.toResponse(officeRepository.save(office));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfficeResponse> findAll() {
        return officeRepository.findAll().stream()
                .map(OfficeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OfficeResponse findById(UUID id) {
        return officeRepository.findById(id)
                .map(OfficeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with id: " + id));
    }

    @Override
    public OfficeResponse update(UUID id, UpdateOfficeRequest req) {
        var existing = officeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with id: " + id));
        existing.setName(req.name());
        existing.setLocation(req.location());
        existing.setStatus(req.status());
        existing.setUpdatedAt(Instant.now());
        return OfficeMapper.toResponse(officeRepository.save(existing));
    }
}
