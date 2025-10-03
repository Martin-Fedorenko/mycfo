package pronostico.models;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable=false, length=10)
    private String desde;

    @Column(nullable=false, length=10)
    private String hasta;
}

