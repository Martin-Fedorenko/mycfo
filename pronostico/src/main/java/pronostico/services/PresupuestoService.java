package pronostico.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresupuestoService {

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final PresupuestoRepository repo;
    private final PresupuestoLineaRepository lineaRepo;

    public List<PresupuestoDTO> findAllByOwner(String ownerSub) {
        return mapToDto(repo.findByOwnerSub(ownerSub));
    }

    public List<PresupuestoDTO> findByRange(LocalDate from, LocalDate to, String ownerSub) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("El rango debe incluir fechas 'from' y 'to'");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("'to' no puede ser anterior a 'from'");
        }
        String fromStr = from.format(ISO_DATE);
        String toStr = to.format(ISO_DATE);
        return mapToDto(repo.findOverlapping(ownerSub, fromStr, toStr));
    }

    public Optional<PresupuestoDTO> findByIdDTO(Long id, String ownerSub) {
        return repo.findByIdAndOwnerSub(id, ownerSub).map(this::toDto);
    }

    public PresupuestoDTO getOneOwned(Long id, String ownerSub) {
        return toDto(mustOwn(id, ownerSub));
    }

    public Presupuesto updateOwned(Long id, Presupuesto payload, String ownerSub) {
        Presupuesto existing = mustOwn(id, ownerSub);
        existing.setNombre(payload.getNombre());
        existing.setDesde(payload.getDesde());
        existing.setHasta(payload.getHasta());
        return repo.save(existing);
    }

    public void deleteOwned(Long id, String ownerSub) {
        Presupuesto existing = mustOwn(id, ownerSub);
        repo.delete(existing);
    }

    public Presupuesto mustOwn(Long id, String ownerSub) {
        Presupuesto presupuesto = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Presupuesto no encontrado"));
        if (!Objects.equals(presupuesto.getOwnerSub(), ownerSub)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }
        return presupuesto;
    }

    private static BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

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
        if (value == null || value.isBlank()) {
            return value;
        }
        String trimmed = value.trim();
        if (trimmed.length() >= 10) {
            try {
                return LocalDate.parse(trimmed).format(DateTimeFormatter.ofPattern("yyyy-MM"));
            } catch (Exception ignored) {
                // formato distinto, seguimos abajo
            }
        }
        return trimmed.length() > 7 ? trimmed.substring(0, 7) : trimmed;
    }

    private static String formatYearMonthForStorage(YearMonth ym, boolean endOfMonth) {
        LocalDate date = endOfMonth ? ym.atEndOfMonth() : ym.atDay(1);
        return date.toString();
    }

    private static PresupuestoLinea.Tipo mapTipo(String v) {
        if (v == null) {
            throw new IllegalArgumentException("Tipo requerido");
        }
        return switch (v.trim().toUpperCase(Locale.ROOT)) {
            case "INGRESO" -> PresupuestoLinea.Tipo.INGRESO;
            case "EGRESO" -> PresupuestoLinea.Tipo.EGRESO;
            default -> throw new IllegalArgumentException("Tipo invalido: " + v);
        };
    }

    @Transactional
    public Presupuesto crearPresupuesto(CrearPresupuestoRequest req, String ownerSub) {
        YearMonth desde = parseYearMonth(req.getDesde(), "desde");
        YearMonth hasta = parseYearMonth(req.getHasta(), "hasta");
        if (hasta.isBefore(desde)) {
            throw new IllegalArgumentException("'hasta' no puede ser anterior a 'desde'");
        }

        Presupuesto presupuesto = Presupuesto.builder()
            .ownerSub(ownerSub)
            .nombre(req.getNombre())
            .desde(formatYearMonthForStorage(desde, false))
            .hasta(formatYearMonthForStorage(hasta, true))
            .build();
        repo.save(presupuesto);

        YearMonth cursor = desde;
        while (!cursor.isAfter(hasta)) {
            String ym = formatYearMonthForStorage(cursor, false);
            if (req.getPlantilla() != null && !req.getPlantilla().isEmpty()) {
                for (CrearPresupuestoRequest.PlantillaLinea plantilla : req.getPlantilla()) {
                    PresupuestoLinea linea = PresupuestoLinea.builder()
                        .presupuesto(presupuesto)
                        .mes(ym)
                        .categoria(plantilla.getCategoria())
                        .tipo(mapTipo(plantilla.getTipo()))
                        .montoEstimado(nvl(plantilla.getMontoEstimado()))
                        .montoReal(plantilla.getMontoReal())
                        .sourceType(PresupuestoLinea.SourceType.MANUAL)
                        .build();
                    lineaRepo.save(linea);
                }
            } else if (req.isAutogenerarCeros()) {
                for (PresupuestoLinea.Tipo tipo : PresupuestoLinea.Tipo.values()) {
                    PresupuestoLinea linea = PresupuestoLinea.builder()
                        .presupuesto(presupuesto)
                        .mes(ym)
                        .categoria("Sin categoria")
                        .tipo(tipo)
                        .montoEstimado(BigDecimal.ZERO)
                        .montoReal(null)
                        .sourceType(PresupuestoLinea.SourceType.MANUAL)
                        .build();
                    lineaRepo.save(linea);
                }
            }
            cursor = cursor.plusMonths(1);
        }

        return presupuesto;
    }
}
