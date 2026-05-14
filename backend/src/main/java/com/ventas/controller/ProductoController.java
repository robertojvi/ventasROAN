package com.ventas.controller;

import com.ventas.dto.ProductoRequest;
import com.ventas.model.Producto;
import com.ventas.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService service;

    @GetMapping
    public List<Producto> listar(@RequestParam(required = false) Boolean soloActivos) {
        return Boolean.TRUE.equals(soloActivos) ? service.listarActivos() : service.listar();
    }

    @GetMapping("/{id}")
    public Producto buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public Producto crear(@Valid @RequestBody ProductoRequest req) { return service.crear(req); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public Producto actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest req) {
        return service.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
