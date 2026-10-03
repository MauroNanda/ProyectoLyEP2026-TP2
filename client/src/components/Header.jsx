import { Link } from "react-router-dom";
import ApachetaLogo from "./ApachetaLogo";
const Header = () => (
  <header className="app-header">
    <Link to="/" className="brand" aria-label="Apacheta, inicio" translate="no">
      <ApachetaLogo />
      <span>Apacheta</span>
    </Link>
    <p className="brand-description">Seguimiento comercial</p>
  </header>
);
export default Header;
