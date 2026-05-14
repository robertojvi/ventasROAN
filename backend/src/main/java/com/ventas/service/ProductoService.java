package com.ventas.service;

import com.ventas.dto.ProductoRequest;
import com.ventas.exception.NotFoundException;
import com.ventas.model.Producto;
import com.ventas.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    private final ProductoRepository repo;

    public List<Producto> listar() { return repo.findAll(); }

    public List<Producto> listarActivos() { return repo.findByActivoTrue(); }

    public Producto buscar(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado"));
    }

    public Producto crear(ProductoRequest req) {
        Producto p = Producto.builder()
                .sku(req.getSku())
                .nombre(req.getNombre())
                .descripcion(req.getDescripcion())
                .precio(req.getPrecio())
                .stock(req.getStock())
                .activo(req.getActivo() == null ? true : req.getActivo())
                .build();
        return repo.save(p);
    }

    public Producto actualizar(Long id, ProductoRequest req) {
        Producto p = buscar(id);
        p.setSku(req.getSku());
        p.setNombre(req.getNombre());
        p.setDescripcion(req.getDescripcion());
        p.setPrecio(req.getPrecio());
        p.setStock(req.getStock());
        if (req.getActivo() != null) p.setActivo(req.getActivo());
        return repo.save(p);
    }

    public void eliminar(Long id) {
        Producto p = buscar(id);
        p.setActivo(false);
        repo.save(p);
    }
}
