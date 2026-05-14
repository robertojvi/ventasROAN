import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Productos from './pages/Productos.jsx'
import Clientes from './pages/Clientes.jsx'
import Ventas from './pages/Ventas.jsx'
import NuevaVenta from './pages/NuevaVenta.jsx'
import DetalleVenta from './pages/DetalleVenta.jsx'
import Reportes from './pages/Reportes.jsx'
import Usuarios from './pages/Usuarios.jsx'

function Protegida({ children, roles }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protegida><Layout /></Protegida>}>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="ventas/nueva" element={
          <Protegida roles={['ADMIN','VENDEDOR']}><NuevaVenta /></Protegida>
        } />
        <Route path="ventas/:id" element={<DetalleVenta />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="usuarios" element={
          <Protegida roles={['ADMIN']}><Usuarios /></Protegida>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
