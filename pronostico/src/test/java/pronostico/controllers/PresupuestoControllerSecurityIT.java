package pronostico.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import pronostico.models.Presupuesto;
import pronostico.repositories.PresupuestoRepository;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PresupuestoControllerSecurityIT {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private PresupuestoRepository presupuestoRepository;

    @BeforeEach
    void setUp() {
        presupuestoRepository.deleteAll();
    }

    @Test
    void unauthenticatedShouldReturn401() throws Exception {
        mvc.perform(get("/api/presupuestos"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedListsOnlyOwnedPresupuestos() throws Exception {
        Presupuesto propio = presupuestoRepository.save(buildPresupuesto("Mine", "sub-user-A"));
        presupuestoRepository.save(buildPresupuesto("Other", "sub-user-B"));

        mvc.perform(get("/api/presupuestos")
                .with(jwt().jwt(jwt -> jwt.subject("sub-user-A")))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id", is(propio.getId().intValue())))
            .andExpect(jsonPath("$[0].nombre", is("Mine")));
    }

    @Test
    void forbidAccessingOthersBudget() throws Exception {
        Presupuesto otro = presupuestoRepository.save(buildPresupuesto("Other", "sub-user-B"));

        mvc.perform(get("/api/presupuestos/" + otro.getId())
                .with(jwt().jwt(jwt -> jwt.subject("sub-user-A")))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());
    }

    private Presupuesto buildPresupuesto(String nombre, String ownerSub) {
        return Presupuesto.builder()
            .nombre(nombre)
            .ownerSub(ownerSub)
            .desde("2024-01-01")
            .hasta("2024-12-31")
            .build();
    }
}
