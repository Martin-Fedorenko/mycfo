package registro.cargarDatos.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import registro.cargarDatos.models.EstadoDocumentoComercial;
import registro.cargarDatos.models.EstadoPago;
import registro.cargarDatos.models.Factura;
import registro.cargarDatos.repositories.FacturaRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final EmpresaDataService empresaDataService;

    public Factura guardarFactura(Factura factura) {
        // Cargar datos de la empresa automáticamente si hay usuarioId
        if (factura.getUsuarioId() != null && !factura.getUsuarioId().isEmpty()) {
            empresaDataService.cargarDatosEmpresaEnFactura(factura, factura.getUsuarioId());
        }
        
        // Setear estado de documento comercial inicial
        if (factura.getEstadoDocumentoComercial() == null) {
            factura.setEstadoDocumentoComercial(EstadoDocumentoComercial.PagoPendiente);
        }
        
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
