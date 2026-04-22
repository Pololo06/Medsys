package edu.unimagdalena.medsys.api;

import tools.jackson.databind.ObjectMapper;
import edu.unimagdalena.medsys.api.dto.request.CancelAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CompleteAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.request.CreateAppointmentRequest;
import edu.unimagdalena.medsys.api.dto.response.AppointmentResponse;
import edu.unimagdalena.medsys.domain.enums.AppointmentStatus;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.AppointmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
class AppointmentControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean
    AppointmentService service;

    @Test
    void create_shouldReturn201AndLocation() throws Exception {

        var req = new CreateAppointmentRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDateTime.now().plusDays(1)
        );

        var resp = new AppointmentResponse(
                UUID.randomUUID(),
                req.startTime(),
                req.startTime().plusHours(1),
                AppointmentStatus.SCHEDULED,
                UUID.randomUUID(),
                "Paciente",
                UUID.randomUUID(),
                "Doctor",
                UUID.randomUUID(),
                "Office",
                UUID.randomUUID(),
                "Consulta",
                null,
                null
        );

        when(service.create(any())).thenReturn(resp);

        mvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        org.hamcrest.Matchers.containsString("/api/appointments/")))
                .andExpect(jsonPath("$.id").value(resp.id().toString()));
    }

    @Test
    void list_shouldReturn200() throws Exception {

        var resp = List.of(
                new AppointmentResponse(
                        UUID.randomUUID(),
                        LocalDateTime.now(),
                        LocalDateTime.now().plusHours(1),
                        AppointmentStatus.SCHEDULED,
                        UUID.randomUUID(),
                        "Paciente",
                        UUID.randomUUID(),
                        "Doctor",
                        UUID.randomUUID(),
                        "Office",
                        UUID.randomUUID(),
                        "Consulta",
                        null,
                        null
                )
        );

        when(service.findAll()).thenReturn(resp);

        mvc.perform(get("/api/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    void get_shouldReturn200() throws Exception {

        var id = UUID.randomUUID();

        var resp = new AppointmentResponse(
                id,
                LocalDateTime.now(),
                LocalDateTime.now().plusHours(1),
                AppointmentStatus.SCHEDULED,
                UUID.randomUUID(),
                "Paciente",
                UUID.randomUUID(),
                "Doctor",
                UUID.randomUUID(),
                "Office",
                UUID.randomUUID(),
                "Consulta",
                null,
                null
        );

        when(service.findById(id)).thenReturn(resp);

        mvc.perform(get("/api/appointments/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void get_shouldReturn404() throws Exception {

        var id = UUID.randomUUID();

        when(service.findById(id))
                .thenThrow(new ResourceNotFoundException("Appointment not found with id: " + id));

        mvc.perform(get("/api/appointments/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void confirm_shouldReturn200() throws Exception {

        var id = UUID.randomUUID();

        var resp = new AppointmentResponse(
                id,
                LocalDateTime.now(),
                LocalDateTime.now().plusHours(1),
                AppointmentStatus.CONFIRMED,
                UUID.randomUUID(),
                "Paciente",
                UUID.randomUUID(),
                "Doctor",
                UUID.randomUUID(),
                "Office",
                UUID.randomUUID(),
                "Consulta",
                null,
                null
        );

        when(service.confirm(id)).thenReturn(resp);

        mvc.perform(patch("/api/appointments/{id}/confirm", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void cancel_shouldReturn200() throws Exception {

        var id = UUID.randomUUID();
        var req = new CancelAppointmentRequest("No puede asistir");

        var resp = new AppointmentResponse(
                id,
                LocalDateTime.now(),
                LocalDateTime.now().plusHours(1),
                AppointmentStatus.CANCELLED,
                UUID.randomUUID(),
                "Paciente",
                UUID.randomUUID(),
                "Doctor",
                UUID.randomUUID(),
                "Office",
                UUID.randomUUID(),
                "Consulta",
                "No puede asistir",
                null
        );

        when(service.cancel(eq(id), any())).thenReturn(resp);

        mvc.perform(patch("/api/appointments/{id}/cancel", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void complete_shouldReturn200() throws Exception {

        var id = UUID.randomUUID();
        var req = new CompleteAppointmentRequest("Excelente");

        var resp = new AppointmentResponse(
                id,
                LocalDateTime.now(),
                LocalDateTime.now().plusHours(1),
                AppointmentStatus.COMPLETED,
                UUID.randomUUID(),
                "Paciente",
                UUID.randomUUID(),
                "Doctor",
                UUID.randomUUID(),
                "Office",
                UUID.randomUUID(),
                "Consulta",
                null,
                "Todo bien"
        );

        when(service.complete(eq(id), any())).thenReturn(resp);

        mvc.perform(patch("/api/appointments/{id}/complete", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void noShow_shouldReturn200() throws Exception {

        var id = UUID.randomUUID();

        var resp = new AppointmentResponse(
                id,
                LocalDateTime.now(),
                LocalDateTime.now().plusHours(1),
                AppointmentStatus.NO_SHOW,
                UUID.randomUUID(),
                "Paciente",
                UUID.randomUUID(),
                "Doctor",
                UUID.randomUUID(),
                "Office",
                UUID.randomUUID(),
                "Consulta",
                null,
                null
        );

        when(service.markNoShow(id)).thenReturn(resp);

        mvc.perform(patch("/api/appointments/{id}/no-show", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NO_SHOW"));
    }
}