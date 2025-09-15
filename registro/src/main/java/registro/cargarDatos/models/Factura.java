package registro.cargarDatos.models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity @Getter @Setter
public class Factura extends DocumentoComercial {

    private String tipoFactura; //obligatorio

    // --- Datos del vendedor ---
    private String vendedorNombre; //obligatorio
    private String vendedorCuit;
    private String vendedorCondicionIVA;
    private String vendedorDomicilio;

    // --- Datos del comprador ---
    private String compradorNombre; //obligatorio
    private String compradorCuit;
    private String compradorCondicionIVA;
    private String compradorDomicilio;

    // --- Datos fiscales ---
    private String cae;
    private LocalDate vencimientoCae;

    // --- Relación con ítems ---
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemFactura> items;

    // --- Relación con recibo ---
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recibo> recibos;

    // --- Relación con pagaré ---
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recibo> pagares;


}
