package registro.controllers;

import registro.models.Registro;
import registro.services.RegistroService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registro/registro")
@CrossOrigin // solo para desarrollo
public class RegistroController {

    private final RegistroService registroService;

    public RegistroController(RegistroService registroService) {
        this.registroService = registroService;
    }

    @PostMapping
    public Registro crearRegistro(@RequestBody Registro registro) {
        return registroService.guardarRegistro(registro);
    }
}
