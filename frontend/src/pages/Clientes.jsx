import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

const vacio = { nombre: '', documento: '', email: '', telefono: '', direccion: '' }

export default function Clientes() {
  const { tieneRol } = useAuth()
  const puedeEditar = tieneRol('ADMIN', 'VENDEDOR')
  const puedeEliminar = tieneRol('ADMIN')

  const [items, setItems] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const cargar = () => api.get('/clientes').then(r => setItems(r.data))
  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => { setForm(vacio); setEditId(null); setError(''); setModal(true) }
  const abrirEditar = (c) => { setForm({ ...c }); setEditId(c.id); setError(''); setModal(true) }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editId) await api.put(`/clientes/${editId}`, form)
      else await api.post('/clientes', form)
      setModal(false)
      cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    try {
      await api.delete(`/clientes/${id}`)
      cargar()
    } catch (err) {
      alert(err.response?.data?.error || 'No se puede eliminar (posiblemente tenga ventas asociadas)')
    }
  }

  return (
    <div>
      <h1 className="page-title">Clientes</h1>
      {puedeEditar && (
        <div className="toolbar"><button onClick={abrirNuevo}>+ Nuevo cliente</button></div>
      )}
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Nombre</th><th>Documento</th><th>Email</th><th>Teléfono</th><th></th></tr></thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.documento || '—'}</td>
                <td>{c.email || '—'}</td>
                <td>{c.telefono || '—'}</td>
                <td className="row-actions">
                  {puedeEditar && <button className="ghost" onClick={() => abrirEditar(c)}>Editar</button>}
                  {puedeEliminar && <button className="ghost" style={{ color: '#b91c1c' }} onClick={() => eliminar(c.id)}>Eliminar</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" style={{ color: '#888', padding: 16 }}>Sin clientes.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
            {error && <div className="error" style={{ marginBottom: 10 }}>{error}</div>}
            <form onSubmit={guardar}>
              <div className="form-grid">
                <div><label>Nombre *</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                <div><label>Documento</label><input value={form.documento || ''} onChange={e => setForm({ ...form, documento: e.target.value })} /></div>
                <div><label>Email</label><input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><label>Teléfono</label><input value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Dirección</label>
                  <input value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} />
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
