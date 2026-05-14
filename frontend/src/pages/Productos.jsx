import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

const vacio = { sku: '', nombre: '', descripcion: '', precio: '', stock: 0, activo: true }

export default function Productos() {
  const { tieneRol } = useAuth()
  const puedeEditar = tieneRol('ADMIN', 'VENDEDOR')
  const puedeEliminar = tieneRol('ADMIN')

  const [items, setItems] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const cargar = () => api.get('/productos').then(r => setItems(r.data))

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => { setForm(vacio); setEditId(null); setError(''); setModal(true) }
  const abrirEditar = (p) => {
    setForm({ sku: p.sku || '', nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, activo: p.activo })
    setEditId(p.id); setError(''); setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const body = { ...form, precio: Number(form.precio), stock: Number(form.stock) }
      if (editId) await api.put(`/productos/${editId}`, body)
      else await api.post('/productos', body)
      setModal(false)
      cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar (desactivar) este producto?')) return
    try {
      await api.delete(`/productos/${id}`)
      cargar()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar el producto')
    }
  }

  return (
    <div>
      <h1 className="page-title">Productos</h1>
      {puedeEditar && (
        <div className="toolbar"><button onClick={abrirNuevo}>+ Nuevo producto</button></div>
      )}
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>SKU</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id}>
                <td>{p.sku || '—'}</td>
                <td>{p.nombre}</td>
                <td>{Number(p.precio).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>{p.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="row-actions">
                  {puedeEditar && <button className="ghost" onClick={() => abrirEditar(p)}>Editar</button>}
                  {puedeEliminar && p.activo && <button className="ghost" style={{ color: '#b91c1c' }} onClick={() => eliminar(p.id)}>Eliminar</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" style={{ color: '#888', padding: 16 }}>Sin productos.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Editar producto' : 'Nuevo producto'}</h3>
            {error && <div className="error" style={{ marginBottom: 10 }}>{error}</div>}
            <form onSubmit={guardar}>
              <div className="form-grid">
                <div><label>SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
                <div><label>Nombre *</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                <div><label>Precio *</label><input required type="number" step="0.01" min="0" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} /></div>
                <div><label>Stock *</label><input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Descripción</label>
                  <textarea rows="3" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
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
