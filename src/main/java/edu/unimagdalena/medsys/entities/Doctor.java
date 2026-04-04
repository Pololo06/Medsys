package edu.unimagdalena.medsys.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Doctor {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String fullName;
    @Column(nullable = false)
    private boolean active;

    @ManyToOne(optional = false)
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    private Set<DoctorSchedule> doctorSchedules;

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    private Set<Appointment> appointments;

    @Column(name = "created_at",nullable = false) private Instant createdAt;
    @Column(name = "updated_at",nullable = false) private Instant updatedAt;
}

