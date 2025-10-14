package registro.cargarDatos.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import registro.cargarDatos.dtos.CargaDatosResponse;
import registro.cargarDatos.models.*;
import registro.cargarDatos.services.*;
import registro.movimientosexcel.dtos.PreviewDataDTO;
import registro.movimientosexcel.dtos.ResumenCargaDTO;
import registro.movimientosexcel.services.ExcelImportService;

import java.util.Map;

/**
 * Controlador unificado para la carga de datos
 * Maneja facturas, recibos, pagarés y movimientos
 * Soporta múltiples métodos: formulario, excel, voz, audio
 */
@RestController
@RequestMapping("/api/carga-datos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CargaDatosController {

    private final FacturaService facturaService;
    private final MovimientoService movimientoService;
    private final ExcelImportService excelImportService;
    private final ObjectMapper objectMapper;

    /**
     * Endpoint unificado para cargar datos mediante formulario, voz o audio
     * POST /api/carga-datos
     */
    @PostMapping
    public ResponseEntity<CargaDatosResponse> cargarDatos(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-Usuario-Sub", required = false) String usuarioSub,
            @RequestHeader(value = "X-Organizacion-Id", required = false) String organizacionId) {
        
        try {
            String tipo = (String) payload.get("tipo");
            String metodo = (String) payload.get("metodo");
            @SuppressWarnings("unchecked")
            Map<String, Object> datos = (Map<String, Object>) payload.get("datos");
            
            // Establecer usuario y organización
            if (usuarioSub != null && datos != null) {
                datos.put("usuarioId", usuarioSub);
            }
            if (organizacionId != null && datos != null) {
                datos.put("organizacionId", Long.parseLong(organizacionId));
            }
            
            Object resultado = null;
            Long id = null;
            
            // Procesar según el tipo de documento/movimiento
            switch (tipo.toLowerCase()) {
                case "factura":
                    Factura factura = objectMapper.convertValue(datos, Factura.class);
                    Factura facturaGuardada = facturaService.guardarFactura(factura);
                    resultado = facturaGuardada;
                    id = facturaGuardada.getIdDocumento();
                    break;
                    
                case "movimiento":
                    Movimiento movimiento = objectMapper.convertValue(datos, Movimiento.class);
                    
                    // Setear el tipo de movimiento si viene en el payload
                    String tipoMovimientoStr = (String) payload.get("tipoMovimiento");
                    if (tipoMovimientoStr != null) {
                        movimiento.setTipo(TipoMovimiento.valueOf(tipoMovimientoStr));
                    }
                    
                    Movimiento movimientoGuardado = movimientoService.guardarMovimiento(movimiento);
                    resultado = movimientoGuardado;
                    id = movimientoGuardado.getId();
                    break;
                    
                default:
                    return ResponseEntity.badRequest().body(
                        new CargaDatosResponse(false, "Tipo de documento no soportado: " + tipo, null, null)
                    );
            }
            
            String mensajeMetodo = metodo != null ? " mediante " + metodo : "";
            return ResponseEntity.ok(
                new CargaDatosResponse(
                    true, 
                    tipo.substring(0, 1).toUpperCase() + tipo.substring(1) + " guardado exitosamente" + mensajeMetodo,
                    id,
                    resultado
                )
            );
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new CargaDatosResponse(false, "Error al procesar la solicitud: " + e.getMessage(), null, null)
            );
        }
    }

    /**
     * Endpoint para cargar datos mediante Excel
     * POST /api/carga-datos/excel/preview
     */
    @PostMapping("/excel/preview")
    public ResponseEntity<PreviewDataDTO> previewExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tipo", required = false, defaultValue = "movimiento") String tipo,
            @RequestParam(value = "tipoOrigen", required = false, defaultValue = "mycfo") String tipoOrigen) {
        
        try {
            PreviewDataDTO resultado = excelImportService.procesarArchivoParaPreview(file, tipoOrigen);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Endpoint para importar Excel directamente
     * POST /api/carga-datos/excel
     */
    @PostMapping("/excel")
    public ResponseEntity<ResumenCargaDTO> importarExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tipo", required = false, defaultValue = "movimiento") String tipo,
            @RequestParam(value = "tipoOrigen", required = false, defaultValue = "mycfo") String tipoOrigen) {
        
        try {
            ResumenCargaDTO resultado = excelImportService.procesarArchivo(file, tipoOrigen);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResumenCargaDTO(0, 0, java.util.List.of())
            );
        }
    }

    /**
     * Endpoint para procesar datos de voz (transcripción)
     * POST /api/carga-datos/voz
     */
    @PostMapping("/voz")
    public ResponseEntity<CargaDatosResponse> procesarVoz(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-Usuario-Sub", required = false) String usuarioSub,
            @RequestHeader(value = "X-Organizacion-Id", required = false) String organizacionId) {
        
        // Similar al método cargarDatos, pero procesando transcripción de voz
        // La transcripción ya viene en el payload como texto procesado
        return cargarDatos(payload, usuarioSub, organizacionId);
    }

    /**
     * Endpoint para procesar archivos de audio
     * POST /api/carga-datos/audio
     */
    @PostMapping("/audio")
    public ResponseEntity<CargaDatosResponse> procesarAudio(
            @RequestParam("file") MultipartFile audioFile,
            @RequestParam("tipo") String tipo,
            @RequestHeader(value = "X-Usuario-Sub", required = false) String usuarioSub,
            @RequestHeader(value = "X-Organizacion-Id", required = false) String organizacionId) {
        
        try {
            // TODO: Implementar servicio de transcripción de audio
            // Por ahora retornamos un mensaje indicando que está en desarrollo
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                new CargaDatosResponse(
                    false, 
                    "La carga mediante audio está en desarrollo. Por favor, use otro método.",
                    null,
                    null
                )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new CargaDatosResponse(false, "Error al procesar audio: " + e.getMessage(), null, null)
            );
        }
    }
}

