package pronostico.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pronostico.dtos.PresupuestoDTO;
import pronostico.models.Presupuesto;
import pronostico.services.PresupuestoService;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PresupuestoController {

    @Autowired
    private PresupuestoService service;

    @GetMapping("/presupuestos")
    public List<PresupuestoDTO> getAll() {
        return service.findAllDTO();
    }

    @GetMapping("/presupuestos/{id}")
    public ResponseEntity<PresupuestoDTO> getById(@PathVariable Long id) {
        // Datos mock con detalle mensual
        PresupuestoDTO p = new PresupuestoDTO();
        p.setId(id);
        p.setNombre("Presupuesto Anual 2025");
        p.setDesde("2025-01-01");
        p.setHasta("2025-12-31");
        p.setCategoriasJson("{}");

        List<PresupuestoDTO.MesDTO> meses = new ArrayList<>();
        String[] nombresMeses = {
            "Enero","Febrero","Marzo","Abril","Mayo","Junio",
            "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
        };
        for (int i = 0; i < nombresMeses.length; i++) {
            double ingresoEst = 90000 + i * 15000;
            double ingresoReal = ingresoEst - (i % 2 == 0 ? 4000 : 0);
            double egresoEst = 60000 + i * 10000;
            double egresoReal = egresoEst + (i % 3 == 0 ? 6000 : 0);

            meses.add(new PresupuestoDTO.MesDTO(
                nombresMeses[i],
                ingresoEst,
                ingresoReal,
                egresoEst,
                egresoReal
            ));
        }
        p.setDetalleMensual(meses);

        return ResponseEntity.ok(p);
    }

    @PostMapping("/presupuestos")
    public Presupuesto create(@RequestBody Presupuesto p) {
        return service.save(p);
    }

    @PutMapping("/presupuestos/{id}")
    public ResponseEntity<Presupuesto> update(@PathVariable Long id, @RequestBody Presupuesto p) {
        return service.findById(id).map(existing -> {
            existing.setNombre(p.getNombre());
            existing.setDesde(p.getDesde());
            existing.setHasta(p.getHasta());
            existing.setCategoriasJson(p.getCategoriasJson());
            return ResponseEntity.ok(service.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/presupuestos/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/presupuestos/mock")
    public List<Map<String, Object>> getMockPresupuestos() {
        List<Map<String, Object>> lista = new ArrayList<>();

        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", "anual-2025");
        p1.put("nombre", "Presupuesto BACKEND Anual 2025");
        p1.put("desde", "2025-01-01");
        p1.put("hasta", "2025-12-31");
        lista.add(p1);

        Map<String, Object> p2 = new HashMap<>();
        p2.put("id", "semestre1-2025");
        p2.put("nombre", "Primer semestre 2025");
        p2.put("desde", "2025-01-01");
        p2.put("hasta", "2025-06-30");
        lista.add(p2);

        return lista;
    }

    @GetMapping
    public List<PresupuestoDTO> obtenerPresupuestos() {
        List<PresupuestoDTO> lista = new ArrayList<>();
        lista.add(new PresupuestoDTO(1L, "Cliente 1", "2025-01-01", "2025-12-31", "{}", null));
        lista.add(new PresupuestoDTO(2L, "Cliente 2", "2025-01-01", "2025-06-30", "{}", null));
        lista.add(new PresupuestoDTO(3L, "Cliente 3", "2025-07-01", "2025-12-31", "{}", null));
        return lista;
    }
}
