import { useContext } from 'react'
import { AutorizacionesContext } from '../context/autorizaciones'
const useAutorizaciones = () => {
  return useContext(AutorizacionesContext)
}
export default useAutorizaciones
