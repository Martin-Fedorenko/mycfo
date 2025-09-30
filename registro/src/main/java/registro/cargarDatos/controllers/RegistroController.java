package registro.cargarDatos.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.cargarDatos.models.Registro;
import registro.cargarDatos.services.RegistroService;

import java.util.List;

@RestController
@RequestMapping("/registros")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegistroController {

    private final RegistroService registroService;

    @PostMapping("/formulario")
    public ResponseEntity<Registro> crearRegistro(@RequestBody Registro registro) {
        Registro guardado = registroService.guardarRegistro(registro);
        return ResponseEntity.ok(guardado);
    }

    @GetMapping
    public ResponseEntity<List<Registro>> listarRegistros() {
        return ResponseEntity.ok(registroService.listarRegistros());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Registro> obtenerRegistro(@PathVariable Long id) {
        Registro registro = registroService.obtenerRegistro(id);
        if (registro == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Registro> updateRegistro(
            @PathVariable Long id,
            @RequestBody Registro registroActualizado) {

        Registro actualizado = registroService.updateRegistro(id, registroActualizado);
        return ResponseEntity.ok(actualizado);
    }
}
