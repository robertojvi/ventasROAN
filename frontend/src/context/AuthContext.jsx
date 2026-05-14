import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (u) setUsuario(JSON.parse(u))
    setCargando(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    const u = { id: data.id, nombre: data.nombre, email: data.email, rol: data.rol }
    localStorage.setItem('usuario', JSON.stringify(u))
    setUsuario(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const tieneRol = (...roles) => usuario && roles.includes(usuario.rol)

  return (
    <AuthContext.Provider value={{ usuario, login, logout, tieneRol, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
