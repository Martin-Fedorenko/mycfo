package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class DocumentoComercial {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idDocumento;

    private String tipoDocumento;

    @Column(nullable = false, unique = true)
    private String numeroDocumento; //obligatorio

    private LocalDate fechaEmision; //obligatorio

    private Double montoTotal; //obligatorio

    @Enumerated(EnumType.STRING)
    private TipoMoneda moneda; //obligatorio

    private String categoria; //obligatorio

    private EstadoDocumentoComercial estadoDocumentoComercial; //obligatorio


    @Enumerated(EnumType.STRING)
    private VersionDocumento versionDocumento; //obligatorio

    // historial
    private LocalDate fechaCreacion; //interno
    private LocalDate fechaActualizacion; //interno
    private UUID usuario; //interno

}