import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ListaClientes from '../pages/ListaClientes'
import DetalleCliente from '../pages/DetalleCliente'
import ErrorPage from '../pages/ErrorPage'
import RutaProtegida from '../components/RutaProtegida'
import MiCuenta from '../pages/MiCuenta'
import Cuentas from '../pages/Cuentas'
import HistorialAdministrativo from '../pages/HistorialAdministrativo'
const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />
      <Route
        path="/clientes"
        element={
          <RutaProtegida>
            <ListaClientes />
          </RutaProtegida>
        }
      />
      <Route
        path="/clientes/:id"
        element={
         <RutaProtegida>
          <DetalleCliente />
         </RutaProtegida>
      }
      />
      <Route path="/mi-cuenta" element={<RutaProtegida><MiCuenta /></RutaProtegida>} />
      <Route path="/cuentas" element={<RutaProtegida administrativa><Cuentas /></RutaProtegida>} />
      <Route path="/historial-administrativo" element={<RutaProtegida administrativa><HistorialAdministrativo /></RutaProtegida>} />
      <Route path="*" element={<ErrorPage />} />

    </Routes>
  )
}
export default AppRoutes
