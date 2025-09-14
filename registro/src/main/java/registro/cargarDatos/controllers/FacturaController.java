package registro.cargarDatos.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.cargarDatos.models.Factura;
import registro.cargarDatos.services.FacturaService;

import java.util.List;

@RestController
@RequestMapping("/facturas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // habilita CORS para el front
public class FacturaController {

    private final FacturaService facturaService;

    @PostMapping("/formulario")
    public ResponseEntity<Factura> crearFactura(@RequestBody Factura factura) {
        Factura guardada = facturaService.guardarFactura(factura);
        return ResponseEntity.ok(guardada);
    }

    @GetMapping
    public ResponseEntity<List<Factura>> listarFacturas() {
        return ResponseEntity.ok(facturaService.listarFacturas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Factura> obtenerFactura(@PathVariable Long id) {
        Factura factura = facturaService.obtenerFactura(id);
        if (factura == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(factura);
    }
}
