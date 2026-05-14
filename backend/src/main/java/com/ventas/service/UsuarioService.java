package com.ventas.service;

import com.ventas.dto.UsuarioRequest;
import com.ventas.dto.UsuarioResponse;
import com.ventas.exception.BadRequestException;
import com.ventas.exception.NotFoundException;
import com.ventas.model.Usuario;
import com.ventas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;

    public List<UsuarioResponse> listar() {
        return repo.findAll().stream().map(UsuarioResponse::from).toList();
    }

    public UsuarioResponse buscar(Long id) {
        return UsuarioResponse.from(get(id));
    }

    public UsuarioResponse crear(UsuarioRequest req) {
        if (repo.existsByEmail(req.getEmail()))
            throw new BadRequestException("El email ya esta registrado");
        if (req.getPassword() == null || req.getPassword().isBlank())
            throw new BadRequestException("La contrasena es requerida");
        Usuario u = Usuario.builder()
                .nombre(req.getNombre())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .rol(req.getRol())
                .activo(req.getActivo() == null ? true : req.getActivo())
                .build();
        return UsuarioResponse.from(repo.save(u));
    }

    public UsuarioResponse actualizar(Long id, UsuarioRequest req) {
        Usuario u = get(id);
        u.setNombre(req.getNombre());
        if (!u.getEmail().equals(req.getEmail())) {
            if (repo.existsByEmail(req.getEmail()))
                throw new BadRequestException("El email ya esta registrado");
            u.setEmail(req.getEmail());
        }
        u.setRol(req.getRol());
        if (req.getActivo() != null) u.setActivo(req.getActivo());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(encoder.encode(req.getPassword()));
        }
        return UsuarioResponse.from(repo.save(u));
    }

    public void eliminar(Long id) {
        Usuario u = get(id);
        u.setActivo(false);
        repo.save(u);
    }

    private Usuario get(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }
}
