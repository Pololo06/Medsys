package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.api.dto.request.CreateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.response.DoctorResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.mappers.DoctorMapper;
import edu.unimagdalena.medsys.domain.repositories.DoctorRepository;
import edu.unimagdalena.medsys.domain.repositories.SpecialtyRepository;
import edu.unimagdalena.medsys.services.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;

    @Override
    public DoctorResponse create(CreateDoctorRequest req) {
        var specialty = specialtyRepository.findById(req.specialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialty not found with id: " + req.specialtyId()));
        var doctor = DoctorMapper.toEntity(req);
        doctor.setSpecialty(specialty);
        doctor.setActive(true);
        doctor.setCreatedAt(Instant.now());
        doctor.setUpdatedAt(Instant.now());
        return DoctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse findById(UUID id) {
        return doctorRepository.findById(id)
                .map(DoctorMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> findAll() {
        return doctorRepository.findAll().stream()
                .map(DoctorMapper::toResponse)
                .toList();
    }

    @Override
    public DoctorResponse update(UUID id, UpdateDoctorRequest req) {
        var existing = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        existing.setFullName(req.fullName());
        existing.setActive(req.active());
        existing.setUpdatedAt(Instant.now());
        return DoctorMapper.toResponse(doctorRepository.save(existing));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> findActiveBySpecialty(UUID specialtyId) {
        return doctorRepository.findBySpecialtyIdAndActiveTrue(specialtyId).stream()
                .map(DoctorMapper::toResponse)
                .toList();
    }
}
