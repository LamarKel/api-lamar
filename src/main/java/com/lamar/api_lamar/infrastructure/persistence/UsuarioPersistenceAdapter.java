package com.lamar.api_lamar.infrastructure.persistence;

import com.lamar.api_lamar.domain.model.Usuario;
import com.lamar.api_lamar.domain.port.out.UsuarioRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class UsuarioPersistenceAdapter implements UsuarioRepositoryPort {

    private final UsuarioJpaRepository jpaRepository;

    public UsuarioPersistenceAdapter(UsuarioJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        UsuarioJpaEntity entity = toEntity(usuario);
        return toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<Usuario> buscarPorId(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return jpaRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public List<Usuario> listarTodos() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void eliminar(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existePorEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    private UsuarioJpaEntity toEntity(Usuario u) {
        return new UsuarioJpaEntity(u.getId(), u.getNombre(), u.getEmail(), u.getPassword(), u.getTelefono());
    }

    private Usuario toDomain(UsuarioJpaEntity e) {
        return new Usuario(e.getId(), e.getNombre(), e.getEmail(), e.getPassword(), e.getTelefono());
    }

}