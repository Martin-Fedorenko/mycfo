package pronostico.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
    name = "presupuesto_linea",
    indexes = {
        @Index(name="idx_linea_presupuesto", columnList = "presupuesto_id"),
        @Index(name="idx_linea_presupuesto_mes", columnList = "presupuesto_id, mes")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PresupuestoLinea {

    public enum Tipo { INGRESO, EGRESO }
    public enum SourceType { MANUAL, AUTOMATICO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch = FetchType.LAZY)
    @JoinColumn(name = "presupuesto_id", nullable = false)
    private Presupuesto presupuesto;

    /** Primer día del mes (YYYY-MM-01) */
    @Column(nullable=false)
    private LocalDate mes;

    @Column(nullable=false)
    private String categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=10)
    private Tipo tipo;

    @Builder.Default
    @Column(name="monto_estimado", precision=19, scale=2)
    private BigDecimal montoEstimado = BigDecimal.ZERO;

    @Column(name="monto_real", precision=19, scale=2)
    private BigDecimal montoReal;

    @Enumerated(EnumType.STRING)
    @Column(name="source_type", nullable=false, length=15)
    @Builder.Default
    private SourceType sourceType = SourceType.MANUAL;
}
