import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Sistema de Ventas GATA</h2>
        <nav>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/ventas">Ventas</NavLink>
          <NavLink to="/reportes">Reportes</NavLink>
          {usuario?.rol === 'ADMIN' && <NavLink to="/usuarios">Usuarios</NavLink>}
        </nav>
        <div className="user">
          <div><strong>{usuario?.nombre}</strong></div>
          <div>{usuario?.email}</div>
          <div>Rol: {usuario?.rol}</div>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
