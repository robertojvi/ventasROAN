package com.ventas.dto;

import com.ventas.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioRequest {
    @NotBlank
    private String nombre;

    @NotBlank @Email
    private String email;

    /** Solo requerido al crear; opcional en update */
    @Size(min = 6, max = 100)
    private String password;

    @NotNull
    private Rol rol;

    private Boolean activo;
}
