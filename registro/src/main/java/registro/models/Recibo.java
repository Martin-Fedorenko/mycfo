package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity @Getter @Setter
public class Recibo extends DocumentoComercial{

    // --- Datos emisor ---
    private String emisorNombre;
    private String emisorDomicilio;
    private String emisorCuit;
    private String emisorIngresosBrutos;
    private String emisorCondicionIVA;

    // --- Datos comprador/pagador ---
    private String compradorNombre;
    private String compradorCuit;

    // --- Detalle de pago ---
    private String tipoPago;
    private Double montoTotal;
    private String motivoPago;
    private String condicionPago;
    private Double saldoPendiente;

    // --- Datos fiscales ---
    private String cae;
    private LocalDate vencimientoCae;

    // --- Factura asociada ---
    @ManyToOne
    @JoinColumn(name = "factura_id")
    private Factura factura;

    // --- Pagare asociado ---
    @ManyToOne
    @JoinColumn(name = "pagare_id")
    private Pagare pagare;

}

