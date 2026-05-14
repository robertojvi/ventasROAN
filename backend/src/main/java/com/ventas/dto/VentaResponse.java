package com.ventas.dto;

import com.ventas.model.EstadoPago;
import com.ventas.model.EstadoVenta;
import com.ventas.model.Pago;
import com.ventas.model.Venta;
import com.ventas.model.VentaItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class VentaResponse {
    private Long id;
    private LocalDate fecha;
    private Long clienteId;
    private String clienteNombre;
    private String vendedorNombre;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
    private BigDecimal totalPagado;
    private BigDecimal saldoPendiente;
    private EstadoVenta estado;
    private String notas;
    private List<ItemDto> items;
    private List<PagoDto> pagos;

    @Data @AllArgsConstructor
    public static class ItemDto {
        private Long id;
        private Long productoId;
        private String productoNombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }

    @Data @AllArgsConstructor
    public static class PagoDto {
        private Long id;
        private Integer numeroCuota;
        private LocalDate fechaVencimiento;
        private BigDecimal monto;
        private BigDecimal montoPagado;
        private LocalDate fechaPago;
        private EstadoPago estado;
    }

    public static VentaResponse from(Venta v) {
        BigDecimal totalPagado = v.getPagos().stream()
                .map(Pago::getMontoPagado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal saldo = v.getTotal().subtract(totalPagado);

        List<ItemDto> items = v.getItems().stream().map(VentaResponse::toItem).toList();
        List<PagoDto> pagos = v.getPagos().stream().map(VentaResponse::toPago).toList();

        return VentaResponse.builder()
                .id(v.getId())
                .fecha(v.getFecha())
                .clienteId(v.getCliente().getId())
                .clienteNombre(v.getCliente().getNombre())
                .vendedorNombre(v.getUsuario() != null ? v.getUsuario().getNombre() : null)
                .subtotal(v.getSubtotal())
                .descuento(v.getDescuento())
                .total(v.getTotal())
                .totalPagado(totalPagado)
                .saldoPendiente(saldo)
                .estado(v.getEstado())
                .notas(v.getNotas())
                .items(items)
                .pagos(pagos)
                .build();
    }

    private static ItemDto toItem(VentaItem i) {
        return new ItemDto(i.getId(), i.getProducto().getId(), i.getProducto().getNombre(),
                i.getCantidad(), i.getPrecioUnitario(), i.getSubtotal());
    }

    private static PagoDto toPago(Pago p) {
        return new PagoDto(p.getId(), p.getNumeroCuota(), p.getFechaVencimiento(),
                p.getMonto(), p.getMontoPagado(), p.getFechaPago(), p.getEstado());
    }
}
