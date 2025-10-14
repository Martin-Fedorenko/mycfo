package registro.cargarDatos.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "registro") // Mantener nombre de tabla para compatibilidad con BD existente
@Getter
@Setter
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tipo de movimiento: INGRESO / EGRESO / DEUDA / ACREENCIA
    @Enumerated(EnumType.STRING)
    private TipoMovimiento tipo;

    private Double montoTotal; //obligatorio

    private LocalDate fechaEmision; //obligatorio

    private String categoria;
    
    // Campos para origen y destino detallados
    private String origenNombre;
    private String origenCuit;
    private String destinoNombre;
    private String destinoCuit;
    
    private String descripcion;  // Detalle libre

    // historial
    private LocalDate fechaCreacion;
    private LocalDate fechaActualizacion;

    // Usuario que creó el movimiento (sub de Cognito)
    private String usuarioId;
    
    // Organización a la que pertenece el movimiento
    private Long organizacionId;

    @Enumerated(EnumType.STRING)
    private TipoMedioPago medioPago;        // efectivo, transferencia, etc.

    @Enumerated(EnumType.STRING)
    private TipoMoneda moneda;           //obligatorio

    @ManyToOne
    @JoinColumn(name = "id_documento")
    private DocumentoComercial documentoComercial;

    // ========================================
    // CAMPOS ESPECÍFICOS DE CADA TIPO
    // (vacíos para tipos que no los usen)
    // ========================================

    // Para Deudas y Acreencias
    private LocalDate fechaVencimiento;
    private Double montoPagado;
    private Integer cantidadCuotas;
    private Integer cuotasPagadas;
    private Double montoCuota;
    private Double tasaInteres;
    private String periodicidad; // Mensual, Trimestral, etc.

    // Estado del movimiento (UNIFICADO)
    @Enumerated(EnumType.STRING)
    private EstadoMovimiento estado;

}

