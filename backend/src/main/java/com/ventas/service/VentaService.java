package com.ventas.service;

import com.ventas.dto.PagoRequest;
import com.ventas.dto.VentaRequest;
import com.ventas.dto.VentaResponse;
import com.ventas.exception.BadRequestException;
import com.ventas.exception.NotFoundException;
import com.ventas.model.*;
import com.ventas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VentaService {

    private final VentaRepository ventaRepo;
    private final ProductoRepository productoRepo;
    private final ClienteRepository clienteRepo;
    private final UsuarioRepository usuarioRepo;
    private final PagoRepository pagoRepo;

    public List<VentaResponse> listar() {
        return ventaRepo.findAllOrdenado().stream().map(VentaResponse::from).toList();
    }

    public VentaResponse buscar(Long id) {
        return VentaResponse.from(ventaRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada")));
    }

    public List<VentaResponse> entreFechas(LocalDate desde, LocalDate hasta) {
        return ventaRepo.findByFechaBetweenOrderByFechaDesc(desde, hasta).stream()
                .map(VentaResponse::from).toList();
    }

    public List<VentaResponse> porCliente(Long clienteId) {
        return ventaRepo.findByClienteIdOrderByFechaDesc(clienteId).stream()
                .map(VentaResponse::from).toList();
    }

    public VentaResponse crear(VentaRequest req) {
        Cliente cliente = clienteRepo.findById(req.getClienteId())
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));

        Venta venta = Venta.builder()
                .cliente(cliente)
                .fecha(req.getFecha() != null ? req.getFecha() : LocalDate.now())
                .descuento(req.getDescuento() != null ? req.getDescuento() : BigDecimal.ZERO)
                .notas(req.getNotas())
                .items(new ArrayList<>())
                .pagos(new ArrayList<>())
                .estado(EstadoVenta.PENDIENTE)
                .build();

        // Asignar usuario actual si esta autenticado
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            usuarioRepo.findByEmail(email).ifPresent(venta::setUsuario);
        } catch (Exception ignored) {}

        BigDecimal subtotal = BigDecimal.ZERO;

        for (VentaRequest.ItemRequest ir : req.getItems()) {
            Producto p = productoRepo.findById(ir.getProductoId())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + ir.getProductoId()));
            if (!p.isActivo())
                throw new BadRequestException("Producto inactivo: " + p.getNombre());
            if (p.getStock() < ir.getCantidad())
                throw new BadRequestException("Stock insuficiente para " + p.getNombre() +
                        " (disponible: " + p.getStock() + ")");
            BigDecimal pu = ir.getPrecioUnitario() != null ? ir.getPrecioUnitario() : p.getPrecio();
            BigDecimal sub = pu.multiply(BigDecimal.valueOf(ir.getCantidad()));

            VentaItem item = VentaItem.builder()
                    .venta(venta)
                    .producto(p)
                    .cantidad(ir.getCantidad())
                    .precioUnitario(pu)
                    .subtotal(sub)
                    .build();
            venta.getItems().add(item);

            // Descontar stock
            p.setStock(p.getStock() - ir.getCantidad());
            productoRepo.save(p);

            subtotal = subtotal.add(sub);
        }

        BigDecimal descuento = venta.getDescuento();
        if (descuento.compareTo(subtotal) > 0)
            throw new BadRequestException("El descuento no puede ser mayor al subtotal");

        BigDecimal total = subtotal.subtract(descuento).setScale(2, RoundingMode.HALF_UP);
        venta.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        venta.setTotal(total);

        // Cuotas
        List<VentaRequest.CuotaRequest> cuotas = req.getCuotas();
        if (cuotas == null || cuotas.isEmpty()) {
            // Una sola cuota = total, vence hoy
            Pago p = Pago.builder()
                    .venta(venta)
                    .numeroCuota(1)
                    .fechaVencimiento(LocalDate.now())
                    .monto(total)
                    .montoPagado(BigDecimal.ZERO)
                    .estado(EstadoPago.PENDIENTE)
                    .build();
            venta.getPagos().add(p);
        } else {
            BigDecimal sumaCuotas = cuotas.stream()
                    .map(VentaRequest.CuotaRequest::getMonto)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);
            if (sumaCuotas.compareTo(total) != 0)
                throw new BadRequestException("La suma de las cuotas (" + sumaCuotas +
                        ") debe ser igual al total (" + total + ")");

            int n = 1;
            for (VentaRequest.CuotaRequest cr : cuotas) {
                Pago p = Pago.builder()
                        .venta(venta)
                        .numeroCuota(n++)
                        .fechaVencimiento(cr.getFechaVencimiento())
                        .monto(cr.getMonto())
                        .montoPagado(BigDecimal.ZERO)
                        .estado(EstadoPago.PENDIENTE)
                        .build();
                venta.getPagos().add(p);
            }
        }

        actualizarEstadoVenta(venta);
        return VentaResponse.from(ventaRepo.save(venta));
    }

    public VentaResponse anular(Long id) {
        Venta v = ventaRepo.findById(id).orElseThrow(() -> new NotFoundException("Venta no encontrada"));
        if (v.getEstado() == EstadoVenta.ANULADA)
            throw new BadRequestException("La venta ya esta anulada");
        // Restituir stock
        for (VentaItem it : v.getItems()) {
            Producto p = it.getProducto();
            p.setStock(p.getStock() + it.getCantidad());
            productoRepo.save(p);
        }
        v.setEstado(EstadoVenta.ANULADA);
        return VentaResponse.from(ventaRepo.save(v));
    }

    public VentaResponse registrarPago(Long ventaId, PagoRequest req) {
        Venta v = ventaRepo.findById(ventaId).orElseThrow(() -> new NotFoundException("Venta no encontrada"));
        if (v.getEstado() == EstadoVenta.ANULADA)
            throw new BadRequestException("No se puede pagar una venta anulada");

        BigDecimal montoRestante = req.getMonto();
        LocalDate fechaPago = req.getFechaPago() != null ? req.getFechaPago() : LocalDate.now();

        if (req.getPagoId() != null) {
            // Pago aplicado a una cuota especifica
            Pago pago = v.getPagos().stream()
                    .filter(p -> p.getId().equals(req.getPagoId()))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Cuota no encontrada"));
            aplicar(pago, montoRestante, fechaPago);
        } else {
            // Aplicar a cuotas pendientes en orden de vencimiento
            List<Pago> pendientes = v.getPagos().stream()
                    .filter(p -> p.getEstado() != EstadoPago.PAGADO)
                    .sorted(Comparator.comparing(Pago::getFechaVencimiento))
                    .toList();
            for (Pago p : pendientes) {
                if (montoRestante.compareTo(BigDecimal.ZERO) <= 0) break;
                BigDecimal saldo = p.getMonto().subtract(p.getMontoPagado());
                BigDecimal a = montoRestante.min(saldo);
                aplicar(p, a, fechaPago);
                montoRestante = montoRestante.subtract(a);
            }
            if (montoRestante.compareTo(BigDecimal.ZERO) > 0)
                throw new BadRequestException("El monto excede el saldo pendiente");
        }

        actualizarEstadoVenta(v);
        return VentaResponse.from(ventaRepo.save(v));
    }

    private void aplicar(Pago p, BigDecimal monto, LocalDate fecha) {
        BigDecimal saldo = p.getMonto().subtract(p.getMontoPagado());
        if (monto.compareTo(saldo) > 0)
            throw new BadRequestException("El monto excede el saldo de la cuota #" + p.getNumeroCuota());
        p.setMontoPagado(p.getMontoPagado().add(monto));
        p.setFechaPago(fecha);
        if (p.getMontoPagado().compareTo(p.getMonto()) >= 0) {
            p.setEstado(EstadoPago.PAGADO);
        }
    }

    private void actualizarEstadoVenta(Venta v) {
        BigDecimal totalPagado = v.getPagos().stream()
                .map(Pago::getMontoPagado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        // Marcar vencidas
        LocalDate hoy = LocalDate.now();
        for (Pago p : v.getPagos()) {
            if (p.getEstado() != EstadoPago.PAGADO && p.getFechaVencimiento().isBefore(hoy)) {
                p.setEstado(EstadoPago.VENCIDO);
            }
        }
        if (totalPagado.compareTo(BigDecimal.ZERO) == 0) {
            v.setEstado(EstadoVenta.PENDIENTE);
        } else if (totalPagado.compareTo(v.getTotal()) >= 0) {
            v.setEstado(EstadoVenta.PAGADA);
        } else {
            v.setEstado(EstadoVenta.PARCIAL);
        }
    }
}
