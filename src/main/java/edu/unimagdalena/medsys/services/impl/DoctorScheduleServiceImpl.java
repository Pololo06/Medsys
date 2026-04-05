package edu.unimagdalena.medsys.services.impl;

import edu.unimagdalena.medsys.dto.request.CreateDoctorScheduleRequest;
import edu.unimagdalena.medsys.dto.response.DoctorScheduleResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.mappers.DoctorScheduleMapper;
import edu.unimagdalena.medsys.repositories.DoctorRepository;
import edu.unimagdalena.medsys.repositories.DoctorScheduleRepository;
import edu.unimagdalena.medsys.services.DoctorScheduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final DoctorRepository doctorRepository;

    public DoctorScheduleServiceImpl(DoctorScheduleRepository doctorScheduleRepository,
                                     DoctorRepository doctorRepository) {
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    public DoctorScheduleResponse create(UUID doctorId, CreateDoctorScheduleRequest req) {
        var doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        var schedule = DoctorScheduleMapper.toEntity(req);
        schedule.setDoctor(doctor);
        schedule.setCreatedAt(Instant.now());
        schedule.setUpdatedAt(Instant.now());
        return DoctorScheduleMapper.toResponse(doctorScheduleRepository.save(schedule));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorScheduleResponse> findByDoctor(UUID doctorId) {
        return doctorScheduleRepository.findByDoctorId(doctorId).stream()
                .map(DoctorScheduleMapper::toResponse)
                .toList();
    }
    @Override
    @Transactional(readOnly = true)
    public List<DoctorScheduleResponse> findByDoctorAndDay(UUID doctorId, DayOfWeek day) {
        return doctorScheduleRepository.findByDoctorIdAndDay(doctorId, day).stream()
                .map(DoctorScheduleMapper::toResponse)
                .toList();
    }
}
