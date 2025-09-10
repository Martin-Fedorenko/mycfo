package registro.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.models.Recibo;
import registro.services.ReciboService;

import java.util.List;

@RestController
@RequestMapping("/recibos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // habilita CORS para el front
public class ReciboController {

    private final ReciboService reciboService;

    @PostMapping("/formulario")
    public ResponseEntity<Recibo> crearRecibo(@RequestBody Recibo recibo) {
        Recibo guardado = reciboService.guardarRecibo(recibo);
        return ResponseEntity.ok(guardado);
    }

    @GetMapping
    public ResponseEntity<List<Recibo>> listarRecibos() {
        return ResponseEntity.ok(reciboService.listarRecibos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recibo> obtenerRecibo(@PathVariable Long id) {
        Recibo recibo = reciboService.obtenerRecibo(id);
        if (recibo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(recibo);
    }
}
