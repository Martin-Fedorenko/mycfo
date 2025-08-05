package consolidacion.services;

import consolidacion.dtos.FilaConErrorDTO;
import consolidacion.dtos.ResumenCargaDTO;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelImportService {

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

                    // TODO: parsear y guardar en base de datos si es necesario
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
