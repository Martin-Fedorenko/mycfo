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
    private String desde;  // String para evitar problemas de formato en JSON
    private String hasta;
    private String categoriasJson;

    // Campos opcionales, usados en el detalle
    private List<MesDTO> detalleMensual;
    private Double totalIngresos;
    private Double totalEgresos;
    private Double resultadoFinal;

    /**
     * Constructor simplificado para la lista de presupuestos (sin detalle).
     */
    public PresupuestoDTO(Long id, String nombre, String desde, String hasta, String categoriasJson) {
        this.id = id;
        this.nombre = nombre;
        this.desde = desde;
        this.hasta = hasta;
        this.categoriasJson = categoriasJson;
        this.detalleMensual = null;
        this.totalIngresos = null;
        this.totalEgresos = null;
        this.resultadoFinal = null;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MesDTO {
        private String mes;
        private Double ingresoEst;
        private Double ingresoReal;
        private Double desvioIngreso;
        private Double egresoEst;
        private Double egresoReal;
        private Double desvioEgreso;
        private Double totalEst;
        private Double totalReal;
        private Double totalDesvio;
    }
}
