package ia.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InsightsService {

    @Value("${mycfo.reporte.url}")
    private String reporteUrl;

    @Value("${deepseek.api.key:}")
    private String deepseekApiKey;

    @Value("${deepseek.base.url:https://api.deepseek.com}")
    private String deepseekBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, Object> generarInsights(String userSub, Integer anio, Integer mes) {
        LocalDate now = LocalDate.now();
        int year = (anio != null) ? anio : now.getYear();
        int month = (mes != null) ? mes : now.getMonthValue();

        // Llamar microservicio reporte para obtener datos compactos
        Map<String, Object> payload = new HashMap<>();
        payload.put("anio", year);
        payload.put("mes", month);

        try {
            var headers = new HttpHeaders();
            headers.add("X-Usuario-Sub", userSub);

            // P&L (devengado)
            String pylUrl = reporteUrl + "/pyl?anio=" + year;
            var pylResp = restTemplate.exchange(
                    pylUrl, HttpMethod.GET, new HttpEntity<>(headers),
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> pyl = Optional.ofNullable(pylResp.getBody()).orElse(Map.of());

            // Cashflow (caja)
            String cashUrl = reporteUrl + "/cashflow?anio=" + year;
            var cashResp = restTemplate.exchange(
                    cashUrl, HttpMethod.GET, new HttpEntity<>(headers),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            List<Map<String, Object>> cash = Optional.ofNullable(cashResp.getBody()).orElse(List.of());

            // Resumen mensual (caja)
            String resumenUrl = reporteUrl + "/resumen?anio=" + year + "&mes=" + month;
            var resResp = restTemplate.exchange(
                    resumenUrl, HttpMethod.GET, new HttpEntity<>(headers),
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> resumen = Optional.ofNullable(resResp.getBody()).orElse(Map.of());

            // Reducir datos a lo esencial para el prompt
            Map<String, Object> compact = compactarDatos(year, month, pyl, cash, resumen);
            payload.put("datos", compact);

            // Llamar DeepSeek
            Map<String, Object> ai = llamarDeepSeek(compact);
            payload.put("ai", ai);
            return ai;
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("diagnostico_corto", "No se pudo generar el análisis en este momento.");
            fallback.put("senales", Map.of());
            fallback.put("tips", List.of("Reintenta en unos minutos", "Verifica tu conexión"));
            fallback.put("error", e.getMessage());
            return fallback;
        }
    }

    private Map<String, Object> compactarDatos(int anio, int mes,
                                               Map<String, Object> pyl,
                                               List<Map<String, Object>> cash,
                                               Map<String, Object> resumen) {
        Map<String, Object> out = new HashMap<>();
        out.put("anio", anio);
        out.put("mes", mes);

        // P&L arrays
        double[] ingPyl = toDoubleArray((List<?>) pyl.getOrDefault("ingresosMensuales", List.of()));
        double[] egrPyl = toDoubleArray((List<?>) pyl.getOrDefault("egresosMensuales", List.of()));
        out.put("pyl", Map.of(
                "ingresosMensuales", ingPyl,
                "egresosMensuales", egrPyl,
                "detalleIngresos", pyl.getOrDefault("detalleIngresos", List.of()),
                "detalleEgresos", pyl.getOrDefault("detalleEgresos", List.of())
        ));

        // Cashflow: agregamos totales por mes
        double[] ingCash = new double[12];
        double[] egrCash = new double[12];
        for (Map<String, Object> mov : cash) {
            try {
                String tipo = Objects.toString(mov.get("tipo"), "");
                String fecha = Objects.toString(mov.get("fechaEmision"), null);
                Double monto = (mov.get("montoTotal") instanceof Number) ? ((Number) mov.get("montoTotal")).doubleValue() : 0.0;
                if (fecha == null) continue;
                int monthIdx = LocalDate.parse(fecha).getMonthValue() - 1;
                if ("Ingreso".equalsIgnoreCase(tipo)) ingCash[monthIdx] += monto;
                else if ("Egreso".equalsIgnoreCase(tipo)) egrCash[monthIdx] += monto;
            } catch (Exception ignore) { }
        }
        out.put("cashflow", Map.of("ingresosMensuales", ingCash, "egresosMensuales", egrCash));

        // Resumen mensual (categorías)
        out.put("resumen", Map.of(
                "detalleIngresos", resumen.getOrDefault("detalleIngresos", List.of()),
                "detalleEgresos", resumen.getOrDefault("detalleEgresos", List.of())
        ));

        // Derivados
        int idx = Math.max(0, Math.min(11, mes - 1));
        double cajaNeta = ingCash[idx] - egrCash[idx];
        double devengadoNeto = (idx < ingPyl.length ? ingPyl[idx] : 0) - (idx < egrPyl.length ? egrPyl[idx] : 0);
        double gapLiquidez = devengadoNeto - cajaNeta;
        out.put("derivados", Map.of(
                "gapLiquidez", gapLiquidez,
                "cajaNetaMes", cajaNeta,
                "devengadoNetoMes", devengadoNeto
        ));
        return out;
    }

    private double[] toDoubleArray(List<?> list) {
        double[] out = new double[list.size()];
        for (int i = 0; i < list.size(); i++) {
            Object v = list.get(i);
            out[i] = (v instanceof Number) ? ((Number) v).doubleValue() : 0.0;
        }
        return out;
    }

    private Map<String, Object> llamarDeepSeek(Map<String, Object> compact) throws Exception {
        if (deepseekApiKey == null || deepseekApiKey.isBlank()) {
            // Sin API key, devolvemos un mensaje de aviso
            return Map.of(
                    "diagnostico_corto", "Configura DEEPSEEK_API_KEY para habilitar IA.",
                    "senales", Map.of(),
                    "tips", List.of(
                            "Ve a variables de entorno y agrega DEEPSEEK_API_KEY",
                            "Luego presiona 'Interpretar situación' nuevamente"
                    ),
                    "alerta", false
            );
        }

        String url = deepseekBaseUrl + "/chat/completions";
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(deepseekApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "deepseek-chat");
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content",
                "Eres un analista financiero. Explica en lenguaje simple, directo y accionable. No inventes datos."));
        messages.add(Map.of("role", "user", "content",
                "Analiza estos datos de la empresa (JSON) y devuelve en JSON: {diagnostico_corto, senales:{liquidez,rentabilidad,tendencias}, riesgos_clave:[], tips:[], alerta:boolean}. Datos: " + mapper.writeValueAsString(compact)));
        body.put("messages", messages);
        body.put("temperature", 0.4);
        body.put("max_tokens", 700);

        String req = mapper.writeValueAsString(body);
        ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(req, headers), String.class);
        String json = Optional.ofNullable(resp.getBody()).orElse("{}");

        // Parse respuesta tipo OpenAI
        JsonNode root = mapper.readTree(json);
        String content = Optional.ofNullable(root.path("choices").get(0)).map(n -> n.path("message").path("content").asText()).orElse("");

        // Intentar parsear contenido a JSON; si falla, devolver texto crudo
        try {
            return mapper.readValue(content, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){});
        } catch (Exception ex) {
            return Map.of("diagnostico_corto", content, "senales", Map.of(), "tips", List.of(), "alerta", false);
        }
    }
}

