package com.lamar.api_lamar.domain.port.in;

import com.lamar.api_lamar.domain.model.Usuario;
import java.util.List;

public interface UsuarioUseCase {
    Usuario registrar(Usuario usuario);

    String autenticar(String email, String password);

    List<Usuario> listarTodos();

    Usuario obtenerPorId(Long id);

    Usuario actualizar(Long id, Usuario usuario);

    void eliminar(Long id);
}