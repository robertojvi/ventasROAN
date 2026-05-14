import { useEffect, useState } from 'react'
import api from '../api/client.js'

const vacio = { nombre: '', email: '', password: '', rol: 'VENDEDOR', activo: true }

export default function Usuarios() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const cargar = () => api.get('/usuarios').then(r => setItems(r.data))
  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => { setForm(vacio); setEditId(null); setError(''); setModal(true) }
  const abrirEditar = (u) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol, activo: u.activo })
    setEditId(u.id); setError(''); setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const body = { ...form }
      if (editId && !body.password) delete body.password
      if (editId) await api.put(`/usuarios/${editId}`, body)
      else await api.post('/usuarios', body)
      setModal(false)
      cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return
    await api.delete(`/usuarios/${id}`)
    cargar()
  }

  return (
    <div>
      <h1 className="page-title">Usuarios</h1>
      <div className="toolbar"><button onClick={abrirNuevo}>+ Nuevo usuario</button></div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="row-actions">
                  <button className="ghost" onClick={() => abrirEditar(u)}>Editar</button>
                  {u.activo && <button className="ghost" style={{ color: '#b91c1c' }} onClick={() => eliminar(u.id)}>Desactivar</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" style={{ color: '#888', padding: 16 }}>Sin usuarios.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
            {error && <div className="error" style={{ marginBottom: 10 }}>{error}</div>}
            <form onSubmit={guardar}>
              <div className="form-grid">
                <div><label>Nombre *</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                <div><label>Email *</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div>
                  <label>{editId ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                  <input type="password" minLength={editId ? 0 : 6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div>
                  <label>Rol *</label>
                  <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                    <option value="ADMIN">Administrador</option>
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="VISOR">Visor</option>
                  </select>
                </div>
                <div>
                  <label>Estado</label>
                  <select value={form.activo} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
