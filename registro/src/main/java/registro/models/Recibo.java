package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity @Getter @Setter
public class Recibo extends DocumentoComercial{

    // --- Datos emisor ---
    private String emisorNombre; //obligatorio
    private String emisorDomicilio;
    private String emisorCuit;
    private String emisorIngresosBrutos;
    private String emisorCondicionIVA;

    // --- Datos comprador/pagador ---
    private String compradorNombre; //obligatorio
    private String compradorCuit;
    private String CompradorDomicilio;

    private String condicionPago;
    private Double saldoPendiente;

    @Enumerated(EnumType.STRING)
    private TipoMedioPago medioPago;

    // --- Factura asociada ---
    @ManyToOne
    @JoinColumn(name = "factura_id")
    private Factura factura;

    // --- Pagare asociado ---
    @ManyToOne
    @JoinColumn(name = "pagare_id")
    private Pagare pagare;

}

