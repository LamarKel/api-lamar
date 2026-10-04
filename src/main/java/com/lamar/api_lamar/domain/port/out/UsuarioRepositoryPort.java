package com.lamar.api_lamar.domain.port.out;

import com.lamar.api_lamar.domain.model.Usuario;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepositoryPort {
    Usuario guardar(Usuario usuario);

    Optional<Usuario> buscarPorId(Long id);

    Optional<Usuario> buscarPorEmail(String email);

    List<Usuario> listarTodos();

    void eliminar(Long id);

    boolean existePorEmail(String email);
}