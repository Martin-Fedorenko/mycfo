package registro.movimientosexcel.services;

import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import registro.movimientosexcel.dtos.FilaConErrorDTO;
import registro.movimientosexcel.dtos.ResumenCargaDTO;
import registro.cargarDatos.models.Registro;
import registro.cargarDatos.models.TipoMedioPago;
import registro.cargarDatos.models.TipoMoneda;
import registro.cargarDatos.models.TipoRegistro;
import registro.cargarDatos.repositories.RegistroRepository;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ExcelImportService {

    @Autowired
    private RegistroRepository registroRepository;

    @Autowired
    private NotificationsEventPublisher notifications;

    public ResumenCargaDTO procesarArchivo(MultipartFile file, String tipoOrigen) {
        switch (tipoOrigen.toLowerCase()) {
            case "mycfo": return procesarGenerico(file);
            case "mercado-pago": return procesarMercadoPago(file);
            case "santander": return procesarSantander(file);
            default: throw new IllegalArgumentException("Tipo de origen no soportado: " + tipoOrigen);
        }
    }

    /** Carga genérica de registros desde MyCFO */
    private ResumenCargaDTO procesarGenerico(MultipartFile file) {
        int total = 0;
        int correctos = 0;
        List<FilaConErrorDTO> errores = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet hoja = workbook.getSheetAt(0);

            for (int i = 1; i <= hoja.getLastRowNum(); i++) {
                Row fila = hoja.getRow(i);
                total++;

                try {
                    Cell fecha = fila.getCell(1);
                    Cell descripcion = fila.getCell(2);
                    Cell monto = fila.getCell(3);
                    Cell medioPago = fila.getCell(4);

                    if (fecha == null || descripcion == null || monto == null || medioPago == null) {
                        throw new RuntimeException("Faltan datos");
                    }

                    LocalDate fechaLocal;
                    if (fecha.getCellType() == CellType.STRING) {
                        fechaLocal = LocalDate.parse(fecha.getStringCellValue(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                    } else if (fecha.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(fecha)) {
                        fechaLocal = fecha.getLocalDateTimeCellValue().toLocalDate();
                    } else {
                        throw new RuntimeException("Formato de fecha inválido en fila " + (i + 1));
                    }

                    String descripcionStr = descripcion.getCellType() == CellType.STRING
                            ? descripcion.getStringCellValue()
                            : String.valueOf(descripcion.getNumericCellValue());

                    Double montoValor = monto.getCellType() == CellType.NUMERIC
                            ? monto.getNumericCellValue()
                            : Double.parseDouble(monto.getStringCellValue());

                    String medioPagoStr = medioPago.getCellType() == CellType.STRING
                            ? medioPago.getStringCellValue()
                            : String.valueOf(medioPago.getNumericCellValue());

                    Registro reg = new Registro();
                    reg.setTipo(TipoRegistro.Ingreso);
                    reg.setMontoTotal(montoValor);
                    reg.setFechaEmision(fechaLocal);
                    reg.setDescripcion(descripcionStr);
                    reg.setMedioPago(parseMedioPago(medioPagoStr));
                    reg.setMoneda(TipoMoneda.ARS);
                    reg.setOrigen("MYCFO");
                    reg.setFechaCreacion(LocalDate.now());
                    reg.setFechaActualizacion(LocalDate.now());

                    registroRepository.save(reg);
                    correctos++;

                } catch (Exception e) {
                    errores.add(new FilaConErrorDTO(i + 1, e.getMessage()));
                }
            }

        } catch (Exception e) {
            errores.add(new FilaConErrorDTO(0, "Error al leer el archivo: " + e.getMessage()));
        }

        return new ResumenCargaDTO(total, correctos, errores);
    }

    private static final int HEADER_ROW_INDEX = 3;

    /** Carga de registros desde un archivo de Mercado Pago (sin id de referencia) */
    private ResumenCargaDTO procesarMercadoPago(MultipartFile file) {
        int total = 0;
        int correctos = 0;
        List<FilaConErrorDTO> errores = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet hoja = workbook.getSheetAt(0);
            DataFormatter fmt = new DataFormatter();

            Row header = hoja.getRow(HEADER_ROW_INDEX);
            if (header == null) {
                errores.add(new FilaConErrorDTO(0, "No existe la fila de encabezados en el índice " + HEADER_ROW_INDEX));
                return new ResumenCargaDTO(total, correctos, errores);
            }

            Map<String, Integer> idx = new HashMap<>();
            for (int c = 0; c < header.getLastCellNum(); c++) {
                String v = fmt.formatCellValue(header.getCell(c)).trim().toUpperCase(Locale.ROOT);
                if (v.equals("RELEASE_DATE")) idx.put("FECHA", c);
                else if (v.equals("TRANSACTION_TYPE")) idx.put("TIPO", c);
                else if (v.equals("TRANSACTION_NET_AMOUNT")) idx.put("MONTO", c);
            }

            if (idx.size() < 3) {
                errores.add(new FilaConErrorDTO(0,
                        "Faltan columnas esperadas (RELEASE_DATE, TRANSACTION_TYPE, TRANSACTION_NET_AMOUNT)."));
                return new ResumenCargaDTO(total, correctos, errores);
            }

            for (int i = HEADER_ROW_INDEX + 1; i <= hoja.getLastRowNum(); i++) {
                Row fila = hoja.getRow(i);
                if (fila == null) continue;

                try {
                    String rawFecha = fmt.formatCellValue(fila.getCell(idx.get("FECHA"))).trim();
                    String rawTipo  = fmt.formatCellValue(fila.getCell(idx.get("TIPO"))).trim();
                    String rawMonto = fmt.formatCellValue(fila.getCell(idx.get("MONTO"))).trim();

                    if (rawFecha.isEmpty() && rawTipo.isEmpty() && rawMonto.isEmpty()) continue;

                    total++;

                    if (rawFecha.isEmpty() || rawMonto.isEmpty()) {
                        throw new RuntimeException("Faltan datos obligatorios (RELEASE_DATE o TRANSACTION_NET_AMOUNT).");
                    }

                    LocalDate fechaLocal = parseFechaMercadoPago(fila.getCell(idx.get("FECHA")));
                    Double montoValor = parseMontoEsAr(rawMonto);

                    Registro reg = new Registro();
                    reg.setTipo(TipoRegistro.Ingreso);
                    reg.setMontoTotal(montoValor);
                    reg.setFechaEmision(fechaLocal);
                    reg.setDescripcion(rawTipo);
                    reg.setMedioPago(parseMedioPago("Mercado Pago"));
                    reg.setMoneda(TipoMoneda.ARS);
                    reg.setOrigen("MERCADO_PAGO");
                    reg.setFechaCreacion(LocalDate.now());
                    reg.setFechaActualizacion(LocalDate.now());

                    registroRepository.save(reg);
                    correctos++;
                    notifications.publishMovement(reg, 1L);

                } catch (Exception ex) {
                    errores.add(new FilaConErrorDTO(i + 1, ex.getMessage()));
                }
            }

        } catch (Exception e) {
            errores.add(new FilaConErrorDTO(0, "Error al leer el archivo: " + e.getMessage()));
        }

        return new ResumenCargaDTO(total, correctos, errores);
    }

    private LocalDate parseFechaMercadoPago(Cell cFecha) {
        if (cFecha == null) throw new RuntimeException("Fecha vacía.");
        if (cFecha.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cFecha)) {
            return cFecha.getLocalDateTimeCellValue().toLocalDate();
        }
        String raw = new DataFormatter().formatCellValue(cFecha).trim();
        DateTimeFormatter f1 = DateTimeFormatter.ofPattern("dd-MM-uuuu");
        DateTimeFormatter f2 = DateTimeFormatter.ofPattern("uuuu-MM-dd");
        try { return LocalDate.parse(raw, f1); } catch (Exception ignore) {}
        try { return LocalDate.parse(raw, f2); } catch (Exception ignore) {}
        throw new RuntimeException("Formato de fecha inválido: " + raw);
    }

    private Double parseMontoEsAr(String raw) {
        if (raw == null) throw new RuntimeException("Monto vacío.");
        String s = raw.replace(".", "").replace(",", ".").replace("$", "").replaceAll("\\s+", "");
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Monto inválido: " + raw);
        }
    }
    private TipoMedioPago parseMedioPago(String raw) {
        if (raw == null) return null;
        String val = raw.toUpperCase(Locale.ROOT);
        // Ajustar los mapeos según tus enums reales
        if (val.contains("EFECTIVO")) return TipoMedioPago.Efectivo;
        if (val.contains("TRANSF")) return TipoMedioPago.Transferencia;
        if (val.contains("TARJ")) return TipoMedioPago.Tarjeta;
        if (val.contains("MERCADO PAGO")) return TipoMedioPago.MercadoPago;
        return TipoMedioPago.Otro;
    }

    private ResumenCargaDTO procesarSantander(MultipartFile file) {
        // TODO: lógica específica para Santander
        return new ResumenCargaDTO(0, 0, new ArrayList<>());
    }
}
