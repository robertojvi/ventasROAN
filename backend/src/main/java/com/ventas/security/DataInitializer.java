package com.ventas.security;

import com.ventas.model.Rol;
import com.ventas.model.Usuario;
import com.ventas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (repo.count() == 0) {
            Usuario admin = Usuario.builder()
                    .nombre("Administrador")
                    .email("admin@ventas.com")
                    .password(encoder.encode("admin123"))
                    .rol(Rol.ADMIN)
                    .activo(true)
                    .build();
            repo.save(admin);
            log.info("Usuario admin creado: admin@ventas.com / admin123");
        }
    }
}
