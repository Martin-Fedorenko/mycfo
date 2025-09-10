package registro.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import registro.models.Pagare;
import registro.repositories.PagareRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PagareService {

    private final PagareRepository pagareRepository;

    public Pagare guardarPagare(Pagare pagare) {return pagareRepository.save(pagare);}

    public List<Pagare> listarPagares() {return pagareRepository.findAll();}

    public Pagare obtenerPagare(Long id) {return pagareRepository.findById(id).orElse(null);}
}
