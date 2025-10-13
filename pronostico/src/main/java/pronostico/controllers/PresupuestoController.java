package pronostico.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import pronostico.dtos.CrearPresupuestoRequest;
import pronostico.dtos.PresupuestoDTO;
import pronostico.models.Presupuesto;
import pronostico.models.PresupuestoLinea;
import pronostico.models.PresupuestoLinea.Tipo;
import pronostico.repositories.PresupuestoLineaRepository;
import pronostico.services.PresupuestoService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PresupuestoController {

    private final PresupuestoService service;
    private final PresupuestoLineaRepository presupuestoLineaRepository;

    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final Pattern YM_PATTERN = Pattern.compile("^(\\d{4})-(\\d{1,2})(?:-(\\d{1,2}))?$");

    @GetMapping("/presupuestos")
    public List<PresupuestoDTO> getAll(
        @RequestParam(value = "year", required = false) Integer year,
        @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @AuthenticationPrincipal Jwt jwt
    ) {
        String sub = requireSub(jwt);
        try {
            if (from != null || to != null) {
                if (from == null || to == null) {
                    throw new IllegalArgumentException("Debe especificar las fechas 'from' y 'to' para el rango");
                }
                return service.findByRange(from, to, sub);
            }
            if (year != null) {
                LocalDate start = LocalDate.of(year, 1, 1);
                LocalDate end = LocalDate.of(year, 12, 31);
                return service.findByRange(start, end, sub);
            }
            return service.findAllByOwner(sub);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    @GetMapping("/presupuestos/{id}")
    public ResponseEntity<PresupuestoDTO> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        String sub = requireSub(jwt);
        try {
            return ResponseEntity.ok(service.getOneOwned(id, sub));
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                return ResponseEntity.notFound().build();
            }
            throw ex;
        }
    }

    @PostMapping(value = "/presupuestos", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> crear(@RequestBody CrearPresupuestoRequest req, @AuthenticationPrincipal Jwt jwt) {
        String sub = requireSub(jwt);
        try {
            Presupuesto presupuesto = service.crearPresupuesto(req, sub);
            PresupuestoDTO dto = PresupuestoDTO.builder()
                .id(presupuesto.getId())
                .nombre(presupuesto.getNombre())
                .desde(normalizeYM(presupuesto.getDesde()))
                .hasta(normalizeYM(presupuesto.getHasta()))
                .build();
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/presupuestos/{id}")
    public ResponseEntity<Presupuesto> update(@PathVariable Long id, @RequestBody Presupuesto payload, @AuthenticationPrincipal Jwt jwt) {
        String sub = requireSub(jwt);
        try {
            Presupuesto updated = service.updateOwned(id, payload, sub);
            return ResponseEntity.ok(updated);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                return ResponseEntity.notFound().build();
            }
            throw ex;
        }
    }

    @DeleteMapping("/presupuestos/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        String sub = requireSub(jwt);
        try {
            service.deleteOwned(id, sub);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                return ResponseEntity.notFound().build();
            }
            throw ex;
        }
    }

    @GetMapping("/presupuestos/{id}/totales")
    public ResponseEntity<List<Map<String, Object>>> getTotalesPorMes(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        service.mustOwn(id, requireSub(jwt));

        List<PresupuestoLinea> lineas = presupuestoLineaRepository.findByPresupuesto_Id(id);
        Map<String, List<PresupuestoLinea>> porMes = lineas.stream()
            .collect(Collectors.groupingBy(l -> normalizeYM(getMesAsString(l))));

        List<Map<String, Object>> salida = porMes.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> buildTotales(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());

        return ResponseEntity.ok(salida);
    }

    @GetMapping("/presupuestos/{id}/mes/{ym}")
    public ResponseEntity<List<Map<String, Object>>> getLineasMes(
        @PathVariable Long id,
        @PathVariable String ym,
        @AuthenticationPrincipal Jwt jwt
    ) {
        service.mustOwn(id, requireSub(jwt));

        String normalized = normalizeYM(ym);
        List<Map<String, Object>> out = presupuestoLineaRepository.findByPresupuesto_Id(id).stream()
            .filter(l -> Objects.equals(normalizeYM(l.getMes()), normalized))
            .map(this::toLineaDTO)
            .collect(Collectors.toList());

        return ResponseEntity.ok(out);
    }

    @PostMapping("/presupuestos/{id}/mes/{ym}/lineas")
    public ResponseEntity<Map<String, Object>> crearLinea(
        @PathVariable Long id,
        @PathVariable String ym,
        @RequestBody LineaUpsertRequest req,
        @AuthenticationPrincipal Jwt jwt
    ) {
        Presupuesto presupuesto = service.mustOwn(id, requireSub(jwt));

        String normalized = normalizeYM(ym);
        PresupuestoLinea linea = new PresupuestoLinea();
        linea.setPresupuesto(presupuesto);
        setMesFromString(linea, normalized);
        linea.setCategoria(req.getCategoria());
        linea.setTipo(Tipo.valueOf(req.getTipo().toUpperCase(Locale.ROOT)));
        linea.setMontoEstimado(req.getMontoEstimado() != null ? req.getMontoEstimado() : BigDecimal.ZERO);
        linea.setMontoReal(req.getMontoReal());

        PresupuestoLinea saved = presupuestoLineaRepository.save(linea);
        return ResponseEntity.ok(toLineaDTO(saved));
    }

    @PatchMapping("/presupuestos/{id}/mes/{ym}/lineas/{lineaId}")
    public ResponseEntity<Map<String, Object>> patchLinea(
        @PathVariable Long id,
        @PathVariable String ym,
        @PathVariable Long lineaId,
        @RequestBody LineaUpsertRequest req,
        @AuthenticationPrincipal Jwt jwt
    ) {
        Presupuesto presupuesto = service.mustOwn(id, requireSub(jwt));
        return upsertLinea(presupuesto, ym, lineaId, req, true);
    }

    @PutMapping("/presupuestos/{id}/mes/{ym}/lineas/{lineaId}")
    public ResponseEntity<Map<String, Object>> putLinea(
        @PathVariable Long id,
        @PathVariable String ym,
        @PathVariable Long lineaId,
        @RequestBody LineaUpsertRequest req,
        @AuthenticationPrincipal Jwt jwt
    ) {
        Presupuesto presupuesto = service.mustOwn(id, requireSub(jwt));
        return upsertLinea(presupuesto, ym, lineaId, req, false);
    }

    @DeleteMapping("/presupuestos/{id}/mes/{ym}/lineas/{lineaId}")
    public ResponseEntity<Void> deleteLinea(
        @PathVariable Long id,
        @PathVariable String ym,
        @PathVariable Long lineaId,
        @AuthenticationPrincipal Jwt jwt
    ) {
        service.mustOwn(id, requireSub(jwt));

        PresupuestoLinea linea = presupuestoLineaRepository.findById(lineaId).orElse(null);
        if (linea == null) {
            return ResponseEntity.notFound().build();
        }
        if (linea.getPresupuesto() == null || !Objects.equals(linea.getPresupuesto().getId(), id)) {
            return ResponseEntity.badRequest().build();
        }
        presupuestoLineaRepository.deleteById(lineaId);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<Map<String, Object>> upsertLinea(
        Presupuesto presupuesto,
        String ym,
        Long lineaId,
        LineaUpsertRequest req,
        boolean partial
    ) {
        PresupuestoLinea linea = presupuestoLineaRepository.findById(lineaId).orElse(null);
        if (linea == null) {
            return ResponseEntity.notFound().build();
        }
        if (linea.getPresupuesto() == null || !Objects.equals(linea.getPresupuesto().getId(), presupuesto.getId())) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "La linea no pertenece al presupuesto indicado");
            return ResponseEntity.badRequest().body(error);
        }

        String normalized = normalizeYM(ym);
        setMesFromString(linea, normalized);

        if (!partial || req.getCategoria() != null) {
            linea.setCategoria(req.getCategoria());
        }
        if (!partial || req.getTipo() != null) {
            linea.setTipo(Tipo.valueOf(req.getTipo().toUpperCase(Locale.ROOT)));
        }
        if (!partial || req.getMontoEstimado() != null) {
            linea.setMontoEstimado(nvl(req.getMontoEstimado()));
        }
        if (!partial || (req.isExplicitMontoReal() || req.getMontoReal() != null)) {
            linea.setMontoReal(req.getMontoReal());
        }

        PresupuestoLinea saved = presupuestoLineaRepository.save(linea);
        return ResponseEntity.ok(toLineaDTO(saved));
    }

    private Map<String, Object> buildTotales(String ym, List<PresupuestoLinea> lineas) {
        BigDecimal ingresoEstimado = BigDecimal.ZERO;
        BigDecimal ingresoReal = BigDecimal.ZERO;
        BigDecimal egresoEstimado = BigDecimal.ZERO;
        BigDecimal egresoReal = BigDecimal.ZERO;

        for (PresupuestoLinea linea : lineas) {
            BigDecimal estimado = nvl(linea.getMontoEstimado());
            BigDecimal real = nvl(linea.getMontoReal());
            if (linea.getTipo() == Tipo.INGRESO) {
                ingresoEstimado = ingresoEstimado.add(estimado);
                ingresoReal = ingresoReal.add(real);
            } else {
                egresoEstimado = egresoEstimado.add(estimado);
                egresoReal = egresoReal.add(real);
            }
        }

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("mes", ym);
        resultado.put("ingresoEstimado", ingresoEstimado);
        resultado.put("egresoEstimado", egresoEstimado);
        resultado.put("ingresoReal", ingresoReal);
        resultado.put("egresoReal", egresoReal);
        resultado.put("saldoEstimado", ingresoEstimado.subtract(egresoEstimado));
        resultado.put("saldoReal", ingresoReal.subtract(egresoReal));
        return resultado;
    }

    private static BigDecimal nvl(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static String normalizeYM(String ym) {
        if (ym == null) {
            return null;
        }
        String trimmed = ym.trim();
        if (trimmed.isEmpty()) {
            return trimmed;
        }

        var matcher = YM_PATTERN.matcher(trimmed);
        if (matcher.matches()) {
            int month = Integer.parseInt(matcher.group(2));
            if (month >= 1 && month <= 12) {
                return matcher.group(1) + "-" + String.format("%02d", month);
            }
        }

        try {
            return YearMonth.parse(trimmed).toString();
        } catch (Exception ignored) {
        }
        try {
            return LocalDate.parse(trimmed).format(YM);
        } catch (Exception ignored) {
        }
        return trimmed;
    }

    private static String getMesAsString(PresupuestoLinea linea) {
        return normalizeYM(linea.getMes());
    }

    private static void setMesFromString(PresupuestoLinea linea, String ym) {
        String normalized = normalizeYM(ym);
        try {
            YearMonth yearMonth = YearMonth.parse(normalized);
            linea.setMes(yearMonth.atDay(1).toString());
        } catch (Exception ex) {
            linea.setMes(normalized);
        }
    }

    private Map<String, Object> toLineaDTO(PresupuestoLinea linea) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", linea.getId());
        dto.put("mes", getMesAsString(linea));
        dto.put("categoria", linea.getCategoria());
        dto.put("tipo", linea.getTipo() != null ? linea.getTipo().name() : null);
        dto.put("montoEstimado", linea.getMontoEstimado());
        dto.put("montoReal", linea.getMontoReal());
        try {
            dto.put("sourceType", PresupuestoLinea.class.getMethod("getSourceType").invoke(linea));
        } catch (Exception ignored) {
        }
        try {
            dto.put("sourceId", PresupuestoLinea.class.getMethod("getSourceId").invoke(linea));
        } catch (Exception ignored) {
        }
        return dto;
    }

    private String requireSub(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalido");
        }
        return jwt.getSubject();
    }

    @lombok.Data
    public static class LineaUpsertRequest {
        private String categoria;
        private String tipo;
        private BigDecimal montoEstimado;
        private BigDecimal montoReal;
        private Boolean explicitMontoReal;

        public boolean isExplicitMontoReal() {
            return explicitMontoReal != null && explicitMontoReal;
        }
    }
}








