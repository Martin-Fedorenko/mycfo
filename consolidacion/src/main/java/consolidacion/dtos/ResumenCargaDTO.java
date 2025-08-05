package consolidacion.dtos;

import java.util.List;

public class ResumenCargaDTO {
    private int total;
    private int correctos;
    private List<FilaConErrorDTO> errores;

    public ResumenCargaDTO(int total, int correctos, List<FilaConErrorDTO> errores) {
        this.total = total;
        this.correctos = correctos;
        this.errores = errores;
    }

    // Getters y Setters
}
