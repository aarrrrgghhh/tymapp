import { FiHome } from "react-icons/fi";
import { FiPackage } from "react-icons/fi";

function BottomNavbar({ activePage, setActivePage }) {
  return (
    <nav className="bottom-nav">
      <button
        className={
          activePage === "home"
            ? "nav-button active"
            : "nav-button"
        }
        onClick={() => setActivePage("home")}
      >
        <FiHome />
      </button>

      <button
        className={
          activePage === "medication"
            ? "nav-button active"
            : "nav-button"
        }
        onClick={() => setActivePage("medication")}
      >
        <FiPackage />
      </button>
    </nav>
  );
}

export default BottomNavbar;