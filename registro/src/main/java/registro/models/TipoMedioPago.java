package registro.models;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum TipoMedioPago {
    Efectivo,
    Transferencia,
    Cheque;
}
