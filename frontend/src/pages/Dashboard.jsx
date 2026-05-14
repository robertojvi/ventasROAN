import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Link } from 'react-router-dom'

const fmt = (n) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Dashboard() {
  const [ventas, setVentas] = useState([])
  const [pagos, setPagos] = useState([])

  useEffect(() => {
    api.get('/ventas').then(r => setVentas(r.data)).catch(() => {})
    api.get('/reportes/pagos-pendientes').then(r => setPagos(r.data)).catch(() => {})
  }, [])

  const hoy = new Date().toISOString().slice(0, 10)
  const ventasHoy = ventas.filter(v => v.fecha === hoy && v.estado !== 'ANULADA')
  const totalHoy = ventasHoy.reduce((s, v) => s + Number(v.total), 0)
  const totalGeneral = ventas.filter(v => v.estado !== 'ANULADA').reduce((s, v) => s + Number(v.total), 0)
  const totalPendiente = pagos.reduce((s, p) => s + Number(p.saldo), 0)

  return (
    <div>
      <h1 className="page-title">Inicio</h1>
      <div className="stat-grid">
        <div className="stat"><div className="label">Ventas hoy</div><div className="value">{ventasHoy.length}</div></div>
        <div className="stat"><div className="label">Monto hoy</div><div className="value">{fmt(totalHoy)}</div></div>
        <div className="stat"><div className="label">Total histórico</div><div className="value">{fmt(totalGeneral)}</div></div>
        <div className="stat"><div className="label">Por cobrar</div><div className="value">{fmt(totalPendiente)}</div></div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Últimas ventas</h3>
        <table>
          <thead><tr><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {ventas.slice(0, 8).map(v => (
              <tr key={v.id}>
                <td>{v.fecha}</td>
                <td>{v.clienteNombre}</td>
                <td>{fmt(v.total)}</td>
                <td><span className={`estado ${v.estado}`}>{v.estado}</span></td>
                <td><Link to={`/ventas/${v.id}`}>Ver</Link></td>
              </tr>
            ))}
            {ventas.length === 0 && <tr><td colSpan="5" style={{ color: '#888' }}>Sin ventas aún.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Pagos pendientes / vencidos</h3>
        <table>
          <thead><tr><th>Venta</th><th>Cliente</th><th>Cuota</th><th>Vence</th><th>Saldo</th><th>Estado</th></tr></thead>
          <tbody>
            {pagos.slice(0, 8).map(p => (
              <tr key={p.pagoId}>
                <td><Link to={`/ventas/${p.ventaId}`}>#{p.ventaId}</Link></td>
                <td>{p.clienteNombre}</td>
                <td>#{p.numeroCuota}</td>
                <td>{p.fechaVencimiento}</td>
                <td>{fmt(p.saldo)}</td>
                <td><span className={`estado ${p.estado}`}>{p.estado}</span></td>
              </tr>
            ))}
            {pagos.length === 0 && <tr><td colSpan="6" style={{ color: '#888' }}>Sin pagos pendientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
