package com.lamar.api_lamar.adapters.rest;

import com.lamar.api_lamar.adapters.dto.NotificationRequest;
import com.lamar.api_lamar.domain.port.out.NotificationPublisherPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final NotificationPublisherPort publisher;

    public NotificationController(NotificationPublisherPort publisher) {
        this.publisher = publisher;
    }

    // POST /notifications/send  { "email", "subject", "message" }
    @PostMapping({"/notifications/send", "/api/notifications/send"})
    public ResponseEntity<?> enviar(@RequestBody NotificationRequest req) {
        // 1. Validar la solicitud
        if (req.getEmail() == null || !EMAIL.matcher(req.getEmail()).matches())
            return ResponseEntity.badRequest().body(Map.of("error", "Email inválido"));
        if (req.getSubject() == null || req.getSubject().isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El asunto es obligatorio"));
        if (req.getMessage() == null || req.getMessage().isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El mensaje es obligatorio"));

        // 2. Publicar en SNS
        try {
            String messageId = publisher.publicar(req.getEmail().trim(), req.getSubject().trim(), req.getMessage().trim());
            log.info("Notificación publicada en SNS. MessageId={} destino={}", messageId, req.getEmail());
            // 3. Respuesta exitosa
            return ResponseEntity.accepted().body(Map.of(
                    "status", "PUBLICADO",
                    "messageId", messageId,
                    "mensaje", "Mensaje enviado correctamente"));
        } catch (Exception e) {
            log.error("Error publicando en SNS", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al enviar mensaje"));
        }
    }
}
