package consolidacion.movimientosexcel.controllers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/consolidacion")
    public String hello() {
        return "Hola desde consolidacion";
    }
}
