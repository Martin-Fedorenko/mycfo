package pronostico.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pronostico.dtos.CrearPresupuestoRequest;
import pronostico.dtos.PresupuestoDTO;
import pronostico.models.Presupuesto;
import pronostico.models.PresupuestoLinea;
import pronostico.repositories.PresupuestoLineaRepository;
import pronostico.repositories.PresupuestoRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresupuestoService {

    private final PresupuestoRepository repo;
    private final PresupuestoLineaRepository lineaRepo;

    // CRUD básico
    public Presupuesto save(Presupuesto p) { return repo.save(p); }
    public List<Presupuesto> findAll() { return repo.findAll(); }
    public Optional<Presupuesto> findById(Long id) { return repo.findById(id); }
    public void delete(Long id) { repo.deleteById(id); }

    public List<PresupuestoDTO> findAllDTO() {
        return repo.findAll().stream()
            .map(p -> PresupuestoDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .desde(p.getDesde() != null ? p.getDesde().toString() : null)
                .hasta(p.getHasta() != null ? p.getHasta().toString() : null)
                .build())
            .collect(Collectors.toList());
    }

    public Optional<PresupuestoDTO> findByIdDTO(Long id) {
        return repo.findById(id).map(p ->
            PresupuestoDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .desde(p.getDesde() != null ? p.getDesde().toString() : null)
                .hasta(p.getHasta() != null ? p.getHasta().toString() : null)
                .build()
        );
    }

    // --- Helpers ---
    private static BigDecimal nvl(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
    private static LocalDate firstDay(LocalDate d) { return d.withDayOfMonth(1); }

    private static PresupuestoLinea.Tipo mapTipo(String v) {
        if (v == null) throw new IllegalArgumentException("Tipo requerido");
        return switch (v.trim().toUpperCase()) {
            case "INGRESO" -> PresupuestoLinea.Tipo.INGRESO;
            case "EGRESO"  -> PresupuestoLinea.Tipo.EGRESO;
            default -> throw new IllegalArgumentException("Tipo inválido: " + v);
        };
    }

    // --- Crear presupuesto (2 tablas) ---
    @Transactional
    public Presupuesto crearPresupuesto(CrearPresupuestoRequest req) {
        if (req.getDesde() == null || req.getHasta() == null)
            throw new IllegalArgumentException("Las fechas 'desde' y 'hasta' son requeridas");
        if (req.getHasta().isBefore(req.getDesde()))
            throw new IllegalArgumentException("'hasta' no puede ser anterior a 'desde'");

        Presupuesto p = Presupuesto.builder()
            .nombre(req.getNombre())
            .desde(req.getDesde())
            .hasta(req.getHasta())
            .build();
        repo.save(p);

        LocalDate cursor = firstDay(req.getDesde());
        LocalDate fin = firstDay(req.getHasta());

        while (!cursor.isAfter(fin)) {
            if (req.getPlantilla() != null && !req.getPlantilla().isEmpty()) {
                for (CrearPresupuestoRequest.PlantillaLinea pl : req.getPlantilla()) {
                    PresupuestoLinea l = PresupuestoLinea.builder()
                        .presupuesto(p)
                        .mes(cursor)
                        .categoria(pl.getCategoria())
                        .tipo(mapTipo(pl.getTipo()))
                        .montoEstimado(nvl(pl.getMontoEstimado()))
                        .montoReal(pl.getMontoReal())
                        .sourceType(PresupuestoLinea.SourceType.MANUAL)
                        .build();
                    lineaRepo.save(l);
                }
            } else if (req.isAutogenerarCeros()) {
                for (PresupuestoLinea.Tipo t : PresupuestoLinea.Tipo.values()) {
                    PresupuestoLinea l = PresupuestoLinea.builder()
                        .presupuesto(p)
                        .mes(cursor)
                        .categoria("Sin categoría")
                        .tipo(t)
                        .montoEstimado(BigDecimal.ZERO)
                        .montoReal(null)
                        .sourceType(PresupuestoLinea.SourceType.MANUAL)
                        .build();
                    lineaRepo.save(l);
                }
            }
            cursor = cursor.plusMonths(1);
        }

        return p;
    }
}
