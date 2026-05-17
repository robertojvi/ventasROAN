import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Layout() {
  const { usuario, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const cerrarSesion = () => {
    logout()
    navigate('/login')
  }

  const cerrar = () => setSidebarOpen(false)

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={cerrar} />}

      <div className="topbar">
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>&#9776;</button>
        <span className="topbar-title">Sistema de Ventas GATA</span>
        <button className="theme-toggle topbar-theme" onClick={toggle} title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          {dark ? '☀' : '🌙'}
        </button>
      </div>

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <h2>Sistema de Ventas GATA</h2>
        <nav>
          <NavLink to="/" end onClick={cerrar}>Inicio</NavLink>
          <NavLink to="/productos" onClick={cerrar}>Productos</NavLink>
          <NavLink to="/clientes" onClick={cerrar}>Clientes</NavLink>
          <NavLink to="/ventas" onClick={cerrar}>Ventas</NavLink>
          <NavLink to="/reportes" onClick={cerrar}>Reportes</NavLink>
          {usuario?.rol === 'ADMIN' && <NavLink to="/usuarios" onClick={cerrar}>Usuarios</NavLink>}
        </nav>
        <div className="user">
          <div><strong>{usuario?.nombre}</strong></div>
          <div>{usuario?.email}</div>
          <div>Rol: {usuario?.rol}</div>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
        <button className="theme-toggle" onClick={toggle} title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          {dark ? '☀ Modo claro' : '🌙 Modo oscuro'}
        </button>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
