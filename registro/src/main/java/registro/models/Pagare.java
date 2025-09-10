package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity @Getter @Setter
public class Pagare extends DocumentoComercial{

    private LocalDate fechaVencimiento; //obligatorio

    private String beneficiarioNombre; //obligatorio
    private String beneficiarioCuit;

    private String deudorNombre; //obligatorio
    private String deudorCuit;

    private Double interesesMora;
    private String clausula; // “a la orden” o “no a la orden”

    // --- Relación con recibo ---
    @OneToMany(mappedBy = "pagare", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recibo> recibos;

    // --- Factura asociada ---
    @ManyToOne
    @JoinColumn(name = "factura_id")
    private Factura factura;


}
