package com.lamar.api_lamar.domain.port.out;

public interface TokenProviderPort {
    String generarToken(String email);

    String obtenerEmailDelToken(String token);

    boolean esTokenValido(String token);
}