package com.lamar.api_lamar.domain.port.out;

// Puerto de salida: el dominio solo sabe que "publica una notificación",
// no sabe que por debajo se usa AWS SNS.
public interface NotificationPublisherPort {
    String publicar(String email, String subject, String message);
}
