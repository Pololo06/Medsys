package edu.unimagdalena.medsys.api;

import tools.jackson.databind.ObjectMapper;
import edu.unimagdalena.medsys.api.dto.request.CreatePatientRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdatePatientRequest;
import edu.unimagdalena.medsys.api.dto.response.PatientResponse;
import edu.unimagdalena.medsys.domain.enums.PatientStatus;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.PatientService;
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

@WebMvcTest(PatientController.class)
class PatientControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean
    PatientService service;
    @MockitoBean
    edu.unimagdalena.medsys.security.service.JwtService jwtService;
    @MockitoBean
    org.springframework.security.core.userdetails.UserDetailsService userDetailsService;



    @Test
    void create_shouldReturn201AndLocation() throws Exception {
        UUID id = UUID.randomUUID();

        var req = new CreatePatientRequest("Luan Jao", "luan@gmail.com", "+573001112233");
        var resp = new PatientResponse(id, "Luan Jao", "luan@gmail.com", "+573001112233", PatientStatus.ACTIVE);

        when(service.create(any())).thenReturn(resp);

        mvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        org.hamcrest.Matchers.containsString("/api/patients/" + id)))
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.fullName").value("Luan Jao"));
    }

    @Test
    void get_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        when(service.findById(id))
                .thenReturn(new PatientResponse(id, "Karla Zapata", "kzapata@gmail.com", "+573002223344", PatientStatus.ACTIVE));

        mvc.perform(get("/api/patients/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void get_shouldReturn404WhenNotFound() throws Exception {
        UUID id = UUID.randomUUID();

        when(service.findById(id))
                .thenThrow(new ResourceNotFoundException("Patient not found"));

        mvc.perform(get("/api/patients/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Patient not found"));
    }

    @Test
    void list_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        var resp = List.of(
                new PatientResponse(id, "Carlos Rodríguez", "carlos@gmail.com", "+573003334455", PatientStatus.ACTIVE)
        );

        when(service.findAll()).thenReturn(resp);

        mvc.perform(get("/api/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id.toString()));
    }

    @Test
    void update_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        var req = new UpdatePatientRequest(
                "Laura Jimenez",
                "laujimenez@gmail.com",
                "+573004445566",
                PatientStatus.INACTIVE
        );

        var resp = new PatientResponse(
                id,
                "Laura Jimenez",
                "laujimenez@gmail.com",
                "+573004445566",
                PatientStatus.INACTIVE
        );

        when(service.update(eq(id), any())).thenReturn(resp);

        mvc.perform(put("/api/patients/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Laura Jimenez"))
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    void create_shouldReturn400WhenFieldsAreBlank() throws Exception {
        mvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"\",\"email\":\"not-an-email\",\"phone\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.violations").isArray());
    }
}
