package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class DocumentoComercial {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idDocumento;

    @Column(nullable = false, unique = true)
    private String numeroDocumento;
    private LocalDate fechaEmision;

    // historial
    private LocalDate fechaCreacion;
    private LocalDate fechaActualizacion;
    private UUID usuario;

    // Datos fiscales comunes
    private String cae;
    private LocalDate vencimientoCae;
}