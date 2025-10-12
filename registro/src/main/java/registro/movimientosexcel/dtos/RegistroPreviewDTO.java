package registro.movimientosexcel.dtos;

import lombok.Getter;
import lombok.Setter;
import registro.cargarDatos.models.TipoMedioPago;
import registro.cargarDatos.models.TipoMoneda;
import registro.cargarDatos.models.TipoRegistro;

import java.time.LocalDate;

@Getter
@Setter
public class RegistroPreviewDTO {
    private Integer filaExcel;
    private TipoRegistro tipo;
    private Double montoTotal;
    private LocalDate fechaEmision;
    private String descripcion;
    private String origen;
    private TipoMedioPago medioPago;
    private TipoMoneda moneda;
    private String categoriaSugerida;
    private Boolean esDuplicado;
    private String motivoDuplicado;
    
    public RegistroPreviewDTO(Integer filaExcel, TipoRegistro tipo, Double montoTotal, 
                             LocalDate fechaEmision, String descripcion, String origen,
                             TipoMedioPago medioPago, TipoMoneda moneda) {
        this.filaExcel = filaExcel;
        this.tipo = tipo;
        this.montoTotal = montoTotal;
        this.fechaEmision = fechaEmision;
        this.descripcion = descripcion;
        this.origen = origen;
        this.medioPago = medioPago;
        this.moneda = moneda;
        this.esDuplicado = false;
    }
}
