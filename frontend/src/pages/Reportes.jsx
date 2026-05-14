import { useEffect, useState } from 'react'
import api from '../api/client.js'

const fmt = (n) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Reportes() {
  const [tab, setTab] = useState('periodo')
  return (
    <div>
      <h1 className="page-title">Reportes</h1>
      <div className="toolbar">
        <button className={tab === 'periodo' ? '' : 'secondary'} onClick={() => setTab('periodo')}>Ventas por período</button>
        <button className={tab === 'cliente' ? '' : 'secondary'} onClick={() => setTab('cliente')}>Ventas por cliente</button>
        <button className={tab === 'productos' ? '' : 'secondary'} onClick={() => setTab('productos')}>Productos más vendidos</button>
        <button className={tab === 'pagos' ? '' : 'secondary'} onClick={() => setTab('pagos')}>Pagos pendientes</button>
      </div>
      {tab === 'periodo' && <ReportePeriodo />}
      {tab === 'cliente' && <ReporteCliente />}
      {tab === 'productos' && <ReporteProductos />}
      {tab === 'pagos' && <ReportePagos />}
    </div>
  )
}

function ReportePeriodo() {
  const inicioMes = () => {
    const d = new Date(); d.setDate(1)
    return d.toISOString().slice(0, 10)
  }
  const [desde, setDesde] = useState(inicioMes())
  const [hasta, setHasta] = useState(new Date().toISOString().slice(0, 10))
  const [data, setData] = useState(null)

  const cargar = () =>
    api.get('/reportes/ventas-por-periodo', { params: { desde, hasta } }).then(r => setData(r.data))

  useEffect(() => { cargar() }, [])

  return (
    <div>
      <div className="toolbar">
        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        <button onClick={cargar}>Filtrar</button>
      </div>
      {data && (
        <>
          <div className="stat-grid">
            <div className="stat"><div className="label">Cantidad ventas</div><div className="value">{data.cantidadVentas}</div></div>
            <div className="stat"><div className="label">Monto total</div><div className="value">{fmt(data.montoTotal)}</div></div>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>Fecha</th><th>Ventas</th><th>Monto</th></tr></thead>
              <tbody>
                {data.serie.map((r, i) => (
                  <tr key={i}><td>{r.fecha}</td><td>{r.totalVentas}</td><td>{fmt(r.monto)}</td></tr>
                ))}
                {data.serie.length === 0 && <tr><td colSpan="3" style={{ color: '#888', padding: 16 }}>Sin datos en el rango.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function ReporteCliente() {
  const [items, setItems] = useState([])
  useEffect(() => { api.get('/reportes/ventas-por-cliente').then(r => setItems(r.data)) }, [])
  return (
    <div className="card" style={{ padding: 0 }}>
      <table>
        <thead><tr><th>Cliente</th><th>Cantidad ventas</th><th>Monto total</th></tr></thead>
        <tbody>
          {items.map(r => (
            <tr key={r.clienteId}><td>{r.clienteNombre}</td><td>{r.cantidadVentas}</td><td>{fmt(r.montoTotal)}</td></tr>
          ))}
          {items.length === 0 && <tr><td colSpan="3" style={{ color: '#888', padding: 16 }}>Sin datos.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function ReporteProductos() {
  const [items, setItems] = useState([])
  useEffect(() => { api.get('/reportes/productos-mas-vendidos').then(r => setItems(r.data)) }, [])
  return (
    <div className="card" style={{ padding: 0 }}>
      <table>
        <thead><tr><th>Producto</th><th>Unidades vendidas</th><th>Monto total</th></tr></thead>
        <tbody>
          {items.map(r => (
            <tr key={r.productoId}><td>{r.productoNombre}</td><td>{r.unidadesVendidas}</td><td>{fmt(r.montoTotal)}</td></tr>
          ))}
          {items.length === 0 && <tr><td colSpan="3" style={{ color: '#888', padding: 16 }}>Sin datos.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function ReportePagos() {
  const [items, setItems] = useState([])
  useEffect(() => { api.get('/reportes/pagos-pendientes').then(r => setItems(r.data)) }, [])
  return (
    <div className="card" style={{ padding: 0 }}>
      <table>
        <thead><tr><th>Venta</th><th>Cliente</th><th>Cuota</th><th>Vencimiento</th><th>Monto</th><th>Pagado</th><th>Saldo</th><th>Estado</th></tr></thead>
        <tbody>
          {items.map(p => (
            <tr key={p.pagoId}>
              <td>#{p.ventaId}</td>
              <td>{p.clienteNombre}</td>
              <td>{p.numeroCuota}</td>
              <td>{p.fechaVencimiento}</td>
              <td>{fmt(p.monto)}</td>
              <td>{fmt(p.montoPagado)}</td>
              <td>{fmt(p.saldo)}</td>
              <td><span className={`estado ${p.estado}`}>{p.estado}</span></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan="8" style={{ color: '#888', padding: 16 }}>Sin pagos pendientes.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
