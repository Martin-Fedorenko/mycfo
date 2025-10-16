package pronostico.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PresupuestoService {

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter ISO_DATE_TIME = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final int CURRENCY_SCALE = 2;
    private static final BigDecimal ZERO_AMOUNT = BigDecimal.ZERO.setScale(CURRENCY_SCALE);
    private static final Pattern YEAR_MONTH_PATTERN = Pattern.compile("^(\\d{4})[-/](\\d{1,2})");

    private final PresupuestoRepository repo;
    private final PresupuestoLineaRepository lineaRepo;
    private final PresupuestoEventService eventService;

    public enum ListStatus {
        ACTIVE,
        DELETED,
        ALL;

        public static ListStatus from(String raw) {
            if (raw == null || raw.isBlank()) {
                return ACTIVE;
            }
            return switch (raw.trim().toLowerCase(Locale.ROOT)) {
                case "deleted", "trash", "papelera" -> DELETED;
                case "all", "todos" -> ALL;
                default -> ACTIVE;
            };
        }
    }

    public List<PresupuestoDTO> findAllByOwner(String ownerSub) {
        return listByStatus(ownerSub, ListStatus.ACTIVE, Pageable.unpaged()).getContent();
    }

    public List<PresupuestoDTO> findByRange(LocalDate from, LocalDate to, String ownerSub) {
        return findByRange(from, to, ownerSub, ListStatus.ACTIVE, Pageable.unpaged()).getContent();
    }

    public List<PresupuestoDTO> findByRange(LocalDate from, LocalDate to, String ownerSub, ListStatus status) {
        return findByRange(from, to, ownerSub, status, Pageable.unpaged()).getContent();
    }

    public Page<PresupuestoDTO> findByRange(LocalDate from, LocalDate to, String ownerSub, ListStatus status, Pageable pageable) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("El rango debe incluir fechas 'from' y 'to'");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("'to' no puede ser anterior a 'from'");
        }
        String fromStr = from.format(ISO_DATE);
        String toStr = to.format(ISO_DATE);
        Pageable safePageable = pageable != null ? pageable : Pageable.unpaged();
        Page<Presupuesto> result = switch (status) {
            case ACTIVE -> repo.findActiveOverlapping(ownerSub, fromStr, toStr, safePageable);
            case DELETED -> repo.findDeletedOverlapping(ownerSub, fromStr, toStr, safePageable);
            case ALL -> repo.findAnyOverlapping(ownerSub, fromStr, toStr, safePageable);
        };
        return result.map(this::toDto);
    }

    public Optional<PresupuestoDTO> findByIdDTO(Long id, String ownerSub) {
        return repo.findByIdAndOwnerSubAndDeletedFalse(id, ownerSub).map(this::toDto);
    }

    public PresupuestoDTO getOneOwned(Long id, String ownerSub) {
        return toDto(mustOwnActive(id, ownerSub));
    }

    public Presupuesto updateOwned(Long id, Presupuesto payload, String ownerSub) {
        Presupuesto existing = mustOwnActive(id, ownerSub);
        existing.setNombre(payload.getNombre());
        existing.setDesde(payload.getDesde());
        existing.setHasta(payload.getHasta());
        return repo.save(existing);
    }

    @Transactional
    public void deleteOwned(Long id, String ownerSub) {
        Presupuesto existing = mustOwnActive(id, ownerSub);
        existing.setDeleted(true);
        existing.setDeletedAt(LocalDateTime.now());
        existing.setDeletedBy(ownerSub);
        repo.save(existing);
        log.info("Presupuesto {} marcado como eliminado por {}", id, ownerSub);
        eventService.sendBudgetDeletedEvent(existing);
    }

    @Transactional
    public PresupuestoDTO restoreOwned(Long id, String ownerSub) {
        Presupuesto presupuesto = mustOwnIncludingDeleted(id, ownerSub);
        if (!presupuesto.isDeleted()) {
            return toDto(presupuesto);
        }
        presupuesto.setDeleted(false);
        presupuesto.setDeletedAt(null);
        presupuesto.setDeletedBy(null);
        Presupuesto restored = repo.save(presupuesto);
        log.info("Presupuesto {} restaurado por {}", id, ownerSub);
        return toDto(restored);
    }

    public Page<PresupuestoDTO> listByStatus(String ownerSub, ListStatus status, Pageable pageable) {
        Pageable safePageable = pageable != null ? pageable : Pageable.unpaged();
        return selectByStatus(ownerSub, status, safePageable).map(this::toDto);
    }

    public List<PresupuestoDTO> listByStatus(String ownerSub, ListStatus status) {
        return listByStatus(ownerSub, status, Pageable.unpaged()).getContent();
    }

    public List<PresupuestoDTO> listByStatus(String ownerSub, String status) {
        return listByStatus(ownerSub, ListStatus.from(status));
    }

    public List<PresupuestoDTO> listActive(String ownerSub) {
        return listByStatus(ownerSub, ListStatus.ACTIVE);
    }

    public List<PresupuestoDTO> listDeleted(String ownerSub) {
        return listByStatus(ownerSub, ListStatus.DELETED);
    }

    private Page<Presupuesto> selectByStatus(String ownerSub, ListStatus status, Pageable pageable) {
        return switch (status) {
            case ACTIVE -> repo.findByOwnerSubAndDeletedFalse(ownerSub, pageable);
            case DELETED -> repo.findByOwnerSubAndDeletedTrue(ownerSub, pageable);
            case ALL -> repo.findByOwnerSub(ownerSub, pageable);
        };
    }

    private Presupuesto mustOwnActive(Long id, String ownerSub) {
        Presupuesto presupuesto = mustOwnIncludingDeleted(id, ownerSub);
        if (presupuesto.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Presupuesto no encontrado");
        }
        return presupuesto;
    }

    public Presupuesto mustOwn(Long id, String ownerSub) {
        return mustOwnActive(id, ownerSub);
    }

    public Presupuesto mustOwnIncludingDeleted(Long id, String ownerSub) {
        Presupuesto presupuesto = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Presupuesto no encontrado"));
        if (!Objects.equals(presupuesto.getOwnerSub(), ownerSub)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }
        return presupuesto;
    }
    private PresupuestoDTO toDto(Presupuesto p) {
        return PresupuestoDTO.builder()
            .id(p.getId())
            .nombre(p.getNombre())
            .desde(formatStoredYm(p.getDesde()))
            .hasta(formatStoredYm(p.getHasta()))
            .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().format(ISO_DATE_TIME) : null)
            .deleted(p.isDeleted())
            .deletedAt(p.getDeletedAt() != null ? p.getDeletedAt().format(ISO_DATE_TIME) : null)
            .deletedBy(p.getDeletedBy())
            .build();
    }

    private static YearMonth parseYearMonth(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("El mes '" + fieldName + "' es requerido");
        }
        String trimmed = value.trim();
        try {
            return YearMonth.parse(trimmed);
        } catch (DateTimeParseException ignored) {
        }
        if (trimmed.length() >= 7) {
            String firstSeven = trimmed.substring(0, 7);
            try {
                return YearMonth.parse(firstSeven);
            } catch (DateTimeParseException ignored) {
            }
        }
        try {
            return YearMonth.from(LocalDate.parse(trimmed));
        } catch (DateTimeParseException ignored) {
        }
        java.util.regex.Matcher matcher = YEAR_MONTH_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            int year = Integer.parseInt(matcher.group(1));
            int month = Integer.parseInt(matcher.group(2));
            if (month >= 1 && month <= 12) {
                return YearMonth.of(year, month);
            }
        }
        throw new IllegalArgumentException("Formato invalido para '" + fieldName + "' (usar YYYY-MM)");
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

    private static BigDecimal scale(BigDecimal value) {
        if (value == null) {
            return null;
        }
        return value.setScale(CURRENCY_SCALE, RoundingMode.HALF_UP);
    }

    private static BigDecimal calculateFactor(BigDecimal porcentaje) {
        if (porcentaje == null) {
            return null;
        }
        BigDecimal rate = porcentaje.divide(new BigDecimal("100"), 8, RoundingMode.HALF_UP);
        return BigDecimal.ONE.add(rate);
    }

    private static class PlantillaData {
        private final String categoria;
        private final PresupuestoLinea.Tipo tipo;
        private final BigDecimal defaultEstimado;
        private final BigDecimal defaultReal;
        private final Map<YearMonth, MesValor> valoresPorMes = new HashMap<>();
        private final BigDecimal factor;
        private BigDecimal pendingAmount;

        private PlantillaData(CrearPresupuestoRequest.PlantillaLinea linea) {
            this.categoria = (linea.getCategoria() != null && !linea.getCategoria().trim().isEmpty())
                ? linea.getCategoria().trim()
                : "Sin categoria";
            this.tipo = mapTipo(linea.getTipo());
            this.defaultEstimado = scale(linea.getMontoEstimado());
            this.defaultReal = scale(linea.getMontoReal());
            this.factor = calculateFactor(linea.getPorcentajeMensual());
            if (this.factor != null) {
                this.pendingAmount = this.defaultEstimado != null ? this.defaultEstimado : ZERO_AMOUNT;
            } else {
                this.pendingAmount = this.defaultEstimado;
            }
            if (linea.getMeses() != null) {
                for (CrearPresupuestoRequest.PlantillaMes mes : linea.getMeses()) {
                    if (mes == null || mes.getMes() == null || mes.getMes().isBlank()) {
                        continue;
                    }
                    try {
                        YearMonth ym = parseYearMonth(mes.getMes(), "mes");
                        valoresPorMes.put(ym, new MesValor(scale(mes.getMontoEstimado()), scale(mes.getMontoReal())));
                    } catch (IllegalArgumentException ex) {
                        log.debug("Mes de plantilla ignorado por formato invalido: {}", mes.getMes());
                    }
                }
            }
        }

        String getCategoria() {
            return categoria;
        }

        PresupuestoLinea.Tipo getTipo() {
            return tipo;
        }

        MesValor valorPara(YearMonth ym) {
            MesValor override = valoresPorMes.get(ym);
            BigDecimal estimado;

            if (override != null && override.estimado != null) {
                estimado = override.estimado;
                if (factor != null) {
                    pendingAmount = estimado.multiply(factor).setScale(CURRENCY_SCALE, RoundingMode.HALF_UP);
                }
            } else if (factor != null) {
                BigDecimal base = pendingAmount;
                if (base == null) {
                    base = defaultEstimado != null ? defaultEstimado : ZERO_AMOUNT;
                    pendingAmount = base;
                }
                estimado = base;
                pendingAmount = estimado.multiply(factor).setScale(CURRENCY_SCALE, RoundingMode.HALF_UP);
            } else if (defaultEstimado != null) {
                estimado = defaultEstimado;
            } else {
                estimado = ZERO_AMOUNT;
            }

            BigDecimal real;
            if (override != null && override.real != null) {
                real = override.real;
            } else {
                real = defaultReal;
            }
            return new MesValor(estimado, real);
        }
    }

    private static class MesValor {
        private final BigDecimal estimado;
        private final BigDecimal real;

        private MesValor(BigDecimal estimado, BigDecimal real) {
            this.estimado = estimado;
            this.real = real;
        }

        BigDecimal getEstimado() {
            return estimado;
        }

        BigDecimal getReal() {
            return real;
        }
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

        List<CrearPresupuestoRequest.PlantillaLinea> plantillaReq = req.getPlantilla();

        if (plantillaReq != null && !plantillaReq.isEmpty()) {
            List<PlantillaData> plantillas = plantillaReq.stream()
                .map(PlantillaData::new)
                .collect(Collectors.toList());

            YearMonth cursor = desde;
            while (!cursor.isAfter(hasta)) {
                String ym = formatYearMonthForStorage(cursor, false);
                for (PlantillaData data : plantillas) {
                    MesValor valor = data.valorPara(cursor);
                    BigDecimal estimado = valor.getEstimado();
                    BigDecimal real = valor.getReal();
                    log.debug("Guardando linea '{}' tipo {} mes {} estimado={} real={}",
                        data.getCategoria(), data.getTipo(), ym, estimado, real);
                    PresupuestoLinea linea = PresupuestoLinea.builder()
                        .presupuesto(presupuesto)
                        .mes(ym)
                        .categoria(data.getCategoria())
                        .tipo(data.getTipo())
                        .montoEstimado(estimado)
                        .montoReal(real)
                        .sourceType(PresupuestoLinea.SourceType.MANUAL)
                        .build();
                    lineaRepo.save(linea);
                }
                cursor = cursor.plusMonths(1);
            }
        } else if (req.isAutogenerarCeros()) {
            YearMonth cursor = desde;
            while (!cursor.isAfter(hasta)) {
                String ym = formatYearMonthForStorage(cursor, false);
                for (PresupuestoLinea.Tipo tipo : PresupuestoLinea.Tipo.values()) {
                    PresupuestoLinea linea = PresupuestoLinea.builder()
                        .presupuesto(presupuesto)
                        .mes(ym)
                        .categoria("Sin categoria")
                        .tipo(tipo)
                        .montoEstimado(ZERO_AMOUNT)
                        .montoReal(null)
                        .sourceType(PresupuestoLinea.SourceType.MANUAL)
                        .build();
                    lineaRepo.save(linea);
                }
                cursor = cursor.plusMonths(1);
            }
        }

        eventService.sendBudgetCreatedEvent(presupuesto);
        return presupuesto;
    }
}
