package registro.controllers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/registro")
    public String hello() {
        return "Hola desde registro";
    }
}
