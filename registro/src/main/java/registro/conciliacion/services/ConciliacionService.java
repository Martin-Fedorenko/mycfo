package registro.conciliacion.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import registro.cargarDatos.models.*;
import registro.cargarDatos.repositories.FacturaRepository;
import registro.cargarDatos.repositories.PagareRepository;
import registro.cargarDatos.repositories.ReciboRepository;
import registro.cargarDatos.repositories.RegistroRepository;
import registro.conciliacion.dtos.DocumentoSugeridoDTO;
import registro.conciliacion.dtos.MovimientoDTO;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConciliacionService {

    private final RegistroRepository registroRepository;
    private final FacturaRepository facturaRepository;
    private final PagareRepository pagareRepository;
    private final ReciboRepository reciboRepository;

    /**
     * Obtiene todos los movimientos sin conciliar
     */
    public List<MovimientoDTO> obtenerMovimientosSinConciliar() {
        List<Registro> registros = registroRepository.findAll();
        
        return registros.stream()
                .filter(r -> r.getDocumentoComercial() == null)
                .map(this::convertirAMovimientoDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todos los movimientos (conciliados y sin conciliar)
     */
    public List<MovimientoDTO> obtenerTodosLosMovimientos() {
        List<Registro> registros = registroRepository.findAll();
        
        return registros.stream()
                .map(this::convertirAMovimientoDTO)
                .collect(Collectors.toList());
    }

    /**
     * Sugiere documentos para un movimiento específico usando algoritmo de matching
     */
    public List<DocumentoSugeridoDTO> sugerirDocumentos(Long movimientoId) {
        Registro movimiento = registroRepository.findById(movimientoId)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));

        List<DocumentoSugeridoDTO> sugerencias = new ArrayList<>();

        // Buscar en facturas
        List<Factura> facturas = facturaRepository.findAll();
        for (Factura factura : facturas) {
            int score = calcularScore(movimiento, factura);
            if (score >= 30) { // Solo sugerir si hay al menos 30% de coincidencia
                sugerencias.add(crearSugerenciaDesdeFactura(factura, score));
            }
        }

        // Buscar en pagarés
        List<Pagare> pagares = pagareRepository.findAll();
        for (Pagare pagare : pagares) {
            int score = calcularScore(movimiento, pagare);
            if (score >= 30) {
                sugerencias.add(crearSugerenciaDesdePagare(pagare, score));
            }
        }

        // Buscar en recibos
        List<Recibo> recibos = reciboRepository.findAll();
        for (Recibo recibo : recibos) {
            int score = calcularScore(movimiento, recibo);
            if (score >= 30) {
                sugerencias.add(crearSugerenciaDesdeRecibo(recibo, score));
            }
        }

        // Ordenar por score descendente
        sugerencias.sort(Comparator.comparingInt(DocumentoSugeridoDTO::getScoreCoincidencia).reversed());

        // Limitar a top 10 sugerencias
        return sugerencias.stream().limit(10).collect(Collectors.toList());
    }

    /**
     * Vincula un movimiento con un documento
     */
    @Transactional
    public MovimientoDTO vincularMovimientoConDocumento(Long movimientoId, Long documentoId) {
        Registro movimiento = registroRepository.findById(movimientoId)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));

        // Buscar el documento en todas las tablas
        DocumentoComercial documento = buscarDocumento(documentoId);
        
        if (documento == null) {
            throw new RuntimeException("Documento no encontrado");
        }

        movimiento.setDocumentoComercial(documento);
        Registro guardado = registroRepository.save(movimiento);

        return convertirAMovimientoDTO(guardado);
    }

    /**
     * Desvincula un movimiento de su documento
     */
    @Transactional
    public MovimientoDTO desvincularMovimiento(Long movimientoId) {
        Registro movimiento = registroRepository.findById(movimientoId)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));

        movimiento.setDocumentoComercial(null);
        Registro guardado = registroRepository.save(movimiento);

        return convertirAMovimientoDTO(guardado);
    }

    /**
     * Algoritmo de scoring para calcular coincidencia entre movimiento y documento
     */
    private int calcularScore(Registro movimiento, DocumentoComercial documento) {
        int score = 0;

        // 1. Coincidencia de fecha (40 puntos)
        if (movimiento.getFechaEmision() != null && documento.getFechaEmision() != null) {
            long diferenciaDias = Math.abs(ChronoUnit.DAYS.between(
                    movimiento.getFechaEmision(), documento.getFechaEmision()));
            
            if (diferenciaDias == 0) {
                score += 40;
            } else if (diferenciaDias <= 3) {
                score += 30;
            } else if (diferenciaDias <= 7) {
                score += 15;
            } else if (diferenciaDias <= 15) {
                score += 5;
            }
        }

        // 2. Coincidencia de monto (30 puntos)
        if (movimiento.getMontoTotal() != null && documento.getMontoTotal() != null) {
            double montoMov = Math.abs(movimiento.getMontoTotal());
            double montoDoc = Math.abs(documento.getMontoTotal());
            double diferenciaMonto = Math.abs(montoMov - montoDoc) / montoDoc;
            
            if (diferenciaMonto == 0) {
                score += 30;
            } else if (diferenciaMonto <= 0.01) { // ±1%
                score += 28;
            } else if (diferenciaMonto <= 0.05) { // ±5%
                score += 20;
            } else if (diferenciaMonto <= 0.10) { // ±10%
                score += 10;
            }
        }

        // 3. Coincidencia de origen/destino con nombres en el documento (20 puntos)
        int similitudTexto = calcularSimilitudTexto(movimiento, documento);
        score += similitudTexto;

        // 4. Coincidencia de categoría (10 puntos)
        if (movimiento.getCategoria() != null && documento.getCategoria() != null) {
            if (movimiento.getCategoria().equalsIgnoreCase(documento.getCategoria())) {
                score += 10;
            }
        }

        return score;
    }

    /**
     * Calcula similitud de texto entre movimiento y documento
     */
    private int calcularSimilitudTexto(Registro movimiento, DocumentoComercial documento) {
        int score = 0;

        String origen = movimiento.getOrigen() != null ? movimiento.getOrigen().toLowerCase() : "";
        String destino = movimiento.getDestino() != null ? movimiento.getDestino().toLowerCase() : "";
        String descripcion = movimiento.getDescripcion() != null ? movimiento.getDescripcion().toLowerCase() : "";

        List<String> nombresDocumento = obtenerNombresDelDocumento(documento);

        for (String nombre : nombresDocumento) {
            String nombreLower = nombre.toLowerCase();
            
            // Verificar si el nombre está contenido en origen, destino o descripción
            if (origen.contains(nombreLower) || nombreLower.contains(origen)) {
                score += 7;
            }
            if (destino.contains(nombreLower) || nombreLower.contains(destino)) {
                score += 7;
            }
            if (descripcion.contains(nombreLower) || nombreLower.contains(descripcion)) {
                score += 6;
            }
        }

        return Math.min(score, 20); // Máximo 20 puntos
    }

    /**
     * Obtiene los nombres relacionados de un documento (vendedor, comprador, etc.)
     */
    private List<String> obtenerNombresDelDocumento(DocumentoComercial documento) {
        List<String> nombres = new ArrayList<>();

        if (documento instanceof Factura) {
            Factura factura = (Factura) documento;
            if (factura.getVendedorNombre() != null) nombres.add(factura.getVendedorNombre());
            if (factura.getCompradorNombre() != null) nombres.add(factura.getCompradorNombre());
        } else if (documento instanceof Pagare) {
            Pagare pagare = (Pagare) documento;
            if (pagare.getBeneficiarioNombre() != null) nombres.add(pagare.getBeneficiarioNombre());
            if (pagare.getDeudorNombre() != null) nombres.add(pagare.getDeudorNombre());
        } else if (documento instanceof Recibo) {
            Recibo recibo = (Recibo) documento;
            if (recibo.getReceptorNombre() != null) nombres.add(recibo.getReceptorNombre());
            if (recibo.getEmisorNombre() != null) nombres.add(recibo.getEmisorNombre());
        }

        return nombres;
    }

    /**
     * Busca un documento por ID en todas las tablas
     */
    private DocumentoComercial buscarDocumento(Long documentoId) {
        // Intentar buscar en facturas
        return facturaRepository.findById(documentoId)
                .map(f -> (DocumentoComercial) f)
                .orElseGet(() -> 
                    // Si no es factura, buscar en pagarés
                    pagareRepository.findById(documentoId)
                            .map(p -> (DocumentoComercial) p)
                            .orElseGet(() -> 
                                // Si no es pagaré, buscar en recibos
                                reciboRepository.findById(documentoId)
                                        .map(r -> (DocumentoComercial) r)
                                        .orElse(null)
                            )
                );
    }

    /**
     * Convierte un Registro a MovimientoDTO
     */
    private MovimientoDTO convertirAMovimientoDTO(Registro registro) {
        MovimientoDTO dto = new MovimientoDTO();
        dto.setId(registro.getId());
        dto.setTipo(registro.getTipo());
        dto.setMontoTotal(registro.getMontoTotal());
        dto.setFechaEmision(registro.getFechaEmision());
        dto.setCategoria(registro.getCategoria());
        dto.setOrigen(registro.getOrigen());
        dto.setDestino(registro.getDestino());
        dto.setDescripcion(registro.getDescripcion());
        dto.setMedioPago(registro.getMedioPago());
        dto.setMoneda(registro.getMoneda());

        // Determinar la fuente de origen basado en los datos disponibles
        dto.setFuenteOrigen(determinarFuenteOrigen(registro));

        // Información de conciliación
        if (registro.getDocumentoComercial() != null) {
            dto.setConciliado(true);
            dto.setIdDocumentoConciliado(registro.getDocumentoComercial().getIdDocumento());
            dto.setNumeroDocumentoConciliado(registro.getDocumentoComercial().getNumeroDocumento());
            dto.setTipoDocumentoConciliado(registro.getDocumentoComercial().getTipoDocumento());
        } else {
            dto.setConciliado(false);
        }

        return dto;
    }

    /**
     * Determina la fuente de origen del registro
     */
    private String determinarFuenteOrigen(Registro registro) {
        // Si el origen contiene "MercadoPago" o similar
        if (registro.getOrigen() != null && registro.getOrigen().toLowerCase().contains("mercadopago")) {
            return "MERCADOPAGO";
        }
        
        // Si tiene descripción que indica Excel
        if (registro.getDescripcion() != null && registro.getDescripcion().toLowerCase().contains("excel")) {
            return "EXCEL";
        }
        
        // Por defecto, asumimos que es manual
        return "MANUAL";
    }

    /**
     * Crea un DocumentoSugeridoDTO desde una Factura
     */
    private DocumentoSugeridoDTO crearSugerenciaDesdeFactura(Factura factura, int score) {
        DocumentoSugeridoDTO dto = new DocumentoSugeridoDTO();
        dto.setIdDocumento(factura.getIdDocumento());
        dto.setTipoDocumento("FACTURA");
        dto.setNumeroDocumento(factura.getNumeroDocumento());
        dto.setFechaEmision(factura.getFechaEmision());
        dto.setMontoTotal(factura.getMontoTotal());
        dto.setMoneda(factura.getMoneda());
        dto.setCategoria(factura.getCategoria());
        dto.setNombreRelacionado(factura.getVendedorNombre() != null ? factura.getVendedorNombre() : factura.getCompradorNombre());
        dto.setCuit(factura.getVendedorCuit() != null ? factura.getVendedorCuit() : factura.getCompradorCuit());
        dto.setScoreCoincidencia(score);
        dto.setNivelSugerencia(determinarNivelSugerencia(score));
        dto.setRazonSugerencia(generarRazonSugerencia(score));
        
        return dto;
    }

    /**
     * Crea un DocumentoSugeridoDTO desde un Pagaré
     */
    private DocumentoSugeridoDTO crearSugerenciaDesdePagare(Pagare pagare, int score) {
        DocumentoSugeridoDTO dto = new DocumentoSugeridoDTO();
        dto.setIdDocumento(pagare.getIdDocumento());
        dto.setTipoDocumento("PAGARE");
        dto.setNumeroDocumento(pagare.getNumeroDocumento());
        dto.setFechaEmision(pagare.getFechaEmision());
        dto.setMontoTotal(pagare.getMontoTotal());
        dto.setMoneda(pagare.getMoneda());
        dto.setCategoria(pagare.getCategoria());
        dto.setNombreRelacionado(pagare.getBeneficiarioNombre() != null ? pagare.getBeneficiarioNombre() : pagare.getDeudorNombre());
        dto.setCuit(pagare.getBeneficiarioCuit() != null ? pagare.getBeneficiarioCuit() : pagare.getDeudorCuit());
        dto.setScoreCoincidencia(score);
        dto.setNivelSugerencia(determinarNivelSugerencia(score));
        dto.setRazonSugerencia(generarRazonSugerencia(score));
        
        return dto;
    }

    /**
     * Crea un DocumentoSugeridoDTO desde un Recibo
     */
    private DocumentoSugeridoDTO crearSugerenciaDesdeRecibo(Recibo recibo, int score) {
        DocumentoSugeridoDTO dto = new DocumentoSugeridoDTO();
        dto.setIdDocumento(recibo.getIdDocumento());
        dto.setTipoDocumento("RECIBO");
        dto.setNumeroDocumento(recibo.getNumeroDocumento());
        dto.setFechaEmision(recibo.getFechaEmision());
        dto.setMontoTotal(recibo.getMontoTotal());
        dto.setMoneda(recibo.getMoneda());
        dto.setCategoria(recibo.getCategoria());
        dto.setNombreRelacionado(recibo.getReceptorNombre() != null ? recibo.getReceptorNombre() : recibo.getEmisorNombre());
        dto.setCuit(recibo.getReceptorCuit() != null ? recibo.getReceptorCuit() : recibo.getEmisorCuit());
        dto.setScoreCoincidencia(score);
        dto.setNivelSugerencia(determinarNivelSugerencia(score));
        dto.setRazonSugerencia(generarRazonSugerencia(score));
        
        return dto;
    }

    /**
     * Determina el nivel de sugerencia basado en el score
     */
    private String determinarNivelSugerencia(int score) {
        if (score >= 70) {
            return "ALTA";
        } else if (score >= 50) {
            return "MEDIA";
        } else {
            return "BAJA";
        }
    }

    /**
     * Genera la razón de la sugerencia basada en el score
     */
    private String generarRazonSugerencia(int score) {
        if (score >= 70) {
            return "Coincidencia alta en fecha, monto y origen/destino";
        } else if (score >= 50) {
            return "Coincidencia media en algunos criterios";
        } else {
            return "Coincidencia baja, verificar manualmente";
        }
    }
}

