package administracion.dtos;

import lombok.Data;

@Data
public class RegistroDTO {
    private String email;
    private String password;
    private String nombre;
    private String apellido;
    private String nombreEmpresa;
}

