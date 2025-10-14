package registro.cargarDatos.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import registro.cargarDatos.models.EstadoPago;
import registro.cargarDatos.models.Factura;
import registro.cargarDatos.repositories.FacturaRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;

    public Factura guardarFactura(Factura factura) {
        // Setear estado de pago inicial
        if (factura.getEstadoPago() == null) {
            factura.setEstadoPago(EstadoPago.NO_PAGADO);
        }
        return facturaRepository.save(factura);
    }

    public List<Factura> listarFacturas() {
        return facturaRepository.findAll();
    }

    public Factura obtenerFactura(Long id) {
        return facturaRepository.findById(id).orElse(null);
    }
}
