package registro.cargarDatos.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.cargarDatos.models.Pagare;
import registro.cargarDatos.services.PagareService;

import java.util.List;

@RestController
@RequestMapping("/pagares")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PagareController {

    private final PagareService pagareService;

    @PostMapping("/formulario")
    public ResponseEntity<Pagare> crearPagare(@RequestBody Pagare pagare) {
        Pagare guardado = pagareService.guardarPagare(pagare);
        return ResponseEntity.ok(guardado);
    }

    @GetMapping
    public ResponseEntity<List<Pagare>> listarPagares() {
        return ResponseEntity.ok(pagareService.listarPagares());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pagare> obtenerPagare(@PathVariable Long id) {
        Pagare pagare = pagareService.obtenerPagare(id);
        if (pagare == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pagare);
    }
}
