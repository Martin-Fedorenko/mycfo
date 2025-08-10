package pronostico.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PresupuestoDTO {
    private Long id;
    private String nombre; // nombre del presupuesto
    private String desde; // string para evitar problemas de formato
    private String hasta;
    private String categoriasJson;
    private List<MesDTO> detalleMensual;

    // Constructor adicional para compatibilidad con código que pasa solo 5 parámetros
    public PresupuestoDTO(Long id, String nombre, String desde, String hasta, String categoriasJson) {
        this.id = id;
        this.nombre = nombre;
        this.desde = desde;
        this.hasta = hasta;
        this.categoriasJson = categoriasJson;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MesDTO {
        private String mes;
        private Double ingresoEst;
        private Double ingresoReal;
        private Double egresoEst;
        private Double egresoReal;
    }
}
