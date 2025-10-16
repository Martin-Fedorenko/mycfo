package reporte.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import reporte.dtos.DetalleCategoriaDTO;
import reporte.dtos.ProfitAndLossDTO;
import reporte.dtos.ProfitAndLossDTO.DocumentoComercialDTO;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProfitAndLossService {

    @Value("${mycfo.registro.url}")
    private String registroUrl; // Ej: http://localhost:8086

    private final RestTemplate restTemplate = new RestTemplate();

    public ProfitAndLossDTO obtenerFacturasPorAnio(int anio) {
        String url = registroUrl + "/documentos-comerciales";

        DocumentoComercialDTO[] documentos;
        try {
            documentos = restTemplate.getForObject(url, DocumentoComercialDTO[].class);
        } catch (Exception e) {
            System.err.println("❌ Error al consultar el servicio Registro: " + e.getMessage());
            return new ProfitAndLossDTO(anio, List.of(), new double[12], new double[12], 0.0, new ArrayList<>(), new ArrayList<>());
        }

        if (documentos == null) {
            System.out.println("⚠️ No se recibieron documentos desde el servicio Registro");
            return new ProfitAndLossDTO(anio, List.of(), new double[12], new double[12], 0.0, new ArrayList<>(), new ArrayList<>());
        }

        List<DocumentoComercialDTO> filtrados = Arrays.stream(documentos)
                .filter(d -> d.getFechaEmision() != null && d.getFechaEmision().getYear() == anio)
                .collect(Collectors.toList());

        double[] ingresosMensuales = new double[12];
        double[] egresosMensuales = new double[12];

        Map<String, Double> ingresosPorCategoria = new HashMap<>();
        Map<String, Double> egresosPorCategoria = new HashMap<>();

        for (DocumentoComercialDTO doc : filtrados) {
            int mes = doc.getFechaEmision().getMonthValue() - 1;
            double monto = Optional.ofNullable(doc.getMontoTotal()).orElse(0.0);
            String categoria = Optional.ofNullable(doc.getCategoria()).orElse("Sin Categoría");

            if ("Ventas".equalsIgnoreCase(categoria)) {
                ingresosMensuales[mes] += monto;
                ingresosPorCategoria.put(categoria, ingresosPorCategoria.getOrDefault(categoria, 0.0) + monto);
            } else {
                egresosMensuales[mes] += monto;
                egresosPorCategoria.put(categoria, egresosPorCategoria.getOrDefault(categoria, 0.0) + monto);
            }
        }

        // Convertir los mapas a la lista de objetos DetalleCategoriaDTO correcta
        List<DetalleCategoriaDTO> detalleIngresosList = ingresosPorCategoria.entrySet().stream()
                .map(entry -> new DetalleCategoriaDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        List<DetalleCategoriaDTO> detalleEgresosList = egresosPorCategoria.entrySet().stream()
                .map(entry -> new DetalleCategoriaDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        double totalIngresos = Arrays.stream(ingresosMensuales).sum();
        double totalEgresos = Arrays.stream(egresosMensuales).sum();
        double resultadoAnual = totalIngresos - totalEgresos;

        return new ProfitAndLossDTO(anio, filtrados, ingresosMensuales, egresosMensuales, resultadoAnual, detalleIngresosList, detalleEgresosList);
    }
}
