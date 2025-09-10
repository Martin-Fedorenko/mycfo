package registro.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import registro.models.Recibo;
import registro.repositories.ReciboRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReciboService {

    private final ReciboRepository reciboRepository;

    public Recibo guardarRecibo(Recibo recibo) {return reciboRepository.save(recibo);}

    public List<Recibo> listarRecibos() {return reciboRepository.findAll();}

    public Recibo obtenerRecibo(Long id) {return reciboRepository.findById(id).orElse(null);}
}
