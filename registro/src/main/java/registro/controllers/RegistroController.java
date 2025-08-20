package registro.controllers;

import registro.models.Registro;
import registro.services.RegistroService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin // solo para desarrollo
public class RegistroController {

    private final RegistroService registroService;

    public RegistroController(RegistroService registroService) {
        this.registroService = registroService;
    }

    @PostMapping("/registros")
    public Registro crearRegistro(@RequestBody Registro registro) {
        return registroService.guardarRegistro(registro);
    }

    @GetMapping("/registros")
    public List<Registro> obtenerTodos() {
        return registroService.obtenerTodos();
    }
}
