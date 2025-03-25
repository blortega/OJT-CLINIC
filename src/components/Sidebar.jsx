import {
  FiBell,
  FiSettings,
  FiLogOut,
  FiUsers,
  FiBarChart2,
  FiClipboard,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

const sidebarLinks = [
  { to: "/dashboard", icon: <FiBarChart2 />, label: "Dashboard" },
  { to: "/inventory", icon: <FiClipboard />, label: "Inventory" },
  { to: "/manage-user", icon: <FiUsers />, label: "User Management" },
  { to: "/records", icon: <FiBell />, label: "Records" },
  { to: "/settings", icon: <FiSettings />, label: "Settings" },
];

const Sidebar = ({ children }) => {
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h1 style={styles.logoText}>Innodata Clinic</h1>

        {/* Navigation Links */}
        <nav style={styles.navLinks}>
          {sidebarLinks.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) =>
                isActive
                  ? { ...styles.sidebarLink, ...styles.activeLink }
                  : styles.sidebarLink
              }
            >
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <button style={styles.logoutButton}>
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.contentWrapper}>{children}</main>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    width: "100vw",
    minHeight: "100vh",
    background: "#f5f6fa",
  },
  sidebar: {
    width: "250px",
    height: "100vh",
    backgroundColor: "white",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    position: "fixed",
    left: 0,
    top: 0,
    overflowY: "auto",
  },
  contentWrapper: {
    marginLeft: "250px",
    flexGrow: 1,
    padding: "20px",
  },
  logoText: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#2d97e9",
    marginBottom: "20px",
  },
  navLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sidebarLink: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    textDecoration: "none",
    color: "#333",
    borderRadius: "5px",
    transition: "background 0.3s ease",
    gap: "10px",
  },
  activeLink: {
    backgroundColor: "#2d97e9",
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#333",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "10px",
    gap: "10px",
    transition: "background 0.3s ease",
    marginTop: "550px",
  },
};

export default Sidebar;
