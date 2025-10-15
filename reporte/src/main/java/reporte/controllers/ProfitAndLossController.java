package reporte.controllers;

import org.springframework.web.bind.annotation.*;
import reporte.dtos.ProfitAndLossDTO;
import reporte.services.ProfitAndLossService;

import java.util.List;

@RestController
@RequestMapping("/pyl")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfitAndLossController {

    private final ProfitAndLossService profitAndLossService;

    public ProfitAndLossController(ProfitAndLossService profitAndLossService) {
        this.profitAndLossService = profitAndLossService;
    }

    @GetMapping
    public List<ProfitAndLossDTO> obtenerProfitAndLoss(@RequestParam int anio) {
        return profitAndLossService.obtenerFacturasPorAnio(anio);
    }
}
