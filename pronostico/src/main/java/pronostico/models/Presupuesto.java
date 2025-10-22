package pronostico.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "presupuesto",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_presupuesto_owner_nombre_periodo",
                columnNames = {"owner_sub", "nombre", "desde", "hasta"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Presupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_sub", nullable = false, length = 64)
    private String ownerSub;

    @Column(nullable=false)
    private String nombre;

    @Column(nullable=false, length=10)
    private String desde;

    @Column(nullable=false, length=10)
    private String hasta;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 64)
    private String deletedBy;
}
