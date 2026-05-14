package com.ventas.repository;

import com.ventas.model.EstadoPago;
import com.ventas.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByEstadoInOrderByFechaVencimientoAsc(List<EstadoPago> estados);
    List<Pago> findByFechaVencimientoBeforeAndEstado(LocalDate fecha, EstadoPago estado);
}
