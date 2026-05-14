package com.ventas.dto;

import com.ventas.model.Rol;
import com.ventas.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
    private boolean activo;
    private LocalDateTime fechaCreacion;

    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getRol(), u.isActivo(), u.getFechaCreacion());
    }
}
