package registro.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import registro.models.Registro;
import registro.repositories.RegistroRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistroService {

    private final RegistroRepository registroRepository;

    public Registro guardarRegistro(Registro registro) {
        return registroRepository.save(registro);
    }

    public List<Registro> listarRegistros() {
        return registroRepository.findAll();
    }

    public Registro obtenerRegistro(Long id) {
        return registroRepository.findById(id).orElse(null);
    }
}
