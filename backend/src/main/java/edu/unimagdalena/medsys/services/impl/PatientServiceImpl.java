package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.api.dto.request.CreatePatientRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdatePatientRequest;
import edu.unimagdalena.medsys.api.dto.response.PatientResponse;
import edu.unimagdalena.medsys.domain.enums.PatientStatus;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.mappers.PatientMapper;
import edu.unimagdalena.medsys.domain.repositories.PatientRepository;
import edu.unimagdalena.medsys.services.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    public PatientResponse create(CreatePatientRequest req) {
        var patient = PatientMapper.toEntity(req);
        patient.setStatus(PatientStatus.ACTIVE);
        patient.setCreatedAt(Instant.now());
        patient.setUpdatedAt(Instant.now());
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse findById(UUID id) {
        return patientRepository.findById(id)
                .map(PatientMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponse> findAll() {
        return patientRepository.findAll().stream()
                .map(PatientMapper::toResponse)
                .toList();
    }

    @Override
    public PatientResponse update(UUID id, UpdatePatientRequest req) {
        var existing = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        existing.setFullName(req.fullName());
        existing.setEmail(req.email());
        existing.setPhone(req.phone());
        existing.setStatus(req.status());
        existing.setUpdatedAt(Instant.now());
        return PatientMapper.toResponse(patientRepository.save(existing));
    }
}
