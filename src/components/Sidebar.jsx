import { useState, useRef, useEffect } from "react";
import {
  FiBell,
  FiSettings,
  FiUsers,
  FiBarChart2,
  FiClipboard,
  FiChevronUp,
  FiChevronDown,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const sidebarLinks = [
  { to: "/dashboard", icon: <FiBarChart2 />, label: "Dashboard" },
  { to: "/inventory", icon: <FiClipboard />, label: "Inventory" },
  { to: "/manage-user", icon: <FiUsers />, label: "User Management" },
  { to: "/records", icon: <FiBell />, label: "Records" },
  { to: "/settings", icon: <FiSettings />, label: "Settings" },
];

const Sidebar = ({ children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h1 style={styles.logoText}>Innodata Clinic</h1>

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

        <div style={styles.userContainer} ref={dropdownRef}>
          <div
            style={styles.userButton}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FiUser style={styles.userIcon} />
            <div>
              <span style={styles.userName}>James</span>
              <p style={styles.userEmail}>james@example.com</p>
            </div>
            {showDropdown ? <FiChevronUp /> : <FiChevronDown />}
          </div>

          <div
            style={{
              ...styles.dropdown,
              maxHeight: showDropdown ? "200px" : "0",
              opacity: showDropdown ? 1 : 0,
            }}
          >
            <button
              style={styles.dropdownItem}
              onClick={() => navigate("/account")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  styles.dropdownItemHover.backgroundColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <FiUser /> Account Settings
            </button>
            <button
              style={styles.dropdownItem}
              onClick={handleLogout}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  styles.dropdownItemHover.backgroundColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>
      </aside>

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
  userContainer: {
    position: "relative",
    marginTop: "530px",
    padding: "10px",
    borderTop: "1px solid #ddd",
  },
  userButton: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#333",
    transition: "background 0.3s ease",
    gap: "10px",
  },
  userIcon: {
    fontSize: "1.5rem",
    color: "#2d97e9",
  },
  userName: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: "0.8rem",
    color: "#666",
    margin: "0",
  },
  dropdown: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    background: "#2d5b89",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    padding: "0",
    width: "100%",
    zIndex: 10,
    overflow: "hidden",
    transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "none",
    color: "white",
    border: "none",
    padding: "12px",
    width: "100%",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "1rem",
    transition: "background 0.3s ease",
  },
  dropdownItemHover: {
    backgroundColor: "#1c3f60",
  },
};

export default Sidebar;
