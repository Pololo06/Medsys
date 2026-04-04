package edu.unimagdalena.medsys.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "appointment_types")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AppointmentType {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private int durationMinutes;

    @OneToMany(mappedBy = "appointmentType", fetch = FetchType.LAZY)
    private Set<Appointment> appointments;

    @Column(name = "created_at",nullable = false) private Instant createdAt;
    @Column(name = "updated_at",nullable = false) private Instant updatedAt;
}
