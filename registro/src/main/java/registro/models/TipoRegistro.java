package registro.models;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum TipoRegistro {
    Ingreso,
    Egreso,
    Deuda,
    Acreencia;
}
