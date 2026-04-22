package edu.unimagdalena.medsys.api;

import tools.jackson.databind.ObjectMapper;
import edu.unimagdalena.medsys.api.dto.request.CreateSpecialtyRequest;
import edu.unimagdalena.medsys.api.dto.response.SpecialtyResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.SpecialtyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SpecialtyController.class)
class SpecialtyControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean
    SpecialtyService service;

    @Test
    void create_shouldReturn201AndLocation() throws Exception {
        UUID id = UUID.randomUUID();

        var req = new CreateSpecialtyRequest("Cardiology");
        var resp = new SpecialtyResponse(id, "Cardiology");

        when(service.create(any())).thenReturn(resp);

        mvc.perform(post("/api/specialties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        org.hamcrest.Matchers.containsString("/api/specialties/" + id)))
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Cardiology"));
    }

    @Test
    void list_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        var resp = List.of(
                new SpecialtyResponse(id, "pediatrics")
        );

        when(service.findAll()).thenReturn(resp);

        mvc.perform(get("/api/specialties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id.toString()))
                .andExpect(jsonPath("$[0].name").value("pediatrics"));
    }

    @Test
    void get_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        when(service.findById(id))
                .thenReturn(new SpecialtyResponse(id, "Dermatology"));

        mvc.perform(get("/api/specialties/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Dermatology"));
    }

    @Test
    void get_shouldReturn404WhenNotFound() throws Exception {
        UUID id = UUID.randomUUID();

        when(service.findById(id))
                .thenThrow(new ResourceNotFoundException("Specialty not found"));

        mvc.perform(get("/api/specialties/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Specialty not found"));
    }
}
