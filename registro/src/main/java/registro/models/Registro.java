package registro.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity @Getter @Setter
public class Registro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;

    private Double monto;

    private LocalDateTime fecha;

    @ElementCollection
    private List<String> categorias;

    private String tercero;

    private String comentario;

}
