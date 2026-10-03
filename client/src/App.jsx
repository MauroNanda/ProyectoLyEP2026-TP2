import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./css/app.css";
import Header from "./components/Header";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import AppRoutes from "./routes/routes";
import useAutorizaciones from "./hooks/useAutorizaciones";

function App() {
  const { admin } = useAutorizaciones();
  const { pathname } = useLocation();
  const login = pathname === "/login";
  const label = login
    ? "Iniciar sesión"
    : pathname === "/"
      ? "Inicio"
      : pathname === "/clientes"
        ? "Clientes"
        : pathname.startsWith("/clientes/")
          ? "Ficha del cliente"
          : "Página no encontrada";
  useEffect(() => {
    document.title = label + " · Apacheta";
  }, [label]);
  return (
    <div
      className={
        "apacheta-app " + (admin && !login ? "workspace-app" : "access-app")
      }
    >
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      {admin && !login ? (
        <aside className="app-sidebar">
          <Header />
          <Nav />
          <p className="sidebar-region">Distribuidoras del NOA</p>
        </aside>
      ) : (
        !login && <Header />
      )}
      <div className="workspace-body">
        {admin && !login && (
          <div className="workspace-context">
            <nav aria-label="Ubicación">
              <Link to="/" translate="no">
                Apacheta
              </Link>
              <span aria-hidden="true">/</span>
              {pathname.startsWith("/clientes/") && (
                <>
                  <Link to="/clientes">Clientes</Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
              <span aria-current="page">{label}</span>
            </nav>
            <span className="context-sector">{admin.sector}</span>
          </div>
        )}
        <main id="contenido" className="app-main" tabIndex={-1}>
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </div>
  );
}
export default App;
