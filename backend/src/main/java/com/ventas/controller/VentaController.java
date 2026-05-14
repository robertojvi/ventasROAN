package com.ventas.controller;

import com.ventas.dto.PagoRequest;
import com.ventas.dto.VentaRequest;
import com.ventas.dto.VentaResponse;
import com.ventas.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService service;

    @GetMapping
    public List<VentaResponse> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long clienteId) {
        if (clienteId != null) return service.porCliente(clienteId);
        if (desde != null && hasta != null) return service.entreFechas(desde, hasta);
        return service.listar();
    }

    @GetMapping("/{id}")
    public VentaResponse buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public VentaResponse crear(@Valid @RequestBody VentaRequest req) { return service.crear(req); }

    @PostMapping("/{id}/anular")
    @PreAuthorize("hasRole('ADMIN')")
    public VentaResponse anular(@PathVariable Long id) { return service.anular(id); }

    @PostMapping("/{id}/pagos")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public VentaResponse registrarPago(@PathVariable Long id, @Valid @RequestBody PagoRequest req) {
        return service.registrarPago(id, req);
    }
}
