package administracion.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import administracion.dtos.EmpresaDTO;
import administracion.models.Empresa;
import administracion.repositories.EmpresaRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaDTO obtenerEmpresa(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        return convertirADTO(empresa);
    }

    public EmpresaDTO crearEmpresa(EmpresaDTO empresaDTO) {
        Empresa empresa = new Empresa();
        empresa.setNombre(empresaDTO.getNombre());
        empresa.setDescripcion(empresaDTO.getDescripcion());
        empresa.setCuit(empresaDTO.getCuit());
        empresa.setCondicionIVA(empresaDTO.getCondicionIVA());
        empresa.setDomicilio(empresaDTO.getDomicilio());
        
        Empresa guardada = empresaRepository.save(empresa);
        return convertirADTO(guardada);
    }

    public EmpresaDTO actualizarEmpresa(Long id, EmpresaDTO empresaDTO) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        
        empresa.setNombre(empresaDTO.getNombre());
        empresa.setDescripcion(empresaDTO.getDescripcion());
        empresa.setCuit(empresaDTO.getCuit());
        empresa.setCondicionIVA(empresaDTO.getCondicionIVA());
        empresa.setDomicilio(empresaDTO.getDomicilio());
        
        Empresa actualizada = empresaRepository.save(empresa);
        return convertirADTO(actualizada);
    }

    public List<EmpresaDTO> listarEmpresas() {
        return empresaRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    private EmpresaDTO convertirADTO(Empresa empresa) {
        EmpresaDTO dto = new EmpresaDTO();
        dto.setId(empresa.getId());
        dto.setNombre(empresa.getNombre());
        dto.setDescripcion(empresa.getDescripcion());
        dto.setCuit(empresa.getCuit());
        dto.setCondicionIVA(empresa.getCondicionIVA());
        dto.setDomicilio(empresa.getDomicilio());
        return dto;
    }
}
