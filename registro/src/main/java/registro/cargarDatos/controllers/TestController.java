package registro.cargarDatos.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import registro.cargarDatos.services.EmpresaDataService;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestController {

    private final EmpresaDataService empresaDataService;
    private final RestTemplate restTemplate;
    
    @Value("${mycfo.administracion.url:http://localhost:8081}")
    private String administracionUrl;

    @GetMapping("/empresa-data/{usuarioSub}")
    public ResponseEntity<Map<String, Object>> testEmpresaData(@PathVariable String usuarioSub) {
        try {
            // Usar reflexión para acceder al método privado
            java.lang.reflect.Method method = EmpresaDataService.class.getDeclaredMethod("obtenerDatosUsuario", String.class);
            method.setAccessible(true);
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) method.invoke(empresaDataService, usuarioSub);
            
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/llamar-administracion/{usuarioSub}")
    public ResponseEntity<String> testLlamarAdministracion(@PathVariable String usuarioSub) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Usuario-Sub", usuarioSub);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            String url = administracionUrl + "/api/usuarios/perfil";
            System.out.println("Llamando a: " + url);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );
            
            return ResponseEntity.ok("Status: " + response.getStatusCode() + ", Body: " + response.getBody());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/hello-registro")
    public String helloRegistro() {
        return "Hola desde registro - puerto 8086";
    }
}
