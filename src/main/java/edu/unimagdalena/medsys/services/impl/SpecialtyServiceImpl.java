package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.dto.request.CreateSpecialtyRequest;
import edu.unimagdalena.medsys.dto.response.SpecialtyResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.mappers.SpecialtyMapper;
import edu.unimagdalena.medsys.repositories.SpecialtyRepository;
import edu.unimagdalena.medsys.services.SpecialtyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;

    public SpecialtyServiceImpl(SpecialtyRepository specialtyRepository) {
        this.specialtyRepository = specialtyRepository;
    }

    @Override
    public SpecialtyResponse create(CreateSpecialtyRequest req) {
        var specialty = SpecialtyMapper.toEntity(req);
        specialty.setCreatedAt(Instant.now());
        specialty.setUpdatedAt(Instant.now());
        return SpecialtyMapper.toResponse(specialtyRepository.save(specialty));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialtyResponse> findAll() {
        return specialtyRepository.findAll().stream()
                .map(SpecialtyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialtyResponse findById(UUID id) {
        return specialtyRepository.findById(id)
                .map(SpecialtyMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty not found with id: " + id));
    }
}
