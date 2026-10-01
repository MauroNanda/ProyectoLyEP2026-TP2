import '../css/dashboard.css'
import { useEffect, useState } from 'react'
import useAutorizaciones from '../hooks/useAutorizaciones'
import AutorizacionesService from '../services/autorizacionesServices'
import Login from './Login'

const URL_CLIENTES = 'https://fakestoreapi.com/users'

const Dashboard = () => {
  const { admin } = useAutorizaciones()
  const usuariosPorSector = AutorizacionesService.contarUsuariosPorSector()
  const [totalClientes, setTotalClientes] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let vigente = true

    fetch(URL_CLIENTES)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al obtener clientes')
        }
        return res.json()
      })
      .then((data) => {
        if (!vigente) return
        setTotalClientes(Array.isArray(data) ? data.length : 0)
        setCargando(false)
      })
      .catch(() => {
        if (!vigente) return
        setError(true)
        setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [])

  return (
    <div className="dashboard">

      <h1>Panel de Control de Clientes</h1>

      {!admin ? (
        <div className="dashboard-login">
          <h3>Bienvenido al sistema</h3>
          <p>Ingrese sus credenciales para acceder.</p>
          <Login />
        </div>
      ) : (
        <>
          <div className="user-card">
            <h3>Usuario conectado</h3>

            <p><strong>Administrador:</strong> {admin.nombre}</p>
            <p><strong>Email:</strong> {admin.email}</p>
            <p><strong>Sector:</strong> {admin.sector}</p>
          </div>
          <div className="dashboard-cards">

            <div className="dashboard-card" aria-busy={cargando}>
              <h3>Clientes</h3>
              <p>{cargando ? '...' : error ? '-' : totalClientes}</p>
              {error && (
                <span role="alert" className="dashboard-card-error">
                  No se pudo obtener el total de clientes.
                </span>
              )}
            </div>

            {Object.entries(usuariosPorSector).map(([nombreSector, cantidad]) => (
              <div className="dashboard-card" key={nombreSector}>
                <h3>{nombreSector}</h3>
                <p>{cantidad}</p>
              </div>
            ))}
          </div>

        </>
      )}

    </div>
  )
}

export default Dashboard