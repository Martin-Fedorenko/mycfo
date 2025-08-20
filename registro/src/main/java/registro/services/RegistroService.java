package registro.services;


import registro.models.Registro;
import registro.repositories.RegistroRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistroService {

    private final RegistroRepository registroRepository;

    public RegistroService(RegistroRepository registroRepository) {
        this.registroRepository = registroRepository;
    }

    public Registro guardarRegistro(Registro registro) {

        return registroRepository.save(registro);
    }

    public List<Registro> obtenerTodos() {
        return registroRepository.findAll();
    }
}
