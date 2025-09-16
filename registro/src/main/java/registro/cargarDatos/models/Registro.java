package registro.cargarDatos.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import registro.movimientosexcel.models.MovimientoBancario;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Registro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tipo de registro: INGRESO / EGRESO / DEUDA / ACREENCIA
    @Enumerated(EnumType.STRING)
    private TipoRegistro tipo;

    private Double montoTotal; //obligatorio

    private LocalDate fechaEmision; //obligatorio

    private String categoria;
    private String origen;
    private String destino;
    private String descripcion;  // Detalle libre

    // historial
    private LocalDate fechaCreacion;
    private LocalDate fechaActualizacion;

    private UUID usuario;

    @Enumerated(EnumType.STRING)
    private TipoMedioPago medioPago;        // efectivo, transferencia, etc.

    @Enumerated(EnumType.STRING)
    private TipoMoneda moneda;           //obligatorio

    @ManyToOne
    @JoinColumn(name = "id_documento")
    private DocumentoComercial documentoComercial;

}
