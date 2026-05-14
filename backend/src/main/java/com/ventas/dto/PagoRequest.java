package com.ventas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PagoRequest {
    /** Si pagoId se envia, se aplica el pago a esa cuota; si no, se aplica a la primera pendiente. */
    private Long pagoId;

    @NotNull @DecimalMin("0.01")
    private BigDecimal monto;

    private LocalDate fechaPago;
}
