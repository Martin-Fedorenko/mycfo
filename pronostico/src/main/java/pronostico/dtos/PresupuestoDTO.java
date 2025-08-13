package pronostico.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    public PresupuestoDTO(Long id, String nombre, String desde, String hasta) {
        this.id = id;
        this.nombre = nombre;
        this.desde = desde;
        this.hasta = hasta;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MesDTO {
        @JsonProperty("id")
        private Long id;
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

        // NUEVO: lista de categorías para ese mes
        private List<CategoriaDTO> categorias;

        public Double getIngresoEstSafe() { return ingresoEst != null ? ingresoEst : 0.0; }
        public Double getIngresoRealSafe() { return ingresoReal != null ? ingresoReal : 0.0; }
        public Double getEgresoEstSafe() { return egresoEst != null ? egresoEst : 0.0; }
        public Double getEgresoRealSafe() { return egresoReal != null ? egresoReal : 0.0; }
    }

    public class PresupuestoDetalleDTO {
        private Long id;
        private Double ingresoEstimado;
        private Double ingresoReal;
        private Double egresoEstimado;
        private Double egresoReal;

        public Double getIngresoEstimadoSafe() {
            return ingresoEstimado != null ? ingresoEstimado : 0.0;
        }

        public Double getIngresoRealSafe() {
            return ingresoReal != null ? ingresoReal : 0.0;
        }

        public Double getEgresoEstimadoSafe() {
            return egresoEstimado != null ? egresoEstimado : 0.0;
        }

        public Double getEgresoRealSafe() {
            return egresoReal != null ? egresoReal : 0.0;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoriaDTO {
        private String categoria;
        private String tipo; // "INGRESO" o "EGRESO"
        private Double montoEstimado;
        private Double montoReal;

        public Double getMontoEstimadoSafe() {
            return montoEstimado != null ? montoEstimado : 0.0;
        }
        public Double getMontoRealSafe() {
            return montoReal != null ? montoReal : 0.0;
        }
    }
}
