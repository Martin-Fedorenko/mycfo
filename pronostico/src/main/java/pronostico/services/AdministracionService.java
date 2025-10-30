package pronostico.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * Servicio para comunicarse con el microservicio de Administracion.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdministracionService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${mycfo.administracion.url}")
    private String administracionUrl;

    /**
     * Obtiene el ID de empresa (organizacion) de un usuario por su sub de Cognito.
     *
     * @param usuarioSub Sub del usuario en Cognito.
     * @return ID de la empresa del usuario.
     * @throws RuntimeException si el usuario no existe o no tiene empresa asociada.
     */
    public Long obtenerEmpresaIdPorUsuarioSub(String usuarioSub) {
        try {
            String url = administracionUrl + "/api/empresas/usuario/" + usuarioSub + "/id";
            log.info("Consultando Administracion para obtener empresa del usuario: {}", usuarioSub);
            log.debug("URL: {}", url);

            Long empresaId = restTemplate.getForObject(url, Long.class);

            if (empresaId == null) {
                throw new RuntimeException("El usuario no tiene empresa asociada");
            }

            log.info("Empresa ID obtenida: {} para usuario: {}", empresaId, usuarioSub);
            return empresaId;

        } catch (HttpClientErrorException.NotFound e) {
            log.error("Usuario no encontrado o sin empresa: {}", usuarioSub);
            throw new RuntimeException("Usuario no encontrado o sin empresa asociada: " + usuarioSub);
        } catch (Exception e) {
            log.error("Error al obtener empresa del usuario {}: {}", usuarioSub, e.getMessage());
            throw new RuntimeException("Error al comunicarse con el servicio de administracion", e);
        }
    }
}
