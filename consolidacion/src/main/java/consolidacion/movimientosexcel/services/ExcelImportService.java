package consolidacion.movimientosexcel.services;

import consolidacion.movimientosexcel.dtos.FilaConErrorDTO;
import consolidacion.movimientosexcel.dtos.ResumenCargaDTO;
import consolidacion.movimientosexcel.models.MovimientoBancario;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import consolidacion.movimientosexcel.repositories.MovimientoBancarioRepository;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ExcelImportService {

    @Autowired
    private MovimientoBancarioRepository movimientoRepo;

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

    private ResumenCargaDTO procesarGenerico(MultipartFile file) {
        int total = 0;
        int correctos = 0;
        List<FilaConErrorDTO> errores = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet hoja = workbook.getSheetAt(0);

            for (int i = 1; i <= hoja.getLastRowNum(); i++) { // asumimos encabezado en la fila 0
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

                    // Parseo
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    LocalDate fechaLocal;

                    if (fecha.getCellType() == CellType.STRING) {
                        String fechaStr = fecha.getStringCellValue();
                        fechaLocal = LocalDate.parse(fechaStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
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

                    // Crear entidad y guardar
                    MovimientoBancario mov = new MovimientoBancario();
                    mov.setFecha(fechaLocal);
                    mov.setDescripcion(descripcionStr);
                    mov.setMonto(montoValor);
                    mov.setOrigen(MovimientoBancario.OrigenMovimiento.MYCFO);
                    mov.setMedioPago(medioPagoStr);
                    mov.setIdReferencia("ID-" + i); // Si no hay columna de ID, podés inventar uno

                    System.out.println("Fila " + i + ": " + fechaLocal + " | " + descripcionStr + " | " + montoValor + " | " + medioPagoStr);

                    movimientoRepo.save(mov);

                    correctos++;

                    notifications.publishMovement(mov, 1L); // por ahora userId=1

                } catch (Exception e) {
                    errores.add(new FilaConErrorDTO(i + 1, e.getMessage()));
                }
            }

        } catch (Exception e) {
            errores.add(new FilaConErrorDTO(0, "Error al leer el archivo: " + e.getMessage()));
        }

        return new ResumenCargaDTO(total, correctos, errores);
    }

    // Cambiá este valor según tu archivo: índice 0-based (fila 1 = 0, fila 5 = 4, etc.)
    private static final int HEADER_ROW_INDEX = 3; // ejemplo: encabezados en la fila 5 de Excel

    private ResumenCargaDTO procesarMercadoPago(MultipartFile file) {
        int total = 0;
        int correctos = 0;
        List<FilaConErrorDTO> errores = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet hoja = workbook.getSheetAt(0);
            DataFormatter fmt = new DataFormatter();

            // 1) Tomar la fila de encabezados fija
            int headerRow = HEADER_ROW_INDEX;
            Row header = hoja.getRow(headerRow);
            if (header == null) {
                errores.add(new FilaConErrorDTO(0, "No existe la fila de encabezados en el índice " + headerRow));
                return new ResumenCargaDTO(total, correctos, errores);
            }

            // 2) Mapear columnas por nombre EXACTO
            Map<String, Integer> idx = new HashMap<>();
            for (int c = 0; c < header.getLastCellNum(); c++) {
                String v = fmt.formatCellValue(header.getCell(c)).trim().toUpperCase(Locale.ROOT);
                if (v.equals("RELEASE_DATE")) idx.put("FECHA", c);
                else if (v.equals("TRANSACTION_TYPE")) idx.put("TIPO", c);
                else if (v.equals("REFERENCE_ID")) idx.put("REF", c);
                else if (v.equals("TRANSACTION_NET_AMOUNT")) idx.put("MONTO", c);
            }

            if (idx.size() < 4) {
                errores.add(new FilaConErrorDTO(0,
                        "Faltan columnas esperadas en encabezado (se requieren: RELEASE_DATE, TRANSACTION_TYPE, REFERENCE_ID, TRANSACTION_NET_AMOUNT)."));
                return new ResumenCargaDTO(total, correctos, errores);
            }

            // 3) Procesar filas de datos: DESDE LA FILA SIGUIENTE AL ENCABEZADO
            for (int i = headerRow + 1; i <= hoja.getLastRowNum(); i++) {
                Row fila = hoja.getRow(i);
                if (fila == null) continue;

                try {
                    String rawFecha = fmt.formatCellValue(fila.getCell(idx.get("FECHA"))).trim();
                    String rawTipo  = fmt.formatCellValue(fila.getCell(idx.get("TIPO"))).trim();
                    String rawRef   = fmt.formatCellValue(fila.getCell(idx.get("REF"))).trim();
                    String rawMonto = fmt.formatCellValue(fila.getCell(idx.get("MONTO"))).trim();

                    // Saltar filas totalmente vacías
                    if (rawFecha.isEmpty() && rawTipo.isEmpty() && rawRef.isEmpty() && rawMonto.isEmpty()) {
                        continue;
                    }

                    // Desde acá la fila cuenta para el total
                    total++;

                    // Validaciones mínimas
                    if (rawFecha.isEmpty() || rawMonto.isEmpty()) {
                        throw new RuntimeException("Faltan datos obligatorios (RELEASE_DATE o TRANSACTION_NET_AMOUNT).");
                    }

                    // Parseos (usando tus helpers existentes)
                    LocalDate fechaLocal = parseFechaMercadoPago(fila.getCell(idx.get("FECHA")));
                    Double montoValor = parseMontoEsAr(rawMonto);

                    String descripcionStr = rawTipo; // tipo como descripción
                    String idRefStr = rawRef.isEmpty() ? ("MP-" + (i + 1)) : rawRef;

                    // Persistencia
                    MovimientoBancario mov = new MovimientoBancario();
                    mov.setFecha(fechaLocal);
                    mov.setDescripcion(descripcionStr);
                    mov.setMonto(montoValor);
                    mov.setOrigen(MovimientoBancario.OrigenMovimiento.MERCADO_PAGO);
                    mov.setMedioPago("Mercado Pago");
                    mov.setIdReferencia(idRefStr);

                    movimientoRepo.save(mov);
                    correctos++;

                    notifications.publishMovement(mov, 1L); // por ahora userId=1

                } catch (Exception ex) {
                    // i + 1 para que coincida con numeración humana de Excel
                    errores.add(new FilaConErrorDTO(i + 1, ex.getMessage()));
                }
            }

        } catch (Exception e) {
            errores.add(new FilaConErrorDTO(0, "Error al leer el archivo: " + e.getMessage()));
        }

        return new ResumenCargaDTO(total, correctos, errores);
    }


    /** Intenta parsear dd-MM-uuuu o uuuu-MM-dd, o fecha Excel si viene como numérica. */
    private LocalDate parseFechaMercadoPago(Cell cFecha) {
        if (cFecha == null) throw new RuntimeException("Fecha vacía.");

        if (cFecha.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cFecha)) {
            return cFecha.getLocalDateTimeCellValue().toLocalDate();
        }

        String raw = new DataFormatter().formatCellValue(cFecha).trim();
        if (raw.isEmpty() || raw.equalsIgnoreCase("RELEASE_DATE")) {
            throw new RuntimeException("Fecha vacía.");
        }

        DateTimeFormatter f1 = DateTimeFormatter.ofPattern("dd-MM-uuuu");
        DateTimeFormatter f2 = DateTimeFormatter.ofPattern("uuuu-MM-dd");

        try { return LocalDate.parse(raw, f1); } catch (Exception ignore) {}
        try { return LocalDate.parse(raw, f2); } catch (Exception ignore) {}

        throw new RuntimeException("Formato de fecha inválido: " + raw);
    }

    /** Convierte "1.234,56" o "-10.000,00" a double. */
    private Double parseMontoEsAr(String raw) {
        if (raw == null) throw new RuntimeException("Monto vacío.");
        String s = raw.replace(".", "").replace(",", ".")
                .replace("$", "").replaceAll("\\s+", "");
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Monto inválido: " + raw);
        }
    }


    private ResumenCargaDTO procesarSantander(MultipartFile file) {
        // TODO: lógica específica para Santander
        return new ResumenCargaDTO(0, 0, new ArrayList<>());
    }
}
