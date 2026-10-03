import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAutorizaciones from "../hooks/useAutorizaciones";
import ApachetaLogo from "../components/ApachetaLogo";
import Icon from "../components/Icon";
import AutorizacionesService from "../services/autorizacionesServices";

const Login = () => {
  const formRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sector, setSector] = useState("");
  const [errores, setErrores] = useState({});
  const { setAdmin } = useAutorizaciones();
  const navigate = useNavigate();
  const validar = () => {
    const nuevosErrores = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      nuevosErrores.email = "El email es obligatorio";
    } else if (!emailRegex.test(email)) {
      nuevosErrores.email = "Email inválido";
    }
    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else {
      if (password.length < 8) {
        nuevosErrores.password = "Mínimo 8 caracteres";
      } else if (!/[A-Z]/.test(password)) {
        nuevosErrores.password = "Debe tener una mayúscula";
      } else if (!/[0-9]/.test(password)) {
        nuevosErrores.password = "Debe tener un número";
      }
    }
    if (!sector) {
      nuevosErrores.sector = "Seleccione un sector";
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) {
      const key = Object.keys(nuevosErrores)[0];
      formRef.current.querySelector('[name="' + key + '"]').focus();
    }
    return Object.keys(nuevosErrores).length === 0;
  };
  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!validar()) return;
    const usuario = AutorizacionesService.login(email, password, sector);
    if (!usuario) {
      setErrores({
        acceso:
          "No pudimos iniciar sesión. Revisá el email, la contraseña y el sector.",
      });
      return;
    }
    setAdmin({
      nombre: usuario.nombre,
      email: usuario.email,
      sector: usuario.sector,
    });
    navigate("/");
  };
  return (
    <section className="login-layout" aria-labelledby="login-titulo">
      <div className="login-story">
        <div className="login-brand" translate="no">
          <ApachetaLogo size={60} />
          <span>Apacheta</span>
        </div>
        <div className="login-promise">
          <h1>Que ningún compromiso con el cliente quede en el camino.</h1>
          <p>Seguimiento comercial para distribuidoras mayoristas del NOA.</p>
        </div>
        <p className="login-positioning">
          Cerca de tus clientes.
          <br />
          En cada paso.
        </p>
      </div>
      <div className="login-form-side">
        <div className="login-form-panel">
          <h2 id="login-titulo">Volvé a tu equipo</h2>
          <p className="muted">
            Ingresá con tu usuario para consultar clientes.
          </p>
          <form ref={formRef} onSubmit={manejarSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="acceso-email">Email</label>
              <input
                id="acceso-email"
                name="email"
                type="email"
                spellCheck={false}
                autoComplete="username"
                placeholder="tu@email.com…"
                value={email}
                aria-invalid={Boolean(errores.email)}
                aria-describedby={errores.email ? "error-email" : undefined}
                onChange={(event) => setEmail(event.target.value)}
              />
              {errores.email && (
                <p className="field-error" id="error-email">
                  {errores.email}
                </p>
              )}
            </div>
            <div className="field-group">
              <label htmlFor="acceso-password">Contraseña</label>
              <input
                id="acceso-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                aria-invalid={Boolean(errores.password)}
                aria-describedby={
                  errores.password ? "error-password" : undefined
                }
                onChange={(event) => setPassword(event.target.value)}
              />
              {errores.password && (
                <p className="field-error" id="error-password">
                  {errores.password}
                </p>
              )}
            </div>
            <div className="field-group">
              <label htmlFor="acceso-sector">Sector</label>
              <select
                id="acceso-sector"
                name="sector"
                autoComplete="off"
                value={sector}
                aria-invalid={Boolean(errores.sector)}
                aria-describedby={errores.sector ? "error-sector" : undefined}
                onChange={(event) => setSector(event.target.value)}
              >
                <option value="">Seleccioná un sector</option>
                <option value="Soporte">Soporte</option>
                <option value="Gerencia">Gerencia</option>
              </select>
              {errores.sector && (
                <p className="field-error" id="error-sector">
                  {errores.sector}
                </p>
              )}
            </div>
            {Object.keys(errores).length > 0 && (
              <p className="inline-message error-message" role="status">
                {errores.acceso ||
                  "Revisá los campos indicados antes de ingresar."}
              </p>
            )}
            <button
              className="button button-primary login-submit"
              type="submit"
            >
              Ingresar
              <Icon name="arrow" size={18} />
            </button>
          </form>
          <p className="login-help">
            Usá el email, la contraseña y el sector asignados a tu usuario.
          </p>
        </div>
      </div>
    </section>
  );
};
export default Login;
