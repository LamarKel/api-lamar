package com.lamar.api_lamar.application;

import com.lamar.api_lamar.domain.model.Usuario;
import com.lamar.api_lamar.domain.port.in.UsuarioUseCase;
import com.lamar.api_lamar.domain.port.out.UsuarioRepositoryPort;
import com.lamar.api_lamar.domain.port.out.TokenProviderPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioServiceImpl implements UsuarioUseCase {

    private final UsuarioRepositoryPort usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProviderPort tokenProvider;

    public UsuarioServiceImpl(UsuarioRepositoryPort usuarioRepository,
            PasswordEncoder passwordEncoder,
            TokenProviderPort tokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public Usuario registrar(Usuario usuario) {
        if (usuarioRepository.existePorEmail(usuario.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.guardar(usuario);
    }

    @Override
    public String autenticar(String email, String password) {
        Usuario usuario = usuarioRepository.buscarPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        return tokenProvider.generarToken(usuario.getEmail());
    }

    @Override
    public List<Usuario> listarTodos() {
        return usuarioRepository.listarTodos();
    }

    @Override
    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    public Usuario actualizar(Long id, Usuario datosNuevos) {
        Usuario usuario = obtenerPorId(id);
        usuario.setNombre(datosNuevos.getNombre());
        usuario.setEmail(datosNuevos.getEmail());
        usuario.setTelefono(datosNuevos.getTelefono());
        if (datosNuevos.getPassword() != null && !datosNuevos.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(datosNuevos.getPassword()));
        }
        return usuarioRepository.guardar(usuario);
    }

    @Override
    public void eliminar(Long id) {
        obtenerPorId(id);
        usuarioRepository.eliminar(id);
    }
}