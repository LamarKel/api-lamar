package com.lamar.api_lamar.adapters.rest;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

// Endpoint extra para demostrar consumo paralelo (usuarios + perfil + configuración)
@RestController
@RequestMapping("/api/config")
public class ConfigController {
    @GetMapping
    public Map<String, Object> config() {
        return Map.of(
            "appName", "api-lamar",
            "version", "2.0.0",
            "maxUploadMB", 10,
            "serverTime", LocalDateTime.now().toString()
        );
    }
}
