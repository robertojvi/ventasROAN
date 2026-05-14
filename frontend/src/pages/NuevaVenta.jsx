import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'

const hoy = () => new Date().toISOString().slice(0, 10)

export default function NuevaVenta() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [descuento, setDescuento] = useState(0)
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState([])
  const [cuotas, setCuotas] = useState([{ fechaVencimiento: hoy(), monto: 0 }])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    api.get('/clientes').then(r => setClientes(r.data))
    api.get('/productos', { params: { soloActivos: true } }).then(r => setProductos(r.data))
  }, [])

  const subtotal = useMemo(() =>
    items.reduce((s, i) => s + (Number(i.precioUnitario) * Number(i.cantidad) || 0), 0),
    [items])
  const total = useMemo(() => Math.max(0, subtotal - Number(descuento || 0)), [subtotal, descuento])

  const sumaCuotas = useMemo(() => cuotas.reduce((s, c) => s + Number(c.monto || 0), 0), [cuotas])

  const agregarItem = () => setItems([...items, { productoId: '', cantidad: 1, precioUnitario: 0 }])
  const quitarItem = (idx) => setItems(items.filter((_, i) => i !== idx))
  const cambiarItem = (idx, campo, valor) => {
    const copia = [...items]
    copia[idx] = { ...copia[idx], [campo]: valor }
    if (campo === 'productoId') {
      const p = productos.find(pr => String(pr.id) === String(valor))
      if (p) copia[idx].precioUnitario = p.precio
    }
    setItems(copia)
  }

  const agregarCuota = () => setCuotas([...cuotas, { fechaVencimiento: hoy(), monto: 0 }])
  const quitarCuota = (idx) => setCuotas(cuotas.filter((_, i) => i !== idx))
  const cambiarCuota = (idx, campo, valor) => {
    const c = [...cuotas]
    c[idx] = { ...c[idx], [campo]: valor }
    setCuotas(c)
  }

  const distribuirIgual = () => {
    if (cuotas.length === 0) return
    const por = Math.floor((total / cuotas.length) * 100) / 100
    const resto = Math.round((total - por * cuotas.length) * 100) / 100
    const nuevas = cuotas.map((c, i) => ({
      ...c,
      monto: i === cuotas.length - 1 ? Math.round((por + resto) * 100) / 100 : por
    }))
    setCuotas(nuevas)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    if (!clienteId) { setError('Seleccione un cliente'); return }
    if (items.length === 0) { setError('Agregue al menos un producto'); return }
    if (Math.abs(sumaCuotas - total) > 0.01) {
      setError(`La suma de cuotas (${sumaCuotas.toFixed(2)}) debe coincidir con el total (${total.toFixed(2)})`)
      return
    }
    setGuardando(true)
    try {
      const body = {
        clienteId: Number(clienteId),
        fecha,
        descuento: Number(descuento || 0),
        notas,
        items: items.map(i => ({
          productoId: Number(i.productoId),
          cantidad: Number(i.cantidad),
          precioUnitario: Number(i.precioUnitario)
        })),
        cuotas: cuotas.map(c => ({ fechaVencimiento: c.fechaVencimiento, monto: Number(c.monto) }))
      }
      const { data } = await api.post('/ventas', body)
      navigate(`/ventas/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la venta')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Nueva venta</h1>
      {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={guardar}>
        <div className="card">
          <div className="form-grid">
            <div>
              <label>Cliente *</label>
              <select required value={clienteId} onChange={e => setClienteId(e.target.value)}>
                <option value="">Seleccione…</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div><label>Fecha *</label><input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} /></div>
            <div><label>Descuento</label><input type="number" min="0" step="0.01" value={descuento} onChange={e => setDescuento(e.target.value)} /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Notas</label>
              <input value={notas} onChange={e => setNotas(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Productos</h3>
          <table>
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unit.</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    <select value={it.productoId} onChange={e => cambiarItem(idx, 'productoId', e.target.value)} required>
                      <option value="">Seleccione…</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
                      ))}
                    </select>
                  </td>
                  <td><input type="number" min="1" value={it.cantidad} onChange={e => cambiarItem(idx, 'cantidad', e.target.value)} style={{ width: 80 }} /></td>
                  <td><input type="number" min="0" step="0.01" value={it.precioUnitario} onChange={e => cambiarItem(idx, 'precioUnitario', e.target.value)} style={{ width: 110 }} /></td>
                  <td>{(Number(it.precioUnitario) * Number(it.cantidad) || 0).toFixed(2)}</td>
                  <td><button type="button" className="ghost" style={{ color: '#b91c1c' }} onClick={() => quitarItem(idx)}>Quitar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={agregarItem} style={{ marginTop: 10 }}>+ Agregar producto</button>
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <div>Subtotal: <strong>{subtotal.toFixed(2)}</strong></div>
            <div>Descuento: <strong>{Number(descuento || 0).toFixed(2)}</strong></div>
            <div style={{ fontSize: 18, marginTop: 4 }}>Total: <strong>{total.toFixed(2)}</strong></div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Cuotas / Pagos programados</h3>
          <p style={{ color: '#666', marginTop: 0 }}>La suma de las cuotas debe ser igual al total de la venta.</p>
          <table>
            <thead><tr><th>#</th><th>Fecha vencimiento</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              {cuotas.map((c, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td><input type="date" required value={c.fechaVencimiento} onChange={e => cambiarCuota(idx, 'fechaVencimiento', e.target.value)} /></td>
                  <td><input type="number" min="0" step="0.01" value={c.monto} onChange={e => cambiarCuota(idx, 'monto', e.target.value)} style={{ width: 140 }} /></td>
                  <td><button type="button" className="ghost" style={{ color: '#b91c1c' }} onClick={() => quitarCuota(idx)}>Quitar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button type="button" onClick={agregarCuota}>+ Agregar cuota</button>
            <button type="button" className="secondary" onClick={distribuirIgual}>Distribuir total en partes iguales</button>
          </div>
          <div style={{ marginTop: 10, textAlign: 'right' }}>
            Suma cuotas: <strong>{sumaCuotas.toFixed(2)}</strong> / Total: <strong>{total.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="secondary" onClick={() => navigate('/ventas')}>Cancelar</button>
          <button type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Registrar venta'}</button>
        </div>
      </form>
    </div>
  )
}
