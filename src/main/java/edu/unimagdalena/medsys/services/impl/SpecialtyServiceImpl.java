package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.api.dto.request.CreateSpecialtyRequest;
import edu.unimagdalena.medsys.api.dto.response.SpecialtyResponse;
import edu.unimagdalena.medsys.exceptions.ConflictException;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.mappers.SpecialtyMapper;
import edu.unimagdalena.medsys.domain.repositories.SpecialtyRepository;
import edu.unimagdalena.medsys.services.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;

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

    @Override
    public void delete(UUID id) {
        if (!specialtyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Specialty not found with id: " + id);
        }
        try {
            specialtyRepository.deleteById(id);
            specialtyRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("No se puede eliminar la especialidad porque está asignada a uno o más médicos.");
        }
    }
}
