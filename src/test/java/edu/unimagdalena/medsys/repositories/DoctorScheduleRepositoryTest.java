package edu.unimagdalena.medsys.repositories;

import edu.unimagdalena.medsys.entities.Doctor;
import edu.unimagdalena.medsys.entities.DoctorSchedule;
import edu.unimagdalena.medsys.entities.Specialty;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class DoctorScheduleRepositoryTest extends AbstractRepositoryIT {

    @Autowired
    DoctorScheduleRepository doctorScheduleRepository;
    @Autowired
    DoctorRepository doctorRepository;
    @Autowired
    SpecialtyRepository specialtyRepository;

    private Doctor createDoctor() {
        var specialty = specialtyRepository.save(
                Specialty.builder()
                        .name("General")
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        return doctorRepository.save(
                Doctor.builder()
                        .fullName("Dr. Grey")
                        .active(true)
                        .specialty(specialty)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );
    }

    @Test
    @DisplayName("Create doctor schedule")
    void shouldCreateDoctorSchedule() {
        var doctor = createDoctor();

        var schedule = doctorScheduleRepository.save(
                DoctorSchedule.builder()
                        .doctor(doctor)
                        .day(DayOfWeek.MONDAY)
                        .startTime(LocalTime.of(8, 0))
                        .endTime(LocalTime.of(12, 0))
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        assertThat(schedule.getId()).isNotNull();
        assertThat(schedule.getDay()).isEqualTo(DayOfWeek.MONDAY);
    }

    @Test
    @DisplayName("Find schedules by doctor and day")
    void shouldFindByDoctorAndDay() {
        var doctor = createDoctor();

        doctorScheduleRepository.save(
                DoctorSchedule.builder()
                        .doctor(doctor)
                        .day(DayOfWeek.TUESDAY)
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(13, 0))
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        doctorScheduleRepository.save(
                DoctorSchedule.builder()
                        .doctor(doctor)
                        .day(DayOfWeek.WEDNESDAY)
                        .startTime(LocalTime.of(10, 0))
                        .endTime(LocalTime.of(14, 0))
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        var result = doctorScheduleRepository.findByDoctorIdAndDay(
                doctor.getId(),
                DayOfWeek.TUESDAY
        );

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDay()).isEqualTo(DayOfWeek.TUESDAY);
    }

    @Test
    @DisplayName("Update doctor schedule")
    void shouldUpdateDoctorSchedule() {
        var doctor = createDoctor();

        var schedule = doctorScheduleRepository.save(
                DoctorSchedule.builder()
                        .doctor(doctor)
                        .day(DayOfWeek.THURSDAY)
                        .startTime(LocalTime.of(8, 0))
                        .endTime(LocalTime.of(12, 0))
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        schedule.setEndTime(LocalTime.of(15, 0));
        doctorScheduleRepository.save(schedule);

        var updated = doctorScheduleRepository.findById(schedule.getId());

        assertThat(updated).isPresent();
        assertThat(updated.get().getEndTime()).isEqualTo(LocalTime.of(15, 0));
    }

    @Test
    @DisplayName("Delete doctor schedule")
    void shouldDeleteDoctorSchedule() {
        var doctor = createDoctor();

        var schedule = doctorScheduleRepository.save(
                DoctorSchedule.builder()
                        .doctor(doctor)
                        .day(DayOfWeek.FRIDAY)
                        .startTime(LocalTime.of(7, 0))
                        .endTime(LocalTime.of(11, 0))
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        doctorScheduleRepository.deleteById(schedule.getId());

        var deleted = doctorScheduleRepository.findById(schedule.getId());

        assertThat(deleted).isNotPresent();
    }
}