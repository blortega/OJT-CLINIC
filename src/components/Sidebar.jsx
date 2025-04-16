import { useState, useRef, useEffect } from "react";
import {
  FiMenu,
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
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { RingLoader } from "react-spinners"; // Import a spinner component

const sidebarLinks = [
  { to: "/dashboard", icon: <FiBarChart2 />, label: "Dashboard" },
  { to: "/inventory", icon: <FiClipboard />, label: "Inventory" },
  { to: "/manage-user", icon: <FiUsers />, label: "User Management" },
  { to: "/records", icon: <FiBell />, label: "Records" },
  { to: "/requestmedicine", icon: <FiBell />, label: "Request Medicine" },
  { to: "/settings", icon: <FiSettings />, label: "Settings" },
];

const Sidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState("");
  const [hoveredLink, setHoveredLink] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userDataFromFirestore = userDoc.data();
            setUserData(userDataFromFirestore);
            localStorage.setItem(
              "userData",
              JSON.stringify(userDataFromFirestore)
            );
          } else {
            console.error("User document not found.");
            const basicUserData = {
              firstname: user.displayName || "User",
              email: user.email,
            };
            setUserData(basicUserData);
            localStorage.setItem("userData", JSON.stringify(basicUserData));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          const basicUserData = {
            firstname: user.displayName || "User",
            email: user.email,
          };
          setUserData(basicUserData);
          localStorage.setItem("userData", JSON.stringify(basicUserData));
        } finally {
          setUserLoading(false);
        }
      } else {
        setUserData(null);
        localStorage.removeItem("userData");
        setUserLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem("userData");
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside
        style={{ ...styles.sidebar, width: isCollapsed ? "60px" : "250px" }}
      >
        {/* Toggle Button */}
        <button
          style={{
            ...styles.toggleButton,
            ...(hoveredLink === "toggle" ? styles.toggleButtonHover : {}),
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={() => setHoveredLink("toggle")}
          onMouseLeave={() => setHoveredLink("")}
        >
          <FiMenu size={24} style={{ color: "#000" }} />
        </button>

        <nav style={styles.navLinks}>
          {sidebarLinks.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...styles.sidebarLink,
                ...(isActive ? styles.activeLink : {}),
                ...(hoveredLink === to && !isActive
                  ? styles.sidebarLinkHover
                  : {}),
              })}
              onMouseEnter={() => setHoveredLink(to)}
              onMouseLeave={() => setHoveredLink("")}
            >
              {icon} {!isCollapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* User Dropdown */}
        <div style={styles.userContainer} ref={dropdownRef}>
          <div
            style={{
              ...styles.userButton,
              ...(hoveredLink === "userProfile" ? styles.userButtonHover : {}),
            }}
            onClick={() => setShowDropdown(!showDropdown)}
            onMouseEnter={() => setHoveredLink("userProfile")}
            onMouseLeave={() => setHoveredLink("")}
          >
            <FiUser style={styles.userIcon} />
            {!isCollapsed && (
              <div>
                {userLoading ? (
                  <div style={styles.userLoading}>
                    <RingLoader size={15} color="#2d97e9" />
                  </div>
                ) : (
                  <>
                    <span style={styles.userName}>
                      {userData ? userData.firstname : "Guest"}
                    </span>
                    <p style={styles.userEmail}>
                      {userData ? userData.email : "guest@example.com"}
                    </p>
                  </>
                )}
              </div>
            )}
            {!isCollapsed &&
              (showDropdown ? (
                <FiChevronUp style={{ color: "#333" }} />
              ) : (
                <FiChevronDown style={{ color: "#333" }} />
              ))}
          </div>

          {/* Dropdown Items */}
          <div
            style={{
              ...styles.dropdown,
              maxHeight: showDropdown ? "200px" : "0",
              opacity: showDropdown ? 1 : 0,
            }}
          >
            <button
              style={{
                ...styles.dropdownItem,
                ...(hoveredItem === "account" ? styles.dropdownItemHover : {}),
              }}
              onClick={() => navigate("/account")}
              onMouseEnter={() => setHoveredItem("account")}
              onMouseLeave={() => setHoveredItem("")}
            >
              {hoveredItem === "account" ? (
                <FiUser style={styles.dropdownItemIconHover} />
              ) : (
                <FiUser />
              )}
              Account Settings
            </button>
            <button
              style={{
                ...styles.dropdownItem,
                ...(hoveredItem === "signOut" ? styles.dropdownItemHover : {}),
              }}
              onClick={handleLogout}
              disabled={loading}
              onMouseEnter={() => setHoveredItem("signOut")}
              onMouseLeave={() => setHoveredItem("")}
            >
              {loading ? (
                <RingLoader size={24} color="#ffffff" />
              ) : (
                <>
                  {hoveredItem === "signOut" ? (
                    <FiLogOut style={styles.dropdownItemIconHover} />
                  ) : (
                    <FiLogOut />
                  )}
                  Sign Out
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          ...styles.contentWrapper,
          marginLeft: isCollapsed ? "60px" : "250px",
        }}
      >
        {children}
      </main>
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
    height: "100vh",
    backgroundColor: "white",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    position: "fixed",
    left: 0,
    top: 0,
    overflowY: "auto",
    transition: "width 0.3s ease-in-out",
  },
  contentWrapper: {
    flexGrow: 1,
    padding: "20px",
    transition: "margin-left 0.3s ease-in-out",
  },
  toggleButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "10px",
    alignSelf: "flex-start",
    borderRadius: "5px",
    transition: "all 0.2s ease-in-out",
  },
  toggleButtonHover: {
    background: "#f0f0f0",
    transform: "scale(1.05)",
  },
  logoText: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#2d97e9",
    marginBottom: "20px",
    textAlign: "center",
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
    transition: "all 0.3s ease",
    gap: "10px",
    fontSize: "1rem",
  },
  sidebarLinkHover: {
    backgroundColor: "#f0f7ff",
    color: "#2d97e9",
    transform: "translateX(5px)",
    boxShadow: "0 2px 5px rgba(45, 151, 233, 0.1)",
  },
  activeLink: {
    backgroundColor: "#2d97e9",
    color: "white",
    fontWeight: "bold",
  },
  userContainer: {
    position: "absolute",
    bottom: "20px",
    width: "100%",
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
    transition: "all 0.3s ease",
    gap: "10px",
    borderRadius: "5px",
  },
  userButtonHover: {
    backgroundColor: "#f0f7ff",
    transform: "translateY(-2px)",
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
  userLoading: {
    display: "flex",
    alignItems: "center",
    height: "35px",
    justifyContent: "center",
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
    transition: "all 0.25s ease-in-out",
    position: "relative",
    overflow: "hidden",
  },
  dropdownItemHover: {
    background: "linear-gradient(90deg, #2d97e9, #1a4d6f)",
    transform: "translateX(5px)",
    boxShadow: "inset 0 0 10px rgba(255, 255, 255, 0.1)",
    paddingLeft: "17px",
    color: "#ffffff",
    letterSpacing: "0.5px",
  },
  dropdownItemIconHover: {
    transform: "scale(1.2)",
    color: "#ffffff",
    transition: "all 0.25s ease-in-out",
  },
};

export default Sidebar;
