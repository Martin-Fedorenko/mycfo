package registro.movimientosexcel.controllers;

import registro.cargarDatos.models.TipoMovimiento;
import registro.movimientosexcel.dtos.*;
import registro.movimientosexcel.services.CategorySuggestionService;
import registro.movimientosexcel.services.ExcelImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ExcelImportController {

    @Autowired
    private ExcelImportService excelImportService;
    
    @Autowired
    private CategorySuggestionService categorySuggestionService;

    @PostMapping("/importar-excel")
    public ResponseEntity<ResumenCargaDTO> importarExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipoOrigen") String tipoOrigen) {

        ResumenCargaDTO resultado = excelImportService.procesarArchivo(file, tipoOrigen);
        return ResponseEntity.ok(resultado);
    }
    
    @PostMapping("/preview-excel")
    public ResponseEntity<PreviewDataDTO> previewExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipoOrigen") String tipoOrigen) {

        PreviewDataDTO resultado = excelImportService.procesarArchivoParaPreview(file, tipoOrigen);
        return ResponseEntity.ok(resultado);
    }
    
    @PostMapping("/guardar-seleccionados")
    public ResponseEntity<ResumenCargaDTO> guardarSeleccionados(
            @RequestBody SaveSelectedRequestDTO request,
            @RequestHeader("X-User-ID") UUID usuario) {

        ResumenCargaDTO resultado = excelImportService.guardarRegistrosSeleccionados(request, usuario);
        return ResponseEntity.ok(resultado);
    }
    
    @GetMapping("/historial-cargas")
    public ResponseEntity<java.util.List<registro.movimientosexcel.models.ExcelImportHistory>> obtenerHistorialCargas(
            @RequestHeader("X-User-ID") UUID usuario) {
        
        java.util.List<registro.movimientosexcel.models.ExcelImportHistory> historial = 
            excelImportService.obtenerHistorialCargas(usuario);
        return ResponseEntity.ok(historial);
    }
    
    /**
     * Obtiene las categorías disponibles según el tipo de registro
     */
    @GetMapping("/categorias")
    public ResponseEntity<List<String>> obtenerCategorias(
            @RequestParam(required = false) String tipo) {
        
        List<String> categorias;
        if (tipo != null && !tipo.isEmpty()) {
            try {
                TipoMovimiento tipoRegistro = TipoMovimiento.valueOf(tipo);
                categorias = categorySuggestionService.obtenerCategorias(tipoRegistro);
            } catch (IllegalArgumentException e) {
                categorias = categorySuggestionService.obtenerTodasLasCategorias();
            }
        } else {
            categorias = categorySuggestionService.obtenerTodasLasCategorias();
        }
        
        return ResponseEntity.ok(categorias);
    }
}
