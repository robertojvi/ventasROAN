import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

const fmt = (n) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function DetalleVenta() {
  const { id } = useParams()
  const { tieneRol } = useAuth()
  const [venta, setVenta] = useState(null)
  const [pagoCuota, setPagoCuota] = useState(null)
  const [monto, setMonto] = useState('')
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')

  const cargar = () => api.get(`/ventas/${id}`).then(r => setVenta(r.data))
  useEffect(() => { cargar() }, [id])

  if (!venta) return <p>Cargando…</p>

  const puedePagar = tieneRol('ADMIN', 'VENDEDOR') && venta.estado !== 'ANULADA' && venta.estado !== 'PAGADA'
  const puedeAnular = tieneRol('ADMIN') && venta.estado !== 'ANULADA'

  const registrarPago = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/ventas/${id}/pagos`, {
        pagoId: pagoCuota,
        monto: Number(monto),
        fechaPago
      })
      setPagoCuota(null); setMonto('')
      cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el pago')
    }
  }

  const anular = async () => {
    if (!confirm('¿Anular esta venta? El stock será restituido.')) return
    try {
      await api.post(`/ventas/${id}/anular`)
      cargar()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al anular')
    }
  }

  return (
    <div>
      <Link to="/ventas">&larr; Volver a ventas</Link>
      <h1 className="page-title">Venta #{venta.id}</h1>

      <div className="card">
        <div className="form-grid">
          <div><strong>Fecha:</strong> {venta.fecha}</div>
          <div><strong>Cliente:</strong> {venta.clienteNombre}</div>
          <div><strong>Vendedor:</strong> {venta.vendedorNombre || '—'}</div>
          <div><strong>Estado:</strong> <span className={`estado ${venta.estado}`}>{venta.estado}</span></div>
          <div><strong>Subtotal:</strong> {fmt(venta.subtotal)}</div>
          <div><strong>Descuento:</strong> {fmt(venta.descuento)}</div>
          <div><strong>Total:</strong> {fmt(venta.total)}</div>
          <div><strong>Pagado:</strong> {fmt(venta.totalPagado)}</div>
          <div><strong>Saldo:</strong> {fmt(venta.saldoPendiente)}</div>
        </div>
        {venta.notas && <p><strong>Notas:</strong> {venta.notas}</p>}
        {puedeAnular && (
          <div style={{ textAlign: 'right' }}>
            <button className="danger" onClick={anular}>Anular venta</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Productos</h3>
        <table>
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
          <tbody>
            {venta.items.map(i => (
              <tr key={i.id}>
                <td>{i.productoNombre}</td>
                <td>{i.cantidad}</td>
                <td>{fmt(i.precioUnitario)}</td>
                <td>{fmt(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Cuotas / Pagos</h3>
        <table>
          <thead><tr><th>#</th><th>Vencimiento</th><th>Monto</th><th>Pagado</th><th>Fecha pago</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {venta.pagos.map(p => (
              <tr key={p.id}>
                <td>{p.numeroCuota}</td>
                <td>{p.fechaVencimiento}</td>
                <td>{fmt(p.monto)}</td>
                <td>{fmt(p.montoPagado)}</td>
                <td>{p.fechaPago || '—'}</td>
                <td><span className={`estado ${p.estado}`}>{p.estado}</span></td>
                <td>
                  {puedePagar && p.estado !== 'PAGADO' && (
                    <button className="ghost" onClick={() => { setPagoCuota(p.id); setMonto((Number(p.monto) - Number(p.montoPagado)).toFixed(2)) }}>
                      Pagar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagoCuota && (
          <form onSubmit={registrarPago} style={{ marginTop: 16, padding: 14, background: '#f8fafc', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0 }}>Registrar pago</h4>
            {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
            <div className="form-grid">
              <div><label>Monto</label><input type="number" min="0.01" step="0.01" required value={monto} onChange={e => setMonto(e.target.value)} /></div>
              <div><label>Fecha del pago</label><input type="date" required value={fechaPago} onChange={e => setFechaPago(e.target.value)} /></div>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => { setPagoCuota(null); setMonto('') }}>Cancelar</button>
              <button type="submit">Confirmar pago</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
