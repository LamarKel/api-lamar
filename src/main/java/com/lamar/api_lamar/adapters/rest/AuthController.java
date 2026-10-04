package com.lamar.api_lamar.adapters.rest;

import com.lamar.api_lamar.adapters.dto.LoginRequest;
import com.lamar.api_lamar.adapters.dto.RegistroRequest;
import com.lamar.api_lamar.adapters.dto.UsuarioResponse;
import com.lamar.api_lamar.domain.model.Usuario;
import com.lamar.api_lamar.domain.port.in.UsuarioUseCase;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioUseCase usuarioUseCase;

    public AuthController(UsuarioUseCase usuarioUseCase) {
        this.usuarioUseCase = usuarioUseCase;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        Usuario usuario = new Usuario(null, request.getNombre(), request.getEmail(), request.getPassword(),
                request.getTelefono());
        Usuario guardado = usuarioUseCase.registrar(usuario);
        return ResponseEntity.ok(new UsuarioResponse(guardado.getId(), guardado.getNombre(), guardado.getEmail(),
                guardado.getTelefono()));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        String token = usuarioUseCase.autenticar(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }
}