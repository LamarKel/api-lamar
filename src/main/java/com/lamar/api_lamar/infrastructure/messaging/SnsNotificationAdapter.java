package com.lamar.api_lamar.infrastructure.messaging;

import com.lamar.api_lamar.domain.port.out.NotificationPublisherPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

// Adaptador: implementa el puerto publicando el mensaje en un tema de AWS SNS
@Component
public class SnsNotificationAdapter implements NotificationPublisherPort {

    private final String topicArn;
    private SnsClient sns;

    public SnsNotificationAdapter(@Value("${app.sns-topic-arn:}") String topicArn) {
        this.topicArn = topicArn;
    }

    private SnsClient sns() {
        if (sns == null)
            sns = SnsClient.create();
        return sns;
    }

    @Override
    public String publicar(String email, String subject, String message) {
        if (topicArn == null || topicArn.isBlank())
            throw new IllegalStateException("SNS_TOPIC_ARN no está configurado");

        String body = "{"
                + "\"email\":\"" + json(email) + "\","
                + "\"subject\":\"" + json(subject) + "\","
                + "\"message\":\"" + json(message) + "\""
                + "}";

        return sns().publish(PublishRequest.builder()
                .topicArn(topicArn)
                .message(body)
                .build()).messageId();
    }

    // Escapa caracteres especiales para que el JSON sea válido
    private static String json(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20)
                        sb.append(String.format("\\u%04x", (int) c));
                    else
                        sb.append(c);
                }
            }
        }
        return sb.toString();
    }
}