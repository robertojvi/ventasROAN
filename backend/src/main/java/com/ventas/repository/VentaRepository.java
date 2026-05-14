package com.ventas.repository;

import com.ventas.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByFechaBetweenOrderByFechaDesc(LocalDate desde, LocalDate hasta);

    List<Venta> findByClienteIdOrderByFechaDesc(Long clienteId);

    @Query("SELECT v FROM Venta v ORDER BY v.fecha DESC, v.id DESC")
    List<Venta> findAllOrdenado();

    @Query("""
           SELECT v.cliente.id, v.cliente.nombre, COUNT(v), SUM(v.total)
           FROM Venta v
           WHERE v.estado <> com.ventas.model.EstadoVenta.ANULADA
           GROUP BY v.cliente.id, v.cliente.nombre
           ORDER BY SUM(v.total) DESC
           """)
    List<Object[]> totalesPorCliente();

    @Query("""
           SELECT i.producto.id, i.producto.nombre, SUM(i.cantidad), SUM(i.subtotal)
           FROM VentaItem i
           WHERE i.venta.estado <> com.ventas.model.EstadoVenta.ANULADA
           GROUP BY i.producto.id, i.producto.nombre
           ORDER BY SUM(i.cantidad) DESC
           """)
    List<Object[]> productosMasVendidos();
}
