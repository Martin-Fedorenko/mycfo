package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity @Getter @Setter
public class Factura extends DocumentoComercial{

    private String tipoFactura;

    // --- Datos del vendedor ---
    private String vendedorNombre;
    private String vendedorCuit;
    private String vendedorCondicionIVA;
    private String vendedorDomicilio;

    // --- Datos del comprador ---
    private String compradorNombre;
    private String compradorCuit;
    private String compradorCondicionIVA;
    private String compradorDomicilio;

    // --- Otros ---
    private String condicionVenta; // contado, tarjeta, etc.
    private String moneda;

    // --- Totales ---
    private Double subtotalGravado;
    private Double subtotalNoGravado;
    private Double totalIVA;
    private Double otrosImpuestos;
    private Double totalGeneral;

    // --- Datos fiscales ---
    private String cae;
    private LocalDate vencimientoCae;

    // --- Relación con ítems ---
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemFactura> items;

    // --- Relación con recibo ---
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recibo> recibos;


}
