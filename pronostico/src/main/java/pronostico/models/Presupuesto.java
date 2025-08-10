package pronostico.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
public class Presupuesto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private LocalDate desde;
    private LocalDate hasta;

    // Para simplificar: guardamos en JSON o crear entidad Categoria si querés normalizar
    @Lob
    private String categoriasJson;
}
