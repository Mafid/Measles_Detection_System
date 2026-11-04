import { Link, useLocation } from "react-router-dom";

function Navbar() {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo">
                    <span className="logo-mark">M</span>
                    <span>Measles</span>
                </Link>

                <div className="nav-links">
                    <Link
                        to="/"
                        className={`nav-link ${currentPath === "/" ? "nav-link-active" : ""}`}
                    >
                        Home
                    </Link>

                    <Link
                        to="/detection"
                        className={`nav-link ${currentPath === "/detection" ? "nav-link-active" : ""}`}
                    >
                        Detection
                    </Link>

                    <Link
                        to="/result"
                        className={`nav-link ${currentPath === "/result" ? "nav-link-active" : ""}`}
                    >
                        Results
                    </Link>


                </div>
            </div>
        </nav>
    );
}

export default Navbar;