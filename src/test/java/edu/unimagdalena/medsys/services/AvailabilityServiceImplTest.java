package edu.unimagdalena.medsys.services;

import edu.unimagdalena.medsys.dto.response.AvailabilitySlotResponse;
import edu.unimagdalena.medsys.entities.*;
import edu.unimagdalena.medsys.enums.AppointmentStatus;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.repositories.AppointmentRepository;
import edu.unimagdalena.medsys.repositories.DoctorRepository;
import edu.unimagdalena.medsys.repositories.DoctorScheduleRepository;
import edu.unimagdalena.medsys.services.impl.AvailabilityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceImplTest {

    @Mock DoctorRepository doctorRepository;
    @Mock DoctorScheduleRepository doctorScheduleRepository;
    @Mock AppointmentRepository appointmentRepository;

    @InjectMocks
    AvailabilityServiceImpl availabilityService;

    UUID doctorId;
    Doctor doctor;
    LocalDate monday;

    @BeforeEach
    void setUp() {
        doctorId = UUID.randomUUID();

        var specialty = Specialty.builder()
                .id(UUID.randomUUID()).name("General")
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        doctor = Doctor.builder()
                .id(doctorId).fullName("Dr. Grey").active(true).specialty(specialty)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        monday = LocalDate.now().with(java.time.temporal.TemporalAdjusters.next(DayOfWeek.MONDAY));
    }

    private DoctorSchedule schedule(LocalTime start, LocalTime end) {
        return DoctorSchedule.builder()
                .id(UUID.randomUUID()).doctor(doctor).day(DayOfWeek.MONDAY)
                .startTime(start).endTime(end)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();
    }

    @Test
    @DisplayName("Devuelve todos los slots cuando no hay citas agendadas")
    void getAvailableSlots_noBookings_returnsAllSlots() {
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule(LocalTime.of(8, 0), LocalTime.of(10, 0))));
        when(appointmentRepository.findActiveAppointmentsByDoctorAndDay(any(), any(), any()))
                .thenReturn(List.of());

        var slots = availabilityService.getAvailableSlots(doctorId, monday, 30);


        assertThat(slots).hasSize(4);
        assertThat(slots.get(0)).isEqualTo(new AvailabilitySlotResponse(monday.atTime(8, 0), monday.atTime(8, 30)));
        assertThat(slots.get(3)).isEqualTo(new AvailabilitySlotResponse(monday.atTime(9, 30), monday.atTime(10, 0)));
    }

    @Test
    @DisplayName("Excluye los slots que ya están ocupados por citas activas")
    void getAvailableSlots_withBooking_excludesOccupiedSlot() {
        var bookedAppt = Appointment.builder()
                .id(UUID.randomUUID())
                .startTime(monday.atTime(8, 0)).endTime(monday.atTime(8, 30))
                .status(AppointmentStatus.CONFIRMED)
                .createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule(LocalTime.of(8, 0), LocalTime.of(10, 0))));
        when(appointmentRepository.findActiveAppointmentsByDoctorAndDay(any(), any(), any()))
                .thenReturn(List.of(bookedAppt));

        var slots = availabilityService.getAvailableSlots(doctorId, monday, 30);

        // 08:00 ocupado → quedan 08:30, 09:00, 09:30
        assertThat(slots).hasSize(3);
        assertThat(slots).doesNotContain(
                new AvailabilitySlotResponse(monday.atTime(8, 0), monday.atTime(8, 30)));
    }

    @Test
    @DisplayName("Devuelve lista vacía si el doctor no tiene horario ese día")
    void getAvailableSlots_noSchedule_returnsEmpty() {
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of());

        var slots = availabilityService.getAvailableSlots(doctorId, monday, 30);

        assertThat(slots).isEmpty();
    }

    @Test
    @DisplayName("Solo devuelve bloques completos — sin medios slots al final del horario")
    void getAvailableSlots_partialWindow_onlyCompleteSlots() {
        // Horario de 50 min, slot de 30 → solo 1 slot completo (08:00–08:30), no el parcial
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule(LocalTime.of(8, 0), LocalTime.of(8, 50))));
        when(appointmentRepository.findActiveAppointmentsByDoctorAndDay(any(), any(), any()))
                .thenReturn(List.of());

        var slots = availabilityService.getAvailableSlots(doctorId, monday, 30);

        assertThat(slots).hasSize(1);
        assertThat(slots.getFirst()).isEqualTo(
                new AvailabilitySlotResponse(monday.atTime(8, 0), monday.atTime(8, 30)));
    }

    @Test
    @DisplayName("Lanza ResourceNotFoundException si el doctor no existe")
    void getAvailableSlots_doctorNotFound_throwsResourceNotFound() {
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> availabilityService.getAvailableSlots(doctorId, monday, 30))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Horario con dos franjas independientes — ambas generan slots")
    void getAvailableSlots_twoScheduleBlocks_slotsFromBoth() {
        var morning = schedule(LocalTime.of(8, 0), LocalTime.of(9, 0));
        var afternoon = schedule(LocalTime.of(14, 0), LocalTime.of(15, 0));

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorScheduleRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(morning, afternoon));
        when(appointmentRepository.findActiveAppointmentsByDoctorAndDay(any(), any(), any()))
                .thenReturn(List.of());

        var slots = availabilityService.getAvailableSlots(doctorId, monday, 30);

        assertThat(slots).hasSize(4);
    }
}
