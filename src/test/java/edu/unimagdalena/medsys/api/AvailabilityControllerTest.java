package edu.unimagdalena.medsys.api;

import edu.unimagdalena.medsys.api.dto.response.AvailabilitySlotResponse;
import edu.unimagdalena.medsys.exceptions.ResourceNotFoundException;
import edu.unimagdalena.medsys.services.AvailabilityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AvailabilityController.class)
class AvailabilityControllerTest {

    @Autowired MockMvc mvc;

    @MockitoBean
    AvailabilityService service;
    @MockitoBean
    edu.unimagdalena.medsys.security.service.JwtService jwtService;
    @MockitoBean
    org.springframework.security.core.userdetails.UserDetailsService userDetailsService;



    @Test
    void getAvailableSlots_shouldReturn200WithSlots() throws Exception {
        UUID doctorId = UUID.randomUUID();
        LocalDate date = LocalDate.of(2026, 4, 27);

        var slots = List.of(
                new AvailabilitySlotResponse(
                        LocalDateTime.of(2026, 4, 27, 8, 0),
                        LocalDateTime.of(2026, 4, 27, 8, 30)
                ),
                new AvailabilitySlotResponse(
                        LocalDateTime.of(2026, 4, 27, 8, 30),
                        LocalDateTime.of(2026, 4, 27, 9, 0)
                )
        );

        when(service.getAvailableSlots(eq(doctorId), eq(date), eq(30)))
                .thenReturn(slots);

        mvc.perform(get("/api/availability/doctors/{doctorId}", doctorId)
                        .param("date", "2026-04-27")
                        .param("durationMinutes", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].startTime").value("2026-04-27T08:00:00"))
                .andExpect(jsonPath("$[0].endTime").value("2026-04-27T08:30:00"))
                .andExpect(jsonPath("$[1].startTime").value("2026-04-27T08:30:00"))
                .andExpect(jsonPath("$[1].endTime").value("2026-04-27T09:00:00"));
    }

    @Test
    void getAvailableSlots_shouldReturnEmptyListWhenNoSlots() throws Exception {
        UUID doctorId = UUID.randomUUID();

        when(service.getAvailableSlots(any(), any(), eq(30)))
                .thenReturn(List.of());

        mvc.perform(get("/api/availability/doctors/{doctorId}", doctorId)
                        .param("date", "2026-04-27")
                        .param("durationMinutes", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getAvailableSlots_shouldReturn404WhenDoctorNotFound() throws Exception {
        UUID doctorId = UUID.randomUUID();

        when(service.getAvailableSlots(any(), any(), eq(30)))
                .thenThrow(new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        mvc.perform(get("/api/availability/doctors/{doctorId}", doctorId)
                        .param("date", "2026-04-27")
                        .param("durationMinutes", "30"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Doctor not found with id: " + doctorId));
    }

    @Test
    void getAvailableSlots_shouldReturn400WhenDateMissing() throws Exception {
        UUID doctorId = UUID.randomUUID();

        mvc.perform(get("/api/availability/doctors/{doctorId}", doctorId)
                        .param("durationMinutes", "30"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAvailableSlots_shouldReturn400WhenDurationMissing() throws Exception {
        UUID doctorId = UUID.randomUUID();

        mvc.perform(get("/api/availability/doctors/{doctorId}", doctorId)
                        .param("date", "2026-04-27"))
                .andExpect(status().isBadRequest());
    }
}
