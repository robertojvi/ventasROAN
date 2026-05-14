# Sistema de Gestión de Ventas

Aplicación full-stack para gestionar productos, clientes, ventas (con cuotas), inventario y reportes.

## Stack

- **Backend:** Java 17, Spring Boot 3.2, Spring Security + JWT, Spring Data JPA, MySQL 8
- **Frontend:** Vite + React 18 (JavaScript), React Router, Axios
- **Idioma:** Español

## Roles

- **ADMIN:** acceso total (usuarios, productos, clientes, ventas, reportes).
- **VENDEDOR:** gestiona clientes y ventas, ve productos y reportes.
- **VISOR:** solo lectura: productos, clientes, ventas y reportes.

## Funcionalidades

- Login con email/contraseña (JWT).
- CRUD de Productos con control de stock.
- CRUD de Clientes.
- Registro de Ventas con múltiples ítems, descuento y cuotas/pagos.
- Pagos parciales por venta con seguimiento de saldo.
- Reportes: ventas totales por período, ventas por cliente, productos más vendidos, pagos pendientes/vencidos.

## Estructura

```
sistema-ventas/
├── backend/             # Spring Boot
├── frontend/            # Vite + React
└── db/init.sql          # Script inicial de base de datos
```

## Instalación rápida

### 1. Base de datos (MySQL)

```bash
mysql -u root -p < db/init.sql
```

Esto crea la base `sistema_ventas` y un usuario admin inicial:
- **email:** admin@ventas.com
- **password:** admin123

### 2. Backend

Requiere Java 17+ y Maven.

```bash
cd backend
mvn spring-boot:run
```

Por defecto corre en `http://localhost:8080`.

Configura tu conexión MySQL en `backend/src/main/resources/application.yml` (usuario/password de MySQL).

### 3. Frontend

Requiere Node 18+.

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

## API (resumen)

| Método | Endpoint | Descripción | Rol mínimo |
|--------|----------|-------------|------------|
| POST | `/api/auth/login` | Iniciar sesión, devuelve JWT | público |
| GET/POST/PUT/DELETE | `/api/usuarios` | Gestión de usuarios | ADMIN |
| GET/POST/PUT/DELETE | `/api/productos` | Productos | VENDEDOR (escritura ADMIN) |
| GET/POST/PUT/DELETE | `/api/clientes` | Clientes | VENDEDOR |
| GET/POST | `/api/ventas` | Ventas | VENDEDOR |
| POST | `/api/ventas/{id}/pagos` | Registrar pago | VENDEDOR |
| GET | `/api/reportes/ventas-por-periodo` | Reporte por período | VISOR |
| GET | `/api/reportes/ventas-por-cliente` | Reporte por cliente | VISOR |
| GET | `/api/reportes/productos-mas-vendidos` | Top productos | VISOR |
| GET | `/api/reportes/pagos-pendientes` | Pagos pendientes/vencidos | VISOR |

Envía el token en header: `Authorization: Bearer <token>`.
