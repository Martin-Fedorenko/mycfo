package reporte.dtos;

import java.util.List;
import java.time.LocalDate;

/**
 * ProfitAndLossDTO – DTO extendido para el Estado de Resultados (P&L)
 * Incluye detalle de cada documento y totales mensuales y anuales ya calculados desde el backend.
 */
public class ProfitAndLossDTO {

    private int anio;
    private List<DocumentoComercialDTO> documentos; // detalle de facturas devengadas
    private double[] ingresosMensuales = new double[12];
    private double[] egresosMensuales = new double[12];
    private double resultadoAnual;

    public ProfitAndLossDTO() {}

    public ProfitAndLossDTO(int anio, List<DocumentoComercialDTO> documentos,
                            double[] ingresosMensuales, double[] egresosMensuales, double resultadoAnual) {
        this.anio = anio;
        this.documentos = documentos;
        this.ingresosMensuales = ingresosMensuales;
        this.egresosMensuales = egresosMensuales;
        this.resultadoAnual = resultadoAnual;
    }

    public int getAnio() {
        return anio;
    }

    public void setAnio(int anio) {
        this.anio = anio;
    }

    public List<DocumentoComercialDTO> getDocumentos() {
        return documentos;
    }

    public void setDocumentos(List<DocumentoComercialDTO> documentos) {
        this.documentos = documentos;
    }

    public double[] getIngresosMensuales() {
        return ingresosMensuales;
    }

    public void setIngresosMensuales(double[] ingresosMensuales) {
        this.ingresosMensuales = ingresosMensuales;
    }

    public double[] getEgresosMensuales() {
        return egresosMensuales;
    }

    public void setEgresosMensuales(double[] egresosMensuales) {
        this.egresosMensuales = egresosMensuales;
    }

    public double getResultadoAnual() {
        return resultadoAnual;
    }

    public void setResultadoAnual(double resultadoAnual) {
        this.resultadoAnual = resultadoAnual;
    }

    // --- Sub-DTO interno ---
    public static class DocumentoComercialDTO {
        private String tipoDocumento;
        private String categoria;
        private Double montoTotal;
        private LocalDate fechaEmision;

        public DocumentoComercialDTO() {}

        public DocumentoComercialDTO(String tipoDocumento, String categoria, Double montoTotal, LocalDate fechaEmision) {
            this.tipoDocumento = tipoDocumento;
            this.categoria = categoria;
            this.montoTotal = montoTotal;
            this.fechaEmision = fechaEmision;
        }

        public String getTipoDocumento() { return tipoDocumento; }
        public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }

        public Double getMontoTotal() { return montoTotal; }
        public void setMontoTotal(Double montoTotal) { this.montoTotal = montoTotal; }

        public LocalDate getFechaEmision() { return fechaEmision; }
        public void setFechaEmision(LocalDate fechaEmision) { this.fechaEmision = fechaEmision; }
    }
}
