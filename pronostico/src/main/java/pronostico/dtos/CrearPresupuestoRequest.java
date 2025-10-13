package pronostico.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CrearPresupuestoRequest {

  @JsonProperty("nombre")
  private String nombre;

  @JsonProperty("desde")
  private String desde; // formato YYYY-MM

  @JsonProperty("hasta")
  private String hasta; // formato YYYY-MM

  @JsonProperty("autogenerarCeros")
  private boolean autogenerarCeros;

  @JsonProperty("plantilla")
  private List<PlantillaLinea> plantilla;

  @Getter @Setter
  @NoArgsConstructor @AllArgsConstructor
  @Builder
  public static class PlantillaLinea {
    @JsonProperty("categoria")
    private String categoria;

    /** Debe llegar "INGRESO" o "EGRESO" */
    @JsonProperty("tipo")
    private String tipo;

    @JsonProperty("montoEstimado")
    private BigDecimal montoEstimado;

    @JsonProperty("montoReal")
    private BigDecimal montoReal;
  }
}
