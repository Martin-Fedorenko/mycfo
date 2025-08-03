package services;

import dtos.ResumenMensualDTO;
import org.springframework.stereotype.Service;

@Service
public class ResumenService {
    public ResumenMensualDTO obtenerResumen() {
        // Datos simulados (luego se conectará a la base de datos)
        return new ResumenMensualDTO(125000, 98000);
    }
}
