package registro.cargarDatos.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import registro.cargarDatos.models.EstadoDocumentoComercial;
import registro.cargarDatos.models.EstadoPago;
import registro.cargarDatos.models.Factura;
import registro.cargarDatos.repositories.FacturaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final EmpresaDataService empresaDataService;

    /**
     * Guarda una nueva factura
     */
    @Transactional
    public Factura guardarFactura(Factura factura) {
        // Establecer fecha de creación
        factura.setFechaCreacion(LocalDate.now());
        factura.setFechaActualizacion(LocalDate.now());
        
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

    /**
     * Obtiene una factura por ID
     */
    public Factura obtenerFactura(Long id) {
        return facturaRepository.findById(id).orElse(null);
    }

    /**
     * Lista todas las facturas
     */
    public List<Factura> listarFacturas() {
        return facturaRepository.findAll();
    }

    /**
     * Lista facturas por organización
     */
    public List<Factura> listarPorOrganizacion(Long organizacionId) {
        return facturaRepository.findByOrganizacionId(organizacionId);
    }

    /**
     * Lista facturas por usuario
     */
    public List<Factura> listarPorUsuario(String usuarioId) {
        return facturaRepository.findByUsuarioId(usuarioId);
    }

    /**
     * Busca factura por número de documento
     */
    public List<Factura> buscarPorNumeroDocumento(String numeroDocumento) {
        return facturaRepository.findByNumeroDocumento(numeroDocumento);
    }

    /**
     * Actualiza una factura existente
     */
    @Transactional
    public Factura actualizarFactura(Long id, Factura datosActualizados) {
        Optional<Factura> optional = facturaRepository.findById(id);

        if (optional.isEmpty()) {
            throw new RuntimeException("Factura no encontrada con id " + id);
        }

        Factura factura = optional.get();

        // Actualizar campos comunes de documento comercial
        factura.setNumeroDocumento(datosActualizados.getNumeroDocumento());
        factura.setFechaEmision(datosActualizados.getFechaEmision());
        factura.setMontoTotal(datosActualizados.getMontoTotal());
        factura.setMoneda(datosActualizados.getMoneda());
        factura.setCategoria(datosActualizados.getCategoria());
        factura.setEstadoDocumentoComercial(datosActualizados.getEstadoDocumentoComercial());

        // Actualizar campos específicos de factura
        factura.setTipoFactura(datosActualizados.getTipoFactura());
        factura.setVendedorNombre(datosActualizados.getVendedorNombre());
        factura.setVendedorCuit(datosActualizados.getVendedorCuit());
        factura.setVendedorCondicionIVA(datosActualizados.getVendedorCondicionIVA());
        factura.setVendedorDomicilio(datosActualizados.getVendedorDomicilio());
        factura.setCompradorNombre(datosActualizados.getCompradorNombre());
        factura.setCompradorCuit(datosActualizados.getCompradorCuit());
        factura.setCompradorCondicionIVA(datosActualizados.getCompradorCondicionIVA());
        factura.setCompradorDomicilio(datosActualizados.getCompradorDomicilio());
        factura.setEstadoPago(datosActualizados.getEstadoPago());

        factura.setFechaActualizacion(LocalDate.now());

        return facturaRepository.save(factura);
    }

    /**
     * Elimina una factura
     */
    @Transactional
    public void eliminarFactura(Long id) {
        facturaRepository.deleteById(id);
    }
}
