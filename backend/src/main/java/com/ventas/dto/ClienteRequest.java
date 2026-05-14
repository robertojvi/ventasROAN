package com.ventas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClienteRequest {
    @NotBlank
    private String nombre;

    private String documento;

    @Email
    private String email;

    private String telefono;

    private String direccion;
}
