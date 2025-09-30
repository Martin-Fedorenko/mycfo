package reporte.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import reporte.dtos.DetalleCategoriaDTO;
import reporte.dtos.RegistroDTO;
import reporte.dtos.ResumenMensualDTO;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumenService {

    @Value("${mycfo.registro.url}")
    private String registroUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public ResumenMensualDTO obtenerResumenMensual(int anio, int mes, List<String> categoriasFiltro) {
        String url = registroUrl + "/registros";
        RegistroDTO[] registros = restTemplate.getForObject(url, RegistroDTO[].class);

        if (registros == null) return new ResumenMensualDTO(0, 0, 0, List.of(), List.of());

        // Filtrar por mes/año
        List<RegistroDTO> filtrados = Arrays.stream(registros)
                .filter(r -> r.getFechaEmision() != null
                        && r.getFechaEmision().getYear() == anio
                        && r.getFechaEmision().getMonthValue() == mes)
                .toList();

        // Filtro por categorías (OR inclusivo)
        if (categoriasFiltro != null && !categoriasFiltro.isEmpty()) {
            Set<String> filtrosNorm = categoriasFiltro.stream()
                    .map(this::normalize)
                    .filter(s -> !s.isBlank())
                    .collect(Collectors.toSet());

            if (!filtrosNorm.isEmpty()) {
                filtrados = filtrados.stream()
                        .filter(r -> {
                            String cat = r.getCategoria();
                            if (cat == null) return false;
                            return filtrosNorm.contains(normalize(cat));
                        })
                        .toList();
            }
        }

        // Separar ingresos y egresos
        List<RegistroDTO> ingresos = filtrados.stream()
                .filter(r -> "Ingreso".equalsIgnoreCase(r.getTipo()))
                .toList();

        List<RegistroDTO> egresos = filtrados.stream()
                .filter(r -> "Egreso".equalsIgnoreCase(r.getTipo()))
                .toList();

        // Calcular totales
        double totalIngresos = ingresos.stream().mapToDouble(RegistroDTO::getMontoTotal).sum();
        double totalEgresos = egresos.stream().mapToDouble(RegistroDTO::getMontoTotal).sum();
        double balance = totalIngresos - totalEgresos;

        // Agrupar por categoría
        List<DetalleCategoriaDTO> detalleIngresos = ingresos.stream()
                .collect(Collectors.groupingBy(RegistroDTO::getCategoria,
                        Collectors.summingDouble(RegistroDTO::getMontoTotal)))
                .entrySet().stream()
                .map(e -> new DetalleCategoriaDTO(e.getKey(), e.getValue()))
                .toList();

        List<DetalleCategoriaDTO> detalleEgresos = egresos.stream()
                .collect(Collectors.groupingBy(RegistroDTO::getCategoria,
                        Collectors.summingDouble(RegistroDTO::getMontoTotal)))
                .entrySet().stream()
                .map(e -> new DetalleCategoriaDTO(e.getKey(), e.getValue()))
                .toList();

        return new ResumenMensualDTO(totalIngresos, totalEgresos, balance, detalleIngresos, detalleEgresos);
    }

    private String normalize(String input) {
        if (input == null) return "";
        String lower = input.trim().toLowerCase(Locale.ROOT);
        String normalized = Normalizer.normalize(lower, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", ""); // quita tildes
    }
}
