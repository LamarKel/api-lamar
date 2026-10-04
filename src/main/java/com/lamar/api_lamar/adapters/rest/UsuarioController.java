package com.lamar.api_lamar.adapters.rest;

import com.lamar.api_lamar.adapters.dto.RegistroRequest;
import com.lamar.api_lamar.adapters.dto.UsuarioResponse;
import com.lamar.api_lamar.domain.model.Usuario;
import com.lamar.api_lamar.domain.port.in.UsuarioUseCase;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioUseCase usuarioUseCase;

    public UsuarioController(UsuarioUseCase usuarioUseCase) {
        this.usuarioUseCase = usuarioUseCase;
    }

    private UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getTelefono());
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        List<UsuarioResponse> lista = usuarioUseCase.listarTodos().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(usuarioUseCase.obtenerPorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizar(@PathVariable Long id,
            @Valid @RequestBody RegistroRequest request) {
        Usuario datos = new Usuario(null, request.getNombre(), request.getEmail(), request.getPassword(),
                request.getTelefono());
        return ResponseEntity.ok(toResponse(usuarioUseCase.actualizar(id, datos)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioUseCase.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}