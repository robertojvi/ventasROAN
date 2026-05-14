package com.ventas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class VentaRequest {

    @NotNull
    private Long clienteId;

    private LocalDate fecha;

    @DecimalMin("0.0")
    private BigDecimal descuento;

    private String notas;

    @NotEmpty
    @Valid
    private List<ItemRequest> items;

    /** Cuotas / pagos programados. Si se omite, se crea 1 cuota igual al total con vencimiento hoy. */
    @Valid
    private List<CuotaRequest> cuotas;

    @Data
    public static class ItemRequest {
        @NotNull private Long productoId;
        @NotNull @Min(1) private Integer cantidad;
        /** Precio unitario opcional; si no se envia, se usa el del producto. */
        private BigDecimal precioUnitario;
    }

    @Data
    public static class CuotaRequest {
        @NotNull private LocalDate fechaVencimiento;
        @NotNull @DecimalMin("0.0") private BigDecimal monto;
    }
}
