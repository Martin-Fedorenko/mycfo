package consolidacion.models;

import jakarta.persistence.*;
import lombok.Setter;

import java.time.LocalDate;

@Entity
public class MovimientoBancario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    private String idReferencia;
    // Setters
    @Setter
    private LocalDate fecha;
    @Setter
    private String descripcion;
    @Setter
    private Double monto;
    @Setter
    private String medioPago;

    // Getters
    public Long getId() {
        return id;
    }

    public String getIdReferencia() {
        return idReferencia;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public Double getMonto() {
        return monto;
    }

    public String getMedioPago() {
        return medioPago;
    }
}

