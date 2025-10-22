package registro.cargarDatos.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import registro.cargarDatos.models.EstadoMovimiento;
import registro.cargarDatos.models.Movimiento;
import registro.cargarDatos.models.TipoMovimiento;
import registro.cargarDatos.repositories.MovimientoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final EmpresaDataService empresaDataService;
    /**
     * Guarda un nuevo movimiento estableciendo el estado según el tipo
     */
    public Movimiento guardarMovimiento(Movimiento movimiento) {
        movimiento.setFechaCreacion(LocalDate.now());
        
        // Cargar datos de la empresa automáticamente si hay usuarioId
        if (movimiento.getUsuarioId() != null && !movimiento.getUsuarioId().isEmpty()) {
            empresaDataService.cargarDatosEmpresaEnMovimiento(movimiento, movimiento.getUsuarioId());
        }
        
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

    /**
     * Obtiene movimientos con filtros múltiples y paginación
     */
    public Page<Movimiento> obtenerMovimientos(
            Long organizacionId,
            String usuarioId,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            List<TipoMovimiento> tipos,
            Boolean conciliado,
            String nombreRelacionado,
            Pageable pageable
    ) {
        // Obtener todos los movimientos
        List<Movimiento> todos = movimientoRepository.findAll();

        // Aplicar filtros
        List<Movimiento> filtrados = todos.stream()
                .filter(r -> filtrarPorOrganizacion(r, organizacionId))
                .filter(r -> filtrarPorUsuario(r, usuarioId))
                .filter(r -> filtrarPorFecha(r, fechaDesde, fechaHasta))
                .filter(r -> filtrarPorTipo(r, tipos))
                .filter(r -> filtrarPorConciliacion(r, conciliado))
                .filter(r -> filtrarPorNombreRelacionado(r, nombreRelacionado))
                .collect(Collectors.toList());

        // Ordenar según el Pageable (implementación simplificada)
        // En producción, idealmente usar una query nativa con filtros

        // Aplicar paginación manual
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtrados.size());

        List<Movimiento> paginados = start < filtrados.size()
                ? filtrados.subList(start, end)
                : List.of();

        return new PageImpl<>(paginados, pageable, filtrados.size());
    }

    private boolean filtrarPorOrganizacion(Movimiento r, Long organizacionId) {
        if (organizacionId == null) return true;
        return r.getOrganizacionId() != null && r.getOrganizacionId().equals(organizacionId);
    }

    private boolean filtrarPorUsuario(Movimiento r, String usuarioId) {
        if (usuarioId == null || usuarioId.isEmpty()) return true;
        return r.getUsuarioId() != null && r.getUsuarioId().equals(usuarioId);
    }

    private boolean filtrarPorFecha(Movimiento r, LocalDate desde, LocalDate hasta) {
        if (desde == null && hasta == null) return true;
        if (r.getFechaEmision() == null) return false;

        if (desde != null && r.getFechaEmision().isBefore(desde)) return false;
        if (hasta != null && r.getFechaEmision().isAfter(hasta)) return false;

        return true;
    }

    private boolean filtrarPorTipo(Movimiento r, List<TipoMovimiento> tipos) {
        if (tipos == null || tipos.isEmpty()) return true;
        return r.getTipo() != null && tipos.contains(r.getTipo());
    }

    private boolean filtrarPorConciliacion(Movimiento r, Boolean conciliado) {
        if (conciliado == null) return true;
        boolean estaConciliado = r.getDocumentoComercial() != null;
        return estaConciliado == conciliado;
    }

    private boolean filtrarPorNombreRelacionado(Movimiento r, String nombre) {
        if (nombre == null || nombre.isEmpty()) return true;
        String nombreLower = nombre.toLowerCase();

        // Verificar en campos comunes de Movimiento
        if (r.getOrigenNombre() != null && r.getOrigenNombre().toLowerCase().contains(nombreLower)) return true;
        if (r.getOrigenCuit() != null && r.getOrigenCuit().toLowerCase().contains(nombreLower)) return true;
        if (r.getDestinoNombre() != null && r.getDestinoNombre().toLowerCase().contains(nombreLower)) return true;
        if (r.getDestinoCuit() != null && r.getDestinoCuit().toLowerCase().contains(nombreLower)) return true;
        if (r.getDescripcion() != null && r.getDescripcion().toLowerCase().contains(nombreLower)) return true;

        return false;
    }
}

