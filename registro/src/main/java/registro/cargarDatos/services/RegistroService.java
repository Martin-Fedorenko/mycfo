package registro.cargarDatos.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import registro.cargarDatos.models.Registro;
import registro.cargarDatos.repositories.RegistroRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RegistroService {

    private final RegistroRepository registroRepository;
    private final RegistroEventService eventService;

    public Registro guardarRegistro(Registro registro) {
        Registro savedRegistro = registroRepository.save(registro);
        
        // Enviar evento de notificación
        eventService.sendMovementCreatedEvent(savedRegistro);
        
        return savedRegistro;
    }

    public List<Registro> listarRegistros() {
        return registroRepository.findAll();
    }

    public Registro obtenerRegistro(Long id) {
        return registroRepository.findById(id).orElse(null);
    }

    @Transactional
    public Registro updateRegistro(Long id, Registro datosActualizados) {
        Optional<Registro> optional = registroRepository.findById(id);

        if (optional.isEmpty()) {
            throw new RuntimeException("Registro no encontrado con id " + id);
        }

        Registro registro = optional.get();

        // 🔹 Copiar solo los campos que quieras actualizar
        registro.setCategoria(datosActualizados.getCategoria());
        registro.setMedioPago(datosActualizados.getMedioPago());
        registro.setMontoTotal(datosActualizados.getMontoTotal());
        registro.setTipo(datosActualizados.getTipo());
        registro.setFechaEmision(datosActualizados.getFechaEmision());
        registro.setOrigen(datosActualizados.getOrigen());
        registro.setDestino(datosActualizados.getDestino());
        registro.setDescripcion(datosActualizados.getDescripcion());
        registro.setMoneda(datosActualizados.getMoneda());

        registro.setFechaActualizacion(LocalDate.now());

        return registroRepository.save(registro);
    }
}
