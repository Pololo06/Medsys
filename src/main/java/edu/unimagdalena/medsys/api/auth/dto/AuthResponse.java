package edu.unimagdalena.medsys.api.auth.dto;

public record AuthResponse(
        String accessToken,
        String userId,
        String email,
        String fullName,
        String role
) {}
