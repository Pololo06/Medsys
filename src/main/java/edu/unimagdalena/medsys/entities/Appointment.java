package edu.unimagdalena.medsys.entities;

import edu.unimagdalena.medsys.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private LocalDateTime startTime;
    @Column(nullable = false)
    private LocalDateTime endTime;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "office_id")
    private Office office;

    @ManyToOne(optional = false)
    @JoinColumn(name = "appointment_type_id")
    private AppointmentType appointmentType;

    @Column(name = "created_at",nullable = false) private Instant createdAt;
    @Column(name = "updated_at",nullable = false) private Instant updatedAt;
}
