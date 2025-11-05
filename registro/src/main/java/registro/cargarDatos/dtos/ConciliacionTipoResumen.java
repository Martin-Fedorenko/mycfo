package registro.cargarDatos.dtos;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ConciliacionTipoResumen {
    String tipo;
    long total;
    long conciliados;
    long pendientes;
}

