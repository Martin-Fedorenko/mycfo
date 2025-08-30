package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Getter @Setter
public class ItemFactura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idItemFactura;

    private Integer cantidad;
    private String descripcion;
    private Double precioUnitario;
    private Double subtotalSinIva;
    private Double alicuotaIva;
    private Double montoTotalItem;

    @ManyToOne
    @JoinColumn(name = "factura_id")
    private Factura factura;

}
