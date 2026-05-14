package com.ventas.service;

import com.ventas.dto.ClienteRequest;
import com.ventas.exception.NotFoundException;
import com.ventas.model.Cliente;
import com.ventas.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final ClienteRepository repo;

    public List<Cliente> listar() { return repo.findAll(); }

    public Cliente buscar(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Cliente no encontrado"));
    }

    public Cliente crear(ClienteRequest req) {
        Cliente c = Cliente.builder()
                .nombre(req.getNombre())
                .documento(req.getDocumento())
                .email(req.getEmail())
                .telefono(req.getTelefono())
                .direccion(req.getDireccion())
                .build();
        return repo.save(c);
    }

    public Cliente actualizar(Long id, ClienteRequest req) {
        Cliente c = buscar(id);
        c.setNombre(req.getNombre());
        c.setDocumento(req.getDocumento());
        c.setEmail(req.getEmail());
        c.setTelefono(req.getTelefono());
        c.setDireccion(req.getDireccion());
        return repo.save(c);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }
}
