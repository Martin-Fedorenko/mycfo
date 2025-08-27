package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
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

    private Double monto;

    private LocalDate fechaEmision;
    private LocalDate fechaCreacion;
    private LocalDate fechaActualizacion;

    private UUID usuario;

    @ElementCollection
    @CollectionTable(name = "registro_categorias", joinColumns = @JoinColumn(name = "registro_id"))
    @Column(name = "categoria")
    private List<String> categorias;

    private String tercero;      // Cliente/proveedor
    private String descripcion;  // Detalle libre

    @Enumerated(EnumType.STRING)
    private TipoMedioPago medioPago;        // efectivo, transferencia, etc.

    @Enumerated(EnumType.STRING)
    private TipoMoneda moneda;           // ARS, USD, EUR...

    private String documentoComercial;
}
