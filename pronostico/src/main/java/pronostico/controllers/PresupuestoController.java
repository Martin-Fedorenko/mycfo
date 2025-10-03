package pronostico.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pronostico.dtos.CrearPresupuestoRequest;
import pronostico.dtos.PresupuestoDTO;
import pronostico.models.Presupuesto;
import pronostico.models.PresupuestoLinea;
import pronostico.models.PresupuestoLinea.Tipo;
import pronostico.repositories.PresupuestoLineaRepository;
import pronostico.repositories.PresupuestoRepository;
import pronostico.services.PresupuestoService;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PresupuestoController {

    private final PresupuestoService service;

    // 🔻 Repos agregados (mínimo necesario) para no tocar tu Service
    private final PresupuestoRepository presupuestoRepository;
    private final PresupuestoLineaRepository presupuestoLineaRepository;

    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyy-MM");

    // ===================== LISTAR =====================
    @GetMapping("/presupuestos")
    public List<PresupuestoDTO> getAll() {
        return service.findAllDTO();
    }

    @GetMapping("/presupuestos/{id}")
    public ResponseEntity<PresupuestoDTO> getById(@PathVariable Long id) {
        return service.findByIdDTO(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ===================== CREAR (nuevo contrato) =====================
    @PostMapping(value = "/presupuestos", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> crear(@RequestBody CrearPresupuestoRequest req) {
        try {
            Presupuesto p = service.crearPresupuesto(req);
            PresupuestoDTO dto = PresupuestoDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .desde(normalizeYM(p.getDesde()))
                .hasta(normalizeYM(p.getHasta()))
                .build();
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    // ===================== UPDATE/DELETE =====================
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

    // ===================== ENDPOINTS AGREGADOS =====================
    // ---------- 1) Totales por mes (para PresupuestoDetalle) ----------
    @GetMapping("/presupuestos/{id}/totales")
    public ResponseEntity<List<Map<String, Object>>> getTotalesPorMes(@PathVariable Long id) {
        Optional<Presupuesto> opt = presupuestoRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        // Traer todas las líneas del presupuesto y agrupar por mes
        List<PresupuestoLinea> lineas = presupuestoLineaRepository.findByPresupuesto_Id(id);

        Map<String, List<PresupuestoLinea>> porMes = lineas.stream()
            .collect(Collectors.groupingBy(l -> normalizeYM(getMesAsString(l))));

        List<Map<String, Object>> salida = porMes.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(e -> {
                String ym = e.getKey();
                BigDecimal ingEst = BigDecimal.ZERO;
                BigDecimal ingReal = BigDecimal.ZERO;
                BigDecimal egrEst = BigDecimal.ZERO;
                BigDecimal egrReal = BigDecimal.ZERO;

                for (PresupuestoLinea l : e.getValue()) {
                    BigDecimal est = nvl(l.getMontoEstimado());
                    BigDecimal real = nvl(l.getMontoReal());
                    if (l.getTipo() == Tipo.INGRESO) {
                        ingEst = ingEst.add(est);
                        ingReal = ingReal.add(real);
                    } else {
                        egrEst = egrEst.add(est);
                        egrReal = egrReal.add(real);
                    }
                }

                Map<String, Object> m = new LinkedHashMap<>();
                m.put("mes", ym); // "YYYY-MM"
                m.put("ingresoEstimado", ingEst);
                m.put("egresoEstimado", egrEst);
                m.put("ingresoReal", ingReal);
                m.put("egresoReal", egrReal);
                m.put("saldoEstimado", ingEst.subtract(egrEst));
                m.put("saldoReal", ingReal.subtract(egrReal));
                return m;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(salida);
    }

    // ---------- 2) Listar líneas del mes ----------
    @GetMapping("/presupuestos/{id}/mes/{ym}")
    public ResponseEntity<List<Map<String, Object>>> getLineasMes(
        @PathVariable Long id,
        @PathVariable String ym
    ) {
        Optional<Presupuesto> opt = presupuestoRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        String normalized = normalizeYM(ym); // Acepta "YYYY-MM" o "YYYY-MM-01"

        List<Map<String, Object>> out = presupuestoLineaRepository.findByPresupuesto_Id(id).stream()
            .filter(l -> Objects.equals(normalizeYM(l.getMes()), normalized))
            .map(this::toLineaDTO)
            .collect(Collectors.toList());

        return ResponseEntity.ok(out);
    }

    // ---------- 3) Crear línea en un mes ----------
    @PostMapping("/presupuestos/{id}/mes/{ym}/lineas")
    public ResponseEntity<Map<String, Object>> crearLinea(
        @PathVariable Long id,
        @PathVariable String ym,
        @RequestBody LineaUpsertRequest req
    ) {
        Presupuesto presupuesto = presupuestoRepository.findById(id).orElse(null);
        if (presupuesto == null) return ResponseEntity.notFound().build();

        String normalized = normalizeYM(ym);

        PresupuestoLinea l = new PresupuestoLinea();
        l.setPresupuesto(presupuesto);
        // guardamos como "YYYY-MM" (string) para mantener compatibilidad
        setMesFromString(l, normalized);
        l.setCategoria(req.getCategoria());
        l.setTipo(Tipo.valueOf(req.getTipo().toUpperCase(Locale.ROOT)));

        l.setMontoEstimado(req.getMontoEstimado() != null ? req.getMontoEstimado() : BigDecimal.ZERO);
        l.setMontoReal(req.getMontoReal()); // puede ser null

        // Opcionales si existen en tu entidad (si no, el compilador los ignorará si no hay setters)
        // l.setSourceType(SourceType.MANUAL);
        // l.setSourceId(null);

        PresupuestoLinea saved = presupuestoLineaRepository.save(l);
        return ResponseEntity.ok(toLineaDTO(saved));
    }

    // ---------- 4) Editar línea del mes (PUT/PATCH tolerante) ----------
    @PatchMapping("/presupuestos/{id}/mes/{ym}/lineas/{lineaId}")
    public ResponseEntity<Map<String, Object>> patchLinea(
        @PathVariable Long id,
        @PathVariable String ym,
        @PathVariable Long lineaId,
        @RequestBody LineaUpsertRequest req
    ) {
        return upsertLinea(id, ym, lineaId, req, true);
    }

    @PutMapping("/presupuestos/{id}/mes/{ym}/lineas/{lineaId}")
    public ResponseEntity<Map<String, Object>> putLinea(
        @PathVariable Long id,
        @PathVariable String ym,
        @PathVariable Long lineaId,
        @RequestBody LineaUpsertRequest req
    ) {
        return upsertLinea(id, ym, lineaId, req, false);
    }

    private ResponseEntity<Map<String, Object>> upsertLinea(Long id, String ym, Long lineaId, LineaUpsertRequest req, boolean partial) {
        Optional<PresupuestoLinea> opt = presupuestoLineaRepository.findById(lineaId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        PresupuestoLinea l = opt.get();
        if (l.getPresupuesto() == null || !Objects.equals(l.getPresupuesto().getId(), id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "La línea no pertenece al presupuesto indicado"));
        }
        // Si cambia el mes por la ruta, lo normalizamos y seteamos igual (permite mover línea de mes si quisieras)
        String normalized = normalizeYM(ym);
        setMesFromString(l, normalized);

        if (!partial || req.getCategoria() != null) l.setCategoria(req.getCategoria());
        if (!partial || req.getTipo() != null) l.setTipo(Tipo.valueOf(req.getTipo().toUpperCase(Locale.ROOT)));
        if (!partial || req.getMontoEstimado() != null) l.setMontoEstimado(nvl(req.getMontoEstimado()));
        if (!partial || (req.isExplicitMontoReal() || req.getMontoReal() != null)) {
            // Permitimos null explícito en PATCH
            l.setMontoReal(req.getMontoReal());
        }

        PresupuestoLinea saved = presupuestoLineaRepository.save(l);
        return ResponseEntity.ok(toLineaDTO(saved));
    }

    // ---------- 5) Borrar línea ----------
    @DeleteMapping("/presupuestos/{id}/mes/{ym}/lineas/{lineaId}")
    public ResponseEntity<Void> deleteLinea(
        @PathVariable Long id,
        @PathVariable String ym,
        @PathVariable Long lineaId
    ) {
        Optional<PresupuestoLinea> opt = presupuestoLineaRepository.findById(lineaId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        PresupuestoLinea l = opt.get();
        if (l.getPresupuesto() == null || !Objects.equals(l.getPresupuesto().getId(), id)) {
            return ResponseEntity.badRequest().build();
        }
        presupuestoLineaRepository.deleteById(lineaId);
        return ResponseEntity.noContent().build();
    }

    // ===================== Helpers =====================
    private static BigDecimal nvl(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

    // Acepta "YYYY-MM" o "YYYY-MM-01" y devuelve "YYYY-MM"
    private static final java.util.regex.Pattern YM_PATTERN = java.util.regex.Pattern.compile("^(\\d{4})-(\\d{1,2})(?:-(\\d{1,2}))?$");

    private static String normalizeYM(String ym) {
        if (ym == null) return null;
        String s = ym.trim();
        if (s.isEmpty()) return s;

        java.util.regex.Matcher matcher = YM_PATTERN.matcher(s);
        if (matcher.matches()) {
            int month = Integer.parseInt(matcher.group(2));
            if (month >= 1 && month <= 12) {
                return matcher.group(1) + "-" + String.format("%02d", month);
            }
        }

        try {
            return java.time.YearMonth.parse(s).toString();
        } catch (Exception ignored) {}
        try {
            return java.time.LocalDate.parse(s).format(YM);
        } catch (Exception ignored) {}
        return s;
    }

    private static String getMesAsString(PresupuestoLinea l) {
        return normalizeYM(l.getMes());
    }

    private static void setMesFromString(PresupuestoLinea l, String ym) {
        String normalized = normalizeYM(ym);
        try {
            YearMonth yearMonth = YearMonth.parse(normalized);
            l.setMes(yearMonth.atDay(1).toString());
        } catch (Exception ex) {
            l.setMes(normalized);
        }
    }

    private Map<String, Object> toLineaDTO(PresupuestoLinea l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", l.getId());
        m.put("mes", getMesAsString(l)); // "YYYY-MM"
        m.put("categoria", l.getCategoria());
        m.put("tipo", l.getTipo() != null ? l.getTipo().name() : null);
        m.put("montoEstimado", l.getMontoEstimado());
        m.put("montoReal", l.getMontoReal());
        // Opcionales si están en tu entidad:
        try { m.put("sourceType", PresupuestoLinea.class.getMethod("getSourceType").invoke(l)); } catch (Exception ignored) {}
        try { m.put("sourceId", PresupuestoLinea.class.getMethod("getSourceId").invoke(l)); } catch (Exception ignored) {}
        return m;
    }

    // Request para crear/editar líneas (camelCase)
    @lombok.Data
    public static class LineaUpsertRequest {
        private String categoria;
        private String tipo; // "INGRESO"/"EGRESO"
        private BigDecimal montoEstimado;
        private BigDecimal montoReal;

        // Para distinguir null vs "quiero setear null" en PATCH
        private Boolean explicitMontoReal;

        public boolean isExplicitMontoReal() {
            return explicitMontoReal != null && explicitMontoReal;
        }
    }
}

