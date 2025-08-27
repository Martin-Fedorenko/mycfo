package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity @Getter @Setter
public class Pagare extends DocumentoComercial{



    private Double monto;

    private LocalDate fechaVencimiento;

    private String beneficiarioNombre;
    private String beneficiarioCuit;

    private String deudorNombre;
    private String deudorCuit;

    private String motivo;
    private Double interesesMora;
    private String clausula; // “a la orden” o “no a la orden”

    // --- Relación con recibo ---
    @OneToMany(mappedBy = "pagare", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recibo> recibos;


}
