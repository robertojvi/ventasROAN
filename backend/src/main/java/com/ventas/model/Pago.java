package com.ventas.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pagos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "venta_id", nullable = false)
    @JsonBackReference("venta-pagos")
    private Venta venta;

    /** Numero de cuota (1, 2, 3...) */
    @Column(name = "numero_cuota", nullable = false)
    private Integer numeroCuota;

    /** Fecha de vencimiento esperada de la cuota */
    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    /** Monto esperado de la cuota */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    /** Monto efectivamente pagado (0 si pendiente) */
    @Column(name = "monto_pagado", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoPagado = BigDecimal.ZERO;

    /** Fecha en la que se cobro (null si pendiente) */
    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPago estado = EstadoPago.PENDIENTE;
}
