package reporte.controllers;

import org.springframework.web.bind.annotation.*;
import reporte.dtos.ResumenMensualDTO;
import reporte.services.ResumenService;

import java.util.Optional;

@RestController
@RequestMapping("/resumen")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumenController {

    private final ResumenService resumenService;

    public ResumenController(ResumenService resumenService) {
        this.resumenService = resumenService;
    }

    @GetMapping
    public ResumenMensualDTO obtenerResumen(
            @RequestParam int anio,
            @RequestParam int mes,
            @RequestParam(required = false) String categoria) {
        return resumenService.obtenerResumenMensual(anio, mes, Optional.ofNullable(categoria));
    }
}
