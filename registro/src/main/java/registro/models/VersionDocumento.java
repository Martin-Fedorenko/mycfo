package registro.models;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum VersionDocumento {
    ORIGINAL,
    DUPLICADO;

    @JsonCreator
    public static VersionDocumento fromString(String value) {
        return value == null ? null : VersionDocumento.valueOf(value.toUpperCase());
    }
}
