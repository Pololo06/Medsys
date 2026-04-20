package edu.unimagdalena.medsys.domain.entities;

import edu.unimagdalena.medsys.domain.enums.OfficeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "offices")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Office {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String location;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfficeStatus status;

    @OneToMany(mappedBy = "office", fetch = FetchType.LAZY)
    private Set<Appointment> appointments;

    @Column(name = "created_at",nullable = false) private Instant createdAt;
    @Column(name = "updated_at",nullable = false) private Instant updatedAt;
}
