package pronostico.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pronostico.dtos.PresupuestoDTO;
import pronostico.models.Presupuesto;
import pronostico.services.PresupuestoService;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PresupuestoController {

    @Autowired
    private PresupuestoService service;

    @GetMapping("/presupuestos")
    public List<PresupuestoDTO> getAll() {
        return service.findAll().stream()
            .map(p -> new PresupuestoDTO(
                p.getId(),
                p.getNombre(),
                p.getDesde().toString(),
                p.getHasta().toString(),
                p.getCategoriasJson()
            ))
            .toList();
    }

    /**
     * Endpoint para PresupuestoDetalle.js
     */
    @GetMapping("/presupuestos/{id}")
    public ResponseEntity<PresupuestoDTO> getById(@PathVariable Long id) {
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

        double totalIngresos = 0;
        double totalEgresos = 0;

        for (int i = 0; i < nombresMeses.length; i++) {
            double ingresoEst = 90000 + i * 15000;
            double ingresoReal = ingresoEst - (i % 2 == 0 ? 4000 : 0);
            double egresoEst = 60000 + i * 10000;
            double egresoReal = egresoEst + (i % 3 == 0 ? 6000 : 0);

            double desvioIngreso = ingresoReal - ingresoEst;
            double desvioEgreso = egresoReal - egresoEst;
            double totalEst = ingresoEst - egresoEst;
            double totalReal = ingresoReal - egresoReal;
            double totalDesvio = totalReal - totalEst;

            PresupuestoDTO.MesDTO mesDTO = new PresupuestoDTO.MesDTO(
                nombresMeses[i],
                ingresoEst,
                ingresoReal,
                desvioIngreso,
                egresoEst,
                egresoReal,
                desvioEgreso,
                totalEst,
                totalReal,
                totalDesvio
            );

            totalIngresos += ingresoReal;
            totalEgresos += egresoReal;
            meses.add(mesDTO);
        }

        p.setDetalleMensual(meses);
        p.setTotalIngresos(totalIngresos);
        p.setTotalEgresos(totalEgresos);
        p.setResultadoFinal(totalIngresos - totalEgresos);

        return ResponseEntity.ok(p);
    }

    /**
     * Endpoint para MesDetalle.js
     */
    @GetMapping("/presupuestos/{id}/mes/{mesId}")
    public ResponseEntity<Map<String, Object>> getMesDetalle(
        @PathVariable Long id,
        @PathVariable int mesId) {

        String[] nombresMeses = {
            "Enero","Febrero","Marzo","Abril","Mayo","Junio",
            "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
        };

        if (mesId < 1 || mesId > 12) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mes inválido"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("mes", nombresMeses[mesId - 1]);
        response.put("presupuesto", "Presupuesto Anual 2025");

        List<Map<String, Object>> categorias = new ArrayList<>();
        categorias.add(Map.of(
            "categoria", "Alquiler",
            "tipo", "Egreso",
            "sugerido", 100000,
            "monto", 100000,
            "desvio", 0
        ));
        categorias.add(Map.of(
            "categoria", "Sueldos",
            "tipo", "Egreso",
            "sugerido", 150000,
            "monto", 120000,
            "desvio", -30000
        ));
        categorias.add(Map.of(
            "categoria", "Ventas esperadas",
            "tipo", "Ingreso",
            "sugerido", 300000,
            "monto", 200,
            "desvio", 0
        ));

        response.put("categorias", categorias);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/presupuestos")
    public ResponseEntity<PresupuestoDTO> create(@RequestBody PresupuestoDTO dto) {
        Presupuesto p = new Presupuesto();
        p.setNombre(dto.getNombre());
        p.setDesde(LocalDate.parse(dto.getDesde()));
        p.setHasta(LocalDate.parse(dto.getHasta()));
        p.setCategoriasJson(dto.getCategoriasJson());

        Presupuesto guardado = service.save(p);

        PresupuestoDTO respuesta = new PresupuestoDTO(
            guardado.getId(),
            guardado.getNombre(),
            guardado.getDesde().toString(),
            guardado.getHasta().toString(),
            guardado.getCategoriasJson()
        );
        respuesta.setDetalleMensual(Collections.emptyList());
        respuesta.setTotalIngresos(0.0);
        respuesta.setTotalEgresos(0.0);
        respuesta.setResultadoFinal(0.0);
        return ResponseEntity.ok(respuesta);
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

//    @GetMapping("/presupuestos/mock")
//    public List<Map<String, Object>> getMockPresupuestos() {
//        List<Map<String, Object>> lista = new ArrayList<>();
//
//        Map<String, Object> p1 = new HashMap<>();
//        p1.put("id", "anual-2025");
//        p1.put("nombre", "Presupuesto BACKEND Anual 2025");
//        p1.put("desde", "2025-01-01");
//        p1.put("hasta", "2025-12-31");
//        lista.add(p1);
//
//        Map<String, Object> p2 = new HashMap<>();
//        p2.put("id", "semestre1-2025");
//        p2.put("nombre", "Primer semestre 2025");
//        p2.put("desde", "2025-01-01");
//        p2.put("hasta", "2025-06-30");
//        lista.add(p2);
//
//        return lista;
//    }

    @GetMapping
    public List<PresupuestoDTO> obtenerPresupuestos() {
        List<PresupuestoDTO> lista = new ArrayList<>();
        lista.add(new PresupuestoDTO(1L, "Cliente 1", "2025-01-01", "2025-12-31", "{}"));
        lista.add(new PresupuestoDTO(2L, "Cliente 2", "2025-01-01", "2025-06-30", "{}"));
        lista.add(new PresupuestoDTO(3L, "Cliente 3", "2025-07-01", "2025-12-31", "{}"));
        return lista;
    }
}
