package administracion.controllers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/administracion")
    public String hello() {
        return "Hola desde administracion";
    }
}
