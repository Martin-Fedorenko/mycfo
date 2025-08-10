package pronostico.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pronostico.dtos.PresupuestoDTO;
import pronostico.models.Presupuesto;
import pronostico.repositories.PresupuestoRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PresupuestoService {
    @Autowired
    private PresupuestoRepository repo;

    public Presupuesto save(Presupuesto p) { return repo.save(p); }
    public List<Presupuesto> findAll() { return repo.findAll(); }
    public Optional<Presupuesto> findById(Long id) { return repo.findById(id); }
    public void delete(Long id) { repo.deleteById(id); }

    public List<PresupuestoDTO> findAllDTO() {
        return repo.findAll().stream().map(p -> new PresupuestoDTO(
            p.getId(),
            p.getNombre(),
            p.getDesde() != null ? p.getDesde().toString() : null,
            p.getHasta() != null ? p.getHasta().toString() : null,
            p.getCategoriasJson()
        )).collect(Collectors.toList());
    }

    public Optional<PresupuestoDTO> findByIdDTO(Long id) {
        return repo.findById(id).map(p -> new PresupuestoDTO(
            p.getId(),
            p.getNombre(),
            p.getDesde() != null ? p.getDesde().toString() : null,
            p.getHasta() != null ? p.getHasta().toString() : null,
            p.getCategoriasJson()
        ));
    }
}
