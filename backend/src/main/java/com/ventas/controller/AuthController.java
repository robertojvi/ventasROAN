package com.ventas.controller;

import com.ventas.dto.LoginRequest;
import com.ventas.dto.LoginResponse;
import com.ventas.exception.NotFoundException;
import com.ventas.model.Usuario;
import com.ventas.repository.UsuarioRepository;
import com.ventas.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepo;
    private final JwtService jwt;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        Usuario u = usuarioRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        String token = jwt.generarToken(u.getEmail(), u.getRol().name());
        return ResponseEntity.ok(new LoginResponse(token, u.getId(), u.getNombre(), u.getEmail(), u.getRol()));
    }
}
