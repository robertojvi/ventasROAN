package com.ventas.controller;

import com.ventas.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService service;

    @GetMapping("/ventas-por-periodo")
    public Map<String, Object> ventasPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return service.ventasPorPeriodo(desde, hasta);
    }

    @GetMapping("/ventas-por-cliente")
    public List<Map<String, Object>> ventasPorCliente() { return service.ventasPorCliente(); }

    @GetMapping("/productos-mas-vendidos")
    public List<Map<String, Object>> productosMasVendidos() { return service.productosMasVendidos(); }

    @GetMapping("/pagos-pendientes")
    public List<Map<String, Object>> pagosPendientes() { return service.pagosPendientes(); }
}
