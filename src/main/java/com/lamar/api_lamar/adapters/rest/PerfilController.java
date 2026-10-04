package com.lamar.api_lamar.adapters.rest;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// Devuelve el usuario autenticado según el JWT
@RestController
@RequestMapping("/api/perfil")
public class PerfilController {
    @GetMapping
    public Map<String, Object> perfil(Authentication auth) {
        return Map.of(
            "email", auth.getName(),
            "roles", auth.getAuthorities().stream().map(Object::toString).toList()
        );
    }
}
