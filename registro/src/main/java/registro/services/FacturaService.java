package registro.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import registro.models.Factura;
import registro.repositories.FacturaRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;

    public Factura guardarFactura(Factura factura) {
        // Podés setear valores internos antes de guardar si hace falta
        return facturaRepository.save(factura);
    }

    public List<Factura> listarFacturas() {
        return facturaRepository.findAll();
    }

    public Factura obtenerFactura(Long id) {
        return facturaRepository.findById(id).orElse(null);
    }
}
