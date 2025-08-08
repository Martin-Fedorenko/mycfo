package consolidacion.controllers;

import consolidacion.dtos.ResumenCargaDTO;
import consolidacion.repositories.MovimientoBancarioRepository;
import consolidacion.services.ExcelImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ExcelImportController {

    @Autowired
    private ExcelImportService excelImportService;

    @PostMapping("/importar-excel")
    public ResponseEntity<ResumenCargaDTO> importarExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipoOrigen") String tipoOrigen) {

        ResumenCargaDTO resultado = excelImportService.procesarArchivo(file, tipoOrigen);
        return ResponseEntity.ok(resultado);
    }
}
