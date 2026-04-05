package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.dto.request.CreateAppointmentTypeRequest;
import edu.unimagdalena.medsys.dto.response.AppointmentTypeResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.mappers.AppointmentTypeMapper;
import edu.unimagdalena.medsys.repositories.AppointmentTypeRepository;
import edu.unimagdalena.medsys.services.AppointmentTypeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AppointmentTypeServiceImpl implements AppointmentTypeService {

    private final AppointmentTypeRepository appointmentTypeRepository;

    public AppointmentTypeServiceImpl(AppointmentTypeRepository appointmentTypeRepository) {
        this.appointmentTypeRepository = appointmentTypeRepository;
    }

    @Override
    public AppointmentTypeResponse create(CreateAppointmentTypeRequest req) {
        var appointmentType = AppointmentTypeMapper.toEntity(req);
        appointmentType.setCreatedAt(Instant.now());
        appointmentType.setUpdatedAt(Instant.now());
        return AppointmentTypeMapper.toResponse(appointmentTypeRepository.save(appointmentType));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentTypeResponse> findAll() {
        return appointmentTypeRepository.findAll().stream()
                .map(AppointmentTypeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentTypeResponse findById(UUID id) {
        return appointmentTypeRepository.findById(id)
                .map(AppointmentTypeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentType not found with id: " + id));
    }
}
