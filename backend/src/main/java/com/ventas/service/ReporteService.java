package com.ventas.service;

import com.ventas.model.EstadoPago;
import com.ventas.model.EstadoVenta;
import com.ventas.model.Pago;
import com.ventas.model.Venta;
import com.ventas.repository.PagoRepository;
import com.ventas.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private final VentaRepository ventaRepo;
    private final PagoRepository pagoRepo;

    public Map<String, Object> ventasPorPeriodo(LocalDate desde, LocalDate hasta) {
        List<Venta> ventas = ventaRepo.findByFechaBetweenOrderByFechaDesc(desde, hasta).stream()
                .filter(v -> v.getEstado() != EstadoVenta.ANULADA)
                .toList();
        BigDecimal total = ventas.stream().map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        // Agrupacion por fecha
        Map<LocalDate, BigDecimal> porFecha = new TreeMap<>();
        Map<LocalDate, Integer> cantPorFecha = new TreeMap<>();
        for (Venta v : ventas) {
            porFecha.merge(v.getFecha(), v.getTotal(), BigDecimal::add);
            cantPorFecha.merge(v.getFecha(), 1, Integer::sum);
        }
        List<Map<String, Object>> serie = new ArrayList<>();
        for (LocalDate f : porFecha.keySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("fecha", f);
            row.put("totalVentas", cantPorFecha.get(f));
            row.put("monto", porFecha.get(f));
            serie.add(row);
        }
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("desde", desde);
        resp.put("hasta", hasta);
        resp.put("cantidadVentas", ventas.size());
        resp.put("montoTotal", total);
        resp.put("serie", serie);
        return resp;
    }

    public List<Map<String, Object>> ventasPorCliente() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : ventaRepo.totalesPorCliente()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("clienteId", r[0]);
            row.put("clienteNombre", r[1]);
            row.put("cantidadVentas", r[2]);
            row.put("montoTotal", r[3]);
            list.add(row);
        }
        return list;
    }

    public List<Map<String, Object>> productosMasVendidos() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : ventaRepo.productosMasVendidos()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("productoId", r[0]);
            row.put("productoNombre", r[1]);
            row.put("unidadesVendidas", r[2]);
            row.put("montoTotal", r[3]);
            list.add(row);
        }
        return list;
    }

    public List<Map<String, Object>> pagosPendientes() {
        List<Pago> pagos = pagoRepo.findByEstadoInOrderByFechaVencimientoAsc(
                List.of(EstadoPago.PENDIENTE, EstadoPago.VENCIDO));
        LocalDate hoy = LocalDate.now();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Pago p : pagos) {
            // Recalcular vencido al vuelo (sin escribir)
            boolean vencido = p.getEstado() == EstadoPago.VENCIDO || p.getFechaVencimiento().isBefore(hoy);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("pagoId", p.getId());
            row.put("ventaId", p.getVenta().getId());
            row.put("clienteNombre", p.getVenta().getCliente().getNombre());
            row.put("numeroCuota", p.getNumeroCuota());
            row.put("fechaVencimiento", p.getFechaVencimiento());
            row.put("monto", p.getMonto());
            row.put("montoPagado", p.getMontoPagado());
            row.put("saldo", p.getMonto().subtract(p.getMontoPagado()));
            row.put("estado", vencido ? "VENCIDO" : "PENDIENTE");
            list.add(row);
        }
        return list;
    }
}
