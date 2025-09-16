package reporte.controllers;

import org.springframework.web.bind.annotation.*;
import reporte.dtos.RegistroDTO;

import java.util.List;

import reporte.services.CashflowService;

@RestController
@RequestMapping("/cashflow")
@CrossOrigin(origins = "http://localhost:3000")
public class CashflowController {

    private final CashflowService cashflowService;

    public CashflowController(CashflowService cashflowService) {
        this.cashflowService = cashflowService;
    }

    @GetMapping
    public List<RegistroDTO> obtenerCashflow(@RequestParam int anio) {
        return cashflowService.obtenerRegistrosPorAnio(anio);
    }
}
