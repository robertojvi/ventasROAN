import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const fmt = (n) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Ventas() {
  const { tieneRol } = useAuth()
  const puedeVender = tieneRol('ADMIN', 'VENDEDOR')

  const [items, setItems] = useState([])
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const cargar = () => {
    const params = {}
    if (desde && hasta) { params.desde = desde; params.hasta = hasta }
    api.get('/ventas', { params }).then(r => setItems(r.data))
  }

  useEffect(() => { cargar() }, [])

  return (
    <div>
      <h1 className="page-title">Ventas</h1>
      <div className="toolbar">
        {puedeVender && <Link to="/ventas/nueva"><button>+ Nueva venta</button></Link>}
        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} style={{ width: 160 }} />
        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} style={{ width: 160 }} />
        <button className="secondary" onClick={cargar}>Filtrar</button>
        <button className="ghost" onClick={() => { setDesde(''); setHasta(''); setTimeout(cargar, 0) }}>Limpiar</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(v => (
              <tr key={v.id}>
                <td>#{v.id}</td>
                <td>{v.fecha}</td>
                <td>{v.clienteNombre}</td>
                <td>{fmt(v.total)}</td>
                <td>{fmt(v.totalPagado)}</td>
                <td>{fmt(v.saldoPendiente)}</td>
                <td><span className={`estado ${v.estado}`}>{v.estado}</span></td>
                <td><Link to={`/ventas/${v.id}`}>Ver</Link></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="8" style={{ color: '#888', padding: 16 }}>Sin ventas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
