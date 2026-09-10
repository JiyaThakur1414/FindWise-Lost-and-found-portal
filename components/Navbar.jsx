import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/home" className="logo">
        Find<span>Wise</span>
      </Link>

      <div className="nav-links">

        <Link to="/home">
          Home
        </Link>

        <Link to="/lost">
          Lost Items
        </Link>

        <Link to="/found">
          Found Items
        </Link>

        <Link to="/post" className="post-btn">
          Post Item
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;