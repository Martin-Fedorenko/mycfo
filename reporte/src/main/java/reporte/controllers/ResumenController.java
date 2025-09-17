package reporte.controllers;

import org.springframework.web.bind.annotation.*;
import reporte.dtos.ResumenMensualDTO;
import reporte.services.ResumenService;

import java.util.*;
import java.util.stream.Collectors;

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
            // Soporta: ?categoria=A&categoria=B  y también ?categoria=A,B
            @RequestParam(required = false, name = "categoria") List<String> categoriaParam
    ) {
        List<String> categorias = (categoriaParam == null ? Collections.emptyList() :
                categoriaParam.stream()
                        .filter(Objects::nonNull)
                        .flatMap(s -> Arrays.stream(s.split(","))) // aplana CSV
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .distinct()
                        .collect(Collectors.toList())
        );

        return resumenService.obtenerResumenMensual(anio, mes, categorias);
    }
}
