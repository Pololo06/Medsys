package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.dto.request.CreateDoctorScheduleRequest;
import edu.unimagdalena.medsys.dto.response.DoctorScheduleResponse;
import edu.unimagdalena.medsys.entities.Doctor;
import edu.unimagdalena.medsys.entities.DoctorSchedule;
import edu.unimagdalena.medsys.entities.Specialty;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.repositories.DoctorRepository;
import edu.unimagdalena.medsys.repositories.DoctorScheduleRepository;
import edu.unimagdalena.medsys.services.impl.DoctorScheduleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleServiceImplTest {

    @Mock DoctorScheduleRepository doctorScheduleRepository;
    @Mock DoctorRepository doctorRepository;

    @InjectMocks
    DoctorScheduleServiceImpl doctorScheduleService;

    UUID doctorId;
    Doctor doctor;

    @BeforeEach
    void setUp() {
        doctorId = UUID.randomUUID();

        var specialty = Specialty.builder()
                .id(UUID.randomUUID()).name("General")
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        doctor = Doctor.builder()
                .id(doctorId).fullName("Dr. Grey").active(true).specialty(specialty)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();
    }

    private DoctorSchedule savedSchedule(DayOfWeek day, LocalTime start, LocalTime end) {
        return DoctorSchedule.builder()
                .id(UUID.randomUUID()).doctor(doctor).day(day)
                .startTime(start).endTime(end)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();
    }

    @Test
    @DisplayName("Crear horario — asigna el doctor y persiste correctamente")
    void create_happyPath_assignsDoctorAndPersists() {
        var req = new CreateDoctorScheduleRequest(DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(12, 0));

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorScheduleRepository.save(any())).thenAnswer(inv ->
                savedSchedule(DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(12, 0)));

        var result = doctorScheduleService.create(doctorId, req);

        assertThat(result.id()).isNotNull();
        assertThat(result.doctorId()).isEqualTo(doctorId);
        assertThat(result.day()).isEqualTo(DayOfWeek.MONDAY);
        assertThat(result.startTime()).isEqualTo(LocalTime.of(8, 0));
        assertThat(result.endTime()).isEqualTo(LocalTime.of(12, 0));
        verify(doctorScheduleRepository).save(any());
    }

    @Test
    @DisplayName("Crear horario lanza ResourceNotFoundException si el doctor no existe")
    void create_doctorNotFound_throwsResourceNotFound() {
        var req = new CreateDoctorScheduleRequest(DayOfWeek.TUESDAY, LocalTime.of(9, 0), LocalTime.of(13, 0));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> doctorScheduleService.create(doctorId, req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(doctorId.toString());
    }

    @Test
    @DisplayName("findByDoctorAndDay devuelve horarios del día solicitado")
    void findByDoctorAndDay_returnsSchedulesForThatDay() {
        var mondaySchedule = savedSchedule(DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(12, 0));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(mondaySchedule));

        var result = doctorScheduleService.findByDoctorAndDay(doctorId, DayOfWeek.MONDAY);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().day()).isEqualTo(DayOfWeek.MONDAY);
        assertThat(result.getFirst().doctorId()).isEqualTo(doctorId);
    }

    @Test
    @DisplayName("findByDoctorAndDay devuelve lista vacía si no hay horario ese día")
    void findByDoctorAndDay_noSchedule_returnsEmpty() {
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.SUNDAY))
                .thenReturn(List.of());

        var result = doctorScheduleService.findByDoctorAndDay(doctorId, DayOfWeek.SUNDAY);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findByDoctor devuelve todos los horarios del doctor para distintos días")
    void findByDoctor_returnsAllSchedules() {
        var monday = savedSchedule(DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(12, 0));
        var wednesday = savedSchedule(DayOfWeek.WEDNESDAY, LocalTime.of(14, 0), LocalTime.of(18, 0));

        when(doctorScheduleRepository.findByDoctorId(doctorId))
                .thenReturn(List.of(monday, wednesday));

        var result = doctorScheduleService.findByDoctor(doctorId);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(DoctorScheduleResponse::day)
                .containsExactlyInAnyOrder(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY);
    }

    @Test
    @DisplayName("findByDoctor devuelve lista vacía si el doctor no tiene horarios")
    void findByDoctor_noSchedules_returnsEmpty() {

        when(doctorScheduleRepository.findByDoctorId(doctorId))
                .thenReturn(List.of());

        var result = doctorScheduleService.findByDoctor(doctorId);

        assertThat(result).isEmpty();

        verify(doctorScheduleRepository).findByDoctorId(doctorId);
    }
}
