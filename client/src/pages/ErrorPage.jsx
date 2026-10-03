import { Link } from "react-router-dom";
import ApachetaLogo from "../components/ApachetaLogo";
import Icon from "../components/Icon";
const ErrorPage = () => (
  <section className="state-box error-page">
    <ApachetaLogo size={48} />
    <h1>Página no encontrada</h1>
    <p>
      Esta dirección no corresponde a una página de Apacheta.
      <br />
      Volvé al inicio para seguir trabajando.
    </p>
    <Link className="button button-primary" to="/">
      Volver al inicio
      <Icon name="arrow" size={18} />
    </Link>
  </section>
);
export default ErrorPage;
