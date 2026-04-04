package edu.unimagdalena.medsys.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "specialties")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Specialty {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "specialty",fetch = FetchType.LAZY)
    private Set<Doctor> doctors;

    @Column(name = "created_at",nullable = false) private Instant createdAt;
    @Column(name = "updated_at",nullable = false) private Instant updatedAt;
}
