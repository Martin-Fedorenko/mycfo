package reporte.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import reporte.dtos.RegistroDTO;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CashflowService {

    @Value("${mycfo.registro.url}")
    private String registroUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<RegistroDTO> obtenerRegistrosPorAnio(int anio) {
        String url = registroUrl + "/registros";
        RegistroDTO[] registros = restTemplate.getForObject(url, RegistroDTO[].class);

        if (registros == null) return List.of();

        // Filtrar solo ingresos y egresos válidos para el año
        List<String> mediosValidos = List.of("Efectivo", "Transferencia", "MercadoPago");

        return Arrays.stream(registros)
                .filter(r -> r.getFechaEmision() != null
                        && r.getFechaEmision().getYear() == anio
                        && r.getTipo() != null
                        && ("Ingreso".equalsIgnoreCase(r.getTipo()) || "Egreso".equalsIgnoreCase(r.getTipo()))
                        && r.getMedioPago() != null
                        && mediosValidos.contains(r.getMedioPago()))
                .collect(Collectors.toList());
    }
}
