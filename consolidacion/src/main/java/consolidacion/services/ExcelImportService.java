package consolidacion.services;

import consolidacion.dtos.FilaConErrorDTO;
import consolidacion.dtos.ResumenCargaDTO;
import consolidacion.models.MovimientoBancario;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import consolidacion.repositories.MovimientoBancarioRepository;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelImportService {

    @Autowired
    private MovimientoBancarioRepository movimientoRepo;

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
                    mov.setMedioPago(medioPagoStr);
                    mov.setIdReferencia("ID-" + i); // Si no hay columna de ID, podés inventar uno

                    System.out.println("Fila " + i + ": " + fechaLocal + " | " + descripcionStr + " | " + montoValor + " | " + medioPagoStr);

                    movimientoRepo.save(mov);

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

    private ResumenCargaDTO procesarMercadoPago(MultipartFile file) {
        // TODO: lógica específica para Mercado Pago
        return new ResumenCargaDTO(0, 0, new ArrayList<>());
    }

    private ResumenCargaDTO procesarSantander(MultipartFile file) {
        // TODO: lógica específica para Santander
        return new ResumenCargaDTO(0, 0, new ArrayList<>());
    }
}
