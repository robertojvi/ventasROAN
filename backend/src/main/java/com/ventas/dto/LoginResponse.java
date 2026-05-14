package com.ventas.dto;

import com.ventas.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
}
