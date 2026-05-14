package com.ventas.controller;

import com.ventas.dto.UsuarioRequest;
import com.ventas.dto.UsuarioResponse;
import com.ventas.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService service;

    @GetMapping
    public List<UsuarioResponse> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public UsuarioResponse buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest req) { return service.crear(req); }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest req) {
        return service.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
