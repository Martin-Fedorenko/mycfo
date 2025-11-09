package pronostico.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import pronostico.dtos.*;
import pronostico.models.Forecast;
import pronostico.models.ForecastLinea;
import pronostico.repositories.ForecastConfigRepository;
import pronostico.repositories.ForecastLineaRepository;
import pronostico.repositories.ForecastRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastService {

    private final ForecastRepository forecastRepository;
    private final ForecastLineaRepository forecastLineaRepository;
    private final ForecastConfigRepository forecastConfigRepository;
    private final RegistroService registroService;
    private final AdministracionService administracionService;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${mycfo.forecast.url}")
    private String forecastUrl;

    private static final DateTimeFormatter ISO_DATE_TIME = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final DateTimeFormatter YEAR_MONTH = DateTimeFormatter.ofPattern("yyyy-MM");

    /**
     * Genera un nuevo forecast basado en la configuración
     */
    @Transactional
    public ForecastDTO generarForecast(Long forecastConfigId, String creadoPor) {
        var config = forecastConfigRepository.findById(forecastConfigId)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, 
                        "Configuración de forecast no encontrada"));
        
        if (!config.isActivo()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, 
                    "La configuración está inactiva");
        }
        
        // 1. Obtener movimientos históricos mensuales desde Registro
        Map<String, Map<String, List<Map<String, Object>>>> movimientosMensuales = 
                registroService.obtenerMovimientosMensuales(config.getOrganizacionId());
        
        // 2. Procesar y convertir movimientos al formato esperado por el servicio de forecast
        List<Map<String, Object>> dataHistorica = procesarMovimientosParaForecast(movimientosMensuales);
        
        // 3. Llamar al servicio de forecast
        Map<String, Object> responseForecast = llamarServicioForecast(dataHistorica, config.getHorizonteMeses());
        
        // 4. Guardar el forecast en la base de datos (incluyendo datos históricos y pronósticos)
        return guardarForecast(config, responseForecast, creadoPor, dataHistorica.size(), dataHistorica);
    }

    /**
     * Genera un rolling forecast en tiempo real sin guardarlo en base de datos
     * @param usuarioSub Sub del usuario
     * @param horizonteMeses Meses a pronosticar hacia adelante
     * @return Response del servicio de forecast con los resultados
     */
    public Map<String, Object> generarRollingForecast(String usuarioSub, Integer horizonteMeses) {
        // Validar que el usuario tiene empresa asociada
        Long organizacionId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
        
        // Validar horizonte
        if (horizonteMeses == null || horizonteMeses <= 0) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, 
                    "El horizonte debe ser mayor a 0");
        }
        
        log.info("Generando rolling forecast para organización {} con horizonte {} meses", organizacionId, horizonteMeses);
        
        // 1. Obtener movimientos históricos mensuales desde Registro
        Map<String, Map<String, List<Map<String, Object>>>> movimientosMensuales = 
                registroService.obtenerMovimientosMensuales(organizacionId);
        
        // 2. Procesar y convertir movimientos al formato esperado por el servicio de forecast
        List<Map<String, Object>> dataHistorica = procesarMovimientosParaForecast(movimientosMensuales);
        
        // 3. Llamar al servicio de forecast
        Map<String, Object> responseForecast = llamarServicioForecast(dataHistorica, horizonteMeses);
        
        // 4. Combinar datos históricos (real) con estimados
        Map<String, Object> resultadoCombinado = combinarDatosRealesYEstimados(dataHistorica, responseForecast);
        
        log.info("Rolling forecast generado exitosamente para organización {}", organizacionId);
        
        return resultadoCombinado;
    }
    
    /**
     * Combina datos reales históricos con estimados en un formato unificado para el frontend
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> combinarDatosRealesYEstimados(
            List<Map<String, Object>> dataHistorica, 
            Map<String, Object> responseForecast) {
        
        List<Map<String, Object>> datosCombinados = new ArrayList<>();
        
        // Agregar datos históricos como "real"
        for (Map<String, Object> registro : dataHistorica) {
            Map<String, Object> combinado = new HashMap<>();
            combinado.put("año", registro.get("año"));
            combinado.put("mes", registro.get("mes"));
            combinado.put("tipo", "real");
            combinado.put("ingresos", registro.get("ingresos"));
            combinado.put("egresos", registro.get("egresos"));
            combinado.put("balance", ((Number) registro.get("ingresos")).doubleValue() + 
                           ((Number) registro.get("egresos")).doubleValue());
            datosCombinados.add(combinado);
        }
        
        // Agregar datos estimados
        List<Map<String, Object>> forecastMensual = (List<Map<String, Object>>) responseForecast.get("forecast_mensual");
        if (forecastMensual != null) {
            for (Map<String, Object> estimado : forecastMensual) {
                Map<String, Object> combinado = new HashMap<>();
                combinado.put("año", estimado.get("Año"));
                combinado.put("mes", estimado.get("Mes"));
                combinado.put("tipo", "estimado");
                
                Number ingresos = (Number) estimado.get("Ingresos_Esperados");
                Number egresos = (Number) estimado.get("Egresos_Esperados");
                Number balance = (Number) estimado.get("Balance_Neto_Esperado");
                
                combinado.put("ingresos", ingresos.doubleValue());
                combinado.put("egresos", egresos.doubleValue());
                combinado.put("balance", balance.doubleValue());
                datosCombinados.add(combinado);
            }
        }
        
        // Ordenar por año y mes
        datosCombinados.sort((a, b) -> {
            int añoComp = ((Integer) a.get("año")).compareTo((Integer) b.get("año"));
            if (añoComp != 0) return añoComp;
            return ((Integer) a.get("mes")).compareTo((Integer) b.get("mes"));
        });
        
        // Construir respuesta combinada
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("status", "ok");
        resultado.put("datos_combinados", datosCombinados);
        resultado.put("parametros_usados", responseForecast.get("parametros_usados"));
        
        return resultado;
    }

    /**
     * Procesa los movimientos mensuales para el formato del servicio de forecast
     */
    private List<Map<String, Object>> procesarMovimientosParaForecast(
            Map<String, Map<String, List<Map<String, Object>>>> movimientosMensuales) {
        
        List<Map<String, Object>> resultado = new ArrayList<>();
        
        for (Map.Entry<String, Map<String, List<Map<String, Object>>>> entry : movimientosMensuales.entrySet()) {
            String yearMonth = entry.getKey(); // formato: "2023-01"
            String[] parts = yearMonth.split("-");
            int año = Integer.parseInt(parts[0]);
            int mes = Integer.parseInt(parts[1]);
            
            Map<String, List<Map<String, Object>>> porTipo = entry.getValue();
            
            // Calcular totales
            BigDecimal ingresos = BigDecimal.ZERO;
            BigDecimal egresos = BigDecimal.ZERO;
            
            List<Map<String, Object>> ingresosList = porTipo.get("Ingreso");
            if (ingresosList != null) {
                for (Map<String, Object> mov : ingresosList) {
                    Object montoObj = mov.get("montoTotal");
                    if (montoObj != null) {
                        BigDecimal monto = new BigDecimal(montoObj.toString());
                        ingresos = ingresos.add(monto);
                    }
                }
            }
            
            List<Map<String, Object>> egresosList = porTipo.get("Egreso");
            if (egresosList != null) {
                for (Map<String, Object> mov : egresosList) {
                    Object montoObj = mov.get("montoTotal");
                    if (montoObj != null) {
                        BigDecimal monto = new BigDecimal(montoObj.toString());
                        // Los egresos ya vienen negativos
                        egresos = egresos.add(monto);
                    }
                }
            }
            
            Map<String, Object> registro = new HashMap<>();
            registro.put("año", año);
            registro.put("mes", mes);
            registro.put("ingresos", ingresos.doubleValue());
            registro.put("egresos", egresos.doubleValue());
            
            resultado.add(registro);
        }
        
        // Ordenar por año y mes
        resultado.sort((a, b) -> {
            int añoComp = ((Integer) a.get("año")).compareTo((Integer) b.get("año"));
            if (añoComp != 0) return añoComp;
            return ((Integer) a.get("mes")).compareTo((Integer) b.get("mes"));
        });
        
        return resultado;
    }

    /**
     * Llama al servicio externo de forecast
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> llamarServicioForecast(List<Map<String, Object>> dataHistorica, Integer periodosAdelante) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> request = new HashMap<>();
            request.put("data", dataHistorica);
            request.put("periodos_adelante", periodosAdelante);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);
            
            log.info("Llamando al servicio de forecast con {} datos históricos", dataHistorica.size());
            
            ResponseEntity<Map> response = restTemplate.exchange(
                    forecastUrl + "/forecast",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );
            
            log.info("Forecast generado exitosamente");
            return response.getBody();
            
        } catch (Exception e) {
            log.error("Error al llamar al servicio de forecast: {}", e.getMessage());
            throw new RuntimeException("Error al generar el forecast", e);
        }
    }

    /**
     * Guarda el forecast en la base de datos (incluyendo datos históricos como "real" y pronósticos como "estimado")
     */
    @Transactional
    private ForecastDTO guardarForecast(
            pronostico.models.ForecastConfig config,
            Map<String, Object> responseForecast,
            String creadoPor,
            Integer periodosAnalizados,
            List<Map<String, Object>> dataHistorica) {
        
        YearMonth ahora = YearMonth.now();
        YearMonth inicio = ahora.plusMonths(1); // El siguiente mes
        YearMonth fin = ahora.plusMonths(config.getHorizonteMeses());
        
        // Crear forecast
        Forecast forecast = Forecast.builder()
                .organizacionId(config.getOrganizacionId())
                .forecastConfigId(config.getId())
                .nombre("Forecast " + ahora.format(YEAR_MONTH))
                .mesesFrecuencia(config.getMesesFrecuencia())
                .horizonteMeses(config.getHorizonteMeses())
                .periodosAnalizados(periodosAnalizados)
                .mesInicioPronostico(inicio.format(YEAR_MONTH))
                .mesFinPronostico(fin.format(YEAR_MONTH))
                .creadoPor(creadoPor)
                .eliminado(false)
                .build();
        
        forecast = forecastRepository.save(forecast);
        
        // Guardar datos históricos como "real"
        for (Map<String, Object> registroHistorico : dataHistorica) {
            Integer año = (Integer) registroHistorico.get("año");
            Integer mes = (Integer) registroHistorico.get("mes");
            Number ingresos = (Number) registroHistorico.get("ingresos");
            Number egresos = (Number) registroHistorico.get("egresos");
            BigDecimal balance = BigDecimal.valueOf(ingresos.doubleValue() + egresos.doubleValue());
            
            ForecastLinea linea = ForecastLinea.builder()
                    .forecast(forecast)
                    .año(año)
                    .mes(mes)
                    .tipo("real")
                    .ingresosEsperados(new BigDecimal(ingresos.toString()))
                    .egresosEsperados(new BigDecimal(egresos.toString()))
                    .balanceNetoEsperado(balance)
                    .build();
            
            forecastLineaRepository.save(linea);
        }
        
        // Guardar líneas del forecast como "estimado"
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> forecastMensual = (List<Map<String, Object>>) responseForecast.get("forecast_mensual");
        
        if (forecastMensual != null) {
            for (Map<String, Object> lineaData : forecastMensual) {
                ForecastLinea linea = ForecastLinea.builder()
                        .forecast(forecast)
                        .año(((Number) lineaData.get("Año")).intValue())
                        .mes(((Number) lineaData.get("Mes")).intValue())
                        .tipo("estimado")
                        .ingresosEsperados(new BigDecimal(lineaData.get("Ingresos_Esperados").toString()))
                        .egresosEsperados(new BigDecimal(lineaData.get("Egresos_Esperados").toString()))
                        .balanceNetoEsperado(new BigDecimal(lineaData.get("Balance_Neto_Esperado").toString()))
                        .build();
                
                forecastLineaRepository.save(linea);
            }
        }
        
        log.info("Forecast guardado: ID={}, Organización={}, {} líneas reales, {} líneas estimadas", 
                forecast.getId(), forecast.getOrganizacionId(), 
                dataHistorica.size(), 
                forecastMensual != null ? forecastMensual.size() : 0);
        return toDto(forecast);
    }

    /**
     * Obtiene todos los forecasts de una empresa
     */
    public List<ForecastListDTO> listarForecasts(Long organizacionId) {
        List<Forecast> forecasts = forecastRepository.findByOrganizacionIdAndEliminado(organizacionId, false);
        return forecasts.stream()
                .map(this::toListDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un forecast por ID con sus líneas
     */
    public ForecastDTO obtenerForecast(Long id) {
        Forecast forecast = forecastRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, 
                        "Forecast no encontrado"));
        
        List<ForecastLinea> lineas = forecastLineaRepository.findByForecast_Id(id);
        
        ForecastDTO dto = toDto(forecast);
        dto.setLineas(lineas.stream().map(this::toLineaDto).collect(Collectors.toList()));
        
        return dto;
    }

    /**
     * Elimina un forecast (soft delete)
     */
    @Transactional
    public void eliminarForecast(Long id, String usuarioSub) {
        Forecast forecast = forecastRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, 
                        "Forecast no encontrado"));
        
        // Verificar permisos
        Long organizacionId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
        if (!forecast.getOrganizacionId().equals(organizacionId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, 
                    "No tiene permisos para eliminar este forecast");
        }
        
        forecast.setEliminado(true);
        forecast.setEliminadoAt(LocalDateTime.now());
        forecast.setEliminadoPor(usuarioSub);
        forecastRepository.save(forecast);
        
        log.info("Forecast eliminado: ID={}", id);
    }

    /**
     * Convierte entidad a DTO
     */
    private ForecastDTO toDto(Forecast forecast) {
        return ForecastDTO.builder()
                .id(forecast.getId())
                .organizacionId(forecast.getOrganizacionId())
                .forecastConfigId(forecast.getForecastConfigId())
                .nombre(forecast.getNombre())
                .mesesFrecuencia(forecast.getMesesFrecuencia())
                .horizonteMeses(forecast.getHorizonteMeses())
                .periodosAnalizados(forecast.getPeriodosAnalizados())
                .mesInicioPronostico(forecast.getMesInicioPronostico())
                .mesFinPronostico(forecast.getMesFinPronostico())
                .creadoPor(forecast.getCreadoPor())
                .createdAt(forecast.getCreatedAt() != null ? forecast.getCreatedAt().format(ISO_DATE_TIME) : null)
                .eliminado(forecast.isEliminado())
                .build();
    }

    /**
     * Convierte entidad a DTO de lista
     */
    private ForecastListDTO toListDto(Forecast forecast) {
        return ForecastListDTO.builder()
                .id(forecast.getId())
                .nombre(forecast.getNombre())
                .mesesFrecuencia(forecast.getMesesFrecuencia())
                .horizonteMeses(forecast.getHorizonteMeses())
                .createdAt(forecast.getCreatedAt() != null ? forecast.getCreatedAt().format(ISO_DATE_TIME) : null)
                .creadoPor(forecast.getCreadoPor())
                .build();
    }

    /**
     * Convierte entidad ForecastLinea a DTO
     */
    private ForecastLineaDTO toLineaDto(ForecastLinea linea) {
        return ForecastLineaDTO.builder()
                .id(linea.getId())
                .año(linea.getAño())
                .mes(linea.getMes())
                .tipo(linea.getTipo())
                .ingresosEsperados(linea.getIngresosEsperados())
                .egresosEsperados(linea.getEgresosEsperados())
                .balanceNetoEsperado(linea.getBalanceNetoEsperado())
                .build();
    }
}

