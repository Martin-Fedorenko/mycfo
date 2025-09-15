package pronostico.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "presupuesto")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Presupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String nombre;

    @Column(nullable=false)
    private LocalDate desde;

    @Column(nullable=false)
    private LocalDate hasta;
}
