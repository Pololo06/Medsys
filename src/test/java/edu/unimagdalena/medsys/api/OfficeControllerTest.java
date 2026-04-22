package edu.unimagdalena.medsys.api;

import tools.jackson.databind.ObjectMapper;
import edu.unimagdalena.medsys.api.dto.request.CreateOfficeRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateOfficeRequest;
import edu.unimagdalena.medsys.api.dto.response.OfficeResponse;
import edu.unimagdalena.medsys.domain.enums.OfficeStatus;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.OfficeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OfficeController.class)
class OfficeControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean
    OfficeService service;

    @Test
    void create_shouldReturn201AndLocation() throws Exception {
        UUID id = UUID.randomUUID();

        var req = new CreateOfficeRequest("Consultorio 105", "Piso 1");
        var resp = new OfficeResponse(id, "Consultorio 105", "Piso 1", OfficeStatus.AVAILABLE);

        when(service.create(any())).thenReturn(resp);

        mvc.perform(post("/api/offices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        org.hamcrest.Matchers.containsString("/api/offices/" + id)))
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Consultorio 105"));
    }

    @Test
    void list_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        var resp = List.of(
                new OfficeResponse(id, "Consultorio 203", "Piso 2", OfficeStatus.AVAILABLE)
        );

        when(service.findAll()).thenReturn(resp);

        mvc.perform(get("/api/offices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id.toString()));
    }

    @Test
    void get_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        when(service.findById(id))
                .thenReturn(new OfficeResponse(id, "Consultorio 308", "Piso 3", OfficeStatus.AVAILABLE));

        mvc.perform(get("/api/offices/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void get_shouldReturn404WhenNotFound() throws Exception {
        UUID id = UUID.randomUUID();

        when(service.findById(id))
                .thenThrow(new ResourceNotFoundException("Office not found"));

        mvc.perform(get("/api/offices/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Office not found"));
    }

    @Test
    void update_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        var req = new UpdateOfficeRequest("Consultorio 404", "Piso 4", OfficeStatus.OUT_OF_SERVICE);
        var resp = new OfficeResponse(id, "Consultorio 404", "Piso 4", OfficeStatus.OUT_OF_SERVICE);

        when(service.update(eq(id), any())).thenReturn(resp);

        mvc.perform(put("/api/offices/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Consultorio 404"))
                .andExpect(jsonPath("$.status").value("OUT_OF_SERVICE"));
    }

    @Test
    void create_shouldReturn400WhenFieldsAreBlank() throws Exception {
        mvc.perform(post("/api/offices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"location\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.violations").isArray());
    }
}
