package reporte.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import reporte.dtos.ProfitAndLossDTO;
import reporte.dtos.ProfitAndLossDTO.DocumentoComercialDTO;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProfitAndLossService {

    @Value("${mycfo.registro.url}")
    private String registroUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public ProfitAndLossDTO obtenerFacturasPorAnio(int anio) {
        String url = registroUrl + "/documentos"; // endpoint del módulo registro
        DocumentoComercialDTO[] documentos = restTemplate.getForObject(url, DocumentoComercialDTO[].class);

        if (documentos == null) return new ProfitAndLossDTO();

        // Filtrar documentos emitidos ese año (criterio devengado)
        List<DocumentoComercialDTO> filtrados = Arrays.stream(documentos)
                .filter(d -> d.getFechaEmision() != null && d.getFechaEmision().getYear() == anio)
                .collect(Collectors.toList());

        // Inicializar totales
        double[] ingresosMensuales = new double[12];
        double[] egresosMensuales = new double[12];

        for (DocumentoComercialDTO doc : filtrados) {
            int mes = doc.getFechaEmision().getMonthValue() - 1;
            double monto = doc.getMontoTotal() != null ? doc.getMontoTotal() : 0.0;

            if (doc.getTipoDocumento() != null && doc.getTipoDocumento().toLowerCase().contains("venta")) {
                ingresosMensuales[mes] += monto;
            } else if (doc.getTipoDocumento() != null && doc.getTipoDocumento().toLowerCase().contains("compra")) {
                egresosMensuales[mes] += monto;
            }
        }

        double totalIngresos = Arrays.stream(ingresosMensuales).sum();
        double totalEgresos = Arrays.stream(egresosMensuales).sum();
        double resultadoAnual = totalIngresos - totalEgresos;

        return new ProfitAndLossDTO(anio, filtrados, ingresosMensuales, egresosMensuales, resultadoAnual);
    }
}
