package administracion.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import administracion.dtos.EmpresaDTO;
import administracion.services.EmpresaService;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmpresaController {

    private final EmpresaService empresaService;

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> obtenerEmpresa(@PathVariable Long id) {
        EmpresaDTO empresa = empresaService.obtenerEmpresa(id);
        return ResponseEntity.ok(empresa);
    }

    @PostMapping
    public ResponseEntity<EmpresaDTO> crearEmpresa(@RequestBody EmpresaDTO empresaDTO) {
        EmpresaDTO creada = empresaService.crearEmpresa(empresaDTO);
        return ResponseEntity.ok(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> actualizarEmpresa(
            @PathVariable Long id,
            @RequestBody EmpresaDTO empresaDTO) {
        EmpresaDTO actualizada = empresaService.actualizarEmpresa(id, empresaDTO);
        return ResponseEntity.ok(actualizada);
    }

    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> listarEmpresas() {
        List<EmpresaDTO> empresas = empresaService.listarEmpresas();
        return ResponseEntity.ok(empresas);
    }
}
