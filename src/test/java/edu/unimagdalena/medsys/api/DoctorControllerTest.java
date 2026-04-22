package edu.unimagdalena.medsys.api;

import tools.jackson.databind.ObjectMapper;
import edu.unimagdalena.medsys.api.dto.request.CreateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.request.UpdateDoctorRequest;
import edu.unimagdalena.medsys.api.dto.response.DoctorResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.DoctorService;
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

@WebMvcTest(DoctorController.class)
class DoctorControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean
    DoctorService service;

    @Test
    void create_shouldReturn201AndLocation() throws Exception {
        UUID id = UUID.randomUUID();
        UUID specialtyId = UUID.randomUUID();

        var req = new CreateDoctorRequest("Dr. Burke", specialtyId);
        var resp = new DoctorResponse(id, "Dr. Burke", true, specialtyId, "Diagnostics");

        when(service.create(any())).thenReturn(resp);

        mvc.perform(post("/api/doctors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/doctors/" + id)))
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.fullName").value("Dr. Burke"));
    }

    @Test
    void get_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        UUID specialtyId = UUID.randomUUID();

        when(service.findById(id))
                .thenReturn(new DoctorResponse(id, "Dr. Lopez", true, specialtyId, "Cardiology"));

        mvc.perform(get("/api/doctors/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void get_shouldReturn404WhenNotFound() throws Exception {
        UUID id = UUID.randomUUID();

        when(service.findById(id))
                .thenThrow(new ResourceNotFoundException("Doctor not found"));

        mvc.perform(get("/api/doctors/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Doctor not found"));
    }

    @Test
    void list_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        UUID specialtyId = UUID.randomUUID();

        var resp = List.of(
                new DoctorResponse(id, "Dr. Bernat", true, specialtyId, "Cardiology")
        );

        when(service.findAll()).thenReturn(resp);

        mvc.perform(get("/api/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id.toString()));
    }

    @Test
    void update_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        UUID specialtyId = UUID.randomUUID();

        var req = new UpdateDoctorRequest("Dr. Drake", false);
        var resp = new DoctorResponse(id, "Dr. Drake", false, specialtyId, "Neurology");

        when(service.update(eq(id), any())).thenReturn(resp);

        mvc.perform(put("/api/doctors/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Dr. Drake"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void findActiveBySpecialty_shouldReturn200() throws Exception {
        UUID specialtyId = UUID.randomUUID();
        UUID doctorId = UUID.randomUUID();

        var resp = List.of(
                new DoctorResponse(doctorId, "Dr. Michael", true, specialtyId, "Pediatrics")
        );

        when(service.findActiveBySpecialty(specialtyId)).thenReturn(resp);

        mvc.perform(get("/api/doctors/specialty/" + specialtyId + "/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(doctorId.toString()));
    }
}
