package administracion.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import administracion.dtos.ActualizarUsuarioDTO;
import administracion.dtos.UsuarioDTO;
import administracion.models.Empresa;
import administracion.models.Rol;
import administracion.models.Usuario;
import administracion.repositories.EmpresaRepository;
import administracion.repositories.UsuarioRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final CognitoService cognitoService;

    public UsuarioDTO obtenerUsuarioPorSub(String sub) {
        Usuario usuario = usuarioRepository.findBySub(sub)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertirADTO(usuario);
    }

    public UsuarioDTO obtenerUsuarioPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertirADTO(usuario);
    }

    /**
     * Verifica si un usuario tiene perfil completo en la BD
     */
    public boolean tienePerfilCompleto(String sub) {
        return usuarioRepository.findBySub(sub).isPresent();
    }

    /**
     * Verifica si un email ya está registrado en la BD
     */
    public boolean existeEmailEnBD(String email) {
        return usuarioRepository.findByEmail(email).isPresent();
    }

    public List<UsuarioDTO> obtenerEmpleadosPorEmpresa(Long empresaId) {
        List<Usuario> usuarios = usuarioRepository.findByEmpresaId(empresaId);
        return usuarios.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioDTO crearOActualizarUsuario(UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findBySub(usuarioDTO.getSub())
                .orElse(new Usuario());
        
        usuario.setSub(usuarioDTO.getSub());
        usuario.setNombre(usuarioDTO.getNombre());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setTelefono(usuarioDTO.getTelefono());
        usuario.setRol(usuarioDTO.getRol() != null ? usuarioDTO.getRol() : Rol.NORMAL);
        usuario.setActivo(true);

        if (usuarioDTO.getEmpresaId() != null) {
            Empresa empresa = empresaRepository.findById(usuarioDTO.getEmpresaId())
                    .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
            usuario.setEmpresa(empresa);
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return convertirADTO(guardado);
    }

    @Transactional
    public UsuarioDTO actualizarPerfil(String sub, ActualizarUsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findBySub(sub)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefono(dto.getTelefono());

        if (dto.getEmpresaId() != null) {
            Empresa empresa = empresaRepository.findById(dto.getEmpresaId())
                    .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
            usuario.setEmpresa(empresa);
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        cognitoService.actualizarUsuarioEnCognito(sub, dto.getNombre(), dto.getEmail(), dto.getTelefono());

        return convertirADTO(actualizado);
    }

    @Transactional
    public UsuarioDTO actualizarEmpleado(String subEmpleado, ActualizarUsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findBySub(subEmpleado)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefono(dto.getTelefono());
        
        if (dto.getRol() != null) {
            usuario.setRol(dto.getRol());
        }

        if (dto.getEmpresaId() != null) {
            Empresa empresa = empresaRepository.findById(dto.getEmpresaId())
                    .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
            usuario.setEmpresa(empresa);
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        cognitoService.actualizarUsuarioEnCognito(subEmpleado, dto.getNombre(), dto.getEmail(), dto.getTelefono());

        return convertirADTO(actualizado);
    }

    @Transactional
    public void eliminarEmpleado(String subEmpleado) {
        Usuario usuario = usuarioRepository.findBySub(subEmpleado)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuarioRepository.delete(usuario);
        cognitoService.eliminarUsuarioEnCognito(subEmpleado);
    }

    @Transactional
    public UsuarioDTO desactivarEmpleado(String subEmpleado) {
        Usuario usuario = usuarioRepository.findBySub(subEmpleado)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setActivo(false);
        Usuario actualizado = usuarioRepository.save(usuario);
        cognitoService.desactivarUsuarioEnCognito(subEmpleado);

        return convertirADTO(actualizado);
    }

    @Transactional
    public UsuarioDTO activarEmpleado(String subEmpleado) {
        Usuario usuario = usuarioRepository.findBySub(subEmpleado)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setActivo(true);
        Usuario actualizado = usuarioRepository.save(usuario);
        cognitoService.activarUsuarioEnCognito(subEmpleado);

        return convertirADTO(actualizado);
    }

    private UsuarioDTO convertirADTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setSub(usuario.getSub());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setTelefono(usuario.getTelefono());
        dto.setRol(usuario.getRol());
        dto.setActivo(usuario.getActivo());
        
        if (usuario.getEmpresa() != null) {
            dto.setEmpresaId(usuario.getEmpresa().getId());
            dto.setEmpresaNombre(usuario.getEmpresa().getNombre());
        }
        
        return dto;
    }
}
