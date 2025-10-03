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
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresupuestoService {

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final PresupuestoRepository repo;
    private final PresupuestoLineaRepository lineaRepo;

    // CRUD basico
    public Presupuesto save(Presupuesto p) { return repo.save(p); }
    public List<Presupuesto> findAll() { return repo.findAll(); }
    public Optional<Presupuesto> findById(Long id) { return repo.findById(id); }
    public void delete(Long id) { repo.deleteById(id); }

    public List<PresupuestoDTO> findAllDTO() {
        return mapToDto(repo.findAll());
    }

    public List<PresupuestoDTO> findByRange(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("El rango debe incluir fechas 'from' y 'to'");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("'to' no puede ser anterior a 'from'");
        }
        String fromStr = from.format(ISO_DATE);
        String toStr = to.format(ISO_DATE);
        return mapToDto(repo.findOverlapping(fromStr, toStr));
    }

    public Optional<PresupuestoDTO> findByIdDTO(Long id) {
        return repo.findById(id).map(this::toDto);
    }

    // --- Helpers ---
    private static BigDecimal nvl(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }

    private List<PresupuestoDTO> mapToDto(List<Presupuesto> presupuestos) {
        return presupuestos.stream().map(this::toDto).collect(Collectors.toList());
    }

    private PresupuestoDTO toDto(Presupuesto p) {
        return PresupuestoDTO.builder()
            .id(p.getId())
            .nombre(p.getNombre())
            .desde(formatStoredYm(p.getDesde()))
            .hasta(formatStoredYm(p.getHasta()))
            .build();
    }

    private static YearMonth parseYearMonth(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("El mes '" + fieldName + "' es requerido");
        }
        try {
            return YearMonth.parse(value.trim());
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Formato invalido para '" + fieldName + "' (usar YYYY-MM)");
        }
    }

    private static String formatStoredYm(String value) {
        if (value == null || value.isBlank()) return value;
        String trimmed = value.trim();
        if (trimmed.length() >= 10) {
            try {
                return LocalDate.parse(trimmed).format(DateTimeFormatter.ofPattern("yyyy-MM"));
            } catch (Exception ignored) { }
        }
        return trimmed.length() > 7 ? trimmed.substring(0, 7) : trimmed;
    }

    private static String formatYearMonthForStorage(YearMonth ym, boolean endOfMonth) {
        LocalDate date = endOfMonth ? ym.atEndOfMonth() : ym.atDay(1);
        return date.toString();
    }

    private static PresupuestoLinea.Tipo mapTipo(String v) {
        if (v == null) throw new IllegalArgumentException("Tipo requerido");
        return switch (v.trim().toUpperCase()) {
            case "INGRESO" -> PresupuestoLinea.Tipo.INGRESO;
            case "EGRESO"  -> PresupuestoLinea.Tipo.EGRESO;
            default -> throw new IllegalArgumentException("Tipo invalido: " + v);
        };
    }

    // --- Crear presupuesto (2 tablas) ---
    @Transactional
    public Presupuesto crearPresupuesto(CrearPresupuestoRequest req) {
        YearMonth desde = parseYearMonth(req.getDesde(), "desde");
        YearMonth hasta = parseYearMonth(req.getHasta(), "hasta");
        if (hasta.isBefore(desde)) {
            throw new IllegalArgumentException("'hasta' no puede ser anterior a 'desde'");
        }

        Presupuesto p = Presupuesto.builder()
            .nombre(req.getNombre())
            .desde(formatYearMonthForStorage(desde, false))
            .hasta(formatYearMonthForStorage(hasta, true))
            .build();
        repo.save(p);

        YearMonth cursor = desde;
        while (!cursor.isAfter(hasta)) {
            String ym = formatYearMonthForStorage(cursor, false);
            if (req.getPlantilla() != null && !req.getPlantilla().isEmpty()) {
                for (CrearPresupuestoRequest.PlantillaLinea pl : req.getPlantilla()) {
                    PresupuestoLinea l = PresupuestoLinea.builder()
                        .presupuesto(p)
                        .mes(ym)
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
                        .mes(ym)
                        .categoria("Sin categoria")
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
