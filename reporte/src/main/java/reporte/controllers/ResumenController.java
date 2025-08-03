package reporte.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/resumen")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumenController {

    @GetMapping
    public Map<String, Object> obtenerResumen() {
        Map<String, Object> response = new HashMap<>();

        List<Map<String, Object>> ingresos = List.of(
            Map.of("id", 1, "categoria", "Salario", "fecha", "2025-08-01", "monto", 100001),
            Map.of("id", 2, "categoria", "Venta", "fecha", "2025-08-10", "monto", 25000)
        );

        List<Map<String, Object>> egresos = List.of(
            Map.of("id", 1, "categoria", "Alquiler", "fecha", "2025-08-05", "monto", 40000),
            Map.of("id", 2, "categoria", "Comida", "fecha", "2025-08-15", "monto", 35000),
            Map.of("id", 3, "categoria", "Transporte", "fecha", "2025-08-20", "monto", 13000)
        );

        response.put("ingresos", ingresos);
        response.put("egresos", egresos);

        return response;
    }
}
