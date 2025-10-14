package registro.cargarDatos.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import registro.cargarDatos.models.*;
import registro.cargarDatos.repositories.MovimientoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimientoQueryService {

    private final MovimientoRepository movimientoRepository;

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
