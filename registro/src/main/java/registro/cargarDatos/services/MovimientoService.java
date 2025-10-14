package registro.cargarDatos.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import registro.cargarDatos.models.EstadoMovimiento;
import registro.cargarDatos.models.Movimiento;
import registro.cargarDatos.models.TipoMovimiento;
import registro.cargarDatos.repositories.MovimientoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;

    /**
     * Guarda un nuevo movimiento estableciendo el estado según el tipo
     */
    public Movimiento guardarMovimiento(Movimiento movimiento) {
        movimiento.setFechaCreacion(LocalDate.now());
        
        // Establecer estado automáticamente según el tipo si no está definido
        if (movimiento.getEstado() == null) {
            establecerEstadoPorDefecto(movimiento);
        }
        
        return movimientoRepository.save(movimiento);
    }

    /**
     * Establece el estado por defecto según el tipo de movimiento
     */
    private void establecerEstadoPorDefecto(Movimiento movimiento) {
        if (movimiento.getTipo() == null) {
            movimiento.setEstado(EstadoMovimiento.PENDIENTE);
            return;
        }
        
        switch (movimiento.getTipo()) {
            case Ingreso:
                movimiento.setEstado(EstadoMovimiento.COBRADO);
                break;
            case Egreso:
                movimiento.setEstado(EstadoMovimiento.PAGADO);
                break;
            case Deuda:
            case Acreencia:
                movimiento.setEstado(EstadoMovimiento.PENDIENTE);
                break;
            default:
                movimiento.setEstado(EstadoMovimiento.PENDIENTE);
        }
    }

    /**
     * Lista todos los movimientos
     */
    public List<Movimiento> listarMovimientos() {
        return movimientoRepository.findAll();
    }

    /**
     * Lista movimientos por organización
     */
    public List<Movimiento> listarPorOrganizacion(Long organizacionId) {
        return movimientoRepository.findByOrganizacionId(organizacionId);
    }

    /**
     * Lista movimientos por tipo
     */
    public List<Movimiento> listarPorTipo(TipoMovimiento tipo) {
        return movimientoRepository.findByTipo(tipo);
    }

    /**
     * Lista movimientos por tipo y organización
     */
    public List<Movimiento> listarPorTipoYOrganizacion(TipoMovimiento tipo, Long organizacionId) {
        return movimientoRepository.findByTipoAndOrganizacionId(tipo, organizacionId);
    }

    /**
     * Obtiene un movimiento por ID
     */
    public Movimiento obtenerMovimiento(Long id) {
        return movimientoRepository.findById(id).orElse(null);
    }

    /**
     * Actualiza un movimiento existente
     */
    @Transactional
    public Movimiento actualizarMovimiento(Long id, Movimiento datosActualizados) {
        Optional<Movimiento> optional = movimientoRepository.findById(id);

        if (optional.isEmpty()) {
            throw new RuntimeException("Movimiento no encontrado con id " + id);
        }

        Movimiento movimiento = optional.get();

        // Copiar campos actualizables comunes
        movimiento.setTipo(datosActualizados.getTipo());
        movimiento.setCategoria(datosActualizados.getCategoria());
        movimiento.setMedioPago(datosActualizados.getMedioPago());
        movimiento.setMontoTotal(datosActualizados.getMontoTotal());
        movimiento.setFechaEmision(datosActualizados.getFechaEmision());
        movimiento.setOrigenNombre(datosActualizados.getOrigenNombre());
        movimiento.setOrigenCuit(datosActualizados.getOrigenCuit());
        movimiento.setDestinoNombre(datosActualizados.getDestinoNombre());
        movimiento.setDestinoCuit(datosActualizados.getDestinoCuit());
        movimiento.setDescripcion(datosActualizados.getDescripcion());
        movimiento.setMoneda(datosActualizados.getMoneda());
        movimiento.setEstado(datosActualizados.getEstado());

        // Campos específicos de Deuda/Acreencia
        movimiento.setFechaVencimiento(datosActualizados.getFechaVencimiento());
        movimiento.setMontoPagado(datosActualizados.getMontoPagado());
        movimiento.setCantidadCuotas(datosActualizados.getCantidadCuotas());
        movimiento.setCuotasPagadas(datosActualizados.getCuotasPagadas());
        movimiento.setTasaInteres(datosActualizados.getTasaInteres());
        movimiento.setMontoCuota(datosActualizados.getMontoCuota());
        movimiento.setPeriodicidad(datosActualizados.getPeriodicidad());

        movimiento.setFechaActualizacion(LocalDate.now());

        return movimientoRepository.save(movimiento);
    }

    /**
     * Elimina un movimiento
     */
    public void eliminarMovimiento(Long id) {
        movimientoRepository.deleteById(id);
    }
}

