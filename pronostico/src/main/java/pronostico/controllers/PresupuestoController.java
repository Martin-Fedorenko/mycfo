package pronostico.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pronostico.dtos.PresupuestoDTO;
import pronostico.models.Presupuesto;
import pronostico.models.PresupuestoDetalle;
import pronostico.models.PresupuestoMesCategoria;
import pronostico.repositories.PresupuestoDetalleRepository;
import pronostico.repositories.PresupuestoMesCategoriaRepository;
import pronostico.services.PresupuestoService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PresupuestoController {

    @Autowired
    private PresupuestoService service;

    @Autowired
    private PresupuestoDetalleRepository detalleRepo;

    @Autowired
    private PresupuestoMesCategoriaRepository categoriaRepo;

    @GetMapping("/presupuestos")
    public List<PresupuestoDTO> getAll() {
        return service.findAll().stream()
            .map(p -> new PresupuestoDTO(
                p.getId(),
                p.getNombre(),
                p.getDesde() != null ? p.getDesde().toString() : null,
                p.getHasta() != null ? p.getHasta().toString() : null
            ))
            .toList();
    }

    @GetMapping("/presupuestos/{id}")
    public ResponseEntity<PresupuestoDTO> getById(@PathVariable Long id) {
        return service.findById(id).map(p -> {
            PresupuestoDTO dto = new PresupuestoDTO(
                p.getId(),
                p.getNombre(),
                p.getDesde() != null ? p.getDesde().toString() : null,
                p.getHasta() != null ? p.getHasta().toString() : null
            );

            List<PresupuestoDetalle> detalles = detalleRepo.findByPresupuestoId(p.getId());
            double totalIngresos = 0;
            double totalEgresos = 0;

            List<PresupuestoDTO.MesDTO> meses = new ArrayList<>();

            for (PresupuestoDetalle d : detalles) {
                // LOG para debug: mostramos id y mes del detalle
                System.out.println("DEBUG PresupuestoDetalle id=" + d.getId() + " mes=" + d.getMes());

                double ingresoEst = safeDouble(d.getIngresoEstimado());
                double ingresoReal = safeDouble(d.getIngresoReal());
                double egresoEst = safeDouble(d.getEgresoEstimado());
                double egresoReal = safeDouble(d.getEgresoReal());

                double desvioIngreso = ingresoReal - ingresoEst;
                double desvioEgreso = egresoReal - egresoEst;
                double totalEst = ingresoEst - egresoEst;
                double totalReal = ingresoReal - egresoReal;
                double totalDesvio = totalReal - totalEst;

                List<PresupuestoDTO.CategoriaDTO> categoriasDTO = new ArrayList<>();
                if (d.getCategorias() != null) {
                    d.getCategorias().forEach(c -> {
                        PresupuestoDTO.CategoriaDTO catDTO = new PresupuestoDTO.CategoriaDTO(
                            c.getCategoria(),
                            c.getTipo() != null ? c.getTipo().toString() : null,
                            safeDouble(c.getMontoEstimado()),
                            safeDouble(c.getMontoReal())
                        );
                        categoriasDTO.add(catDTO);
                    });
                }

                PresupuestoDTO.MesDTO mesDto = new PresupuestoDTO.MesDTO();

                // aseguramos setId (y antes lo imprimimos en log)
                System.out.println(" -> set MesDTO.id = " + d.getId());
                mesDto.setId(d.getId());
                System.out.println("DEBUG detalle mensual id=" + d.getId() + " mes=" + d.getMes());
                mesDto.setMes(d.getMes());
                mesDto.setIngresoEst(ingresoEst);
                mesDto.setIngresoReal(ingresoReal);
                mesDto.setDesvioIngreso(desvioIngreso);
                mesDto.setEgresoEst(egresoEst);
                mesDto.setEgresoReal(egresoReal);
                mesDto.setDesvioEgreso(desvioEgreso);
                mesDto.setTotalEst(totalEst);
                mesDto.setTotalReal(totalReal);
                mesDto.setTotalDesvio(totalDesvio);
                mesDto.setCategorias(categoriasDTO);

                meses.add(mesDto);

                totalIngresos += ingresoReal;
                totalEgresos += egresoReal;
            }

            dto.setDetalleMensual(meses);
            dto.setTotalIngresos(totalIngresos);
            dto.setTotalEgresos(totalEgresos);
            dto.setResultadoFinal(totalIngresos - totalEgresos);

            return ResponseEntity.ok(dto);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/presupuestos/{presupuestoId}/mes/{detalleId}")
    public ResponseEntity<?> getMesDetalle(
        @PathVariable Long presupuestoId,
        @PathVariable Long detalleId) {

//        Optional<PresupuestoDetalle> detalleOpt = detalleRepo.findById(detalleId);
//        if (detalleOpt.isEmpty()) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Detalle mensual no encontrado"));
//        }

        Optional<PresupuestoDetalle> detalleOpt = detalleRepo.findByIdAndPresupuestoId(detalleId, presupuestoId);
        if (detalleOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Detalle mensual no encontrado para este presupuesto"));
        }

        List<PresupuestoMesCategoria> categorias = categoriaRepo.findByPresupuestoDetalleId(detalleId);

        Map<String, Object> response = Map.of(
            "presupuestoNombre", detalleOpt.get().getPresupuesto().getNombre(),
            "mes", detalleOpt.get().getMes(),
            "categorias", categorias.stream().map(c -> Map.of(
                "categoria", c.getCategoria(),
                "tipo", c.getTipo().name(),
                "montoEstimado", c.getMontoEstimado(),
                "montoReal", c.getMontoReal()
            )).toList()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/presupuestos")
    public ResponseEntity<PresupuestoDTO> create(@RequestBody PresupuestoDTO dto) {
        Presupuesto p = new Presupuesto();
        p.setNombre(dto.getNombre());
        p.setDesde(LocalDate.parse(dto.getDesde()));
        p.setHasta(LocalDate.parse(dto.getHasta()));

        List<PresupuestoDetalle> detalles = new ArrayList<>();
        if (dto.getDetalleMensual() != null) {
            for (PresupuestoDTO.MesDTO mesDTO : dto.getDetalleMensual()) {
                PresupuestoDetalle d = new PresupuestoDetalle();
                d.setPresupuesto(p);
                d.setMes(mesDTO.getMes());
                d.setIngresoEstimado(BigDecimal.valueOf(mesDTO.getIngresoEst() != null ? mesDTO.getIngresoEst() : 0));
                d.setEgresoEstimado(BigDecimal.valueOf(mesDTO.getEgresoEst() != null ? mesDTO.getEgresoEst() : 0));
                d.setIngresoReal(BigDecimal.ZERO);
                d.setEgresoReal(BigDecimal.ZERO);

                List<PresupuestoMesCategoria> categorias = new ArrayList<>();
                if (mesDTO.getCategorias() != null) {
                    for (PresupuestoDTO.CategoriaDTO catDTO : mesDTO.getCategorias()) {
                        PresupuestoMesCategoria c = new PresupuestoMesCategoria();
                        c.setPresupuestoDetalle(d);
                        c.setCategoria(catDTO.getCategoria());
                        if (catDTO.getTipo() != null) {
                            try {
                                c.setTipo(PresupuestoMesCategoria.TipoMovimiento.valueOf(catDTO.getTipo()));
                            } catch (IllegalArgumentException ex) {
                                try {
                                    c.setTipo(PresupuestoMesCategoria.TipoMovimiento.valueOf(catDTO.getTipo().toUpperCase()));
                                } catch (Exception e) {
                                    c.setTipo(null);
                                }
                            }
                        }
                        c.setMontoEstimado(BigDecimal.valueOf(catDTO.getMontoEstimadoSafe()));
                        c.setMontoReal(BigDecimal.valueOf(catDTO.getMontoRealSafe()));
                        categorias.add(c);
                    }
                }
                d.setCategorias(categorias);
                detalles.add(d);
            }
        }

        p.setDetalles(detalles);
        Presupuesto guardado = service.save(p);

        PresupuestoDTO respuesta = new PresupuestoDTO(
            guardado.getId(),
            guardado.getNombre(),
            guardado.getDesde() != null ? guardado.getDesde().toString() : null,
            guardado.getHasta() != null ? guardado.getHasta().toString() : null
        );

        respuesta.setDetalleMensual(dto.getDetalleMensual());
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
            return ResponseEntity.ok(service.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/presupuestos/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    private double safeDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : 0.0;
    }
}
